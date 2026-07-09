"use client";

import { useMemo } from "react";
import type { Subscription } from "@/types/subscription";
import { getOccurrenceDaysInMonth } from "@/lib/recurrence";
import { formatMonthTitle, formatWon, isSameDay } from "@/lib/format";
import { buildMonthGrid } from "@/lib/calendarGrid";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

const TODAY_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => TODAY_YEAR - 5 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i);

interface MonthCalendarProps {
  currentDate: Date;
  subscriptions: Subscription[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectMonth: (year: number, month: number) => void;
  onRegisterClick: () => void;
  onSelectSubscription: (sub: Subscription) => void;
}

export function MonthCalendar({
  currentDate,
  subscriptions,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectMonth,
  onRegisterClick,
  onSelectSubscription,
}: MonthCalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const occurrencesByDay = useMemo(() => {
    const map = new Map<number, { sub: Subscription }[]>();
    for (const sub of subscriptions) {
      const days = getOccurrenceDaysInMonth(sub, year, month);
      for (const day of days) {
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push({ sub });
      }
    }
    return map;
  }, [subscriptions, year, month]);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="이전 달"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-all hover:scale-105 hover:bg-mint-50 hover:text-mint-600"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="min-w-[120px] text-center text-base font-bold text-navy-800 sm:text-lg">
            {formatMonthTitle(currentDate)}
          </p>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="다음 달"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-all hover:scale-105 hover:bg-mint-50 hover:text-mint-600"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" onClick={onToday} className="btn-secondary !px-3 !py-1.5 text-xs">
            이번 달
          </button>

          <div className="flex items-center gap-1.5">
            <select
              value={year}
              onChange={(e) => onSelectMonth(Number(e.target.value), month)}
              className="rounded-lg border border-navy-100 bg-white px-2 py-1.5 text-xs font-semibold text-navy-700 focus:border-mint-400 focus:outline-none"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => onSelectMonth(year, Number(e.target.value))}
              className="rounded-lg border border-navy-100 bg-white px-2 py-1.5 text-xs font-semibold text-navy-700 focus:border-mint-400 focus:outline-none"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m + 1}월
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onRegisterClick}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-card transition-all duration-200 hover:scale-105 hover:bg-amber-600 hover:shadow-glow active:scale-95 sm:text-sm"
        >
          새로운 구독서비스 등록
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-navy-400 sm:text-xs">
        {WEEKDAYS.map((day) => (
          <div key={day} className={day === "일" ? "text-rose-400" : day === "토" ? "text-sky-500" : ""}>
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map(({ date, inCurrentMonth }) => {
          const dayOccurrences = inCurrentMonth ? occurrencesByDay.get(date.getDate()) ?? [] : [];
          const isToday = isSameDay(date, today);

          return (
            <div
              key={date.toISOString()}
              className={`min-h-[64px] rounded-lg p-1.5 transition-colors sm:min-h-[92px] sm:p-2 ${
                inCurrentMonth ? "bg-white/50" : "bg-transparent"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold sm:text-xs ${
                  isToday
                    ? "bg-brand-gradient-deep text-white shadow-glow ring-2 ring-mint-200"
                    : inCurrentMonth
                      ? "text-navy-600"
                      : "text-navy-300"
                }`}
              >
                {date.getDate()}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {dayOccurrences.slice(0, 2).map(({ sub }, idx) => (
                  <button
                    key={`${sub.id}-${idx}`}
                    type="button"
                    onClick={() => onSelectSubscription(sub)}
                    className="group/chip relative flex items-center gap-1 truncate rounded-full px-1.5 py-0.5 text-left text-[9px] font-bold text-white shadow-sm transition-transform hover:scale-105 sm:text-[10px]"
                    style={{ backgroundColor: sub.color }}
                  >
                    <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-white/30 text-[8px] leading-none sm:h-3.5 sm:w-3.5">
                      {sub.icon_label}
                    </span>
                    <span className="truncate">{sub.name}</span>

                    <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-40 -translate-x-1/2 scale-95 rounded-xl bg-navy-900 p-2.5 text-left opacity-0 shadow-xl transition-all duration-150 group-hover/chip:scale-100 group-hover/chip:opacity-100">
                      <span className="block text-[11px] font-bold text-white">{sub.name}</span>
                      <span className="mt-1 block text-[10px] font-medium text-white/75">
                        {formatWon(sub.price)}
                      </span>
                      <span className="block text-[10px] font-medium text-white/75">
                        첫 결제 {sub.pay_date.replace(/-/g, ".")}
                      </span>
                      <span className="block text-[10px] font-medium text-white/75">
                        {sub.cycle_count}회 / {sub.cycle_unit}
                      </span>
                    </span>
                  </button>
                ))}
                {dayOccurrences.length > 2 && (
                  <span className="text-[9px] font-medium text-navy-400">
                    +{dayOccurrences.length - 2}개 더보기
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
