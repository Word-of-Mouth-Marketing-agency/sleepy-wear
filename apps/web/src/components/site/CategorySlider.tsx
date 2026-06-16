"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Category } from "@sleepywear/shared";
import { getMediaUrl } from "@/lib/media";

type CategorySliderProps = {
  categories: Category[];
};

export function CategorySlider({ categories }: CategorySliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  function scrollCategories(direction: "previous" | "next") {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-category-card]");
    const cardWidth = card?.offsetWidth ?? track.clientWidth;
    const gap = 16;
    const distance = (cardWidth + gap) * 2;

    track.scrollBy({
      left: direction === "next" ? -distance : distance,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="التصنيفات السابقة"
        onClick={() => scrollCategories("previous")}
        className="absolute right-0 top-[42%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-white text-lg font-bold text-brand-pink shadow-sm transition-colors hover:bg-brand-light-pink"
      >
        ›
      </button>

      <div
        ref={trackRef}
        className="grid auto-cols-[minmax(150px,1fr)] grid-flow-col gap-4 overflow-x-auto scroll-smooth px-12 pb-2 hide-scrollbar sm:auto-cols-[minmax(190px,1fr)] lg:auto-cols-[calc((100%_-_144px)_/_4)]"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            data-category-card
            className="group block min-w-0"
          >
            <div className="aspect-square overflow-hidden rounded-lg border border-[var(--line)] bg-brand-light-pink">
              {cat.imageUrl ? (
                <img
                  src={getMediaUrl(cat.imageUrl)}
                  alt={cat.nameAr}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-pink via-white to-brand-blue p-4 text-center text-white transition-transform duration-300 group-hover:scale-105">
                  <span className="text-sm font-bold leading-relaxed drop-shadow-sm sm:text-base">
                    {cat.nameAr}
                  </span>
                </div>
              )}
            </div>
            <span className="mt-3 block truncate text-center text-sm font-semibold text-brand-black">
              {cat.nameAr}
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="التصنيفات التالية"
        onClick={() => scrollCategories("next")}
        className="absolute left-0 top-[42%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-white text-lg font-bold text-brand-pink shadow-sm transition-colors hover:bg-brand-light-pink"
      >
        ‹
      </button>
    </div>
  );
}
