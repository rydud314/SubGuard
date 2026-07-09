"use client";

import { useMemo, useState } from "react";
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
  onSelectSubscription: (sub: Subscription, occurrenceDate: Date) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { items, total } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const rows: MonthlyItem[] = [];
    let sum = 0;
    for (const sub of subscriptions) {
      if (sub.price <= 0) continue; // 결제 금액 0원인 구독 서비스는 제외
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white shadow-glow">
            ₩
          </span>
          <div>
            <h3 className="text-sm font-bold text-navy-800">이번 달 구독료</h3>
            <p className="text-base font-black text-navy-900">
              {formatWon(total)} <span className="text-xs font-semibold text-navy-400">· {items.length}건</span>
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-navy-400 transition-colors hover:text-mint-600"
          >
            더보기
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {expanded &&
        (items.length === 0 ? (
          <p className="mt-4 text-xs leading-relaxed text-navy-400">
            이번 달 결제 예정인 구독 서비스가 없어요.
          </p>
        ) : (
          <ul className="mt-4 animate-pop-in space-y-2">
            {items.map(({ sub, day }, idx) => (
              <li key={`${sub.id}-${idx}`}>
                <button
                  type="button"
                  onClick={() =>
                    onSelectSubscription(sub, new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                  }
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
        ))}
    </div>
  );
}
