"use client";

import { useRef, useEffect } from "react";

type MarqueeStripProps = {
  text?: string;
  items?: string[];
  direction?: "rtl" | "ltr";
  reverse?: boolean;
  bgClass?: string;
  speedSeconds?: number;
};

const defaultItems = [
  "أسعار المصنع",
  "خامات مريحة",
  "عروض مستمرة",
  "توصيل سريع",
  "تشكيلات جديدة",
];

const SEPARATOR = "✦";
const DUPLICATE_COUNT = 10;

export function MarqueeStrip({
  text,
  items,
  direction = "rtl",
  reverse = false,
  bgClass = "bg-brand-pink",
  speedSeconds = 24,
}: MarqueeStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const content = items && items.length > 0 ? items : getTextItems(text);
  const shouldReverse = reverse || direction === "ltr";

  useEffect(() => {
    const track = trackRef.current;
    const measure = measureRef.current;
    if (!track || !measure) return;

    const groupWidth = measure.offsetWidth;
    if (groupWidth <= 0) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const anim = track.animate(
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: `translate3d(-${groupWidth}px, 0, 0)` },
      ],
      {
        duration: speedSeconds * 1000,
        iterations: Infinity,
        direction: shouldReverse ? "reverse" : "normal",
      },
    );

    if (prefersReduced) anim.pause();

    return () => anim.cancel();
  }, [speedSeconds, shouldReverse]);

  const contentElements = buildContent(content);

  return (
    <div
      className={`sleepy-marquee ${bgClass}`}
      style={{ position: "relative" }}
    >
      <div
        ref={measureRef}
        className="sleepy-marquee__content"
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        {contentElements}
      </div>

      <div ref={trackRef} className="sleepy-marquee__track">
        {Array.from({ length: DUPLICATE_COUNT }, (_, i) => (
          <div
            key={i}
            className="sleepy-marquee__content"
            aria-hidden={i > 0}
          >
            {contentElements}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildContent(items: string[]) {
  return items.flatMap((item, i) => [
    <span key={`t${i}`}>{item}</span>,
    <span key={`s${i}`} className="sleepy-marquee__icon">
      {SEPARATOR}
    </span>,
  ]);
}

function getTextItems(text?: string): string[] {
  if (!text) return [...defaultItems];
  const result = text
    .split(/[★✦]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return result.length > 0 ? result : [...defaultItems];
}
