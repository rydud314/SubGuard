"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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

  return { subscriptions, loading, error, refresh, addSubscription };
}
