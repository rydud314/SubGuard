"use client";

import { useState } from "react";
import type { CycleUnit, Subscription } from "@/types/subscription";
import { formatNumberInput, formatWon, parseNumberInput } from "@/lib/format";

const CYCLE_UNITS: CycleUnit[] = ["주", "월", "년"];

interface SubscriptionDetailModalProps {
  subscription: Subscription;
  occurrenceDate: Date;
  onClose: () => void;
  onUpdate: (
    sub: Subscription,
    occurrenceDate: Date,
    patch: Partial<Pick<Subscription, "price" | "cycle_count" | "cycle_unit">>
  ) => Promise<{ error: string | null }>;
  onCancel: (sub: Subscription, occurrenceDate: Date) => Promise<{ error: string | null }>;
  onToggleNotify: (sub: Subscription, enabled: boolean) => Promise<{ error: string | null }>;
}

export function SubscriptionDetailModal({
  subscription,
  occurrenceDate,
  onClose,
  onUpdate,
  onCancel,
  onToggleNotify,
}: SubscriptionDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState(subscription.price.toLocaleString("ko-KR"));
  const [cycleCount, setCycleCount] = useState(subscription.cycle_count);
  const [cycleUnit, setCycleUnit] = useState<CycleUnit>(subscription.cycle_unit);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [notifyEnabled, setNotifyEnabled] = useState(subscription.notify_enabled);
  const [togglingNotify, setTogglingNotify] = useState(false);

  const handleToggleNotify = async () => {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    setTogglingNotify(true);
    const { error } = await onToggleNotify(subscription, next);
    setTogglingNotify(false);
    if (error) {
      setNotifyEnabled(!next);
      setErrorMessage(`알림 설정 변경에 실패했어요: ${error}`);
    }
  };

  const isTrial = subscription.kind === "trial";
  const isTrialWithoutPay = isTrial && subscription.trial_auto_pay === false;
  const isTrialInProgress = isTrial && new Date() < new Date(subscription.pay_date);
  // 자동결제 체험은 종료일이 지나기 전까지만 무료체험 항목으로 표시하고, 지나면 정기 결제처럼 관리한다.
  const showTrialFields = isTrialWithoutPay || (isTrial && subscription.trial_auto_pay === true && isTrialInProgress);

  const trialPeriodDays = (() => {
    if (!showTrialFields || !subscription.trial_start_date) return null;
    const start = new Date(subscription.trial_start_date);
    const end = new Date(subscription.pay_date);
    const days = Math.round((end.getTime() - start.getTime()) / 86400000);
    return Number.isFinite(days) && days > 0 ? days : null;
  })();

  const handleSave = async () => {
    setErrorMessage(null);
    const price = parseNumberInput(priceDisplay);
    if (price <= 0) {
      setErrorMessage("결제 금액을 올바르게 입력해주세요.");
      return;
    }
    setSaving(true);
    const { error } = await onUpdate(subscription, occurrenceDate, {
      price,
      cycle_count: cycleCount,
      cycle_unit: cycleUnit,
    });
    setSaving(false);
    if (error) {
      setErrorMessage(`저장에 실패했어요: ${error}`);
      return;
    }
    onClose();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await onCancel(subscription, occurrenceDate);
    setDeleting(false);
    if (error) {
      setErrorMessage(`삭제에 실패했어요: ${error}`);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-pop-in rounded-3xl bg-white p-7 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy-400 transition-all hover:scale-105 hover:bg-navy-50 hover:text-navy-700"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: subscription.color }}
          >
            {subscription.icon_label}
          </span>
          <div>
            <h2 className="text-lg font-black tracking-tight text-navy-900">{subscription.name}</h2>
            {isTrialInProgress && (
              <span className="pill-badge mt-1 bg-amber-100 text-amber-700">현재 무료 체험 중</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-navy-50/60 p-4">
          <div>
            <p className="text-sm font-bold text-navy-800">결제 알림</p>
            <p className="text-[11px] text-navy-400">3일 전, 1일 전에 이메일로 알려드려요.</p>
          </div>
          <button
            type="button"
            onClick={handleToggleNotify}
            disabled={togglingNotify}
            aria-pressed={notifyEnabled}
            aria-label="결제 알림 켜기/끄기"
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-60 ${
              notifyEnabled ? "bg-mint-500" : "bg-navy-200"
            }`}
          >
            <span
              className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-200 ${
                notifyEnabled ? "translate-x-[22px]" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-3 space-y-3 rounded-2xl bg-navy-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy-400">결제 금액</span>
            {editing ? (
              <input
                type="text"
                inputMode="numeric"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(formatNumberInput(e.target.value))}
                className="w-32 rounded-lg border border-mint-200 bg-white px-2 py-1 text-right text-sm font-bold text-navy-800 focus:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-100"
              />
            ) : (
              <span className="text-sm font-bold text-navy-800">{formatWon(subscription.price)}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy-400">
              {showTrialFields ? "무료 체험 기간" : "결제 주기"}
            </span>
            {editing && !showTrialFields ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={cycleCount}
                  onChange={(e) => setCycleCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-12 rounded-lg border border-mint-200 bg-white px-1.5 py-1 text-center text-sm font-bold text-navy-800 focus:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-100"
                />
                <span className="text-xs text-navy-500">회 /</span>
                <select
                  value={cycleUnit}
                  onChange={(e) => setCycleUnit(e.target.value as CycleUnit)}
                  className="rounded-lg border border-mint-200 bg-white px-1.5 py-1 text-sm font-bold text-navy-800 focus:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-100"
                >
                  {CYCLE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-sm font-bold text-navy-800">
                {showTrialFields
                  ? trialPeriodDays
                    ? `${trialPeriodDays}일`
                    : "-"
                  : `${subscription.cycle_count}회 / ${subscription.cycle_unit}`}
              </span>
            )}
          </div>

          {showTrialFields && subscription.trial_start_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy-400">무료 체험 시작일</span>
              <span className="text-sm font-bold text-navy-800">
                {subscription.trial_start_date.replace(/-/g, ".")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy-400">
              {showTrialFields ? "무료 체험 종료일" : "첫 결제 날짜"}
            </span>
            <span className="text-sm font-bold text-navy-800">{subscription.pay_date.replace(/-/g, ".")}</span>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500">{errorMessage}</p>
        )}

        <div className="mt-6 flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setPriceDisplay(subscription.price.toLocaleString("ko-KR"));
                  setCycleCount(subscription.cycle_count);
                  setCycleUnit(subscription.cycle_unit);
                  setErrorMessage(null);
                }}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? "저장 중..." : "저장"}
              </button>
            </>
          ) : isTrialWithoutPay ? (
            <button type="button" onClick={() => setConfirmingDelete(true)} className="btn-secondary w-full !border-rose-200 !text-rose-500 hover:!border-rose-400 hover:!bg-rose-50">
              삭제하기
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="btn-secondary flex-1 !border-rose-200 !text-rose-500 hover:!border-rose-400 hover:!bg-rose-50"
              >
                삭제하기
              </button>
              <button type="button" onClick={() => setEditing(true)} className="btn-primary flex-1">
                편집
              </button>
            </>
          )}
        </div>

        {confirmingDelete && (
          <div className="mt-3 animate-pop-in rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-xs font-semibold text-rose-600">
              정말 삭제할까요? 이 날짜를 포함한 이후 결제 일정부터 캘린더에서 사라져요.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-navy-600 shadow-sm transition-all hover:scale-105"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제 확정"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
