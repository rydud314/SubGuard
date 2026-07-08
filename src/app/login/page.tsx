"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/useSession";
import { ShieldLogo, BrandWordmark } from "@/components/icons/ShieldLogo";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMessage("로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-grain relative flex min-h-dvh items-center justify-center overflow-hidden bg-brand-diagonal px-6">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 animate-blob rounded-full bg-mint-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-blob rounded-full bg-sky-500/20 blur-3xl [animation-delay:4s]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 animate-blob rounded-full bg-violet-200/30 blur-3xl [animation-delay:2s]" />

      <div className="glass-card relative z-10 w-full max-w-md p-8 text-center animate-pop-in">
        <div className="flex flex-col items-center">
          <ShieldLogo className="h-14 w-14" />
          <BrandWordmark className="mt-3 text-3xl" />
        </div>
        <h1 className="mt-6 text-lg font-black tracking-tight text-navy-900">
          구글 계정으로 간편하게 시작하세요
        </h1>
        <p className="mt-2 text-sm text-navy-400">
          로그인하면 구독 서비스 결제일을 캘린더에서 한눈에 확인할 수 있어요.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-navy-100 bg-white px-5 py-3.5 text-sm font-semibold text-navy-800 shadow-sm transition-all duration-200 hover:scale-105 hover:border-mint-300 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3.02h3.89c2.27-2.09 3.58-5.17 3.58-8.84Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.29v3.09A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.31 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.58.38-2.31V6.6H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.4l4.02-3.09Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.35.6 4.6 1.79l3.45-3.45C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.6l4.02 3.09C6.25 6.87 8.89 4.77 12 4.77Z"
            />
          </svg>
          {submitting ? "이동 중..." : "Google 계정으로 로그인"}
        </button>

        {errorMessage && (
          <p className="mt-4 text-xs font-medium text-rose-500">{errorMessage}</p>
        )}

        <p className="mt-8 text-[11px] leading-relaxed text-navy-400/70">
          로그인 시 SubGuard의 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
}
