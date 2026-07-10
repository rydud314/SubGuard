import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { PushSubscriptionRow } from "@/types/subscription";

// 브라우저 푸시가 실제로 기기에 도달하는지, 구독 데이터/스케줄과 무관하게 즉시 확인하기 위한 테스트 전용 엔드포인트.
// CRON_SECRET으로만 보호하며, /api/cron/notify와 동일한 인증 방식을 그대로 사용한다.

const SUPABASE_URL = "https://qtonlxyyqiohaezicski.supabase.co";
const VAPID_PUBLIC_KEY = "BOkaQioZzBtINb0_XhACCbjxlOQUvNVwGg8ZFjTATyQGl-aRbIzSly6ZQcEwV7e2gJxIeF6pyhQtWjMixOtmFJo";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다." }, { status: 500 });
  }
  if (!vapidPrivateKey) {
    return NextResponse.json({ error: "VAPID_PRIVATE_KEY 환경 변수가 설정되지 않았습니다." }, { status: 500 });
  }

  webpush.setVapidDetails("mailto:support@subguard.app", VAPID_PUBLIC_KEY, vapidPrivateKey);

  const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);
  const { data: rows, error } = await supabaseAdmin.from("push_subscriptions").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pushRows = (rows ?? []) as PushSubscriptionRow[];
  if (pushRows.length === 0) {
    return NextResponse.json({
      sent: 0,
      message: "push_subscriptions 테이블에 등록된 구독이 없어요. 사이드바 설정에서 '브라우저 알림 켜기'를 먼저 눌러주세요.",
    });
  }

  const payload = JSON.stringify({
    title: "[SubGuard] 테스트 알림",
    body: "브라우저 푸시가 정상적으로 도착했어요.",
    url: "/",
  });

  const results = [];
  for (const row of pushRows) {
    try {
      await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth_key } }, payload);
      results.push({ id: row.id, sent: true });
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", row.id);
      }
      results.push({ id: row.id, sent: false, statusCode, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ results });
}
