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

  return (
    <PageShell title="السلة" eyebrow="منتجات مختارة">
      {items.length === 0 ? (
        <p className="text-[var(--muted)]">السلة فارغة حاليا.</p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.variantId}
                className="grid gap-3 rounded-md border border-[var(--line)] p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <p className="font-semibold">{item.nameAr}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {item.variantInfo || item.sku}
                  </p>
                </div>
                <input
                  className="w-24 rounded-md border border-[var(--line)] p-2"
                  min={1}
                  onChange={(event) =>
                    updateQuantity(item.variantId, Number(event.target.value))
                  }
                  type="number"
                  value={item.quantity}
                />
                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    {item.price * item.quantity} جنيه
                  </span>
                  <button
                    className="text-sm text-red-700"
                    onClick={() => removeItem(item.variantId)}
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <p className="text-lg font-bold">الإجمالي: {total} جنيه</p>
            <Link
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              href="/checkout"
            >
              إتمام الطلب
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
