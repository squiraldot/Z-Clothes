create table if not exists public.account_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_frequency text not null default 'weekly'
    check (email_frequency in ('all', 'weekly', 'monthly', 'off')),
  new_arrivals boolean not null default true,
  offers boolean not null default true,
  style_edits boolean not null default false,
  personalized_recommendations boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.account_preferences to authenticated;

alter table public.account_preferences enable row level security;

drop policy if exists "Users can read their own account preferences" on public.account_preferences;
create policy "Users can read their own account preferences"
  on public.account_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own account preferences" on public.account_preferences;
create policy "Users can create their own account preferences"
  on public.account_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own account preferences" on public.account_preferences;
create policy "Users can update their own account preferences"
  on public.account_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
