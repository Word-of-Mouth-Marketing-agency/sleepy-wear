type MarqueeBannerProps = {
  bgColor?: string;
};

const items = [
  "Premium Packaging",
  "Fast & Reliable Supply",
  "Wholesale Prices",
];

const STAR = '\u2726';

function buildMarqueeContent(startIdx: number) {
  const parts: React.ReactNode[] = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    for (const item of items) {
      parts.push(
        <span key={`${startIdx}-${cycle}-${item}`}>{item}</span>,
      );
      parts.push(
        <span
          key={`${startIdx}-${cycle}-${item}-icon`}
          className="wom-marquee__icon"
        >
          {STAR}
        </span>,
      );
    }
  }
  return parts;
}

export function MarqueeBanner({ bgColor = "transparent" }: MarqueeBannerProps) {
  return (
    <section className="wom-marquee" style={{ background: bgColor }}>
      <div className="wom-marquee__track">
        <div className="wom-marquee__content">
          {buildMarqueeContent(0)}
        </div>
        <div className="wom-marquee__content" aria-hidden="true">
          {buildMarqueeContent(1)}
        </div>
      </div>
    </section>
  );
}
