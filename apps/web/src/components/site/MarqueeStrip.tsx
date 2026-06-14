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

const CYCLES = 20;

export function MarqueeStrip({
  text,
  items,
  direction = "rtl",
  reverse = false,
  bgClass = "bg-brand-pink",
  speedSeconds = 30,
}: MarqueeStripProps) {
  const content = items && items.length > 0 ? items : getTextItems(text);
  const shouldReverse = reverse || direction === "ltr";
  const contentElements = buildLongContent(content);

  return (
    <div className={`sleepy-marquee ${bgClass}`}>
      <div
        className="sleepy-marquee__track"
        style={{
          animationDuration: `${speedSeconds}s`,
          animationDirection: shouldReverse ? "reverse" : "normal",
        }}
      >
        <div className="sleepy-marquee__content">{contentElements}</div>
        <div className="sleepy-marquee__content" aria-hidden="true">
          {contentElements}
        </div>
      </div>
    </div>
  );
}

function buildLongContent(items: string[]) {
  const spans: ReactNode[] = [];

  for (let c = 0; c < CYCLES; c++) {
    for (let i = 0; i < items.length; i++) {
      spans.push(<span key={`c${c}-i${i}`}>{items[i]}</span>);
      spans.push(
        <span key={`c${c}-s${i}`} className="sleepy-marquee__icon">
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
