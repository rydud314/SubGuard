import type { Subscription } from "@/types/subscription";

type RecurrenceInput = Pick<
  Subscription,
  "pay_date" | "cycle_count" | "cycle_unit" | "kind" | "trial_auto_pay" | "canceled_from"
>;

function parseAnchor(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** 무료 체험 종료 후 자동 결제가 없는 경우: 반복 없이 그 날짜 한 번만 발생한다. */
function isOneTime(sub: RecurrenceInput): boolean {
  return sub.kind === "trial" && sub.trial_auto_pay === false;
}

/** 해당 연/월(0-indexed month)에 결제가 발생하는 날짜(일) 목록을 반환한다. */
export function getOccurrenceDaysInMonth(
  sub: RecurrenceInput,
  year: number,
  month: number
): number[] {
  const anchor = parseAnchor(sub.pay_date);
  const interval = Math.max(1, sub.cycle_count || 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let results: number[] = [];

  if (isOneTime(sub)) {
    if (anchor.getFullYear() === year && anchor.getMonth() === month) {
      results.push(anchor.getDate());
    }
  } else if (sub.cycle_unit === "월") {
    if (anchor.getDate() <= daysInMonth) {
      const monthsDiff = (year - anchor.getFullYear()) * 12 + (month - anchor.getMonth());
      if (monthsDiff >= 0 && monthsDiff % interval === 0) {
        results.push(anchor.getDate());
      }
    }
  } else if (sub.cycle_unit === "년") {
    const yearsDiff = year - anchor.getFullYear();
    if (
      month === anchor.getMonth() &&
      yearsDiff >= 0 &&
      yearsDiff % interval === 0 &&
      anchor.getDate() <= daysInMonth
    ) {
      results.push(anchor.getDate());
    }
  } else if (sub.cycle_unit === "주") {
    const periodDays = interval * 7;
    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      const diffDays = Math.round((current.getTime() - anchor.getTime()) / 86400000);
      if (diffDays >= 0 && mod(diffDays, periodDays) === 0) {
        results.push(day);
      }
    }
  }

  if (sub.canceled_from) {
    const canceledFrom = parseAnchor(sub.canceled_from);
    results = results.filter((day) => new Date(year, month, day) < canceledFrom);
  }

  return results;
}

/** 오늘(from) 이후 가장 가까운 결제일을 계산한다. 최대 24개월 앞까지 탐색. */
export function getNextOccurrence(sub: RecurrenceInput, from: Date = new Date()): Date | null {
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  for (let i = 0; i < 25; i++) {
    const year = start.getFullYear();
    const month = start.getMonth() + i;
    const cursor = new Date(year, month, 1);
    const days = getOccurrenceDaysInMonth(sub, cursor.getFullYear(), cursor.getMonth());
    for (const day of days) {
      const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
      if (candidate.getTime() >= today.getTime()) {
        return candidate;
      }
    }
  }
  return null;
}
