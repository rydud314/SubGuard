-- SubGuard: 구독 서비스 테이블 및 보안 정책
-- Supabase 대시보드 > SQL Editor 에서 전체 내용을 실행하세요.
-- (기존에 실행한 적이 있다면 다시 실행해도 안전하도록 작성되어 있습니다.)

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  pay_date date not null,
  cycle_count integer not null default 1 check (cycle_count > 0),
  cycle_unit text not null default '월' check (cycle_unit in ('주', '월', '년')),
  icon_label text not null default 'S',
  color text not null default '#18CFC3',
  created_at timestamptz not null default now(),
  kind text not null default 'regular',
  trial_auto_pay boolean,
  trial_start_date date,
  canceled_from date
);

-- 이미 만들어진 테이블에 새 컬럼을 추가해야 하는 경우(마이그레이션)에도 안전하게 실행된다.
alter table public.subscriptions add column if not exists kind text not null default 'regular';
alter table public.subscriptions add column if not exists trial_auto_pay boolean;
alter table public.subscriptions add column if not exists trial_start_date date;
alter table public.subscriptions add column if not exists canceled_from date;

alter table public.subscriptions drop constraint if exists subscriptions_kind_check;
alter table public.subscriptions add constraint subscriptions_kind_check check (kind in ('trial', 'regular'));

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

drop policy if exists "구독 서비스 조회: 본인 것만" on public.subscriptions;
create policy "구독 서비스 조회: 본인 것만"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "구독 서비스 등록: 본인 계정으로만" on public.subscriptions;
create policy "구독 서비스 등록: 본인 계정으로만"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "구독 서비스 수정: 본인 것만" on public.subscriptions;
create policy "구독 서비스 수정: 본인 것만"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "구독 서비스 삭제: 본인 것만" on public.subscriptions;
create policy "구독 서비스 삭제: 본인 것만"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Realtime: 메인 화면 진입 시 등록된 구독 서비스가 실시간으로 캘린더에 반영되도록 publication에 추가
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'subscriptions'
  ) then
    alter publication supabase_realtime add table public.subscriptions;
  end if;
end $$;
