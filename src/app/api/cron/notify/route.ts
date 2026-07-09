import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getNextOccurrence } from "@/lib/recurrence";
import { daysUntil, toISODate } from "@/lib/format";
import type { Subscription } from "@/types/subscription";

// Vercel Cron이 매일 호출하는 서버 전용 엔드포인트.
// 각 구독 서비스의 결제(또는 무료체험 종료)일이 3일 전/1일 전이면 이메일로 1회씩 알린다.
// SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY / CRON_SECRET는 진짜 비밀값이라
// (공개용 anon 키와 달리) 소스코드에 하드코딩하지 않고 Vercel 환경 변수로만 관리한다.

const SUPABASE_URL = "https://qtonlxyyqiohaezicski.supabase.co";

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
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!serviceRoleKey || !resendApiKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY 또는 RESEND_API_KEY 환경 변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);
  const resend = new Resend(resendApiKey);

  const { data, error } = await supabaseAdmin.from("subscriptions").select("*").eq("notify_enabled", true);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subscriptions = (data ?? []) as Subscription[];
  const today = new Date();
  const results: Array<{ id: string; name: string; sent?: "3d" | "1d"; error?: string }> = [];

  for (const sub of subscriptions) {
    const next = getNextOccurrence(sub, today);
    if (!next) continue;

    const diff = daysUntil(next, today);
    const occurrenceISO = toISODate(next);

    let target: "3d" | "1d" | null = null;
    if (diff === 3 && sub.notified_3d_for !== occurrenceISO) target = "3d";
    else if (diff === 1 && sub.notified_1d_for !== occurrenceISO) target = "1d";
    if (!target) continue;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const isPayment = sub.price > 0;
    const daysLabel = target === "3d" ? "3일" : "1일";
    const actionLabel = isPayment ? "결제" : "무료 체험 종료";
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
      results.push({ id: sub.id, name: sub.name, error: sendError.message });
      continue;
    }

    const patch = target === "3d" ? { notified_3d_for: occurrenceISO } : { notified_1d_for: occurrenceISO };
    await supabaseAdmin.from("subscriptions").update(patch).eq("id", sub.id);
    results.push({ id: sub.id, name: sub.name, sent: target });
  }

  return NextResponse.json({ checked: subscriptions.length, results });
}
