"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  CouponValidationResult,
  CreateOrderInput,
  Order,
  PaymentMethod,
  PaymobIntentionResponse,
  ShippingCity,
} from "@sleepywear/shared";
import { API_URL, apiGet, apiPost } from "@/lib/api";
import { getCardUrl } from "@/lib/media";
import { getDisplayVariantInfo } from "@/lib/product-variants";
import { useCartStore } from "@/stores/cart-store";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/15";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingToSuccess, setIsRedirectingToSuccess] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<{
    text: string;
    enabled: boolean;
  } | null>(null);
  const [shippingCities, setShippingCities] = useState<ShippingCity[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const effectiveShipping = couponResult?.freeDelivery ? 0 : shippingPrice;
  const discount = couponResult?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + effectiveShipping - discount);

  useEffect(() => {
    apiGet<ShippingCity[]>("/shipping-cities")
      .then(setShippingCities)
      .catch(() => {});
    fetch(`${API_URL}/settings`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const notice = data.checkout_notice as
          | { text: string; enabled: boolean }
          | undefined;
        if (notice) setCheckoutNotice(notice);
      })
      .catch(() => {});
  }, []);

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedCityId(id);
    const city = shippingCities.find((c) => c.id === id);
    setShippingPrice(city?.price ?? 0);
    setCouponResult(null);
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponResult(null);
    try {
      const res = await fetch(
        `${API_URL}/coupons/validate?code=${encodeURIComponent(couponCode.trim())}&subtotal=${subtotal}`,
      );
      const result = (await res.json()) as CouponValidationResult;
      setCouponResult(result);
    } catch {
      setCouponResult({
        valid: false,
        discountAmount: 0,
        freeDelivery: false,
        message: "تعذر التحقق من الكوبون.",
      });
    } finally {
      setCouponLoading(false);
    }
  }

  if (isRedirectingToSuccess) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-brand-pink/20 bg-brand-light-pink/30 px-6 py-12 text-center">
        <p className="text-lg font-black text-brand-black">
          جاري تأكيد الطلب...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-pink/35 bg-brand-light-pink/50 px-6 py-12 text-center">
        <p className="text-lg font-black text-brand-black">سلتك فارغة.</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          أضيفي المنتجات أولاً ثم عودي لإتمام الطلب.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
          href="/products"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const cityId = String(form.get("shippingCityId") ?? "");
    const city = shippingCities.find((c) => c.id === cityId);
    const payload: CreateOrderInput = {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? "").trim() || undefined,
      address: String(form.get("address") ?? ""),
      city: city?.nameAr ?? "",
      shippingCityId: cityId || undefined,
      notes: String(form.get("notes") ?? "") || undefined,
      paymentMethod,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    if (couponResult?.valid && couponCode.trim()) {
      payload.couponCode = couponCode.trim();
    }

    setIsSubmitting(true);
    try {
      const order = await apiPost<Order, CreateOrderInput>("/orders", payload);
      if (paymentMethod === "PAYMOB") {
        const intention = await apiPost<
          PaymobIntentionResponse,
          { orderId: string }
        >("/payments/paymob/create-intention", { orderId: order.id });
        window.location.href = intention.checkoutUrl;
        return;
      }

      setIsRedirectingToSuccess(true);
      clear();
      router.replace(`/checkout/success?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "تعذر إنشاء الطلب.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form
        className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6"
        onSubmit={submit}
      >
        <div className="mb-5">
          <h2 className="text-lg font-black text-brand-black">بيانات العميل</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            هذه البيانات تستخدم للتأكيد والتوصيل فقط.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم الكامل" htmlFor="customerName">
            <input
              id="customerName"
              className={inputClass}
              name="customerName"
              placeholder="مثال: سارة أحمد"
              required
            />
          </Field>

          <Field label="رقم الهاتف" htmlFor="phone">
            <input
              id="phone"
              className={inputClass}
              name="phone"
              placeholder="01xxxxxxxxx"
              required
              dir="ltr"
            />
          </Field>

          <Field label="البريد الإلكتروني" htmlFor="email" optional>
            <input
              id="email"
              className={inputClass}
              name="email"
              placeholder="name@example.com"
              type="email"
            />
          </Field>

          <Field label="المحافظة / المدينة" htmlFor="shippingCityId">
            <select
              id="shippingCityId"
              className={`${inputClass} appearance-none`}
              name="shippingCityId"
              value={selectedCityId}
              onChange={handleCityChange}
              required
            >
              <option value="">اختاري المحافظة / المدينة</option>
              {shippingCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} {c.price > 0 ? `(${c.price} ج)` : "(مجاني)"}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="العنوان بالتفصيل"
            htmlFor="address"
            className="sm:col-span-2"
          >
            <input
              id="address"
              className={inputClass}
              name="address"
              placeholder="الشارع، رقم العمارة، الدور، علامة مميزة"
              required
            />
          </Field>

          <Field
            label="ملاحظات"
            htmlFor="notes"
            optional
            className="sm:col-span-2"
          >
            <textarea
              id="notes"
              className={inputClass}
              name="notes"
              placeholder="أي تفاصيل تساعدنا في التوصيل"
              rows={3}
            />
          </Field>
        </div>

        <div className="mt-5 rounded-3xl border border-[var(--line)] bg-white p-4">
          <p className="mb-3 text-sm font-black text-brand-black">كود الخصم</p>
          <div className="flex gap-2">
            <input
              className={`${inputClass} flex-1`}
              placeholder="أدخلي كود الخصم"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value); setCouponResult(null); }}
            />
            <button
              className="shrink-0 rounded-2xl bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-pink disabled:opacity-50"
              disabled={couponLoading || !couponCode.trim()}
              onClick={handleApplyCoupon}
              type="button"
            >
              {couponLoading ? "..." : "تطبيق"}
            </button>
          </div>
          {couponResult ? (
            <p className={`mt-2 text-xs font-semibold ${couponResult.valid ? "text-green-700" : "text-red-700"}`}>
              {couponResult.message}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-brand-light-pink/35 p-4">
          <p className="text-sm font-black text-brand-black">طريقة الدفع</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <PaymentOption
              checked={paymentMethod === "COD"}
              description="ادفعي عند استلام الطلب."
              label="الدفع عند الاستلام"
              value="COD"
              onChange={setPaymentMethod}
            />
            <PaymentOption
              checked={paymentMethod === "PAYMOB"}
              description="تحويل آمن إلى صفحة الدفع."
              label="الدفع أونلاين"
              value="PAYMOB"
              onChange={setPaymentMethod}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">
            {message}
          </p>
        ) : null}

        <button
          className="mt-5 w-full rounded-2xl bg-brand-pink px-4 py-3.5 text-sm font-black text-white transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting || !selectedCityId}
          type="submit"
        >
          {isSubmitting
            ? paymentMethod === "PAYMOB"
              ? "جاري تحويلك للدفع..."
              : "جاري إنشاء الطلب..."
            : paymentMethod === "PAYMOB"
              ? "إتمام الدفع أونلاين"
              : "تأكيد الطلب"}
        </button>
      </form>

      <aside className="h-fit space-y-4 rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm lg:sticky lg:top-32">
        <div>
          <h2 className="text-lg font-black text-brand-black">ملخص الطلب</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            راجعي المنتجات والشحن قبل التأكيد.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const variantInfo = getDisplayVariantInfo(item.variantInfo);

            return (
              <div
                key={item.variantId}
                className="flex items-center gap-3 rounded-2xl bg-brand-light-pink/45 p-2"
              >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {item.imageUrl ? (
                  <img
                    alt={item.nameAr}
                    className="h-full w-full object-cover"
                    src={getCardUrl(item.imageUrl)}
                  />
                ) : (
                  <span className="text-xs font-black text-brand-pink">
                    {item.nameAr.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand-black">
                  {item.nameAr}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {variantInfo ? `${variantInfo} × ` : ""}
                  {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-black">
                {item.price * item.quantity} ج
              </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-[var(--line)] pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">المجموع</span>
            <span className="font-black">{subtotal} ج</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">الشحن</span>
            <span className="font-bold text-brand-blue">
              {effectiveShipping > 0 ? `${effectiveShipping} ج` : "مجاني"}
            </span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">الخصم</span>
              <span className="font-bold text-red-600">-{discount} ج</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base font-black">
            <span>الإجمالي</span>
            <span className="text-brand-pink">{total} ج</span>
          </div>
          {checkoutNotice?.enabled && checkoutNotice.text ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-800">
              {checkoutNotice.text}
            </p>
          ) : (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-800">
              يتم دفع ديبوزت قبل الشحن: 50 ج.م داخل القاهرة، و100 ج.م لباقي المحافظات.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  optional = false,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        className="mb-1.5 flex items-center justify-between text-sm font-bold text-brand-black"
        htmlFor={htmlFor}
      >
        <span>{label}</span>
        {optional ? (
          <span className="text-xs font-semibold text-[var(--muted)]">
            اختياري
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

function PaymentOption({
  checked,
  description,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-4 transition ${
        checked
          ? "border-brand-pink bg-white shadow-sm"
          : "border-[var(--line)] bg-white/70 hover:border-brand-pink/40"
      }`}
    >
      <span className="flex items-center gap-3">
        <input
          type="radio"
          name="paymentMethod"
          checked={checked}
          value={value}
          onChange={() => onChange(value)}
          className="h-4 w-4 accent-brand-pink"
        />
        <span className="text-sm font-black text-brand-black">{label}</span>
      </span>
      <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
        {description}
      </span>
    </label>
  );
}
