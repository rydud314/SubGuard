"use client";

import { useEffect, useRef, useState } from "react";
import { buildMonthGrid } from "@/lib/calendarGrid";
import { isSameDay, toISODate } from "@/lib/format";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

interface DatePickerFieldProps {
  value: string; // ISO date string (YYYY-MM-DD) or ""
  onChange: (isoDate: string) => void;
  placeholder?: string;
}

export function DatePickerField({ value, onChange, placeholder }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const grid = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "YYYY-MM-DD"}
          className="input-field"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="달력에서 선택"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-500 transition-all hover:scale-105 hover:border-mint-300 hover:text-mint-600"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-72 animate-pop-in rounded-2xl border border-mint-100 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 hover:bg-mint-50 hover:text-mint-600"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-sm font-bold text-navy-800">
              {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
            </p>
            <button
              type="button"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 hover:bg-mint-50 hover:text-mint-600"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-navy-400">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map(({ date, inCurrentMonth }) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(toISODate(date));
                    setOpen(false);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all hover:scale-110 ${
                    isSelected
                      ? "bg-brand-gradient text-white shadow-card"
                      : inCurrentMonth
                        ? "text-navy-700 hover:bg-mint-50"
                        : "text-navy-200"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
