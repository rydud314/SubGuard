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
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-extrabold text-navy-800 sm:text-2xl">이번 달 구독서비스 관리</h1>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-navy-400">이번 달 구독료</span>
        <span className="bg-gradient-to-r from-mint-600 to-sky-600 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
          {formatWon(total)}
        </span>
        <span className="text-xs font-medium text-navy-400">· 결제 {count}건</span>
      </div>
    </div>
  );
}
