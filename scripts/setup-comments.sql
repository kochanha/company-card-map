create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  review_id uuid not null references reviews(id) on delete cascade,
  nickname text default '익명',
  content text not null
);

alter table comments enable row level security;

create policy "Anyone can read comments" on comments
  for select using (true);

create policy "Anyone can write comments" on comments
  for insert with check (true);
