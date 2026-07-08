export function formatWon(value: number): string {
  if (Number.isNaN(value)) return "0원";
  return `${value.toLocaleString("ko-KR")}원`;
}

/** "10000" -> "10,000" (입력 필드에서 실시간으로 콤마를 붙일 때 사용) */
export function formatNumberInput(raw: string): string {
  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("ko-KR");
}

export function parseNumberInput(raw: string): number {
  const digitsOnly = raw.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysUntil(target: Date, from: Date = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
