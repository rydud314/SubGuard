"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ShieldLogo } from "@/components/icons/ShieldLogo";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    const succeed = () => {
      if (cancelled || settled) return;
      settled = true;
      router.replace("/");
    };

    const fail = () => {
      if (cancelled || settled) return;
      settled = true;
      setErrorMessage("로그인에 실패했어요. 다시 시도해주세요.");
      setTimeout(() => router.replace("/login"), 1500);
    };

    // detectSessionInUrl이 리다이렉트 URL의 인가 코드를 세션으로 교환하는 과정은
    // 비동기(네트워크 호출)로 진행되므로, onAuthStateChange 이벤트를 우선 신호로 삼는다.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) succeed();
    });

    // 이미 세션이 존재하는 경우(예: 뒤로가기로 재진입)를 위한 즉시 확인.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) succeed();
    });

    // 코드 교환이 비정상적으로 오래 걸리거나 실패한 경우를 위한 최종 타임아웃.
    const timeoutId = setTimeout(fail, 8000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldLogo className="h-12 w-12 animate-pulse" />
      <p className="text-sm font-medium text-navy-500">
        {errorMessage ?? "로그인 처리 중이에요..."}
      </p>
    </main>
  );
}
