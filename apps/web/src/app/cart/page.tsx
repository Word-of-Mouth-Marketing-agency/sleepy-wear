"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-extrabold">سلة التسوق</h1>
        <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-[var(--line)] bg-white p-10 shadow-sm">
          <p className="text-[var(--muted)]">سلتك فارغة حاليا.</p>
          <Link
            className="rounded-lg bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            href="/products"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-extrabold">سلة التسوق</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-light-pink text-lg font-bold text-brand-pink">
                {item.nameAr.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{item.nameAr}</p>
                <p className="text-xs text-[var(--muted)]">
                  {item.variantInfo || item.sku}
                </p>
                <p className="mt-1 font-bold text-brand-pink">
                  {item.price} ج
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-sm font-bold transition-colors hover:bg-brand-light-pink"
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity - 1)
                  }
                  type="button"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-sm font-bold transition-colors hover:bg-brand-light-pink"
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity + 1)
                  }
                  type="button"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.price * item.quantity} ج</p>
                <button
                  className="mt-1 text-xs text-red-600 transition-colors hover:text-red-800"
                  onClick={() => removeItem(item.variantId)}
                  type="button"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
          <h3 className="font-bold">ملخص الطلب</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">عدد المنتجات</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">المجموع</span>
              <span className="font-bold">{total} ج</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">الشحن</span>
              <span className="text-brand-blue font-semibold">مجاني</span>
            </div>
          </div>
          <Link
            className="mt-5 block w-full rounded-lg bg-brand-pink px-4 py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
            href="/checkout"
          >
            إتمام الطلب
          </Link>
        </div>
      </div>
    </div>
  );
}
