import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildPaymentReminderEmail } from "@/lib/emailTemplate";

// 결제 알림 메일 서식을 실제 발송 없이(구독 데이터/스케줄과 무관하게) 눈으로 확인하기 위한 테스트 전용 엔드포인트.
// CRON_SECRET으로만 보호하며, /api/cron/notify와 동일한 인증 방식을 그대로 사용한다.

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY 환경 변수가 설정되지 않았습니다." }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);

  const samples = [
    buildPaymentReminderEmail({
      name: "넷플릭스",
      price: 17000,
      actionLabel: "결제",
      daysLabel: "3일",
      occurrenceISO: "2026-07-13",
      isPayment: true,
    }),
    buildPaymentReminderEmail({
      name: "노션",
      price: 0,
      actionLabel: "무료 체험 종료",
      daysLabel: "1일",
      occurrenceISO: "2026-07-11",
      isPayment: false,
    }),
  ];

  const results = [];
  for (const { subject, html } of samples) {
    const { data, error } = await resend.emails.send({
      from: "SubGuard <onboarding@resend.dev>",
      to: "rydud314@gmail.com",
      subject,
      html,
    });
    results.push(error ? { subject, error: error.message } : { subject, sent: true, id: data?.id });
  }

  return NextResponse.json({ results });
}
