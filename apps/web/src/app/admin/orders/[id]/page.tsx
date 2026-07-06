"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Order } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "جديد",
  CONFIRMED: "قيد المراجعة",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: "الدفع عند الاستلام",
  PAYMOB: "أونلاين",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PAID: "مدفوع",
  FAILED: "فشل",
  CANCELED: "ملغي",
};

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-brand-blue",
  PROCESSING: "border-purple-200 bg-purple-50 text-purple-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DELIVERED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        throw new Error();
      }
      setOrder((await res.json()) as Order);
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err && (err as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleStatusUpdate(status: string) {
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        throw new Error("تعذر تحديث حالة الطلب.");
      }
      setSaveSuccess(true);
      fetchOrder();
    } catch (caught) {
      if (caught instanceof Error && "status" in caught && (caught as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setSaveError(
        caught instanceof Error ? caught.message : "تعذر تحديث حالة الطلب.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`هل أنت متأكد من حذف الطلب "${order?.orderNumber}"؟`)) return;
    setSaveError(null);
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/orders/${params.id}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) {
        if (res.status === 401) throw Object.assign(new Error(), { status: 401 });
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "تعذر حذف الطلب.");
      }
      router.push("/admin/orders");
      router.refresh();
    } catch (caught) {
      if (caught instanceof Error && "status" in caught && (caught as any).status === 401) {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
        return;
      }
      setSaveError(
        caught instanceof Error ? caught.message : "تعذر حذف الطلب.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="الطلب" eyebrow="Admin" description="جاري التحميل..." noContainer>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري تحميل الطلب...
        </div>
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell title="الطلب" eyebrow="Admin" description="تعذر التحميل" noContainer>
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل الطلب.
        </p>
      </PageShell>
    );
  }

  const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <PageShell
      title={`طلب ${order.orderNumber}`}
      eyebrow="Admin"
      description={`تم في ${new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
      noContainer
      surface="plain"
    >
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold transition hover:border-brand-blue hover:text-brand-blue"
      >
        <ArrowRight size={16} />
        العودة للطلبات
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Customer info */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">بيانات العميل</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="الاسم" value={order.customerName} />
              <InfoRow label="رقم الهاتف" value={order.phone} dir="ltr" />
              <InfoRow label="البريد الإلكتروني" value={order.email ?? "—"} />
              <InfoRow label="المدينة" value={order.city ?? "—"} />
              <InfoRow label="العنوان" value={order.address ?? "—"} className="sm:col-span-2" />
              {order.notes ? (
                <InfoRow label="ملاحظات" value={order.notes} className="sm:col-span-2" />
              ) : null}
            </div>
          </section>

          {/* Order items */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">المنتجات</h2>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fbf7fa] px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-bold">{item.productNameSnapshot}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {item.variantInfoSnapshot && `${item.variantInfoSnapshot} - `}
                      {item.skuSnapshot}
                    </p>
                  </div>
                  <span className="font-semibold text-[var(--muted)]">
                    {item.quantity} × {item.unitPriceSnapshot} ج = {item.total} ج
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Status update */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">حالة الطلب</h2>
            <div className="mb-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[order.status] ?? ""}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving || order.status === status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-right text-sm font-bold transition disabled:opacity-40 ${
                    order.status === status
                      ? "border-brand-pink bg-pink-50 text-brand-pink"
                      : "border-[var(--line)] hover:border-brand-pink hover:bg-pink-50"
                  }`}
                >
                  {STATUS_LABELS[status] ?? status}
                </button>
              ))}
            </div>
            {saveSuccess ? (
              <p className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                تم تحديث حالة الطلب بنجاح.
              </p>
            ) : null}
            {saveError ? (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {saveError}
              </p>
            ) : null}
          </section>

          {/* Payment info */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">الدفع</h2>
            <div className="space-y-3">
              <InfoRow label="طريقة الدفع" value={PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} />
              <InfoRow label="حالة الدفع" value={PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus} />
            </div>
          </section>

          {/* Delete */}
          <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <button
              className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              disabled={deleting}
              onClick={handleDelete}
              type="button"
            >
              {deleting ? "جاري الحذف..." : "حذف الطلب"}
            </button>
          </section>

          {/* Totals */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold">إجماليات</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">المجموع الفرعي</span>
                <span className="font-bold">{order.subtotal} ج</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">الشحن</span>
                <span className="font-bold text-brand-blue">{order.shippingTotal} ج</span>
              </div>
              {order.discountTotal && order.discountTotal > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">
                    الخصم {order.couponCode ? `(${order.couponCode})` : ""}
                  </span>
                  <span className="font-bold text-red-600">-{order.discountTotal} ج</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base font-black">
                <span>الإجمالي</span>
                <span className="text-brand-pink">{order.total} ج</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({
  label,
  value,
  dir,
  className = "",
}: {
  label: string;
  value: string;
  dir?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-bold" dir={dir}>
        {value}
      </p>
    </div>
  );
}
