"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toISODate } from "@/lib/format";
import type { NewSubscription, Subscription } from "@/types/subscription";

export function useSubscriptions(userId: string | null | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // userId가 바뀌는 순간(예: 로그인 완료로 undefined -> 실제 id) 렌더링 중에 즉시 loading을 true로
  // 되돌린다. 이렇게 하지 않으면, 로그인 직후 "이전 사용자(없음)의 빈 결과"가 아직 setLoading(false)로
  // 남아있는 한 틱 동안, 화면(page.tsx)이 이를 "이번 사용자도 구독이 없다"로 잘못 읽어
  // 구독 등록 팝업을 오작동시키는 경합이 생긴다.
  const [trackedUserId, setTrackedUserId] = useState(userId);
  if (userId !== trackedUserId) {
    setTrackedUserId(userId);
    setLoading(true);
  }

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("pay_date", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setSubscriptions(data as Subscription[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 실시간 반영: 다른 탭/기기에서 구독 데이터가 바뀌어도 메인 화면 캘린더가 즉시 갱신되도록 함.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`subscriptions-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const addSubscription = useCallback(
    async (payload: NewSubscription) => {
      if (!userId) return { error: "로그인이 필요합니다." };
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert([{ ...payload, user_id: userId }]);

      if (insertError) return { error: insertError.message };
      await refresh();
      return { error: null };
    },
    [userId, refresh]
  );

  /**
   * 결제 금액/주기 수정: 기존 행을 그대로 두면 과거에 표시됐던 결제 내역까지 새 값으로 바뀌어 버리므로,
   * "사용자가 캘린더에서 클릭한 그 날짜"를 기준으로 기존 행은 그 날짜부터 취소하고, 그 날짜부터 시작하는
   * 새 행을 만든다. 이렇게 하면 클릭한 날짜 이전 데이터는 그대로 유지되고, 그 날짜를 포함한 이후 데이터만
   * 새 값을 반영한다.
   */
  const updateSubscription = useCallback(
    async (
      sub: Subscription,
      occurrenceDate: Date,
      patch: Partial<Pick<Subscription, "price" | "cycle_count" | "cycle_unit">>
    ) => {
      const splitDate = toISODate(occurrenceDate);

      const { error: cancelError } = await supabase
        .from("subscriptions")
        .update({ canceled_from: splitDate })
        .eq("id", sub.id);
      if (cancelError) return { error: cancelError.message };

      const { error: insertError } = await supabase.from("subscriptions").insert([
        {
          user_id: sub.user_id,
          name: sub.name,
          price: patch.price ?? sub.price,
          pay_date: splitDate,
          cycle_count: patch.cycle_count ?? sub.cycle_count,
          cycle_unit: patch.cycle_unit ?? sub.cycle_unit,
          icon_label: sub.icon_label,
          color: sub.color,
          kind: sub.kind,
          trial_auto_pay: sub.trial_auto_pay,
          notify_enabled: sub.notify_enabled,
        },
      ]);
      if (insertError) return { error: insertError.message };

      await refresh();
      return { error: null };
    },
    [refresh]
  );

  /**
   * 하드 삭제 대신 취소 시점을 기록한다: 클릭한 캘린더 날짜를 포함한 이후 결제일부터 캘린더에서
   * 사라지고, 그 이전 데이터는 그대로 유지된다.
   */
  const cancelSubscription = useCallback(
    async (sub: Subscription, occurrenceDate: Date) => {
      const { error: cancelError } = await supabase
        .from("subscriptions")
        .update({ canceled_from: toISODate(occurrenceDate) })
        .eq("id", sub.id);
      if (cancelError) return { error: cancelError.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  /** 이 구독 서비스의 결제일 이메일 알림(3일 전/1일 전)을 켜거나 끈다. */
  const toggleNotify = useCallback(
    async (sub: Subscription, enabled: boolean) => {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ notify_enabled: enabled })
        .eq("id", sub.id);
      if (updateError) return { error: updateError.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return {
    subscriptions,
    loading,
    error,
    refresh,
    addSubscription,
    updateSubscription,
    cancelSubscription,
    toggleNotify,
  };
}
