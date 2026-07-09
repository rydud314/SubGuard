"use client";

import { useMemo } from "react";
import type { Subscription } from "@/types/subscription";
import { getNextOccurrence } from "@/lib/recurrence";
import { daysUntil, formatWon } from "@/lib/format";

interface TrialItem {
  sub: Subscription;
  date: Date;
  diff: number;
}

export function TrialEndingCard({
  subscriptions,
  onSelectSubscription,
}: {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
}) {
  const ending = useMemo<TrialItem[]>(() => {
    const today = new Date();
    return subscriptions
      .filter((sub) => sub.kind === "trial")
      .map((sub) => {
        const date = getNextOccurrence(sub, today);
        if (!date) return null;
        return { sub, date, diff: daysUntil(date, today) };
      })
      .filter((item): item is TrialItem => item !== null && item.diff >= 0 && item.diff <= 3)
      .sort((a, b) => a.diff - b.diff);
  }, [subscriptions]);

  if (ending.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="text-sm font-bold text-navy-800">무료 체험이 종료돼요</h3>
      </div>

      <ul className="mt-4 space-y-2">
        {ending.map(({ sub, date, diff }) => (
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
                    {date.getMonth() + 1}월 {date.getDate()}일{" "}
                    {sub.trial_auto_pay ? "자동 결제 예정" : "무료 체험 종료"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {sub.trial_auto_pay && (
                  <span className="text-xs font-bold text-navy-800">{formatWon(sub.price)}</span>
                )}
                <span className="pill-badge bg-rose-100 text-rose-600">
                  {diff === 0 ? "오늘 종료" : `D-${diff}`}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
