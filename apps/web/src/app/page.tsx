import type { Category, PaginatedResponse, Product } from "@sleepywear/shared";
import { HeroSlider } from "@/components/site/HeroSlider";
import { FullWidthBanner } from "@/components/site/FullWidthBanner";
import { MarqueeBanner } from "@/components/site/MarqueeBanner";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CategorySlider } from "@/components/site/CategorySlider";
import { ProductCard } from "@/components/site/ProductCard";
import { apiGet, apiFetch } from "@/lib/api";

type ReasonItem = {
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
};

type WhySection = {
  title: string;
  subtitle: string;
  enabled: boolean;
  reasons: ReasonItem[];
};

type MidBanner = {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  enabled: boolean;
};

type MarqueeSettings = {
  messages: string[];
};

type BestSellersSettings = {
  productIds: string[];
};

const REASON_ICONS: Record<string, React.ReactNode> = {
  factory: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    </svg>
  ),
  truck: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  ),
  refresh: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  chat: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

async function getSettings() {
  return apiFetch<Record<string, unknown>>("/settings");
}

export default async function HomePage() {
  const [categoriesRes, productsRes, settings] = await Promise.all([
    apiFetch<Category[]>("/categories"),
    apiGet<PaginatedResponse<Product>>("/products?limit=20").catch(() => null),
    getSettings(),
  ]);

  const products = productsRes?.items ?? [];
  const categories = categoriesRes ?? [];
  const latest = [...products].reverse().slice(0, 4);

  const marqueeSettings = (settings?.homepage_marquee ?? {
    messages: ["توصيل مجاني", "خصم 10%", "جودة من المصنع"],
  }) as MarqueeSettings;

  const bestSellerIds = (settings?.homepage_best_sellers as BestSellersSettings)?.productIds ?? [];

  let bestSellers: Product[];
  if (bestSellerIds.length > 0) {
    bestSellers = products.filter((p) => bestSellerIds.includes(p.id));
    if (bestSellers.length < 4) {
      const fallback = products.filter((p) => !bestSellerIds.includes(p.id));
      bestSellers = [...bestSellers, ...fallback].slice(0, 4);
    }
  } else {
    bestSellers = products.slice(0, 4);
  }

  const midBanner = (settings?.homepage_mid_banner ?? {
    title: "عرض خاص",
    subtitle: "خصم 10% على أول طلب",
    description: "+ توصيل مجاني للطلبات فوق 999 جنيه",
    buttonText: "تسوق الآن",
    buttonUrl: "/products",
    enabled: true,
  }) as MidBanner;

  const whySection = (settings?.homepage_why_sleepywear ?? {
    title: "ليه SleepyWear؟",
    subtitle: "كل اللي تحتاجيه لراحة البيت وأناقة كل يوم",
    enabled: true,
    reasons: [
      { title: "أسعار المصنع مباشرة", description: "اختيارات حقيقية بسعر قريب من المصنع من غير طبقات زيادة.", icon: "factory", enabled: true },
      { title: "خامات مريحة وجودة عالية", description: "ملابس بيت ولانچيري بخامات ناعمة ومناسبة للاستخدام اليومي.", icon: "refresh", enabled: true },
      { title: "تشكيلات متنوعة لكل الأذواق", description: "بيچامات، ساتان، كيرفي، لانچيري وكوليكشنات تتجدد باستمرار.", icon: "chat", enabled: true },
      { title: "توصيل سريع لكل المحافظات", description: "نوصل طلبك لباب البيت مع متابعة واضحة لحد الاستلام.", icon: "truck", enabled: true },
    ],
  }) as WhySection;

  return (
    <div>
      <HeroSlider />
      <MarqueeBanner bgColor="#FBE8F5" messages={marqueeSettings.messages} />

      <section className="container py-12 sm:py-16">
        <div className="mb-6">
          <SectionHeading
            title="تسوق حسب القسم"
            link={{ href: "/products", label: "عرض الكل" }}
          />
        </div>
        <CategorySlider categories={categories} />
      </section>

      <MarqueeBanner bgColor="#FBE8F5" reverse messages={marqueeSettings.messages} />

      <section className="container py-12 sm:py-16">
        <div className="mb-6">
          <SectionHeading
            title="الأكثر مبيعاً"
            link={{ href: "/products", label: "عرض الكل" }}
          />
        </div>
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--muted)]">لا توجد منتجات حالياً.</p>
        )}
      </section>

      {midBanner.enabled ? (
        <FullWidthBanner banner={midBanner} />
      ) : null}

      <section className="container py-12 sm:py-16">
        <div className="mb-6">
          <SectionHeading
            title="آخر المنتجات"
            link={{ href: "/products", label: "عرض الكل" }}
          />
        </div>
        {latest.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--muted)]">لا توجد منتجات حالياً.</p>
        )}
      </section>

      {whySection.enabled ? (
        <section className="container py-12 text-center sm:py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-brand-black sm:text-3xl">
              {whySection.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {whySection.subtitle}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whySection.reasons.filter((r) => r.enabled).map((reason, i) => (
              <BenefitCard
                key={i}
                icon={REASON_ICONS[reason.icon] ?? REASON_ICONS.factory}
                title={reason.title}
                desc={reason.description}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light-pink text-brand-pink">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-brand-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        {desc}
      </p>
    </div>
  );
}
