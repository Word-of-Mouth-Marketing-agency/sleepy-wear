"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gem,
  HandCoins,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import {
  type AdminStatistics,
  getAdminStatistics,
} from "@/lib/admin-push";

type Preset = "today" | "yesterday" | "this_week" | "this_month" | "all" | "custom";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "اليوم" },
  { value: "yesterday", label: "أمس" },
  { value: "this_week", label: "هذا الأسبوع" },
  { value: "this_month", label: "هذا الشهر" },
  { value: "all", label: "الكل" },
  { value: "custom", label: "فترة مخصصة" },
];

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminStatisticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedNonce, setAppliedNonce] = useState(0);

  const fetchStats = useCallback(
    (signal?: AbortSignal) => {
      setError(false);
      setLoading(true);

      const params: { preset?: string; from?: string; to?: string } = {};

      if (preset === "custom") {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
        params.preset = "custom";
      } else {
        params.preset = preset;
      }

      getAdminStatistics(params)
        .then(setStats)
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
    [preset, customFrom, customTo, router, appliedNonce],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const mainCards = [
    {
      label: "إجمالي قيمة الطلبات",
      value: formatMoney(stats?.totalOrdersValue),
      hint: "قيمة الطلبات غير الملغية",
      icon: ReceiptText,
      tone: "blue" as const,
    },
    {
      label: "قيمة الطلبات المسلمة",
      value: formatMoney(stats?.deliveredOrdersValue),
      hint: `${stats?.deliveredOrdersCount ?? "-"} طلب تم تسليمها`,
      icon: PackageCheck,
      tone: "green" as const,
    },
    {
      label: "قيمة الطلبات الملغية",
      value: formatMoney(stats?.cancelledOrdersValue),
      hint: `${stats?.cancelledOrdersCount ?? "-"} طلب ملغي`,
      icon: XCircle,
      tone: "red" as const,
    },
    {
      label: "عدد الطلبات",
      value: stats?.totalOrdersCount ?? "-",
      hint: "إجمالي الطلبات في الفترة",
      icon: ShoppingCart,
      tone: "pink" as const,
    },
    {
      label: "متوسط قيمة الطلب",
      value: formatMoney(stats?.averageOrderValue),
      hint: "المتوسط للطلبات غير الملغية",
      icon: Gem,
      tone: "amber" as const,
    },
    {
      label: "المنتجات المباعة",
      value: stats?.totalItemsSold ?? "-",
      hint: "إجمالي عدد القطع المباعة",
      icon: BarChart3,
      tone: "black" as const,
    },
  ];

  const statusCards = [
    {
      label: "قيد الانتظار",
      value: stats?.pendingOrdersCount ?? "-",
      icon: Clock3,
      tone: "amber" as const,
    },
    {
      label: "مؤكد",
      value: stats?.confirmedOrdersCount ?? "-",
      icon: CheckCircle2,
      tone: "blue" as const,
    },
    {
      label: "قيد التجهيز",
      value: stats?.processingOrdersCount ?? "-",
      icon: HandCoins,
      tone: "purple" as const,
    },
    {
      label: "تم الشحن",
      value: stats?.shippedOrdersCount ?? "-",
      icon: Truck,
      tone: "indigo" as const,
    },
    {
      label: "تم التسليم",
      value: stats?.deliveredOrdersCount ?? "-",
      icon: PackageCheck,
      tone: "green" as const,
    },
    {
      label: "ملغي",
      value: stats?.cancelledOrdersCount ?? "-",
      icon: XCircle,
      tone: "red" as const,
    },
  ];

  const paymentCards = [
    {
      label: "الدفع عند الاستلام",
      count: stats?.codOrdersCount,
      value: formatMoney(stats?.codOrdersValue),
      icon: Banknote,
      tone: "green" as const,
    },
    {
      label: "الدفع أونلاين",
      count: stats?.onlineOrdersCount,
      value: formatMoney(stats?.onlineOrdersValue),
      icon: CreditCard,
      tone: "blue" as const,
    },
    {
      label: "مدفوع",
      count: stats?.paidOrdersCount,
      value: formatMoney(stats?.paidOrdersValue),
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      label: "غير مدفوع",
      count: stats?.unpaidOrdersCount,
      value: formatMoney(stats?.unpaidOrdersValue),
      icon: Clock3,
      tone: "amber" as const,
    },
  ];

  return (
    <PageShell
      title="الإحصائيات"
      eyebrow="تحليلات المتجر"
      description="إحصائيات كاملة للطلبات والمبيعات"
      noContainer
      surface="plain"
    >
      {/* Date Filter */}
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
                onClick={() => setPreset(opt.value)}
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
              <button
                type="button"
                onClick={() => setAppliedNonce((n) => n + 1)}
                className="rounded-xl bg-brand-pink px-5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-pink/90"
              >
                تطبيق
              </button>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          تعذر تحميل الإحصائيات.
        </div>
      ) : null}

      {loading && !stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
            >
              <div className="mb-3 h-11 w-11 rounded-2xl bg-pink-100" />
              <div className="mb-2 h-7 w-24 rounded bg-pink-100" />
              <div className="h-4 w-32 rounded bg-pink-50" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Main Cards */}
      {stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mainCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </div>

          {/* Status Section */}
          <section className="mt-5">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
              حالة الطلبات
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {statusCards.map((card) => (
                <MiniCard key={card.label} {...card} />
              ))}
            </div>
          </section>

          {/* Payment Section */}
          <section className="mt-5">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
              طرق الدفع
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentCards.map((card) => (
                <PaymentCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {!loading && !stats && !error ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
          لا توجد بيانات للعرض.
        </div>
      ) : null}
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
  tone: "pink" | "blue" | "green" | "amber" | "red" | "black" | "purple" | "indigo";
}) {
  const toneClass: Record<string, string> = {
    pink: "bg-pink-50 text-brand-pink",
    blue: "bg-blue-50 text-brand-blue",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    black: "bg-[#fbf7fa] text-black",
    purple: "bg-purple-50 text-purple-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass[tone]}`}>
          <Icon size={20} aria-hidden />
        </span>
        <p className="text-2xl font-extrabold text-black">{value}</p>
      </div>
      <p className="mt-4 text-sm font-extrabold text-black">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{hint}</p>
    </div>
  );
}

function MiniCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  tone: string;
}) {
  const toneClass: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-brand-blue",
    purple: "bg-purple-50 text-purple-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-black">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass[tone] ?? "bg-[#fbf7fa] text-black"}`}>
          <Icon size={16} aria-hidden />
        </span>
        {label}
      </span>
      <span className="text-lg font-extrabold text-black">{value}</span>
    </div>
  );
}

function PaymentCard({
  label,
  count,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  count?: number;
  value: string | number;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  tone: string;
}) {
  const toneClass: Record<string, string> = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-brand-blue",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass[tone] ?? "bg-[#fbf7fa] text-black"}`}>
          <Icon size={20} aria-hidden />
        </span>
        <p className="text-2xl font-extrabold text-black">{value}</p>
      </div>
      <p className="mt-4 text-sm font-extrabold text-black">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
        {typeof count === "number" ? `${count} طلب` : "-"}
      </p>
    </div>
  );
}

function formatMoney(value?: number) {
  if (typeof value !== "number") return "-";
  return `${Math.round(value).toLocaleString("ar-EG")} جنيه`;
}
