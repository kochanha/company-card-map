-- Supabase SQL Editor에서 실행하세요
-- 대시보드 > SQL Editor > New query

-- 제보 테이블
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  category text not null,
  price_range text not null,
  price_per_person integer not null,
  address text not null,
  license_type text not null default '일반음식점',
  description text,
  recommendation text,
  status text not null default 'pending',
  -- status: pending(검토중), approved(승인), rejected(반려)

  constraint valid_category check (category in ('한식','일식','양식','중식','파인다이닝','뷔페','고기/구이','해산물')),
  constraint valid_price_range check (price_range in ('3-5만','5-8만','8만+')),
  constraint valid_license check (license_type in ('일반음식점','휴게음식점','제과점영업')),
  constraint valid_status check (status in ('pending','approved','rejected'))
);

-- RLS (Row Level Security) 활성화
alter table submissions enable row level security;

-- 누구나 제보 가능 (insert)
create policy "Anyone can submit" on submissions
  for insert with check (true);

-- 승인된 제보만 조회 가능
create policy "Anyone can read approved" on submissions
  for select using (status = 'approved');
