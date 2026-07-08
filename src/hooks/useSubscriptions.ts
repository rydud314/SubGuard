"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toISODate } from "@/lib/format";
import type { NewSubscription, Subscription } from "@/types/subscription";

export function useSubscriptions(userId: string | null | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const updateSubscription = useCallback(
    async (id: string, patch: Partial<Pick<Subscription, "price" | "cycle_count" | "cycle_unit">>) => {
      const { error: updateError } = await supabase.from("subscriptions").update(patch).eq("id", id);
      if (updateError) return { error: updateError.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  /** 하드 삭제 대신 취소 시점을 기록한다: 그 이후 결제일부터 캘린더에서 사라지고, 이전 데이터는 그대로 유지된다. */
  const cancelSubscription = useCallback(
    async (id: string) => {
      const { error: cancelError } = await supabase
        .from("subscriptions")
        .update({ canceled_from: toISODate(new Date()) })
        .eq("id", id);
      if (cancelError) return { error: cancelError.message };
      await refresh();
      return { error: null };
    },
    [refresh]
  );

  return { subscriptions, loading, error, refresh, addSubscription, updateSubscription, cancelSubscription };
}
