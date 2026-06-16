"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import type { Category } from "@sleepywear/shared";
import { getMediaUrl } from "@/lib/media";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CategorySliderProps = {
  categories: Category[];
};

export function CategorySlider({ categories }: CategorySliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = scrollWidth - clientWidth;
    const current = Math.abs(scrollLeft);
    setHasPrev(current > 4);
    setHasNext(current < maxScroll - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    return () => track.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  if (categories.length === 0) return null;

  function scrollCategories(direction: "previous" | "next") {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-category-card]");
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 8;
    const distance = (cardWidth + gap) * 2;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const current = Math.abs(track.scrollLeft);
    const atStart = current < 4;
    const atEnd = current > maxScroll - 4;

    if (direction === "next" && atEnd) return;
    if (direction === "previous" && atStart) return;

    track.scrollBy({
      left: direction === "next" ? -distance : distance,
      behavior: "smooth",
    });
  }

  const arrowBase =
    "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all duration-200";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="التالي"
        onClick={(e) => {
          e.stopPropagation();
          scrollCategories("next");
        }}
        disabled={!hasNext}
        className={`${arrowBase} right-0 border-brand-pink bg-white text-brand-pink hover:bg-brand-pink hover:text-white disabled:opacity-30`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={trackRef}
        className="mx-[52px] grid auto-cols-[calc((100%_-_8px)_/_2)] grid-flow-col gap-2 overflow-x-auto scroll-smooth pb-1 hide-scrollbar sm:auto-cols-[calc((100%_-_16px)_/_3)] lg:auto-cols-[calc((100%_-_24px)_/_4)]"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            data-category-card
            className="group block min-w-0"
          >
            <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-brand-light-pink aspect-[3/4]">
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
            <span className="mt-2 block truncate text-center text-sm font-semibold text-brand-black">
              {cat.nameAr}
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="السابق"
        onClick={(e) => {
          e.stopPropagation();
          scrollCategories("previous");
        }}
        disabled={!hasPrev}
        className={`${arrowBase} left-0 border-brand-blue bg-white text-brand-blue hover:bg-brand-blue hover:text-white disabled:opacity-30`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
