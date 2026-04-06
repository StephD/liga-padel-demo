create extension if not exists pgcrypto;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  level text not null,
  status text not null default 'open' check (status in ('open', 'full', 'closed')),
  week_label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'refused')),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists registrations_unique_name_per_match
  on public.registrations (match_id, lower(player_name));

create index if not exists matches_week_label_idx on public.matches (week_label, date, start_time);
create index if not exists registrations_match_status_idx on public.registrations (match_id, status, created_at);

create or replace function public.sync_match_status(match_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  approved_count integer;
  current_status text;
  match_start timestamptz;
begin
  select count(*) into approved_count
  from public.registrations
  where match_id = match_id_input
    and status = 'approved';

  select status, (date + start_time)::timestamptz into current_status, match_start
  from public.matches
  where id = match_id_input;

  if current_status = 'closed' then
    return;
  end if;

  if approved_count >= 4 then
    update public.matches set status = 'full' where id = match_id_input;
  elsif match_start < now() then
    update public.matches set status = 'closed' where id = match_id_input;
  else
    update public.matches set status = 'open' where id = match_id_input;
  end if;
end;
$$;

create or replace function public.approve_registration(registration_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_match_id uuid;
  approved_count integer;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'Not authorized';
  end if;

  select match_id into target_match_id
  from public.registrations
  where id = registration_id_input
    and status = 'pending';

  if target_match_id is null then
    raise exception 'Pending registration not found';
  end if;

  perform 1
  from public.matches
  where id = target_match_id
  for update;

  select count(*) into approved_count
  from public.registrations
  where match_id = target_match_id
    and status = 'approved';

  if approved_count >= 4 then
    raise exception 'Match is already full';
  end if;

  update public.registrations
  set status = 'approved'
  where id = registration_id_input;

  perform public.sync_match_status(target_match_id);
end;
$$;

create or replace function public.add_direct_player(match_id_input uuid, player_name_input text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  approved_count integer;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'Not authorized';
  end if;

  perform 1
  from public.matches
  where id = match_id_input
  for update;

  select count(*) into approved_count
  from public.registrations
  where match_id = match_id_input
    and status = 'approved';

  if approved_count >= 4 then
    raise exception 'Match is already full';
  end if;

  insert into public.registrations (match_id, player_name, status)
  values (match_id_input, trim(player_name_input), 'approved');

  perform public.sync_match_status(match_id_input);
end;
$$;

alter table public.matches enable row level security;
alter table public.registrations enable row level security;

drop policy if exists "public read matches" on public.matches;
create policy "public read matches"
on public.matches
for select
to anon, authenticated
using (true);

drop policy if exists "admin manage matches" on public.matches;
create policy "admin manage matches"
on public.matches
for all
to authenticated
using (true)
with check (true);

drop policy if exists "public read approved registrations" on public.registrations;
create policy "public read approved registrations"
on public.registrations
for select
to anon, authenticated
using (status = 'approved' or auth.role() = 'authenticated');

drop policy if exists "public insert pending registrations" on public.registrations;
create policy "public insert pending registrations"
on public.registrations
for insert
to anon, authenticated
with check (
  status = 'pending'
  and exists (
    select 1
    from public.matches
    where matches.id = registrations.match_id
      and matches.status = 'open'
      and (matches.date + matches.start_time) > now()
  )
);

drop policy if exists "admin update registrations" on public.registrations;
create policy "admin update registrations"
on public.registrations
for update
to authenticated
using (true)
with check (true);

drop policy if exists "admin delete registrations" on public.registrations;
create policy "admin delete registrations"
on public.registrations
for delete
to authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.matches to anon, authenticated;
grant select on public.registrations to anon, authenticated;
grant insert on public.registrations to anon, authenticated;
grant update, insert, delete on public.matches to authenticated;
grant update, delete on public.registrations to authenticated;
grant execute on function public.approve_registration(uuid) to authenticated;
grant execute on function public.add_direct_player(uuid, text) to authenticated;
grant execute on function public.sync_match_status(uuid) to authenticated;
