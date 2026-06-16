type MarqueeBannerProps = {
  bgColor?: string;
  reverse?: boolean;
};

const items = [
  "توصيل مجاني",
  "خصم 10%",
  "جودة من المصنع",
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

export function MarqueeBanner({ bgColor = "transparent", reverse }: MarqueeBannerProps) {
  return (
    <section className="wom-marquee" style={{ background: bgColor }}>
      <div className={`wom-marquee__track${reverse ? " wom-marquee__track--reverse" : ""}`}>
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
