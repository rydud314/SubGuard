"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { DatePickerField } from "@/components/DatePickerField";
import { ShieldLogo } from "@/components/icons/ShieldLogo";
import {
  KOREAN_SUBSCRIPTIONS,
  resolvePresetByName,
  suggestSubscriptions,
  type SuggestionResult,
} from "@/data/koreanSubscriptions";
import { formatNumberInput, parseNumberInput } from "@/lib/format";
import type { CycleUnit } from "@/types/subscription";

const CYCLE_UNITS: CycleUnit[] = ["주", "월", "년"];
const TOTAL_FIELDS = 4;

export default function RegisterRegularPage() {
  const router = useRouter();
  const { user } = useSession();
  const { addSubscription } = useSubscriptions(user?.id);

  const [name, setName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<{ iconLabel: string; color: string } | null>(
    null
  );

  const [priceDisplay, setPriceDisplay] = useState("");
  const [payDate, setPayDate] = useState("");
  const [cycleCount, setCycleCount] = useState(1);
  const [cycleUnit, setCycleUnit] = useState<CycleUnit>("월");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const suggestions: SuggestionResult[] = useMemo(() => suggestSubscriptions(name), [name]);
  const price = parseNumberInput(priceDisplay);

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(payDate) && !Number.isNaN(new Date(payDate).getTime());
  const filledCount = [name.trim().length > 0, price > 0, isValidDate, cycleCount >= 1].filter(
    Boolean
  ).length;
  const progress = Math.round((filledCount / TOTAL_FIELDS) * 100);

  const handleSelectSuggestion = (preset: SuggestionResult) => {
    setName(preset.name);
    setSelectedPreset({ iconLabel: preset.iconLabel, color: preset.color });
    setShowSuggestions(false);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSelectedPreset(null);
    setShowSuggestions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("구독서비스 이름을 입력해주세요.");
      return;
    }
    if (price <= 0) {
      setErrorMessage("결제 금액을 올바르게 입력해주세요.");
      return;
    }
    if (!isValidDate) {
      setErrorMessage("결제 날짜를 올바르게 입력해주세요. (예: 2026-07-15)");
      return;
    }
    if (cycleCount < 1) {
      setErrorMessage("결제 주기를 올바르게 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const preset = selectedPreset ?? resolvePresetByName(name);

    const { error } = await addSubscription({
      name: name.trim(),
      price,
      pay_date: payDate,
      cycle_count: cycleCount,
      cycle_unit: cycleUnit,
      icon_label: preset.iconLabel,
      color: preset.color,
      kind: "regular",
      trial_auto_pay: null,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(`저장에 실패했어요: ${error}`);
      setRedirecting(true);
      setTimeout(() => router.push("/"), 1800);
      return;
    }

    router.push("/register/complete");
  };

  return (
    <main className="bg-grain relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-diagonal px-5 py-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 animate-blob rounded-full bg-mint-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 animate-blob rounded-full bg-sky-500/15 blur-3xl [animation-delay:4s]" />

      <div className="glass-card relative z-10 w-full max-w-md p-7 sm:p-8">
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="mb-4 flex items-center gap-1 text-xs font-semibold text-navy-400 transition-all hover:text-mint-600"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          이전으로
        </button>

        <div className="flex items-center gap-2">
          <ShieldLogo className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-black tracking-tight text-navy-900 sm:text-xl">
              새로운 구독 서비스 등록하기
            </h1>
            <p className="text-xs font-semibold text-mint-600">정기 구독 등록</p>
          </div>
        </div>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-navy-50">
          <div
            className="h-full rounded-full bg-brand-gradient-deep transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-bold text-navy-600">
              구독서비스 이름
            </label>
            <div className="relative">
              {selectedPreset && (
                <span
                  className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: selectedPreset.color }}
                >
                  {selectedPreset.iconLabel}
                </span>
              )}
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="구독서비스 이름을 입력하세요."
                className={`input-field ${selectedPreset ? "pl-11" : ""}`}
                autoComplete="off"
              />
            </div>

            {showSuggestions && name.trim() && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-mint-100 bg-white shadow-xl animate-pop-in">
                {suggestions.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-mint-50"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.iconLabel}
                      </span>
                      <span className="font-medium text-navy-700">{s.name}</span>
                      <span className="ml-auto text-[10px] text-navy-300">{s.category}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1.5 text-[11px] text-navy-400">
              인기 구독서비스 {KOREAN_SUBSCRIPTIONS.length}종과 비교해 가장 유사한 서비스를 추천해드려요.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-navy-600">결제 금액</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(formatNumberInput(e.target.value))}
                placeholder="결제 금액을 입력하세요."
                className="input-field pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-navy-400">
                원
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-navy-600">결제 날짜</label>
            <DatePickerField value={payDate} onChange={setPayDate} placeholder="결제 날짜를 입력하세요." />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-navy-600">결제 주기</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={cycleCount}
                onChange={(e) => setCycleCount(Math.max(1, Number(e.target.value) || 1))}
                className="input-field w-20 text-center"
              />
              <span className="text-sm font-medium text-navy-500">회 /</span>
              <div className="relative flex-1">
                <select
                  value={cycleUnit}
                  onChange={(e) => setCycleUnit(e.target.value as CycleUnit)}
                  className="input-field appearance-none pr-9"
                >
                  {CYCLE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500">
              {errorMessage}
              {redirecting && " 잠시 후 메인 화면으로 이동합니다..."}
            </p>
          )}

          <button type="submit" disabled={submitting || redirecting} className="btn-primary w-full">
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
