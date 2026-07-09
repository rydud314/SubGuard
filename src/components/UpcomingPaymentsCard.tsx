"use client";

import { useMemo } from "react";
import type { Subscription } from "@/types/subscription";
import { getNextOccurrence } from "@/lib/recurrence";
import { daysUntil, formatWon } from "@/lib/format";

interface UpcomingItem {
  sub: Subscription;
  date: Date;
  diff: number;
}

export function UpcomingPaymentsCard({
  subscriptions,
  onSelectSubscription,
}: {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
}) {
  const upcoming = useMemo<UpcomingItem[]>(() => {
    const today = new Date();
    // 정기 결제, 무료 체험 모두 포함
    return subscriptions
      .map((sub) => {
        const date = getNextOccurrence(sub, today);
        if (!date) return null;
        return { sub, date, diff: daysUntil(date, today) };
      })
      .filter((item): item is UpcomingItem => item !== null && item.diff >= 0 && item.diff <= 3)
      .sort((a, b) => a.diff - b.diff);
  }, [subscriptions]);

  return (
    <div className="glass-card overflow-hidden border-mint-200/70 bg-gradient-to-br from-mint-50 via-white to-sky-50 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient-deep text-white shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
        <h3 className="text-sm font-bold text-navy-800">곧 결제되는 서비스예요</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-navy-400">
          3일 이내로 예정된 결제가 없어요. 안심하고 지내세요!
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {upcoming.map(({ sub, date, diff }) => (
            <li key={sub.id}>
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
                      {date.getMonth() + 1}월 {date.getDate()}일
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs font-bold text-navy-800">{formatWon(sub.price)}</span>
                  <span
                    className={`pill-badge ${
                      diff === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {diff === 0 ? "오늘 결제" : `D-${diff}`}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
