export type CycleUnit = "주" | "월" | "년";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  pay_date: string; // ISO date (YYYY-MM-DD) representing the next/anchor payment date
  cycle_count: number; // e.g. 1
  cycle_unit: CycleUnit; // e.g. "월"
  icon_label: string; // short label rendered in the badge (e.g. "N", "S")
  color: string; // hex color used for the badge/dot
  created_at: string;
}

export type NewSubscription = Pick<
  Subscription,
  "name" | "price" | "pay_date" | "cycle_count" | "cycle_unit" | "icon_label" | "color"
>;
