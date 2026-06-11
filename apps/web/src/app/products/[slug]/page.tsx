import { PageShell } from "@/components/PageShell";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <PageShell title="تفاصيل المنتج" eyebrow={slug}>
      <div className="space-y-3 text-[var(--muted)]">
        <p>
          صفحة منتج جاهزة لاستقبال بيانات المنتج والصور والمقاسات والألوان من
          API.
        </p>
        <p>المخزون سيكون من ProductVariant وليس من المنتج الرئيسي.</p>
      </div>
    </PageShell>
  );
}
