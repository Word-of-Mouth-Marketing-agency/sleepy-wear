import type { Category, PaginatedResponse, Product } from "@sleepywear/shared";
import { HeroSlider } from "@/components/site/HeroSlider";
import { FullWidthBanner } from "@/components/site/FullWidthBanner";
import { MarqueeBanner } from "@/components/site/MarqueeBanner";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CategorySlider } from "@/components/site/CategorySlider";
import { ProductCard } from "@/components/site/ProductCard";
import { API_URL, apiGet } from "@/lib/api";

export default async function HomePage() {
  const [categoriesRes, productsRes] = await Promise.all([
    fetch(`${API_URL}/categories`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then((r) => (r.ok ? (r.json() as Promise<Category[]>) : null))
      .catch(() => null),
    apiGet<PaginatedResponse<Product>>("/products?limit=20").catch(() => null),
  ]);

  const products = productsRes?.items ?? [];
  const categories = categoriesRes ?? [];
  const bestSellers = products.slice(0, 4);
  const latest = [...products].reverse().slice(0, 4);

  return (
    <div>
      <HeroSlider />
      <MarqueeBanner bgColor="#FBE8F5" />

      <section className="container py-12 sm:py-16">
        <div className="mb-6">
          <SectionHeading
            title="تسوق حسب القسم"
            link={{ href: "/products", label: "عرض الكل" }}
          />
        </div>
        <CategorySlider categories={categories} />
      </section>

      <MarqueeBanner bgColor="#FBE8F5" reverse />

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

      <FullWidthBanner />

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

      <section className="container py-12 text-center sm:py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-brand-black sm:text-3xl">
            ليه SleepyWear؟
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            كل اللي تحتاجيه لراحة البيت وأناقة كل يوم
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard
            icon={<FactoryIcon />}
            title="أسعار المصنع مباشرة"
            desc="اختيارات حقيقية بسعر قريب من المصنع من غير طبقات زيادة."
          />
          <BenefitCard
            icon={<RefreshIcon />}
            title="خامات مريحة وجودة عالية"
            desc="ملابس بيت ولانچيري بخامات ناعمة ومناسبة للاستخدام اليومي."
          />
          <BenefitCard
            icon={<ChatIcon />}
            title="تشكيلات متنوعة لكل الأذواق"
            desc="بيچامات، ساتان، كيرفي، لانچيري وكوليكشنات تتجدد باستمرار."
          />
          <BenefitCard
            icon={<TruckIcon />}
            title="توصيل سريع لكل المحافظات"
            desc="نوصل طلبك لباب البيت مع متابعة واضحة لحد الاستلام."
          />
        </div>
      </section>
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

function FactoryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
