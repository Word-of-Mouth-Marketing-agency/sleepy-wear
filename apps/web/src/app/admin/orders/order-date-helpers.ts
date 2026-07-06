export type OrderPeriod = "all" | "day" | "week" | "month" | "year" | "custom";

export const ORDER_PERIOD_OPTIONS: { value: OrderPeriod; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "day", label: "يوم" },
  { value: "week", label: "أسبوع" },
  { value: "month", label: "شهر" },
  { value: "year", label: "سنة" },
  { value: "custom", label: "فترة مخصصة" },
];

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDate(dateString: string): Date | null {
  if (!dateString) return null;
  const match = DATE_RE.exec(dateString);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

type AnchorPeriod = Exclude<OrderPeriod, "all" | "custom">;

export function getOrderDateRange(
  anchorDate: string,
  period: AnchorPeriod,
): { from: string; to: string } | null {
  const anchor = parseLocalDate(anchorDate);
  if (!anchor) return null;

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const day = anchor.getDate();

  if (period === "day") {
    const start = new Date(year, month, day);
    const end = new Date(year, month, day);
    end.setDate(end.getDate() + 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (period === "week") {
    const start = new Date(year, month, day);
    const daysSinceSaturday = (start.getDay() + 1) % 7;
    start.setDate(start.getDate() - daysSinceSaturday);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (period === "month") {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function getCustomOrderDateRange(
  fromDate: string,
  toDate: string,
): { from: string; to: string } | null {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (!from || !to) return null;
  if (from > to) return null;

  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  end.setDate(end.getDate() + 1);
  return { from: from.toISOString(), to: end.toISOString() };
}

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function formatPeriodDescription(
  anchorDate: string,
  period: AnchorPeriod,
): string {
  const parsed = parseLocalDate(anchorDate);
  if (!parsed) return "";

  const year = parsed.getFullYear();
  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();

  if (period === "day") {
    return `عرض طلبات يوم ${day} ${ARABIC_MONTHS[month - 1]} ${year}`;
  }

  if (period === "week") {
    return "عرض طلبات الأسبوع المحدد";
  }

  if (period === "month") {
    return `عرض طلبات شهر ${ARABIC_MONTHS[month - 1]} ${year}`;
  }

  return `عرض طلبات سنة ${year}`;
}

export function formatCustomPeriodDescription(
  fromDate: string,
  toDate: string,
): string {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (!from || !to) return "";

  const fromDay = from.getDate();
  const fromMonth = ARABIC_MONTHS[from.getMonth()];
  const fromYear = from.getFullYear();

  const toDay = to.getDate();
  const toMonth = ARABIC_MONTHS[to.getMonth()];
  const toYear = to.getFullYear();

  return `عرض الطلبات من ${fromDay} ${fromMonth} ${fromYear} إلى ${toDay} ${toMonth} ${toYear}`;
}

export function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
