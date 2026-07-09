"use client";

import { useMemo } from "react";
import type { Subscription } from "@/types/subscription";
import { getOccurrenceDaysInMonth } from "@/lib/recurrence";
import { formatWon } from "@/lib/format";

interface MonthlyItem {
  sub: Subscription;
  day: number;
}

export function MonthlyCostCard({
  subscriptions,
  currentDate,
  onSelectSubscription,
}: {
  subscriptions: Subscription[];
  currentDate: Date;
  onSelectSubscription: (sub: Subscription) => void;
}) {
  const { items, total } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const rows: MonthlyItem[] = [];
    let sum = 0;
    for (const sub of subscriptions) {
      const days = getOccurrenceDaysInMonth(sub, year, month);
      for (const day of days) {
        rows.push({ sub, day });
        sum += sub.price;
      }
    }
    rows.sort((a, b) => a.day - b.day);
    return { items: rows, total: sum };
  }, [subscriptions, currentDate]);

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-bold text-navy-800">이번 달 구독료</h3>

      {items.length === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-navy-400">
          이번 달 결제 예정인 구독 서비스가 없어요.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map(({ sub, day }, idx) => (
            <li key={`${sub.id}-${idx}`}>
              <button
                type="button"
                onClick={() => onSelectSubscription(sub)}
                className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-left shadow-sm transition-all hover:scale-[1.02]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.icon_label}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-navy-800">{sub.name}</p>
                    <p className="text-[11px] text-navy-400">
                      {currentDate.getMonth() + 1}월 {day}일
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-navy-800">{formatWon(sub.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3">
        <span className="text-xs font-bold text-navy-500">합계</span>
        <span className="text-base font-black text-navy-900">{formatWon(total)}</span>
      </div>
    </div>
  );
}
