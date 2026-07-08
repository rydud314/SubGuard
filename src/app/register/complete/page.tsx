"use client";

import { useRouter } from "next/navigation";
import { ShieldLogo } from "@/components/icons/ShieldLogo";

export default function RegisterCompletePage() {
  const router = useRouter();

  return (
    <main className="bg-grain relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-diagonal px-6">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 animate-blob rounded-full bg-mint-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 animate-blob rounded-full bg-sky-500/20 blur-3xl [animation-delay:4s]" />

      <div className="glass-card relative z-10 flex w-full max-w-md flex-col items-center p-9 text-center animate-pop-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient-deep shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10">
            <path
              d="M5 13l4.5 4.5L19 7"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-xl font-black tracking-tight text-navy-900">등록이 완료되었습니다.</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-400">
          이제 메인 화면 달력에서 결제일을 확인하고
          <br />
          결제 임박 알림을 받아보세요.
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-mint-600">
          <ShieldLogo className="h-5 w-5" />
          <span className="text-xs font-bold">SubGuard가 결제일을 지켜봐 드릴게요</span>
        </div>

        <button type="button" onClick={() => router.push("/")} className="btn-primary mt-8 w-full">
          메인화면으로 돌아가기
        </button>
      </div>
    </main>
  );
}
