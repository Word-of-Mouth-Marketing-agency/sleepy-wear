function buildSpans(items: string[], keyPrefix: string) {
  const spans: React.ReactNode[] = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < items.length; i++) {
      spans.push(<span key={`${keyPrefix}-t${cycle}-${i}`}>{items[i]}</span>);
      spans.push(
        <span key={`${keyPrefix}-s${cycle}-${i}`} className="wom-marquee__icon">
          &#10022;
        </span>
      );
    }
  }
  return spans;
}

export function MarqueeStrip({
  reverse = false,
  background = "#FBE902",
}: {
  reverse?: boolean;
  background?: string;
}) {
  const ITEMS = [
    "Comfort in Every Color",
    "Socks That Make You Smile",
    "Step Into Joy",
  ];
  const spans = buildSpans(ITEMS, "m");

  return (
    <div className="wom-marquee" style={{ background }}>
      <div
        className="wom-marquee__track"
        style={{ animationDirection: reverse ? undefined : "normal" }}
      >
        <div className="wom-marquee__content">{spans}</div>
        <div className="wom-marquee__content" aria-hidden="true">{spans}</div>
      </div>
    </div>
  );
}