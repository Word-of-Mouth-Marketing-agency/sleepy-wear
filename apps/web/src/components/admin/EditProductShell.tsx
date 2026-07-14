"use client";

import { ArrowRight, ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Category, Product } from "@sleepywear/shared";
import {
  PricingSection,
  ProductForm,
  VariantManager,
} from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";

type EditProductShellProps = {
  product: Product;
  categories: Category[];
};

const PRODUCT_FORM_ID = "admin-product-edit-form";

export function EditProductShell({
  product,
  categories,
}: EditProductShellProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-black">
            {product.nameAr}
          </h2>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--muted)]">
            /{product.slug.trim()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-brand-pink hover:text-brand-pink"
          >
            <ArrowRight size={16} aria-hidden="true" />
            رجوع
          </Link>
          <a
            href={`/products/${product.slug.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-brand-blue hover:text-brand-blue"
          >
            <ExternalLink size={16} aria-hidden="true" />
            عرض المنتج
          </a>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-brand-blue"
          >
            <Save size={16} aria-hidden="true" />
            حفظ التعديلات
          </button>
        </div>
      </div>

      <ProductForm
        categories={categories}
        product={product}
        formId={PRODUCT_FORM_ID}
        formRef={formRef}
      />

      <EditorSection title="الأسعار والمخزون">
        <PricingSection product={product} />
      </EditorSection>

      <EditorSection title="الصور">
        <ImageManager product={product} />
      </EditorSection>

      <EditorSection title="المتغيرات">
        <VariantManager product={product} />
      </EditorSection>
    </div>
  );
}

export function EditorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-black text-black">{title}</h3>
      {children}
    </section>
  );
}
