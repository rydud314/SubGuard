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
  canceled_from: string | null; // ISO date. 설정되면 이 날짜 이후 결제일은 캘린더에 표시하지 않음(과거 데이터는 유지)
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
>;
