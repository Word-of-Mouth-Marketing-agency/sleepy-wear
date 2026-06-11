import Link from "next/link";

type Slide = {
  title: string;
  subtitle?: string;
  href: string;
  cta: string;
  bg: string;
};

const slides: Slide[] = [
  {
    title: "تشكيلة الشتاء",
    subtitle: "أجمل أطقم المنزل بأفضل سعر",
    href: "/products",
    cta: "تسوق الآن",
    bg: "#F389D4",
  },
  {
    title: "خصم 10% لأول طلب",
    subtitle: "استخدم كود BF10 عند الدفع",
    href: "/products",
    cta: "استخدم الكود",
    bg: "#00AEEF",
  },
  {
    title: "جودة من المصنع",
    subtitle: "أسعار لا تقبل المنافسة",
    href: "/products",
    cta: "تصفح المنتجات",
    bg: "#000000",
  },
];

export function HeroSlider() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[50vh] sm:h-[80vh]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="hero-slide-anim absolute inset-0 flex items-center"
            style={{ backgroundColor: slide.bg }}
          >
            <div className="container">
              <div className="max-w-md space-y-3">
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                  {slide.title}
                </h1>
                {slide.subtitle ? (
                  <p className="text-white/80 text-lg">{slide.subtitle}</p>
                ) : null}
                <Link
                  href={slide.href}
                  className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-pink hover:bg-brand-light-pink transition-colors"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-white/60"
          />
        ))}
      </div>
    </section>
  );
}
