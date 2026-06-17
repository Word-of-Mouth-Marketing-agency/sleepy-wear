"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@sleepywear/shared";

type MobileHeaderMenuProps = {
  categories: Category[];
};

export function MobileHeaderMenu({ categories }: MobileHeaderMenuProps) {
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
        className={`mobile-menu-drawer fixed inset-y-0 right-0 z-[70] w-[min(86vw,360px)] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <Link href="/" onClick={close} className="font-extrabold text-brand-pink">
            SleepyWear
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
          <div className="flex items-center gap-4 text-xl text-black">
            <SocialIcon href="#" label="Instagram">
              <InstagramSvg />
            </SocialIcon>
            <SocialIcon href="#" label="Facebook">
              <FacebookSvg />
            </SocialIcon>
            <SocialIcon href="#" label="TikTok">
              <TikTokSvg />
            </SocialIcon>
            <SocialIcon href="https://t.me/sleepywear" label="Telegram">
              <TelegramSvg />
            </SocialIcon>
          </div>
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

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="text-black transition-colors hover:text-brand-pink"
    >
      {children}
    </a>
  );
}

function InstagramSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

function FacebookSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  );
}

function TikTokSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function TelegramSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3l-3.7-1.16c-.8-.26-.8-.78.17-1.17l14.56-5.6c.67-.25 1.3.16 1.07 1.16l-2.46 11.58c-.19.92-.73 1.14-1.48.71l-4.08-3-1.97 1.9c-.22.22-.4.4-.75.4z" />
    </svg>
  );
}
