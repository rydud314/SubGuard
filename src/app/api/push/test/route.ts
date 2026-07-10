import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { PushSubscriptionRow } from "@/types/subscription";

// 로그인한 사용자가 앱 안에서 직접 "테스트 알림 보내기"를 눌러 자기 자신의 브라우저 푸시 구독으로만
// 즉시 테스트 알림을 보낼 수 있는 엔드포인트. CRON_SECRET 대신 로그인 세션의 액세스 토큰으로 인증하고,
// 본인이 등록한 push_subscriptions에만 발송한다(다른 사용자에게는 절대 보내지 않음).

const SUPABASE_URL = "https://qtonlxyyqiohaezicski.supabase.co";
const VAPID_PUBLIC_KEY = "BOkaQioZzBtINb0_XhACCbjxlOQUvNVwGg8ZFjTATyQGl-aRbIzSly6ZQcEwV7e2gJxIeF6pyhQtWjMixOtmFJo";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "");
  if (!token) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다." }, { status: 500 });
  }
  if (!vapidPrivateKey) {
    return NextResponse.json({ error: "VAPID_PRIVATE_KEY 환경 변수가 설정되지 않았습니다." }, { status: 500 });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "로그인 세션이 만료됐어요. 새로고침 후 다시 시도해주세요." }, { status: 401 });
  }

  webpush.setVapidDetails("mailto:support@subguard.app", VAPID_PUBLIC_KEY, vapidPrivateKey);

  const { data: rows, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userData.user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pushRows = (rows ?? []) as PushSubscriptionRow[];
  if (pushRows.length === 0) {
    return NextResponse.json({
      sent: 0,
      message: "등록된 브라우저 알림 구독이 없어요. '브라우저 알림 켜기'를 먼저 눌러주세요.",
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
        // 브라우저가 구독을 해지했거나 만료됨: 더 이상 유효하지 않은 구독 정보를 정리한다.
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", row.id);
      }
      results.push({ id: row.id, sent: false, statusCode });
    }
  }

  return NextResponse.json({ results });
}
