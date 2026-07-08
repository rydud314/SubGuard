"use client";

import { useRouter } from "next/navigation";
import { ShieldLogo } from "@/components/icons/ShieldLogo";

export default function RegisterSelectPage() {
  const router = useRouter();

  return (
    <main className="bg-grain relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-diagonal px-5 py-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 animate-blob rounded-full bg-mint-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 animate-blob rounded-full bg-sky-500/15 blur-3xl [animation-delay:4s]" />

      <div className="glass-card relative z-10 w-full max-w-md p-7 text-center sm:p-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-4 flex items-center gap-1 text-xs font-semibold text-navy-400 transition-all hover:text-mint-600"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          메인으로
        </button>

        <div className="flex flex-col items-center">
          <ShieldLogo className="h-12 w-12" />
        </div>

        <h1 className="mt-4 text-lg font-black tracking-tight text-navy-900 sm:text-xl">
          새로운 구독 서비스 등록하기
        </h1>
        <p className="mt-2 text-sm text-navy-400">등록하는 구독 서비스의 유형을 선택하세요.</p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/register/trial")}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-white px-5 py-7 transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:shadow-card"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm font-bold text-navy-800">무료 체험</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/register/regular")}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-white px-5 py-7 transition-all duration-200 hover:scale-105 hover:border-mint-300 hover:shadow-card"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-100 text-mint-700 transition-colors group-hover:bg-brand-gradient-deep group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66M17 3v4h-4M7 21v-4h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-bold text-navy-800">정기 구독</span>
          </button>
        </div>
      </div>
    </main>
  );
}
