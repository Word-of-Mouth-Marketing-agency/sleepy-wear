import type { CSSProperties } from "react";

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
  items = defaultItems,
  direction = "rtl",
  reverse = false,
  bgClass = "bg-brand-pink",
  speedSeconds = 24,
}: MarqueeStripProps) {
  const shouldReverse = reverse || direction === "ltr";
  const content = [...items, ...items];
  const style = {
    "--sleepy-marquee-duration": `${speedSeconds}s`,
    "--sleepy-marquee-mobile-duration": `${Math.round(speedSeconds * (20 / 24))}s`,
  } as CSSProperties;

  return (
    <div className={`sleepy-marquee ${bgClass}`} style={style}>
      <div
        className="sleepy-marquee__track"
        style={{
          animationDirection: shouldReverse ? "reverse" : "normal",
        }}
      >
        <MarqueeContent items={content} />
        <MarqueeContent items={content} ariaHidden />
      </div>
    </div>
  );
}

function MarqueeContent({
  items,
  ariaHidden = false,
}: {
  items: string[];
  ariaHidden?: boolean;
}) {
  return (
    <div className="sleepy-marquee__content" aria-hidden={ariaHidden}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="sleepy-marquee__item">
          {item}
          <span className="sleepy-marquee__icon">✦</span>
        </span>
      ))}
    </div>
  );
}
