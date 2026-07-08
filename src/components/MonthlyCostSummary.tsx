"use client";

import { useMemo } from "react";
import type { Subscription } from "@/types/subscription";
import { getOccurrenceDaysInMonth } from "@/lib/recurrence";
import { formatWon } from "@/lib/format";

export function MonthlyCostSummary({
  subscriptions,
  currentDate,
}: {
  subscriptions: Subscription[];
  currentDate: Date;
}) {
  const { total, count } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let sum = 0;
    let occurrenceCount = 0;
    for (const sub of subscriptions) {
      const days = getOccurrenceDaysInMonth(sub, year, month);
      if (days.length > 0) {
        sum += sub.price * days.length;
        occurrenceCount += days.length;
      }
    }
    return { total: sum, count: occurrenceCount };
  }, [subscriptions, currentDate]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-black tracking-tight text-navy-900 sm:text-2xl">이번 달 구독서비스 관리</h1>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-medium text-navy-400">이번 달 구독료</span>
        <span className="inline-flex items-center rounded-full bg-brand-gradient-deep px-4 py-1.5 text-base font-black text-white shadow-card sm:text-lg">
          {formatWon(total)}
        </span>
        <span className="pill-badge bg-navy-50 text-navy-500">결제 {count}건</span>
      </div>
    </div>
  );
}
