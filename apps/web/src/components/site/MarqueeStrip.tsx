type MarqueeStripProps = {
  text: string;
  direction?: "rtl" | "ltr";
  bgClass?: string;
  speedSeconds?: number;
};

export function MarqueeStrip({
  text,
  direction = "rtl",
  bgClass = "bg-brand-light-pink",
  speedSeconds = 25,
}: MarqueeStripProps) {
  const animClass =
    direction === "rtl" ? "animate-marquee-rtl" : "animate-marquee-ltr";

  return (
    <div className={`overflow-hidden py-2 ${bgClass}`}>
      <div
        className={`flex ${animClass} gap-8 whitespace-nowrap`}
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        <span className="text-sm text-[var(--muted)]">{text}</span>
        <span className="text-sm text-[var(--muted)]">{text}</span>
        <span className="text-sm text-[var(--muted)]">{text}</span>
        <span className="text-sm text-[var(--muted)]">{text}</span>
      </div>
    </div>
  );
}
