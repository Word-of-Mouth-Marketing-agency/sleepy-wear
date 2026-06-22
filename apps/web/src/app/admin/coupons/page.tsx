"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Coupon } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

const TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "نسبة مئوية",
  FIXED: "مبلغ ثابت",
  FREE_DELIVERY: "شحن مجاني",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error();
      setCoupons((await res.json()) as Coupon[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleSave(event: FormEvent<HTMLFormElement>, couponId?: string) {
    event.preventDefault();
    setFormError(null);
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type") ?? "PERCENTAGE");
    const payload: Record<string, unknown> = {
      code: String(form.get("code") ?? ""),
      type,
      value: String(form.get("value") ?? "0"),
      isActive: form.get("isActive") === "on",
      minimumOrderAmount: String(form.get("minimumOrderAmount") ?? "") || undefined,
      startsAt: String(form.get("startsAt") ?? "") || undefined,
      expiresAt: String(form.get("expiresAt") ?? "") || undefined,
      usageLimit: Number(form.get("usageLimit") ?? 0) || undefined,
    };

    try {
      const res = await fetch(
        couponId ? `${API_URL}/coupons/${couponId}` : `${API_URL}/coupons`,
        {
          method: couponId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "تعذر حفظ الكوبون.");
      }
      setEditingId(null);
      setShowForm(false);
      fetchCoupons();
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "تعذر حفظ الكوبون.",
      );
    }
  }

  async function handleToggleActive(coupon: Coupon) {
    setFormError(null);
    try {
      const res = await fetch(`${API_URL}/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error();
      fetchCoupons();
    } catch {
      setFormError("تعذر تحديث حالة الكوبون.");
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) return;
    setFormError(null);
    try {
      const res = await fetch(`${API_URL}/coupons/${coupon.id}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "تعذر حذف الكوبون.");
      }
      fetchCoupons();
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "تعذر حذف الكوبون.",
      );
    }
  }

  function CouponForm({
    coupon,
    onSubmit,
  }: {
    coupon?: Coupon;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  }) {
    const [type, setType] = useState(coupon?.type ?? "PERCENTAGE");

    return (
      <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
        <div className="space-y-2">
          <span className="text-sm font-bold">كود الكوبون</span>
          <input className={inputClass} defaultValue={coupon?.code} name="code" placeholder="مثال: WELCOME10" required />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-bold">نوع الخصم</span>
          <select className={inputClass} defaultValue={coupon?.type ?? "PERCENTAGE"} name="type" onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED" | "FREE_DELIVERY")}>
            <option value="PERCENTAGE">نسبة مئوية</option>
            <option value="FIXED">مبلغ ثابت</option>
            <option value="FREE_DELIVERY">شحن مجاني</option>
          </select>
        </div>
        {type !== "FREE_DELIVERY" ? (
          <div className="space-y-2">
            <span className="text-sm font-bold">قيمة الخصم</span>
            <input className={inputClass} defaultValue={coupon?.value} name="value" placeholder="مثال: 10 أو 100" required step="0.01" type="number" min="0" />
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-sm font-bold">قيمة الخصم</span>
            <input className={inputClass} defaultValue={coupon?.value} name="value" type="hidden" />
            <p className="pt-3 text-sm text-[var(--muted)]">شحن مجاني — يتم تجاهل قيمة الخصم.</p>
          </div>
        )}
        <div className="space-y-2">
          <span className="text-sm font-bold">الحد الأدنى للطلب</span>
          <input className={inputClass} defaultValue={coupon?.minimumOrderAmount ?? ""} name="minimumOrderAmount" placeholder="اختاري" step="0.01" type="number" min="0" />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-bold">تاريخ البداية</span>
          <input className={inputClass} defaultValue={coupon?.startsAt ? coupon.startsAt.slice(0, 16) : ""} name="startsAt" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-bold">تاريخ النهاية</span>
          <input className={inputClass} defaultValue={coupon?.expiresAt ? coupon.expiresAt.slice(0, 16) : ""} name="expiresAt" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-bold">حد الاستخدام</span>
          <input className={inputClass} defaultValue={coupon?.usageLimit ?? ""} name="usageLimit" placeholder="بدون حد" type="number" min="1" />
        </div>
        <div className="flex items-center gap-3 self-end pb-1">
          <input defaultChecked={coupon?.isActive ?? true} id="isActive" name="isActive" type="checkbox" className="h-4 w-4 accent-brand-pink" />
          <label htmlFor="isActive" className="text-sm font-bold">مفعل</label>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
          <button
            className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90"
            type="submit"
          >
            {coupon ? "حفظ التعديلات" : "إضافة كوبون"}
          </button>
          <button
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-red-200 hover:text-red-700"
            onClick={() => { setEditingId(null); setShowForm(false); setFormError(null); }}
            type="button"
          >
            إلغاء
          </button>
        </div>
      </form>
    );
  }

  return (
    <PageShell
      title="الكوبونات"
      eyebrow="Admin"
      description="إدارة كوبونات الخصم والشحن المجاني."
      noContainer
      surface="plain"
    >
      {/* Add coupon button */}
      {!showForm && !editingId ? (
        <button
          className="mb-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90"
          onClick={() => setShowForm(true)}
          type="button"
        >
          + إضافة كوبون
        </button>
      ) : null}

      {formError ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {formError}
        </p>
      ) : null}

      {/* New coupon form */}
      {showForm ? (
        <div className="mb-5 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">إضافة كوبون جديد</h2>
          <CouponForm onSubmit={(event) => handleSave(event)} />
        </div>
      ) : null}

      {/* Edit form */}
      {editingId ? (
        <div className="mb-5 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">تعديل الكوبون</h2>
          <CouponForm
            coupon={coupons.find((c) => c.id === editingId)}
            onSubmit={(event) => handleSave(event, editingId)}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري تحميل الكوبونات...
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل الكوبونات.
        </p>
      ) : null}

      {!loading && !error && coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          لا توجد كوبونات بعد.
        </div>
      ) : null}

      {!loading && !error && coupons.length > 0 ? (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold">{coupon.code}</p>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${coupon.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                      {coupon.isActive ? "مفعل" : "غير مفعل"}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-brand-blue">
                      {TYPE_LABELS[coupon.type] ?? coupon.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : coupon.type === "FIXED" ? `${coupon.value} جنيه` : "شحن مجاني"}
                    {coupon.usageLimit ? ` — مستخدم ${coupon.usageCount}/${coupon.usageLimit}` : ` — مستخدم ${coupon.usageCount} مرة`}
                    {coupon.minimumOrderAmount ? ` — الحد الأدنى ${coupon.minimumOrderAmount} ج` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-bold transition hover:border-brand-blue hover:text-brand-blue"
                    onClick={() => { setEditingId(coupon.id); setShowForm(false); setFormError(null); }}
                    type="button"
                  >
                    تعديل
                  </button>
                  <button
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-bold transition hover:border-amber-400 hover:text-amber-700"
                    onClick={() => handleToggleActive(coupon)}
                    type="button"
                  >
                    {coupon.isActive ? "تعطيل" : "تفعيل"}
                  </button>
                  <button
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                    onClick={() => handleDelete(coupon)}
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
