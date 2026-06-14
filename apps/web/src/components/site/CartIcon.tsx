"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

function CartSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function CartIcon() {
  const count = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <Link href="/cart" className="relative inline-flex" aria-label="سلة التسوق">
      <CartSvg />
      {count > 0 ? (
        <span className="absolute -left-2 -top-2 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-brand-pink text-[10px] font-bold text-white leading-none px-1">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
