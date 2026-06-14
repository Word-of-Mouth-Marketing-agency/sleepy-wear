import type { CSSProperties } from "react";
import { Fragment } from "react";

const marqueeItems = [
  "توصيل مجاني للطلبات فوق 999 جنيه",
  "خصم 10% لأول طلب",
  "ضمان استبدال خلال 14 يوم",
  "توصيل لجميع المحافظات",
  "أسعار المصنع مباشرة",
];

type SimpleMarqueeProps = {
  reverse?: boolean;
  background: string;
  separatorColor?: string;
};

export function SimpleMarquee({
  reverse = false,
  background,
  separatorColor = "#000000",
}: SimpleMarqueeProps) {
  const longItems = Array.from({ length: 8 }, () => marqueeItems).flat();
  const style = {
    "--simple-marquee-bg": background,
    "--simple-marquee-separator": separatorColor,
  } as CSSProperties;

  return (
    <div className="simple-marquee" style={style}>
      <div
        className="simple-marquee__track"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        <MarqueeSegment items={longItems} />
        <MarqueeSegment items={longItems} ariaHidden />
      </div>
    </div>
  );
}

function MarqueeSegment({
  items,
  ariaHidden = false,
}: {
  items: string[];
  ariaHidden?: boolean;
}) {
  return (
    <div className="simple-marquee__segment" aria-hidden={ariaHidden}>
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <span className="simple-marquee__text">{item}</span>
          <span className="simple-marquee__separator">✦</span>
        </Fragment>
      ))}
    </div>
  );
}
