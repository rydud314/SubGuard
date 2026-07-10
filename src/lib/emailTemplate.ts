export function buildPaymentReminderEmail(params: {
  name: string;
  price: number;
  actionLabel: string;
  daysLabel: string;
  occurrenceISO: string;
  isPayment: boolean;
}) {
  const { name, price, actionLabel, daysLabel, occurrenceISO, isPayment } = params;

  const subject = `"${name}" ${actionLabel}가 ${daysLabel} 후예요.`;
  const html = `
    <div style="font-family:sans-serif;padding:24px;color:#132A4C;">
      <h2 style="margin:0 0 12px;">"${name}" ${actionLabel} 알림</h2>
      <p style="margin:0 0 8px;">${occurrenceISO}에 ${actionLabel}가 예정되어 있어요.</p>
      ${isPayment ? `<p style="margin:0 0 8px;">결제 금액 : ${price.toLocaleString("ko-KR")}원</p>` : ""}
      <p style="margin-top:16px;color:#94A3B8;font-size:12px;">
        이 알림을 더 받고 싶지 않다면 <a href="https://sub-guard-khaki.vercel.app/" style="color:#94A3B8;text-decoration:underline;">SubGuard</a>에서 해당 구독의 결제 알림을 꺼주세요.
      </p>
    </div>
  `;

  return { subject, html };
}
