import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import webpush from "web-push";
import { getNextOccurrence } from "@/lib/recurrence";
import { daysUntil, toISODate } from "@/lib/format";
import type { PushSubscriptionRow, Subscription } from "@/types/subscription";

// Vercel Cron이 매일 호출하는 서버 전용 엔드포인트.
// 각 구독 서비스의 결제(또는 무료체험 종료)일이 3일 전/1일 전이면 이메일과 브라우저 푸시로 각각 1회씩 알린다.
// SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY / CRON_SECRET / VAPID_PRIVATE_KEY는 진짜 비밀값이라
// (공개용 anon 키·VAPID 공개키와 달리) 소스코드에 하드코딩하지 않고 Vercel 환경 변수로만 관리한다.

const SUPABASE_URL = "https://qtonlxyyqiohaezicski.supabase.co";
const VAPID_PUBLIC_KEY = "BOkaQioZzBtINb0_XhACCbjxlOQUvNVwGg8ZFjTATyQGl-aRbIzSly6ZQcEwV7e2gJxIeF6pyhQtWjMixOtmFJo";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function daysLabelOf(target: "3d" | "1d") {
  return target === "3d" ? "3일" : "1일";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!serviceRoleKey || !resendApiKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY 또는 RESEND_API_KEY 환경 변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);
  const resend = new Resend(resendApiKey);
  if (vapidPrivateKey) {
    webpush.setVapidDetails("mailto:support@subguard.app", VAPID_PUBLIC_KEY, vapidPrivateKey);
  }

  const [{ data, error }, { data: pushRowsData }] = await Promise.all([
    supabaseAdmin.from("subscriptions").select("*").eq("notify_enabled", true),
    supabaseAdmin.from("push_subscriptions").select("*"),
  ]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pushByUser = new Map<string, PushSubscriptionRow[]>();
  for (const row of (pushRowsData ?? []) as PushSubscriptionRow[]) {
    if (!pushByUser.has(row.user_id)) pushByUser.set(row.user_id, []);
    pushByUser.get(row.user_id)!.push(row);
  }

  const subscriptions = (data ?? []) as Subscription[];
  const today = new Date();
  const results: Array<{ id: string; name: string; email?: "3d" | "1d"; emailError?: string; push?: "3d" | "1d" }> = [];

  for (const sub of subscriptions) {
    const next = getNextOccurrence(sub, today);
    if (!next) continue;

    const diff = daysUntil(next, today);
    const occurrenceISO = toISODate(next);

    let emailTarget: "3d" | "1d" | null = null;
    if (diff === 3 && sub.notified_3d_for !== occurrenceISO) emailTarget = "3d";
    else if (diff === 1 && sub.notified_1d_for !== occurrenceISO) emailTarget = "1d";

    let pushTarget: "3d" | "1d" | null = null;
    if (diff === 3 && sub.push_notified_3d_for !== occurrenceISO) pushTarget = "3d";
    else if (diff === 1 && sub.push_notified_1d_for !== occurrenceISO) pushTarget = "1d";

    if (!emailTarget && !pushTarget) continue;

    const isPayment = sub.price > 0;
    const actionLabel = isPayment ? "결제" : "무료 체험 종료";
    const resultEntry: (typeof results)[number] = { id: sub.id, name: sub.name };

    if (emailTarget) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
      const email = userData?.user?.email;

      if (email) {
        const daysLabel = daysLabelOf(emailTarget);
        const subject = `[SubGuard] ${sub.name} ${actionLabel}이 ${daysLabel} 후예요`;
        const html = `
          <div style="font-family:sans-serif;padding:24px;color:#132A4C;">
            <h2 style="margin:0 0 12px;">${sub.name} ${actionLabel} 알림</h2>
            <p style="margin:0 0 8px;">${occurrenceISO}에 ${actionLabel}이 예정되어 있어요. (${daysLabel} 남음)</p>
            ${isPayment ? `<p style="margin:0 0 8px;">결제 금액: ${sub.price.toLocaleString("ko-KR")}원</p>` : ""}
            <p style="margin-top:16px;color:#94A3B8;font-size:12px;">
              이 알림을 더 받고 싶지 않다면 SubGuard 앱에서 해당 구독의 결제 알림을 꺼주세요.
            </p>
          </div>
        `;

        const { error: sendError } = await resend.emails.send({
          from: "SubGuard <onboarding@resend.dev>",
          to: email,
          subject,
          html,
        });

        if (sendError) {
          resultEntry.emailError = sendError.message;
        } else {
          const patch = emailTarget === "3d" ? { notified_3d_for: occurrenceISO } : { notified_1d_for: occurrenceISO };
          await supabaseAdmin.from("subscriptions").update(patch).eq("id", sub.id);
          resultEntry.email = emailTarget;
        }
      }
    }

    if (pushTarget && vapidPrivateKey) {
      const rows = pushByUser.get(sub.user_id) ?? [];
      if (rows.length > 0) {
        const daysLabel = daysLabelOf(pushTarget);
        const payload = JSON.stringify({
          title: `[SubGuard] ${sub.name} ${actionLabel}`,
          body: `${daysLabel} 후 ${actionLabel} 예정이에요. (${occurrenceISO})`,
          url: "/",
        });

        let anySuccess = false;
        for (const row of rows) {
          try {
            await webpush.sendNotification(
              { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth_key } },
              payload
            );
            anySuccess = true;
          } catch (err) {
            const statusCode = (err as { statusCode?: number })?.statusCode;
            if (statusCode === 404 || statusCode === 410) {
              // 브라우저가 구독을 해지했거나 만료됨: 더 이상 유효하지 않은 구독 정보를 정리한다.
              await supabaseAdmin.from("push_subscriptions").delete().eq("id", row.id);
            }
          }
        }

        if (anySuccess) {
          const patch =
            pushTarget === "3d" ? { push_notified_3d_for: occurrenceISO } : { push_notified_1d_for: occurrenceISO };
          await supabaseAdmin.from("subscriptions").update(patch).eq("id", sub.id);
          resultEntry.push = pushTarget;
        }
      }
    }

    results.push(resultEntry);
  }

  return NextResponse.json({ checked: subscriptions.length, results });
}
