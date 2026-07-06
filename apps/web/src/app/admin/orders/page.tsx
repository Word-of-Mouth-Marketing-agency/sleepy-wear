"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import type { Order, PaginatedResponse } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { OrderItemThumbnail } from "@/components/admin/OrderItemThumbnail";
import { API_URL, getAdminHeaders } from "@/lib/api";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  type OrderPeriod,
  ORDER_PERIOD_OPTIONS,
  formatCustomPeriodDescription,
  formatPeriodDescription,
  getCustomOrderDateRange,
  getOrderDateRange,
  parseLocalDate,
  todayDateString,
} from "./order-date-helpers";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "جديد",
  CONFIRMED: "قيد المراجعة",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-brand-blue",
  PROCESSING: "border-purple-200 bg-purple-50 text-purple-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DELIVERED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const PAGE_SIZE = 12;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PaginatedResponse<Order> | null>(null);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<OrderPeriod>("all");
  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const handlePeriodChange = (newPeriod: OrderPeriod) => {
    setPeriod(newPeriod);
    setPage(1);
  };

  const handleSelectedDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setPage(1);
  };

  const handleCustomFromDateChange = (newDate: string) => {
    setCustomFromDate(newDate);
    setPage(1);
  };

  const handleCustomToDateChange = (newDate: string) => {
    setCustomToDate(newDate);
    setPage(1);
  };

  const fetchOrders = useCallback(
    (signal: AbortSignal) => {
      setError(false);

      let range: { from: string; to: string } | null = null;

      if (period === "custom") {
        if (!customFromDate || !customToDate) {
          setLoading(false);
          setOrders(null);
          return;
        }
        const fromParsed = parseLocalDate(customFromDate);
        const toParsed = parseLocalDate(customToDate);
        if (!fromParsed || !toParsed) {
          setLoading(false);
          setOrders(null);
          return;
        }
        if (fromParsed > toParsed) {
          setLoading(false);
          setOrders(null);
          return;
        }
        range = getCustomOrderDateRange(customFromDate, customToDate);
        if (!range) {
          setLoading(false);
          setOrders(null);
          return;
        }
      } else if (period !== "all") {
        if (!parseLocalDate(selectedDate)) {
          setLoading(false);
          setOrders(null);
          return;
        }
        range = getOrderDateRange(selectedDate, period);
        if (!range) {
          setLoading(false);
          setOrders(null);
          return;
        }
      }

      setLoading(true);

      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(page),
      });

      if (range) {
        params.set("from", range.from);
        params.set("to", range.to);
      }

      const currentPage = page;

      fetch(`${API_URL}/orders?${params.toString()}`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
        signal,
      })
        .then((r) => {
          if (!r.ok) {
            if (r.status === 401) throw Object.assign(new Error(), { status: 401 });
            throw new Error();
          }
          return r.json() as Promise<PaginatedResponse<Order>>;
        })
        .then((data) => {
          if (
            data.meta.totalPages > 0 &&
            currentPage > data.meta.totalPages
          ) {
            setPage(data.meta.totalPages);
            return;
          }
          setOrders(data);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          if (err instanceof Error && "status" in err && (err as any).status === 401) {
            localStorage.removeItem("admin_token");
            router.replace("/admin/login");
            return;
          }
          setError(true);
          setLoading(false);
        });
    },
    [period, selectedDate, customFromDate, customToDate, page, router],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  const isFiltered = period !== "all";
  const parsedCustomFrom =
    period === "custom" ? parseLocalDate(customFromDate) : null;
  const parsedCustomTo =
    period === "custom" ? parseLocalDate(customToDate) : null;
  const isCustomInvalid =
    period === "custom" &&
    parsedCustomFrom !== null &&
    parsedCustomTo !== null &&
    parsedCustomFrom > parsedCustomTo;

  const showCustomDateInputs = period === "custom";
  const showAnchorDateInput = period !== "all" && period !== "custom";

  const totalPages = orders?.meta.totalPages ?? 1;
  const totalOrders = orders?.meta.total ?? 0;

  return (
    <PageShell
      title="إدارة الطلبات"
      eyebrow="Admin"
      description="متابعة طلبات العملاء ومراجعة المنتجات داخل كل طلب."
      noContainer
      surface="plain"
    >
      <div className="mb-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--muted)]">
              الفترة
            </label>
            <div className="inline-flex flex-wrap rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-1">
              {ORDER_PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={period === opt.value}
                  onClick={() => handlePeriodChange(opt.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition sm:px-4 ${
                    period === opt.value
                      ? "bg-brand-pink text-white shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {showAnchorDateInput && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="order-anchor-date"
                className="text-xs font-bold text-[var(--muted)]"
              >
                التاريخ
              </label>
              <input
                id="order-anchor-date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleSelectedDateChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold shadow-sm focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 sm:w-auto"
              />
              {!parseLocalDate(selectedDate) && (
                <p className="text-xs font-semibold text-red-600">
                  التاريخ غير صالح.
                </p>
              )}
            </div>
          )}

          {showCustomDateInputs && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="custom-from-date"
                  className="text-xs font-bold text-[var(--muted)]"
                >
                  من تاريخ
                </label>
                <input
                  id="custom-from-date"
                  type="date"
                  value={customFromDate}
                  max={customToDate || undefined}
                  onChange={(e) =>
                    handleCustomFromDateChange(e.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold shadow-sm focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 sm:w-auto"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="custom-to-date"
                  className="text-xs font-bold text-[var(--muted)]"
                >
                  إلى تاريخ
                </label>
                <input
                  id="custom-to-date"
                  type="date"
                  value={customToDate}
                  min={customFromDate || undefined}
                  onChange={(e) => handleCustomToDateChange(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold shadow-sm focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 sm:w-auto"
                />
              </div>
            </div>
          )}

          {isCustomInvalid && (
            <p className="text-xs font-semibold text-red-600">
              تاريخ البداية يجب أن يكون قبل أو مساويًا لتاريخ النهاية.
            </p>
          )}

          {period === "custom" && (!customFromDate || !customToDate) && (
            <p className="text-xs font-semibold text-[var(--muted)]">
              اختر تاريخ البداية والنهاية لعرض الطلبات.
            </p>
          )}
        </div>

        {period === "day" && parseLocalDate(selectedDate) && (
          <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
            {formatPeriodDescription(selectedDate, "day")}
          </p>
        )}
        {period === "week" && parseLocalDate(selectedDate) && (
          <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
            {formatPeriodDescription(selectedDate, "week")}
          </p>
        )}
        {period === "month" && parseLocalDate(selectedDate) && (
          <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
            {formatPeriodDescription(selectedDate, "month")}
          </p>
        )}
        {period === "year" && parseLocalDate(selectedDate) && (
          <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
            {formatPeriodDescription(selectedDate, "year")}
          </p>
        )}
        {period === "custom" &&
          customFromDate &&
          customToDate &&
          !isCustomInvalid && (
            <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
              {formatCustomPeriodDescription(customFromDate, customToDate)}
            </p>
          )}
      </div>

      {!loading && !error && totalOrders > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--muted)]">
            {totalOrders} طلب
          </p>
          {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
      )}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل الطلبات.
        </p>
      ) : null}

      {!error && loading ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري تحميل الطلبات...
        </div>
      ) : null}

      {!error && !loading && orders?.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          {isFiltered
            ? "لا توجد طلبات في الفترة المحددة."
            : "لا توجد طلبات حتى الآن."}
        </div>
      ) : null}

      {!error && !loading && orders && orders.items.length > 0 ? (
        <div className="space-y-3">
          {orders.items.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : null}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-5">
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </PageShell>
  );
}

function OrderCard({ order }: { order: Order }) {
  const whatsappUrl = getWhatsAppChatUrl(order.phone);
  const itemCount = order.items?.length ?? 0;
  const firstItem = order.items?.[0];
  const moreCount = itemCount > 1 ? itemCount - 1 : 0;

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white shadow-sm transition hover:border-brand-pink/30 hover:shadow-md">
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold text-black">
                {order.orderNumber}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                  statusStyles[order.status] ??
                  "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {order.customerName} &middot; {order.phone}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-sm font-extrabold text-brand-pink">
            {order.total} ج
          </span>
        </div>

        {firstItem ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#fbf7fa] px-3 py-2.5">
            <OrderItemThumbnail
              alt={firstItem.productNameSnapshot}
              size="list"
              src={firstItem.displayImageUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">
                {firstItem.productNameSnapshot}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {firstItem.quantity} &times; {firstItem.unitPriceSnapshot} ج
                {firstItem.variantInfoSnapshot && firstItem.variantInfoSnapshot !== "عام / Default / عام"
                  ? ` - ${firstItem.variantInfoSnapshot}`
                  : ""}
              </p>
            </div>
            {moreCount > 0 ? (
              <span className="shrink-0 text-xs font-bold text-brand-pink">
                + {moreCount}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-[#fbf7fa] px-3 py-2.5 text-xs text-[var(--muted)]">
            لا توجد منتجات
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
          <span className="text-[11px] font-semibold text-[var(--muted)]">
            {formatOrderDate(order.createdAt)}
          </span>
          <span className="text-[11px] font-semibold text-[var(--muted)]">
            {itemCount} منتج
          </span>
          <div className="flex-1" />
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-pink/40 bg-white px-3 py-1.5 text-xs font-bold text-brand-pink transition hover:bg-pink-50"
          >
            <Eye size={13} />
            عرض التفاصيل
          </Link>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`واتساب ${order.customerName}`}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-white transition hover:opacity-80"
              style={{ backgroundColor: "#25D366" }}
            >
              <WhatsAppIcon size={14} />
              واتساب
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = getVisiblePages(page, totalPages);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs font-bold text-[var(--fg)] shadow-sm transition hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft size={14} />
        السابق
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-xs text-[var(--muted)]">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            disabled={p === page}
            onClick={() => onPageChange(p as number)}
            className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold transition ${
              p === page
                ? "bg-brand-pink text-white shadow-sm"
                : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-brand-pink hover:text-brand-pink"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs font-bold text-[var(--fg)] shadow-sm transition hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        التالي
        <ArrowLeft size={14} className="rotate-180" />
      </button>
    </div>
  );
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}

function formatOrderDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
