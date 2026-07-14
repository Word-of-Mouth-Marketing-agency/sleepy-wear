"use client";

import {
  ArrowRight,
  Boxes,
  ExternalLink,
  Image as ImageIcon,
  Save,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Category, Product } from "@sleepywear/shared";
import { ProductForm, VariantManager } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";

type EditProductShellProps = {
  product: Product;
  categories: Category[];
};

const PRODUCT_FORM_ID = "admin-product-edit-form";

const sections = [
  {
    id: "basic",
    label: "البيانات الأساسية",
    description: "الاسم والرابط والوصف",
    icon: Tags,
  },
  {
    id: "images",
    label: "الصور",
    description: "صور المنتج والمعرض",
    icon: ImageIcon,
  },
  {
    id: "variants",
    label: "المتغيرات والمخزون",
    description: "المقاسات والألوان والأسعار",
    icon: Boxes,
  },
] as const;

export function EditProductShell({
  product,
  categories,
}: EditProductShellProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-5 pb-10">
      <div className="sticky top-16 z-20 rounded-3xl border border-pink-100 bg-white/95 p-3 shadow-sm backdrop-blur lg:top-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-pink">تعديل منتج</p>
            <h2 className="truncate text-lg font-black text-black">
              {product.nameAr}
            </h2>
            <p className="mt-1 truncate text-xs font-semibold text-[var(--muted)]">
              /{product.slug.trim()} · {product.status}
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
      </div>

      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <nav className="sticky top-32 space-y-2 rounded-3xl border border-[var(--line)] bg-white p-3 shadow-sm">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[var(--muted)] transition hover:bg-pink-50 hover:text-black"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf7fa] text-black transition group-hover:text-brand-pink">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-black">{section.label}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-[var(--muted)]">
                      {section.description}
                    </span>
                  </span>
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-5">
          <EditorSection
            id="basic"
            title="البيانات الأساسية"
            description="عدّل اسم المنتج والرابط والتصنيف وحالة الظهور من مكان واحد."
          >
            <ProductForm
              categories={categories}
              product={product}
              formId={PRODUCT_FORM_ID}
              formRef={formRef}
            />
          </EditorSection>

          <EditorSection
            id="images"
            title="الصور"
            description="نظّم صور المنتج الأساسية، وارفع صورا جديدة، واحذف الصور غير المطلوبة."
          >
            <ImageManager product={product} />
          </EditorSection>

          <EditorSection
            id="variants"
            title="المتغيرات والمخزون"
            description="راجع المقاسات والألوان والأسعار والمخزون، واربط كل متغير بالصورة المناسبة."
          >
            <VariantManager product={product} />
          </EditorSection>
        </div>
      </div>
    </div>
  );
}

function EditorSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 rounded-3xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-5 border-b border-[var(--line)] pb-4">
        <h3 className="text-xl font-black text-black">{title}</h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
