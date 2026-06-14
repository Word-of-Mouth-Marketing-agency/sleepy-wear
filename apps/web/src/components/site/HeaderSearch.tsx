"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

function SearchSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <button onClick={() => setOpen(true)} aria-label="بحث" className="text-[var(--muted)] transition-colors hover:text-brand-pink">
        <SearchSvg />
      </button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={close}
          />
          <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border border-[var(--line)] bg-white p-3 shadow-lg">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="min-w-0 flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm outline-none transition-colors focus:border-brand-pink"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-pink px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
