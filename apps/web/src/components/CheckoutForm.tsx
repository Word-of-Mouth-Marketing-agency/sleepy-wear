"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { CreateOrderInput, Order, ShippingCity } from "@sleepywear/shared";
import { apiGet, apiPost } from "@/lib/api";
import { getCardUrl } from "@/lib/media";
import { getDisplayVariantInfo } from "@/lib/product-variants";
import { useCartStore } from "@/stores/cart-store";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/15";

export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [shippingCities, setShippingCities] = useState<ShippingCity[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + shippingPrice;

  useEffect(() => {
    apiGet<ShippingCity[]>("/shipping-cities")
      .then(setShippingCities)
      .catch(() => {});
  }, []);

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedCityId(id);
    const city = shippingCities.find((c) => c.id === id);
    setShippingPrice(city?.price ?? 0);
  }

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-green-100 bg-green-50 px-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-green-700 shadow-sm">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-black text-brand-black">
          تم استلام طلبك
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          رقم الطلب:{" "}
          <span className="font-black text-brand-pink">{orderNumber}</span>
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          سنتواصل معك قريباً لتأكيد الطلب وتفاصيل الشحن.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
          href="/products"
        >
          تصفح المزيد من المنتجات
        </Link>
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
      email: String(form.get("email") ?? "") || undefined,
      address: String(form.get("address") ?? ""),
      city: city?.nameAr ?? "",
      shippingCityId: cityId || undefined,
      notes: String(form.get("notes") ?? "") || undefined,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    setIsSubmitting(true);
    try {
      const order = await apiPost<Order, CreateOrderInput>("/orders", payload);
      clear();
      setOrderNumber(order.orderNumber);
      setMessage(
        `تم إنشاء الطلب ${order.orderNumber} بقيمة ${order.total} جنيه.`,
      );
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
          {isSubmitting ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
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
              {shippingPrice > 0 ? `${shippingPrice} ج` : "مجاني"}
            </span>
          </div>
          <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base font-black">
            <span>الإجمالي</span>
            <span className="text-brand-pink">{total} ج</span>
          </div>
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
