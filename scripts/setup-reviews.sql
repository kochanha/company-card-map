create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  restaurant_name text not null,
  content text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  price_per_person integer,
  nickname text default '익명'
);

alter table reviews enable row level security;

create policy "Anyone can read reviews" on reviews
  for select using (true);

create policy "Anyone can write reviews" on reviews
  for insert with check (true);
