"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Category, Product } from "@sleepywear/shared";
import { ProductForm, VariantManager } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";

type EditProductShellProps = {
  product: Product;
  categories: Category[];
};

export function EditProductShell({
  product,
  categories,
}: EditProductShellProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-6 pb-24">
      <CollapsibleSection
        title="البيانات الأساسية"
        subtitle="الاسم، الرابط، التصنيف، الوصف، وحالة المنتج."
        defaultOpen
      >
        <ProductForm
          categories={categories}
          product={product}
          formRef={formRef}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="الصور"
        subtitle="ارفع صوراً واضحة للمنتج. صور المتغيرات تُدار من قسم المتغيرات."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">صور المنتج الأساسية</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                ارفع صورا لتظهر في كروت المنتج والمعرض الرئيسي.
              </p>
            </div>
          </div>
          <ImageManager product={product} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="المتغيرات والمخزون"
        subtitle="أضف متغيراً لكل مقاس أو لون. اضغط على أيقونة الصورة لاختيار صورة المتغير."
      >
        <VariantManager product={product} />
      </CollapsibleSection>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--line)] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              className="rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-pink/90"
            >
              حفظ التعديلات
            </button>
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-brand-blue hover:text-brand-blue"
            >
              <ExternalLink size={15} aria-hidden="true" />
              عرض المنتج
            </a>
          </div>
          <Link
            href="/admin/products"
            className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-red-200 hover:text-red-700"
          >
            رجوع
          </Link>
        </div>
      </div>
    </div>
  );
}
