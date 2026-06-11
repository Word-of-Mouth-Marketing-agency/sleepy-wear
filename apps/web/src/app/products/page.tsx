import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type { Product } from "@sleepywear/shared";

const products: Pick<Product, "nameAr" | "slug" | "descriptionAr">[] = [
  {
    nameAr: "طقم نوم قطني",
    slug: "cotton-sleep-set",
    descriptionAr: "منتج تجريبي من بيانات البداية.",
  },
  {
    nameAr: "بيجامة ساتان",
    slug: "satin-pajama",
    descriptionAr: "جاهز للربط مع API المنتجات.",
  },
];

export default function ProductsPage() {
  return (
    <PageShell title="المنتجات" eyebrow="كتالوج المتجر">
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="rounded-md border border-[var(--line)] p-4"
          >
            <h2 className="font-semibold">{product.nameAr}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {product.descriptionAr}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
