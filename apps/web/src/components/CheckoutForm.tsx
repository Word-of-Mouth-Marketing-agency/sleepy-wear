"use client";

import { FormEvent, useState } from "react";
import type { CreateOrderInput, Order } from "@sleepywear/shared";
import { apiPost } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";

export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (items.length === 0) {
      setError("السلة فارغة.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload: CreateOrderInput = {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? "") || undefined,
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
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
      setMessage(
        `تم إنشاء الطلب ${order.orderNumber} بقيمة ${order.total} جنيه.`,
      );
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر إنشاء الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      <input
        className="rounded-md border border-[var(--line)] p-3"
        name="customerName"
        placeholder="الاسم"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-3"
        name="phone"
        placeholder="رقم الهاتف"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-3"
        name="email"
        placeholder="البريد الإلكتروني"
        type="email"
      />
      <input
        className="rounded-md border border-[var(--line)] p-3"
        name="city"
        placeholder="المدينة"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-3 sm:col-span-2"
        name="address"
        placeholder="العنوان"
        required
      />
      <textarea
        className="rounded-md border border-[var(--line)] p-3 sm:col-span-2"
        name="notes"
        placeholder="ملاحظات"
      />
      {error ? (
        <p className="text-sm text-red-700 sm:col-span-2">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm text-green-700 sm:col-span-2">{message}</p>
      ) : null}
      <button
        className="rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "جاري إنشاء الطلب..." : "إنشاء الطلب"}
      </button>
    </form>
  );
}
