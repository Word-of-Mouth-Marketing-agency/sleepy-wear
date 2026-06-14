import type { Category, PaginatedResponse, Product } from "@sleepywear/shared";
import { HeroSlider } from "@/components/site/HeroSlider";
import { MarqueeStrip } from "@/components/site/MarqueeStrip";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CategorySlider } from "@/components/site/CategorySlider";
import { ProductCard } from "@/components/site/ProductCard";
import { apiGet } from "@/lib/api";

export default async function HomePage() {
  const [productsRes, categoriesRes] = await Promise.all([
    apiGet<PaginatedResponse<Product>>("/products?limit=20").catch(() => null),
    apiGet<Category[]>("/categories").catch(() => null),
  ]);

  const products = productsRes?.items ?? [];
  const categories = categoriesRes ?? [];
  const bestSellers = products.slice(0, 6);
  const latest = [...products].reverse().slice(0, 6);

  return (
    <div>
      <HeroSlider />

      <MarqueeStrip background="#F389D4" />

      <section className="container py-10 sm:py-14">
        <div className="mb-6">
          <SectionHeading
            title="تسوق حسب القسم"
            link={{ href: "/products", label: "عرض الكل" }}
          />
        </div>
        <CategorySlider categories={categories} />
      </section>

      <MarqueeStrip reverse background="#000000" />

      <section className="container py-10 sm:py-14">
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

      <section className="container py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-pink p-6 sm:p-8 text-white">
            <p className="text-sm font-semibold opacity-80">عرض خاص</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              خصم 10% على أول طلب
            </h2>
            <p className="mt-2 text-sm opacity-80">
              استخدم كود الخصم عند الدفع
            </p>
            <div className="mt-4 inline-block rounded-lg border border-white/30 px-4 py-1.5 text-lg font-mono font-bold tracking-wider">
              BF10
            </div>
          </div>
          <div className="rounded-xl bg-brand-blue p-6 sm:p-8 text-white">
            <p className="text-sm font-semibold opacity-80">توصيل مجاني</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              للطلبات فوق 999 جنيه
            </h2>
            <p className="mt-2 text-sm opacity-80">
              نوصل لكل المحافظات في 3-7 أيام
            </p>
          </div>
        </div>
      </section>

      <section className="container py-10 sm:py-14">
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

      <section className="container py-10 sm:py-14">
        <div className="mb-6">
          <SectionHeading title="ليه SleepyWear؟" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard
            icon={<FactoryIcon />}
            title="من المصنع مباشرة"
            desc="نبيع بأسعار المصنع بدون وسيط — جودة عالية بسعر منافس"
          />
          <BenefitCard
            icon={<TruckIcon />}
            title="توصيل سريع"
            desc="نوصل لكل المحافظات في 3-7 أيام عمل"
          />
          <BenefitCard
            icon={<RefreshIcon />}
            title="استبدال مجاني"
            desc="ضمان استبدال خلال 14 يوم من الاستلام"
          />
          <BenefitCard
            icon={<ChatIcon />}
            title="دعم متواصل"
            desc="خدمة عملاء عبر واتساب طوال أيام الأسبوع"
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
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 text-center sm:p-6 shadow-sm">
      <div className="mb-3 inline-flex text-brand-pink">{icon}</div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">{desc}</p>
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
