export type CycleUnit = "주" | "월" | "년";
export type SubscriptionKind = "trial" | "regular";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  pay_date: string; // ISO date (YYYY-MM-DD): 첫 결제(또는 무료체험 종료) 날짜 — 반복 계산의 기준일
  cycle_count: number; // e.g. 1
  cycle_unit: CycleUnit; // e.g. "월"
  icon_label: string; // short label rendered in the badge (e.g. "N", "S")
  color: string; // hex color used for the badge/dot
  created_at: string;
  kind: SubscriptionKind; // "regular": 정기 구독 / "trial": 무료 체험
  trial_auto_pay: boolean | null; // trial일 때만 의미 있음: 체험 종료 후 자동 결제 여부
  trial_start_date: string | null; // trial일 때만 의미 있음: 무료 체험 시작일(ISO date). 캘린더에 시작일~pay_date 구간으로 표시하는 데 사용
  canceled_from: string | null; // ISO date. 설정되면 이 날짜 이후 결제일은 캘린더에 표시하지 않음(과거 데이터는 유지)
  notify_enabled: boolean; // 이 구독 서비스의 결제일 알림(이메일/브라우저 푸시, 3일 전/1일 전) on/off
  notified_3d_for: string | null; // 3일 전 이메일 알림을 이미 보낸 결제 회차의 날짜(ISO). 중복 발송 방지용
  notified_1d_for: string | null; // 1일 전 이메일 알림을 이미 보낸 결제 회차의 날짜(ISO). 중복 발송 방지용
  push_notified_3d_for: string | null; // 3일 전 브라우저 푸시 알림을 이미 보낸 결제 회차의 날짜(ISO)
  push_notified_1d_for: string | null; // 1일 전 브라우저 푸시 알림을 이미 보낸 결제 회차의 날짜(ISO)
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  created_at: string;
}

export type NewSubscription = Pick<
  Subscription,
  | "name"
  | "price"
  | "pay_date"
  | "cycle_count"
  | "cycle_unit"
  | "icon_label"
  | "color"
  | "kind"
  | "trial_auto_pay"
  | "trial_start_date"
>;
