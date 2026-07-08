"use client";

import { useRouter } from "next/navigation";
import { ShieldLogo, BrandWordmark } from "@/components/icons/ShieldLogo";

const FEATURES = [
  {
    label: "구독 일정\n한눈에",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "무료체험\n해지 알림",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: "결제 예정\n미리 확인",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="3" y="6" width="18" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 10.2h18" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: "스마트한\n구독 관리",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const PREVIEW_ROWS = [
  { day: 2, label: "넷플릭스", color: "#E50914", initial: "N" },
  { day: 8, label: "스포티파이", color: "#1DB954", initial: "S" },
  { day: 15, label: "유튜브 프리미엄", color: "#FF0000", initial: "▶" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const handleStart = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("subguard_onboarded", "1");
    }
    router.push("/login");
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6 py-14">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-mint-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 animate-blob rounded-full bg-sky-500/20 blur-3xl [animation-delay:3s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 animate-blob rounded-full bg-navy-100/70 blur-3xl [animation-delay:6s]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center animate-fade-up">
        <ShieldLogo className="h-16 w-16" />
        <BrandWordmark className="mt-4 text-4xl" />
        <p className="mt-3 text-sm leading-relaxed text-navy-400">
          흩어진 구독 서비스를 달력 한 곳에 모아보고,
          <br />
          결제 임박 알림으로 불필요한 지출을 막아드려요.
        </p>
      </div>

      <div
        className="relative z-10 mt-8 w-full max-w-md animate-fade-up [animation-delay:120ms]"
        style={{ opacity: 0 }}
      >
        <div className="glass-card overflow-hidden p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-navy-800">2026년 7월</p>
            <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700">
              이번 달 구독료 42,800원
            </span>
          </div>
          <div className="space-y-2">
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-softmint-100/70 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                    style={{ backgroundColor: row.color }}
                  >
                    {row.initial}
                  </span>
                  <span className="text-xs font-medium text-navy-700">{row.label}</span>
                </div>
                <span className="text-xs font-semibold text-navy-400">7월 {row.day}일</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 grid w-full max-w-md grid-cols-4 gap-2 animate-fade-up [animation-delay:200ms]" style={{ opacity: 0 }}>
        {FEATURES.map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 px-2 py-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white">
              {f.icon}
            </div>
            <p className="whitespace-pre-line text-[11px] font-semibold leading-tight text-navy-700">
              {f.label}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="btn-primary relative z-10 mt-10 w-full max-w-md animate-fade-up [animation-delay:280ms]"
        style={{ opacity: 0 }}
      >
        시작하기
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </main>
  );
}
