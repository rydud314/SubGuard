export interface DayCell {
  date: Date;
  inCurrentMonth: boolean;
}

/** 월요일 시작 6주(42칸) 달력 그리드를 생성한다. */
export function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  const gridStart = new Date(year, month, 1 - mondayIndex);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, inCurrentMonth: date.getMonth() === month };
  });
}
