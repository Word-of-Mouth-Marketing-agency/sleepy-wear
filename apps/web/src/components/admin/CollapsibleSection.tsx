"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-right transition-colors hover:bg-[#fbf7fa]"
      >
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[var(--muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`border-t border-[var(--line)] ${
          open ? "" : "hidden"
        }`}
      >
        <div className="p-5">{children}</div>
      </div>
    </section>
  );
}
