"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@sleepywear/shared";
import { SocialLinks } from "./SocialLinks";

type MobileHeaderMenuProps = {
  categories: Category[];
  socialUrls?: { facebook?: string; instagram?: string; tiktok?: string; telegram?: string };
};

export function MobileHeaderMenu({ categories, socialUrls }: MobileHeaderMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label="فتح القائمة"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="mobile-menu-button h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-black transition-colors hover:border-brand-pink hover:text-brand-pink"
      >
        <span className="sr-only">فتح القائمة</span>
        <span className="flex flex-col gap-1.5" aria-hidden="true">
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {open ? (
        <button
          type="button"
          aria-label="إغلاق القائمة من الخلفية"
          className="mobile-menu-overlay fixed inset-0 z-[60] bg-black/35"
          onClick={close}
        />
      ) : null}

      <aside
        className={`mobile-menu-drawer fixed inset-y-0 left-0 z-[70] w-[min(86vw,360px)] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <Link href="/" onClick={close} className="inline-flex items-center">
            <img
              src="/brand/blue-logo.png"
              alt="SleepyWear | سليبى وير"
              className="h-10 w-auto"
            />
          </Link>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={close}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-xl leading-none text-black transition-colors hover:border-brand-pink hover:text-brand-pink"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-1">
            <DrawerLink href="/" onClick={close}>
              الرئيسية
            </DrawerLink>
            <DrawerLink href="/products" onClick={close}>
              جميع المنتجات
            </DrawerLink>
            {categories.map((cat) => (
              <DrawerLink
                key={cat.id}
                href={`/categories/${cat.slug}`}
                onClick={close}
              >
                {cat.nameAr}
              </DrawerLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-[var(--line)] px-5 py-5">
          <p className="mb-3 text-xs font-bold text-[var(--muted)]">
            تابعينا
          </p>
          <SocialLinks urls={socialUrls} />
        </div>
      </aside>
    </>
  );
}

function DrawerLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-2xl px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-brand-light-pink hover:text-brand-pink"
    >
      {children}
    </Link>
  );
}

