"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthlyCostSummary } from "@/components/MonthlyCostSummary";
import { UpcomingPaymentsCard } from "@/components/UpcomingPaymentsCard";
import { RegisterModal } from "@/components/RegisterModal";
import { getNextOccurrence } from "@/lib/recurrence";
import { daysUntil } from "@/lib/format";
import { ShieldLogo, BrandWordmark } from "@/components/icons/ShieldLogo";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { subscriptions, loading: subsLoading } = useSubscriptions(user?.id);

  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [dismissedModal, setDismissedModal] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
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

  const upcomingCount = useMemo(() => {
    const today = new Date();
    return subscriptions.filter((sub) => {
      const next = getNextOccurrence(sub, today);
      if (!next) return false;
      const diff = daysUntil(next, today);
      return diff >= 0 && diff <= 3;
    }).length;
  }, [subscriptions]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (sessionLoading || !user) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <ShieldLogo className="h-10 w-10 animate-pulse" />
        <p className="text-sm text-navy-400">불러오는 중...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar upcomingCount={upcomingCount} onSignOut={handleSignOut} />

      <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <ShieldLogo className="h-8 w-8" />
            <BrandWordmark className="text-xl" />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-semibold text-navy-400 hover:text-rose-500"
          >
            로그아웃
          </button>
        </header>

        <div className="mb-6">
          <MonthlyCostSummary subscriptions={subscriptions} currentDate={currentDate} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <MonthCalendar
            currentDate={currentDate}
            subscriptions={subscriptions}
            onPrevMonth={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            onNextMonth={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            onToday={() => setCurrentDate(startOfMonth(new Date()))}
            onRegisterClick={() => router.push("/register")}
          />

          <div className="flex flex-col gap-5">
            <UpcomingPaymentsCard subscriptions={subscriptions} />
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
    </div>
  );
}
