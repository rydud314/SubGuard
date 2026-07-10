/** 실제 남은 일수를 그대로 문구로 바꾼다. 3일전/1일전 발송 창을 놓쳐 늦게 보내는 경우에도 정확한 날짜 수를 보여주기 위함. */
export function formatRelativeDayLabel(diff: number): string {
  return diff <= 0 ? "오늘" : `${diff}일 후`;
}

export function buildPaymentReminderEmail(params: {
  name: string;
  price: number;
  actionLabel: string;
  daysUntilTarget: number;
  occurrenceISO: string;
  isPayment: boolean;
}) {
  const { name, price, actionLabel, daysUntilTarget, occurrenceISO, isPayment } = params;
  const label = formatRelativeDayLabel(daysUntilTarget);

  const subject =
    label === "오늘" ? `${name} ${actionLabel}가 오늘이에요.` : `${name} ${actionLabel}가 ${label}예요.`;
  const html = `
    <div style="font-family:sans-serif;padding:24px;color:#132A4C;">
      <h2 style="margin:0 0 12px;">${name} ${actionLabel} 알림</h2>
      <p style="margin:0 0 8px;">${occurrenceISO}에 ${actionLabel}가 예정되어 있어요.</p>
      ${isPayment ? `<p style="margin:0 0 8px;">결제 금액 : ${price.toLocaleString("ko-KR")}원</p>` : ""}
      <p style="margin-top:16px;color:#94A3B8;font-size:12px;">
        이 알림을 더 받고 싶지 않다면 <a href="https://sub-guard-khaki.vercel.app/" style="color:#94A3B8;text-decoration:underline;">SubGuard</a>에서 해당 구독의 결제 알림을 꺼주세요.
      </p>
    </div>
  `;

  return { subject, html };
}
