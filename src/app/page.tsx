"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthlyCostCard } from "@/components/MonthlyCostCard";
import { UpcomingPaymentsCard } from "@/components/UpcomingPaymentsCard";
import { TrialEndingCard } from "@/components/TrialEndingCard";
import { RegisterModal } from "@/components/RegisterModal";
import { SubscriptionDetailModal } from "@/components/SubscriptionDetailModal";
import { ShieldLogo, BrandWordmark } from "@/components/icons/ShieldLogo";
import type { Subscription } from "@/types/subscription";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 로컬 개발 서버(`npm run dev`)에서 로그인 없이 메인 화면 디자인을 바로 확인하기 위한 미리보기 전용 우회.
// Vercel 프로덕션 빌드(next build)에서는 NODE_ENV가 "production"이라 항상 비활성화된다.
const isPreviewMode = process.env.NODE_ENV !== "production";

function buildPreviewSubscriptions(): Subscription[] {
  const today = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };
  return [
    { id: "preview-netflix", user_id: "preview", name: "넷플릭스", price: 17000, pay_date: iso(2), cycle_count: 1, cycle_unit: "월", icon_label: "N", color: "#E50914", created_at: "", kind: "regular", trial_auto_pay: null, canceled_from: null },
    { id: "preview-youtube", user_id: "preview", name: "유튜브 프리미엄", price: 14900, pay_date: iso(1), cycle_count: 1, cycle_unit: "월", icon_label: "▶", color: "#FF0000", created_at: "", kind: "regular", trial_auto_pay: null, canceled_from: null },
    { id: "preview-disney", user_id: "preview", name: "디즈니+", price: 9900, pay_date: iso(3), cycle_count: 1, cycle_unit: "월", icon_label: "D", color: "#113CCF", created_at: "", kind: "regular", trial_auto_pay: null, canceled_from: null },
    { id: "preview-spotify", user_id: "preview", name: "스포티파이", price: 10900, pay_date: iso(8), cycle_count: 1, cycle_unit: "월", icon_label: "S", color: "#1DB954", created_at: "", kind: "regular", trial_auto_pay: null, canceled_from: null },
    { id: "preview-watcha", user_id: "preview", name: "왓챠", price: 12900, pay_date: iso(-10), cycle_count: 1, cycle_unit: "월", icon_label: "W", color: "#FF0558", created_at: "", kind: "regular", trial_auto_pay: null, canceled_from: null },
    { id: "preview-chatgpt-trial", user_id: "preview", name: "챗GPT 플러스", price: 22000, pay_date: iso(2), cycle_count: 1, cycle_unit: "월", icon_label: "AI", color: "#10A37F", created_at: "", kind: "trial", trial_auto_pay: true, canceled_from: null },
  ];
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const {
    subscriptions: liveSubscriptions,
    loading: subsLoading,
    updateSubscription,
    cancelSubscription,
  } = useSubscriptions(user?.id);
  const subscriptions = isPreviewMode && !user ? buildPreviewSubscriptions() : liveSubscriptions;

  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [dismissedModal, setDismissedModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showMobileLogoutConfirm, setShowMobileLogoutConfirm] = useState(false);

  const account = user
    ? {
        email: user.email ?? "",
        name: (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? "",
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }
    : isPreviewMode
      ? { email: "preview@subguard.app", name: "미리보기 사용자", avatarUrl: null }
      : null;

  useEffect(() => {
    if (sessionLoading || isPreviewMode) return;
    if (!user) {
      const onboarded =
        typeof window !== "undefined" && window.localStorage.getItem("subguard_onboarded");
      router.replace(onboarded ? "/login" : "/onboarding");
    }
  }, [sessionLoading, user, router]);

  useEffect(() => {
    if (!subsLoading && subscriptions.length === 0 && !dismissedModal) {
      setShowRegisterModal(true);
    }
  }, [subsLoading, subscriptions.length, dismissedModal]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (sessionLoading || (!user && !isPreviewMode)) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <ShieldLogo className="h-10 w-10 animate-pulse" />
        <p className="text-sm text-navy-400">불러오는 중...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar onSignOut={handleSignOut} account={account} />

      <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <ShieldLogo className="h-8 w-8" />
            <BrandWordmark className="text-xl" />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileLogoutConfirm(true)}
            className="text-xs font-semibold text-navy-400 hover:text-rose-500"
          >
            로그아웃
          </button>
        </header>

        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
            이번 달 구독서비스 관리
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <MonthCalendar
            currentDate={currentDate}
            subscriptions={subscriptions}
            onPrevMonth={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            onNextMonth={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            onToday={() => setCurrentDate(startOfMonth(new Date()))}
            onRegisterClick={() => router.push("/register")}
            onSelectSubscription={setSelectedSubscription}
          />

          <div className="flex flex-col gap-5">
            <MonthlyCostCard
              subscriptions={subscriptions}
              currentDate={currentDate}
              onSelectSubscription={setSelectedSubscription}
            />
            <UpcomingPaymentsCard subscriptions={subscriptions} onSelectSubscription={setSelectedSubscription} />
            <TrialEndingCard subscriptions={subscriptions} onSelectSubscription={setSelectedSubscription} />
          </div>
        </div>
      </main>

      {showRegisterModal && (
        <RegisterModal
          onClose={() => {
            setShowRegisterModal(false);
            setDismissedModal(true);
          }}
          onRegister={() => router.push("/register")}
        />
      )}

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onUpdate={updateSubscription}
          onCancel={cancelSubscription}
        />
      )}

      {showMobileLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 px-6 backdrop-blur-sm md:hidden">
          <div className="relative w-full max-w-xs animate-pop-in rounded-3xl bg-white p-7 text-center shadow-2xl">
            <h2 className="text-base font-black tracking-tight text-navy-900">로그아웃 하시겠습니까?</h2>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowMobileLogoutConfirm(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMobileLogoutConfirm(false);
                  handleSignOut();
                }}
                className="flex-1 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-card transition-all duration-200 hover:scale-105 active:scale-95"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
