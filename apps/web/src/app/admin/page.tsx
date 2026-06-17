import Link from "next/link";
import { ArrowUpLeft, Grid3X3, Package, ShoppingCart } from "lucide-react";
import type {
  Category,
  Order,
  PaginatedResponse,
  Product,
} from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { apiGet } from "@/lib/api";

export default async function AdminPage() {
  const [products, categories, orders] = await Promise.all([
    apiGet<PaginatedResponse<Product>>(
      "/products?includeInactive=true&limit=1",
    ).catch(() => null),
    apiGet<Category[]>("/categories?includeInactive=true").catch(() => null),
    apiGet<PaginatedResponse<Order>>("/orders?limit=1").catch(() => null),
  ]);

  const cards = [
    {
      href: "/admin/products",
      label: "المنتجات",
      hint: "إدارة الكتالوج والمخزون",
      value: products?.meta.total ?? "-",
      icon: Package,
      tone: "pink",
    },
    {
      href: "/admin/categories",
      label: "التصنيفات",
      hint: "ترتيب قوائم المتجر",
      value: categories?.length ?? "-",
      icon: Grid3X3,
      tone: "blue",
    },
    {
      href: "/admin/orders",
      label: "الطلبات",
      hint: "متابعة طلبات العملاء",
      value: orders?.meta.total ?? "-",
      icon: ShoppingCart,
      tone: "black",
    },
  ];

  return (
    <PageShell
      title="لوحة الإدارة"
      eyebrow="ملخص المتجر"
      description="نظرة سريعة على أهم أجزاء المتجر وروابط مختصرة للمهام اليومية."
      noContainer
      surface="plain"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const toneClass =
            card.tone === "pink"
              ? "bg-brand-pink text-white"
              : card.tone === "blue"
                ? "bg-brand-blue text-white"
                : "bg-black text-white";

          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-pink/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClass}`}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <ArrowUpLeft
                  size={18}
                  className="text-[var(--muted)] transition group-hover:text-brand-pink"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-6 text-sm font-semibold text-[var(--muted)]">
                {card.label}
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-4xl font-extrabold tracking-tight">
                  {card.value}
                </p>
                <p className="pb-1 text-xs font-semibold text-[var(--muted)]">
                  {card.hint}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
            مهام سريعة
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickLink href="/admin/products/new" label="إضافة منتج جديد" />
            <QuickLink href="/admin/pages/home" label="تعديل الصفحة الرئيسية" />
            <QuickLink href="/admin/categories" label="إدارة التصنيفات" />
            <QuickLink href="/admin/orders" label="مراجعة الطلبات" />
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
            حالة اليوم
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            استخدم هذه اللوحة لتحديث المنتجات والصور والطلبات بدون لمس إعدادات
            المتجر أو بيانات الشحن.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-bold transition hover:border-brand-blue/40 hover:bg-blue-50/40"
    >
      {label}
      <ArrowUpLeft size={16} className="text-brand-blue" aria-hidden="true" />
    </Link>
  );
}
