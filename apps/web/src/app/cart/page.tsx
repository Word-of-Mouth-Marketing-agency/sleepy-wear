"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { getCardUrl } from "@/lib/media";
import { getDisplayVariantInfo } from "@/lib/product-variants";

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
      <div className="container py-10 sm:py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-pink/35 bg-brand-light-pink/50 px-6 py-14 text-center">
          <p className="text-sm font-bold text-brand-pink">سلة التسوق</p>
          <h1 className="mt-2 text-2xl font-black text-brand-black">
            سلتك فارغة حالياً
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            اختاري منتجاتك المفضلة، وسيظهر ملخص الطلب هنا قبل الدفع.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
            href="/products"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-12">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-pink">سلة التسوق</p>
          <h1 className="mt-1 text-3xl font-black text-brand-black">
            مراجعة الطلب
          </h1>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {itemCount} قطعة في السلة
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => {
            const variantInfo = getDisplayVariantInfo(item.variantInfo);
            const isAtStockLimit =
              item.availableStock !== undefined &&
              item.quantity >= item.availableStock;

            return (
              <article
                key={item.variantId}
                className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-4 shadow-sm sm:grid-cols-[88px_1fr_auto] sm:items-center"
              >
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand-light-pink sm:h-[88px] sm:w-[88px]">
                {item.imageUrl ? (
                  <img
                    alt={item.nameAr}
                    className="h-full w-full object-cover"
                    src={getCardUrl(item.imageUrl)}
                  />
                ) : (
                  <span className="text-lg font-black text-brand-pink">
                    {item.nameAr.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-black text-brand-black">
                  {item.nameAr}
                </p>
                {variantInfo ? (
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    {variantInfo}
                  </p>
                ) : null}
                {isAtStockLimit ? (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    الكمية المتاحة حاليًا: {item.availableStock}
                  </p>
                ) : null}
                <p className="mt-2 text-lg font-black text-brand-pink">
                  {item.price} ج
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center rounded-full border border-[var(--line)] bg-brand-light-pink/35 p-1">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black transition-colors hover:text-brand-pink"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    type="button"
                    aria-label="تقليل الكمية"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-sm font-black">
                    {item.quantity}
                  </span>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black transition-colors hover:text-brand-pink disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    disabled={isAtStockLimit}
                    type="button"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-black text-brand-black">
                    {item.price * item.quantity} ج
                  </p>
                  <button
                    className="mt-1 text-xs font-bold text-red-600 transition-colors hover:text-red-800"
                    onClick={() => removeItem(item.variantId)}
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm lg:sticky lg:top-32">
          <h2 className="text-lg font-black text-brand-black">ملخص الطلب</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">عدد القطع</span>
              <span className="font-bold">{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">المجموع</span>
              <span className="font-black">{total} ج</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-blue/60 px-3 py-2">
              <span className="text-[var(--muted)]">الشحن</span>
              <span className="font-bold text-brand-blue">يحسب في الدفع</span>
            </div>
          </div>
          <Link
            className="mt-6 block w-full rounded-2xl bg-brand-pink px-4 py-3.5 text-center text-sm font-black text-white transition-colors hover:bg-brand-blue"
            href="/checkout"
          >
            إتمام الطلب
          </Link>
          <Link
            className="mt-3 block text-center text-sm font-bold text-brand-pink transition-colors hover:text-brand-blue"
            href="/products"
          >
            متابعة التسوق
          </Link>
        </aside>
      </div>
    </div>
  );
}
