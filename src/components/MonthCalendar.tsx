"use client";

import { useMemo, useState } from "react";
import type { Subscription } from "@/types/subscription";
import { getOccurrenceDaysInMonth, getTrialRangeDaysInMonth } from "@/lib/recurrence";
import { formatWon, isSameDay } from "@/lib/format";
import { buildMonthGrid } from "@/lib/calendarGrid";

interface DayOccurrence {
  sub: Subscription;
  isStart: boolean;
  isEnd: boolean;
  isRange: boolean;
  showLabel: boolean;
}

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
  const [openDropdown, setOpenDropdown] = useState<null | "year" | "month">(null);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const occurrencesByDay = useMemo(() => {
    const map = new Map<number, DayOccurrence[]>();
    const add = (day: number, entry: DayOccurrence) => {
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(entry);
    };

    for (const sub of subscriptions) {
      if (sub.kind === "trial" && sub.trial_start_date) {
        // 무료 체험: 시작일~종료일(또는 첫 결제일)까지 하나의 연속된 일정(바)으로 표시.
        // 실제 시작일이 이전 달이라 이번 달에는 안 보이는 경우에도, 이번 달에 보이는 첫 날에는
        // 라벨(아이콘+이름)을 표시해 어떤 구독인지 알아볼 수 있게 한다.
        getTrialRangeDaysInMonth(sub, year, month).forEach(({ day, isStart, isEnd }, idx) => {
          add(day, { sub, isStart, isEnd, isRange: true, showLabel: idx === 0 });
        });

        // 자동결제 체험은 첫 결제일이 지난 이후부터 일반 정기결제처럼 매달 반복된다.
        // (첫 결제일이 속한 달은 위 구간 표시로 이미 커버되므로 중복 표시하지 않는다.)
        if (sub.trial_auto_pay) {
          const anchor = new Date(sub.pay_date);
          const isAnchorMonth = anchor.getFullYear() === year && anchor.getMonth() === month;
          if (!isAnchorMonth) {
            for (const day of getOccurrenceDaysInMonth(sub, year, month)) {
              add(day, { sub, isStart: true, isEnd: true, isRange: false, showLabel: true });
            }
          }
        }
      } else {
        for (const day of getOccurrenceDaysInMonth(sub, year, month)) {
          add(day, { sub, isStart: true, isEnd: true, isRange: false, showLabel: true });
        }
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
          <div className="relative flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setOpenDropdown((d) => (d === "year" ? null : "year"))}
              className="rounded px-0.5 text-base font-bold text-navy-800 transition-colors hover:text-mint-600 sm:text-lg"
            >
              {year}년
            </button>
            <button
              type="button"
              onClick={() => setOpenDropdown((d) => (d === "month" ? null : "month"))}
              className="rounded px-0.5 text-base font-bold text-navy-800 transition-colors hover:text-mint-600 sm:text-lg"
            >
              {month + 1}월
            </button>

            {openDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full z-30 mt-1.5 max-h-56 w-24 overflow-y-auto rounded-xl border border-mint-100 bg-white p-1.5 shadow-xl animate-pop-in">
                  {(openDropdown === "year" ? YEAR_OPTIONS : MONTH_OPTIONS).map((value) => {
                    const isYear = openDropdown === "year";
                    const selected = isYear ? value === year : value === month;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          onSelectMonth(isYear ? value : year, isYear ? month : value);
                          setOpenDropdown(null);
                        }}
                        className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                          selected ? "bg-mint-50 font-bold text-mint-700" : "text-navy-600 hover:bg-navy-50"
                        }`}
                      >
                        {isYear ? `${value}년` : `${value + 1}월`}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

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
        </div>

        <button
          type="button"
          onClick={onRegisterClick}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-900 px-4 py-2.5 text-xs font-bold text-white shadow-card transition-all duration-200 hover:scale-105 hover:shadow-glow active:scale-95 sm:text-sm"
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
                {dayOccurrences.slice(0, 2).map(({ sub, isStart, isEnd, isRange, showLabel }, idx) => (
                  <button
                    key={`${sub.id}-${idx}`}
                    type="button"
                    onClick={() => onSelectSubscription(sub)}
                    className={`group/chip relative flex items-center gap-1 py-0.5 text-left text-[9px] font-bold text-white shadow-sm transition-transform hover:scale-105 sm:text-[10px] ${
                      isRange
                        ? `h-3.5 w-full px-1.5 sm:h-4 ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`
                        : "truncate rounded-full px-1.5"
                    }`}
                    style={{ backgroundColor: sub.color }}
                  >
                    {showLabel && (
                      <>
                        <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-white/30 text-[8px] leading-none sm:h-3.5 sm:w-3.5">
                          {sub.icon_label}
                        </span>
                        <span className="truncate">{sub.name}</span>
                      </>
                    )}

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
