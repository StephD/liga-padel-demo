-- Demo seed data for Liga Padel
-- Run this after supabase/schema.sql

begin;

truncate table public.registrations restart identity cascade;
truncate table public.matches restart identity cascade;

with inserted_matches as (
  insert into public.matches (id, date, start_time, end_time, level, status, week_label)
  values
    (
      '11111111-1111-1111-1111-111111111111',
      current_date + 1,
      '19:00',
      '20:30',
      'Low Bronze',
      'open',
      to_char(date_trunc('week', (current_date + 1)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      current_date + 2,
      '20:00',
      '21:30',
      'Mid Bronze',
      'open',
      to_char(date_trunc('week', (current_date + 2)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      current_date + 3,
      '18:30',
      '20:00',
      'High Silver',
      'open',
      to_char(date_trunc('week', (current_date + 3)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '44444444-4444-4444-4444-444444444444',
      current_date + 4,
      '09:00',
      '10:30',
      'High Silver',
      'full',
      to_char(date_trunc('week', (current_date + 4)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '55555555-5555-5555-5555-555555555555',
      current_date + 5,
      '17:00',
      '18:30',
      'Low Gold',
      'open',
      to_char(date_trunc('week', (current_date + 5)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '66666666-6666-6666-6666-666666666666',
      current_date + 8,
      '19:30',
      '21:00',
      'Mid Silver',
      'open',
      to_char(date_trunc('week', (current_date + 8)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '77777777-7777-7777-7777-777777777777',
      current_date + 10,
      '08:00',
      '09:30',
      'High Bronze',
      'closed',
      to_char(date_trunc('week', (current_date + 10)::timestamp), 'YYYY-MM-DD')
    ),
    (
      '88888888-8888-8888-8888-888888888888',
      current_date - 2,
      '19:00',
      '20:30',
      'Low Silver',
      'closed',
      to_char(date_trunc('week', (current_date - 2)::timestamp), 'YYYY-MM-DD')
    )
  returning id
)
select count(*) from inserted_matches;

insert into public.registrations (match_id, player_name, status)
values
  -- One approved player
  ('22222222-2222-2222-2222-222222222222', 'Alex Tan', 'approved'),

  -- Two approved players plus waiting list
  ('33333333-3333-3333-3333-333333333333', 'Maya Lee', 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'Jon Cruz', 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'Ivy Ong', 'pending'),
  ('33333333-3333-3333-3333-333333333333', 'Dan Wu', 'pending'),

  -- Full match with four approved players
  ('44444444-4444-4444-4444-444444444444', 'Rico Lim', 'approved'),
  ('44444444-4444-4444-4444-444444444444', 'Ben Koh', 'approved'),
  ('44444444-4444-4444-4444-444444444444', 'Sara Ng', 'approved'),
  ('44444444-4444-4444-4444-444444444444', 'Nina Tan', 'approved'),

  -- Three approved players and one pending
  ('55555555-5555-5555-5555-555555555555', 'Liam Goh', 'approved'),
  ('55555555-5555-5555-5555-555555555555', 'Jules Tan', 'approved'),
  ('55555555-5555-5555-5555-555555555555', 'Carla See', 'approved'),
  ('55555555-5555-5555-5555-555555555555', 'Owen Yeo', 'pending'),

  -- Empty future week match has no rows

  -- Next week one approved plus refused example
  ('66666666-6666-6666-6666-666666666666', 'Priya Nair', 'approved'),
  ('66666666-6666-6666-6666-666666666666', 'Marcus Teo', 'refused'),

  -- Closed match with approved players
  ('77777777-7777-7777-7777-777777777777', 'Dina Fox', 'approved'),
  ('77777777-7777-7777-7777-777777777777', 'Kai Sim', 'approved'),

  -- Past match
  ('88888888-8888-8888-8888-888888888888', 'Ari Tan', 'approved'),
  ('88888888-8888-8888-8888-888888888888', 'Moe Chan', 'approved'),
  ('88888888-8888-8888-8888-888888888888', 'Vic Lau', 'approved'),
  ('88888888-8888-8888-8888-888888888888', 'Elle Yap', 'approved');

select public.sync_match_status('11111111-1111-1111-1111-111111111111');
select public.sync_match_status('22222222-2222-2222-2222-222222222222');
select public.sync_match_status('33333333-3333-3333-3333-333333333333');
select public.sync_match_status('44444444-4444-4444-4444-444444444444');
select public.sync_match_status('55555555-5555-5555-5555-555555555555');
select public.sync_match_status('66666666-6666-6666-6666-666666666666');

commit;
