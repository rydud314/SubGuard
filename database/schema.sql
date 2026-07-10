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
  canceled_from date,
  notify_enabled boolean not null default true,
  notified_3d_for date,
  notified_1d_for date,
  push_notified_3d_for date,
  push_notified_1d_for date
);

-- 이미 만들어진 테이블에 새 컬럼을 추가해야 하는 경우(마이그레이션)에도 안전하게 실행된다.
alter table public.subscriptions add column if not exists kind text not null default 'regular';
alter table public.subscriptions add column if not exists trial_auto_pay boolean;
alter table public.subscriptions add column if not exists trial_start_date date;
alter table public.subscriptions add column if not exists canceled_from date;
alter table public.subscriptions add column if not exists notify_enabled boolean not null default true;
-- 결제일 3일 전/1일 전 이메일 알림을 이미 보낸 결제 회차(날짜)를 기록해, 같은 회차에 중복 발송되지 않도록 한다.
alter table public.subscriptions add column if not exists notified_3d_for date;
alter table public.subscriptions add column if not exists notified_1d_for date;
-- 브라우저 푸시 알림은 이메일과 별도 채널이라, 발송 여부를 독립적으로 기록한다(이메일만 실패해도 푸시는 그대로 감).
alter table public.subscriptions add column if not exists push_notified_3d_for date;
alter table public.subscriptions add column if not exists push_notified_1d_for date;

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

-- 브라우저 푸시 알림 구독 정보(기기/브라우저별로 여러 개 있을 수 있음)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "푸시 구독 조회: 본인 것만" on public.push_subscriptions;
create policy "푸시 구독 조회: 본인 것만"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "푸시 구독 등록: 본인 계정으로만" on public.push_subscriptions;
create policy "푸시 구독 등록: 본인 계정으로만"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "푸시 구독 수정: 본인 것만" on public.push_subscriptions;
create policy "푸시 구독 수정: 본인 것만"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "푸시 구독 삭제: 본인 것만" on public.push_subscriptions;
create policy "푸시 구독 삭제: 본인 것만"
  on public.push_subscriptions for delete
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
