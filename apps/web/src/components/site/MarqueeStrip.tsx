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
  "توصيل مجاني للطلبات فوق 999 جنيه",
  "خصم 10% لأول طلب",
  "ضمان استبدال خلال 14 يوم",
  "توصيل لجميع المحافظات",
  "أسعار المصنع مباشرة",
];

export function MarqueeStrip({
  text,
  items,
  direction = "rtl",
  reverse = false,
  bgClass = "bg-brand-pink",
  speedSeconds = 24,
}: MarqueeStripProps) {
  const content = items && items.length > 0 ? items : getTextItems(text);
  const shouldReverse = reverse || direction === "ltr";
  const spans = buildSpans(content);

  return (
    <div className={`sleepy-marquee ${bgClass}`}>
      <div
        className="sleepy-marquee__track"
        style={{
          animationDuration: `${speedSeconds}s`,
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

function buildSpans(items: string[]) {
  const spans: ReactNode[] = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < items.length; i++) {
      spans.push(<span key={`t${cycle}-${i}`}>{items[i]}</span>);
      spans.push(
        <span key={`s${cycle}-${i}`} className="sleepy-marquee__icon">
          ✦
        </span>,
      );
    }
  }
  return spans;
}

function getTextItems(text?: string): string[] {
  if (!text) return [...defaultItems];
  const result = text
    .split(/[★✦]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return result.length > 0 ? result : [...defaultItems];
}
