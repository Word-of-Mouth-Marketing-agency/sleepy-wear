"use client";

import { PageShell } from "@/components/PageShell";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  return (
    <PageShell title="السلة" eyebrow="حالة محلية مؤقتة">
      {items.length === 0 ? (
        <p className="text-[var(--muted)]">السلة فارغة حاليا.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.variantId}
              className="flex justify-between border-b border-[var(--line)] pb-3"
            >
              <span>{item.nameAr}</span>
              <span>{item.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
