import Link from "next/link";
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
      value: products?.meta.total ?? "-",
    },
    {
      href: "/admin/categories",
      label: "التصنيفات",
      value: categories?.length ?? "-",
    },
    {
      href: "/admin/orders",
      label: "الطلبات",
      value: orders?.meta.total ?? "-",
    },
  ];

  return (
    <PageShell title="لوحة الإدارة" eyebrow="بدون تسجيل دخول حاليا">
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-md border border-[var(--line)] p-4"
          >
            <p className="text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
