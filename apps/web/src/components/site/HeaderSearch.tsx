"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

function SearchSvg() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, close]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    close();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(true)}
        aria-label="بحث"
        className="flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-brand-light-pink hover:text-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/40"
        type="button"
      >
        <SearchSvg />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/10" onClick={close} />
          <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-[var(--line)] bg-white p-4 text-right shadow-xl">
            <div className="mb-3">
              <p className="text-sm font-bold text-brand-black">ابحثي عن منتج</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                اكتبي اسم المنتج أو الكاتيجوري وسيتم عرض النتائج فوراً.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <label className="sr-only" htmlFor="header-search">
                بحث عن منتج
              </label>
              <input
                id="header-search"
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: ساتان، بيجامة، لانجيري..."
                className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-brand-light-pink/50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-brand-pink focus:bg-white focus:ring-2 focus:ring-brand-pink/15"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-pink px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!query.trim()}
              >
                بحث
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
