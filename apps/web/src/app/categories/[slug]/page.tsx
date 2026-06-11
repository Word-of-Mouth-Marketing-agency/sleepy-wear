import { PageShell } from "@/components/PageShell";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <PageShell title="تصنيف المنتجات" eyebrow={slug}>
      <p className="text-[var(--muted)]">
        قائمة منتجات التصنيف ستقرأ لاحقا من /api/categories/{slug}.
      </p>
    </PageShell>
  );
}
