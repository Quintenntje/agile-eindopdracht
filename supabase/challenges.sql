-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Challenges Table
-- Stores the definitions of available challenges
create table public.challenges (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text check (type in ('daily', 'weekly', 'seasonal', 'one_time')) not null,
  
  -- Rewards
  points_reward integer not null default 0,
  
  -- Completion Criteria
  goal_metric text not null, -- e.g., 'trash_reported', 'distance_walked'
  goal_target integer not null default 1,
  
  -- Activity Period
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone, -- Null for indefinite
  is_active boolean default true,
  
  created_at timestamp with time zone default now()
);

-- 2. User Challenges Progress Table
-- Tracks a user's progress on specific challenges
create table public.user_challenges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  
  -- Progress Tracking
  current_progress integer default 0,
  status text check (status in ('in_progress', 'completed', 'claimed')) default 'in_progress',
  
  completed_at timestamp with time zone,
  last_updated_at timestamp with time zone default now(),
  
  -- Ensure a user effectively has one entry per challenge (unless we want repeatable challenges, 
  -- in which case we might perform soft deletes or have a 'period_id')
  unique(user_id, challenge_id)
);

-- 3. Row Level Security (RLS) Policies

-- Enable RLS
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;

-- Policies for 'challenges'
-- Everyone can view active challenges
create policy "Active challenges are viewable by everyone" 
on public.challenges for select 
using (is_active = true);

-- Only service_role or admins should be able to insert/update/delete challenges
-- (Implicitly denied for anon/authenticated unless policies added)

-- Policies for 'user_challenges'
-- Users can view their own progress
create policy "Users can view own challenge progress" 
on public.user_challenges for select 
using (auth.uid() = user_id);

-- Users can update their own progress (or usually this is done via a secure function/RPC)
-- For now, allowing update if user owns the record
create policy "Users can update own challenge progress" 
on public.user_challenges for update 
using (auth.uid() = user_id);

-- Users can insert their own progress record (start a challenge)
create policy "Users can start a challenge" 
on public.user_challenges for insert 
with check (auth.uid() = user_id);
