"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// VAPID 공개키. 브라우저에 그대로 노출되는 게 정상인 "공개" 키라서
// (Supabase publishable key와 같은 성격) 하드코딩한다. 개인키는 서버(Vercel 환경 변수)에만 둔다.
const VAPID_PUBLIC_KEY = "BOkaQioZzBtINb0_XhACCbjxlOQUvNVwGg8ZFjTATyQGl-aRbIzSly6ZQcEwV7e2gJxIeF6pyhQtWjMixOtmFJo";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export type PushStatus = "loading" | "unsupported" | "denied" | "unsubscribed" | "subscribed";
export type TestPushStatus = "idle" | "sending" | "sent" | "error";

export function usePushNotifications(userId: string | null | undefined) {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [testStatus, setTestStatus] = useState<TestPushStatus>("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const existing = await registration?.pushManager.getSubscription();
      setStatus(existing ? "subscribed" : "unsubscribed");
    } catch {
      setStatus("unsubscribed");
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = useCallback(async () => {
    if (!userId) {
      setErrorMessage("로그인이 필요합니다.");
      return;
    }
    setErrorMessage(null);
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "unsubscribed");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const json = pushSubscription.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth_key: json.keys!.auth,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setStatus("subscribed");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "알림 설정에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    setErrorMessage(null);
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const existing = await registration?.pushManager.getSubscription();
      if (existing) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", existing.endpoint);
        await existing.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "알림 해제에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    setTestStatus("sending");
    setTestMessage(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setTestStatus("error");
        setTestMessage("로그인이 필요합니다.");
        return;
      }

      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setTestStatus("error");
        setTestMessage(json.error ?? "테스트 알림 발송에 실패했어요.");
        return;
      }
      if (json.sent === 0) {
        setTestStatus("error");
        setTestMessage(json.message ?? "등록된 구독이 없어요.");
        return;
      }

      const anySent = Array.isArray(json.results) && json.results.some((r: { sent?: boolean }) => r.sent);
      setTestStatus(anySent ? "sent" : "error");
      setTestMessage(anySent ? "테스트 알림을 보냈어요. 잠시 후 알림을 확인해보세요." : "발송에 실패했어요.");
    } catch (e) {
      setTestStatus("error");
      setTestMessage(e instanceof Error ? e.message : "테스트 알림 발송에 실패했어요.");
    }
  }, []);

  return { status, busy, errorMessage, subscribe, unsubscribe, testStatus, testMessage, sendTestNotification };
}
