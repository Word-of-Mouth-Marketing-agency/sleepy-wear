import type { CSSProperties } from "react";
import type { ReactNode } from "react";

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

export function MarqueeStrip({
  text,
  items,
  direction = "rtl",
  reverse = false,
  bgClass = "bg-brand-pink",
  speedSeconds = 24,
}: MarqueeStripProps) {
  const shouldReverse = reverse || direction === "ltr";
  const content = items && items.length > 0 ? items : getTextItems(text);
  const spans = buildSpans(content, "sleepy-marquee");
  const style = {
    "--sleepy-marquee-duration": `${speedSeconds}s`,
    "--sleepy-marquee-mobile-duration": `${Math.round(speedSeconds * (20 / 24))}s`,
  } as CSSProperties;

  return (
    <div className={`sleepy-marquee ${bgClass}`} style={style}>
      <div
        className="sleepy-marquee__track"
        style={{
          animationDirection: shouldReverse ? undefined : "normal",
        }}
      >
        <div className="sleepy-marquee__content">{spans}</div>
        <div className="sleepy-marquee__content" aria-hidden="true">
          {spans}
        </div>
      </div>
    </div>
  );
}

function buildSpans(items: string[], keyPrefix: string) {
  const spans: ReactNode[] = [];

  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < items.length; i++) {
      spans.push(<span key={`${keyPrefix}-t${cycle}-${i}`}>{items[i]}</span>);
      spans.push(
        <span
          key={`${keyPrefix}-s${cycle}-${i}`}
          className="sleepy-marquee__icon"
        >
          ✦
        </span>,
      );
    }
  }

  return spans;
}

function getTextItems(text?: string) {
  if (!text) return defaultItems;

  const textItems = text
    .split(/[★✦]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return textItems.length > 0 ? textItems : defaultItems;
}
