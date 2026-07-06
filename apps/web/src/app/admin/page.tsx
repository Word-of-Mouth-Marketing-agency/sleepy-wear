"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpLeft,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import {
  type AdminDashboardSummary,
  getAdminDashboardSummary,
} from "@/lib/admin-push";

const statusLabels: Record<string, string> = {
  PENDING: "جديد",
  CONFIRMED: "قيد المراجعة",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

type Preset = "today" | "yesterday" | "this_week" | "this_month" | "custom";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "اليوم" },
  { value: "yesterday", label: "أمس" },
  { value: "this_week", label: "هذا الأسبوع" },
  { value: "this_month", label: "هذا الشهر" },
  { value: "custom", label: "فترة مخصصة" },
];

const PERIOD_LABELS: Record<Preset, string> = {
  today: "إحصائيات اليوم",
  yesterday: "إحصائيات أمس",
  this_week: "إحصائيات هذا الأسبوع",
  this_month: "إحصائيات هذا الشهر",
  custom: "إحصائيات الفترة المخصصة",
};

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const fetchSummary = useCallback(
    (signal?: AbortSignal) => {
      setError(false);
      setLoading(true);

      const params: { preset?: string; from?: string; to?: string } = {};

      if (preset === "custom") {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      } else {
        params.preset = preset;
      }

      getAdminDashboardSummary(params)
        .then(setSummary)
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          if (
            err instanceof Error &&
            err.message.startsWith("HTTP 401")
          ) {
            localStorage.removeItem("admin_token");
            router.replace("/admin/login");
            return;
          }
          setError(true);
        })
        .finally(() => setLoading(false));
    },
    [preset, customFrom, customTo, router],
  );

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handlePresetChange = (p: Preset) => {
    setPreset(p);
  };

  const cards = [
    {
      label: "طلبات الفترة",
      value: loading ? "..." : summary?.periodOrders ?? "-",
      hint: "كل الطلبات في الفترة المحددة",
      icon: ShoppingCart,
      tone: "pink" as const,
    },
    {
      label: "طلبات قيد الانتظار",
      value: summary?.pendingOrders ?? "-",
      hint: "تحتاج متابعة",
      icon: Clock3,
      tone: "amber" as const,
    },
    {
      label: "طلبات مدفوعة",
      value: summary?.paidOrders ?? "-",
      hint: "إجمالي الطلبات المدفوعة",
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      label: "طلبات ملغية",
      value: summary?.cancelledOrders ?? "-",
      hint: "للمراجعة فقط",
      icon: XCircle,
      tone: "red" as const,
    },
    {
      label: "قيمة طلبات الفترة",
      value: loading ? "..." : formatMoney(summary?.periodOrderValue),
      hint: "بدون الطلبات الملغية",
      icon: ReceiptText,
      tone: "blue" as const,
    },
    {
      label: "إيراد مدفوع الفترة",
      value: loading ? "..." : formatMoney(summary?.periodPaidRevenue),
      hint: "الطلبات المدفوعة فقط",
      icon: CreditCard,
      tone: "black" as const,
    },
  ];

  const periodDescription =
    preset === "custom"
      ? customFrom && customTo
        ? `إحصائيات من ${customFrom} إلى ${customTo}`
        : customFrom
          ? `إحصائيات من ${customFrom}`
          : customTo
            ? `إحصائيات حتى ${customTo}`
            : "فترة مخصصة"
      : PERIOD_LABELS[preset];

  return (
    <PageShell
      title="لوحة الإدارة"
      eyebrow="متابعة الطلبات"
      description={periodDescription}
      noContainer
      surface="plain"
      actions={
        <Link
          href="/admin/settings/notifications"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-pink px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-pink/90"
        >
          <Bell size={16} aria-hidden />
          الإشعارات
        </Link>
      }
    >
      <div className="mb-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-bold text-[var(--muted)]">
          فلترة الإحصائيات
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex flex-wrap rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-1">
            {PRESETS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={preset === opt.value}
                onClick={() => handlePresetChange(opt.value)}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition sm:px-4 ${
                  preset === opt.value
                    ? "bg-brand-pink text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[var(--muted)]">من</label>
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || todayDateString()}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold shadow-sm focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[var(--muted)]">إلى</label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  max={todayDateString()}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold shadow-sm focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          تعذر تحميل الإحصائيات.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
                Latest orders
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-black">
                آخر الطلبات
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-extrabold text-[var(--muted)] transition hover:border-brand-pink hover:text-brand-pink"
            >
              عرض الكل
              <ArrowUpLeft size={14} aria-hidden />
            </Link>
          </div>

          <div className="mt-4 grid gap-3">
            {summary?.latestOrders?.length ? (
              summary.latestOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-4 transition hover:border-brand-pink/40 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-extrabold text-black">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-brand-pink">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[var(--muted)]">
                      {order.paymentStatus}
                    </span>
                    <span className="text-lg font-extrabold text-black">
                      {formatMoney(order.total)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl bg-[#fbf7fa] p-5 text-sm font-semibold text-[var(--muted)]">
                لا توجد طلبات حديثة للعرض.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
            Notification status
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-black">
            حالة الإشعارات
          </h2>
          <div className="mt-4 grid gap-3">
            <StatusLine
              icon={Bell}
              label="أجهزة مفعّلة"
              value={summary?.notifications.enabledDevices ?? "-"}
            />
            <StatusLine
              icon={PackageCheck}
              label="فشل حديث اليوم"
              value={summary?.notifications.recentFailures ?? "-"}
            />
          </div>
          <Link
            href="/admin/settings/notifications"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-pink/90"
          >
            إعداد الإشعارات
            <ArrowUpLeft size={16} aria-hidden />
          </Link>
          <Link
            href="/admin/orders"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-extrabold text-black transition hover:border-brand-blue hover:text-brand-blue"
          >
            متابعة كل الطلبات
            <ArrowUpLeft size={16} aria-hidden />
          </Link>
        </section>
      </div>
    </PageShell>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  tone: "pink" | "blue" | "green" | "amber" | "red" | "black";
}) {
  const toneClass = {
    pink: "bg-pink-50 text-brand-pink",
    blue: "bg-blue-50 text-brand-blue",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    black: "bg-[#fbf7fa] text-black",
  }[tone];

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}>
          <Icon size={20} aria-hidden />
        </span>
        <p className="text-2xl font-extrabold text-black">{value}</p>
      </div>
      <p className="mt-4 text-sm font-extrabold text-black">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{hint}</p>
    </div>
  );
}

function StatusLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbf7fa] px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
        <Icon size={16} aria-hidden />
        {label}
      </span>
      <span className="text-lg font-extrabold text-brand-pink">{value}</span>
    </div>
  );
}

function formatMoney(value?: number) {
  if (typeof value !== "number") return "-";
  return `${Math.round(value).toLocaleString("ar-EG")} جنيه`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
