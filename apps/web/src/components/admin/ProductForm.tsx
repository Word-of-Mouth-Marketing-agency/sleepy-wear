"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Category,
  Product,
  ProductStatus,
} from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";

type ProductFormProps = {
  categories: Category[];
  product?: Product;
};

const statuses: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

const fieldClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      nameAr: String(form.get("nameAr") ?? ""),
      slug: String(form.get("slug") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
      descriptionAr: String(form.get("descriptionAr") ?? "") || undefined,
      status: String(form.get("status") ?? "DRAFT"),
    };

    try {
      const response = await fetch(
        product ? `${API_URL}/products/${product.id}` : `${API_URL}/products`,
        {
          method: product ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(await readError(response));

      const saved = (await response.json()) as Product;
      router.push(`/admin/products/${saved.id}/edit`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "تعذر حفظ المنتج.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
      <Field label="اسم المنتج بالعربي">
        <input
          className={fieldClass}
          defaultValue={product?.nameAr}
          name="nameAr"
          placeholder="مثال: بيجامة قطن ناعمة"
          required
        />
      </Field>
      <Field label="رابط المنتج">
        <input
          className={fieldClass}
          defaultValue={product?.slug}
          name="slug"
          placeholder="product-slug"
          required
        />
      </Field>
      <Field label="التصنيف">
        <select
          className={fieldClass}
          defaultValue={product?.categoryId ?? ""}
          name="categoryId"
          required
        >
          <option value="" disabled>
            اختر التصنيف
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameAr}
            </option>
          ))}
        </select>
      </Field>
      <Field label="حالة المنتج">
        <select
          className={fieldClass}
          defaultValue={product?.status ?? "DRAFT"}
          name="status"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Field>
      <Field label="الوصف العربي" className="sm:col-span-2">
        <textarea
          className={`${fieldClass} min-h-32 resize-y leading-7`}
          defaultValue={product?.descriptionAr ?? ""}
          name="descriptionAr"
          placeholder="اكتب وصفا مختصرا يساعد العميل على الاختيار"
        />
      </Field>
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2">
          {error}
        </p>
      ) : null}
      <button
        className="rounded-full bg-brand-pink px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-pink/90 disabled:opacity-50 sm:col-span-2"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "جاري الحفظ..." : "حفظ المنتج"}
      </button>
    </form>
  );
}

type VariantManagerProps = {
  product: Product;
};

export function VariantManager({
  product,
}: VariantManagerProps) {
  const router = useRouter();
  const [variants, setVariants] = useState(product.variants);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  async function saveVariant(
    event: FormEvent<HTMLFormElement>,
    variantId?: string,
  ) {
    event.preventDefault();
    setError(null);

    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload: Record<string, unknown> = {
      sku: String(form.get("sku") ?? ""),
      price: String(form.get("price") ?? ""),
      salePrice: String(form.get("salePrice") ?? "") || undefined,
      stock: Number(form.get("stock") ?? 0),
      sizeName: String(form.get("sizeName") ?? "") || undefined,
      colorName: String(form.get("colorName") ?? "") || undefined,
    };

    try {
      const response = await fetch(
        variantId
          ? `${API_URL}/products/variants/${variantId}`
          : `${API_URL}/products/${product.id}/variants`,
        {
          method: variantId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(await readError(response));

      const saved = (await response.json()) as Product["variants"][number];

      if (variantId) {
        setVariants((prev) =>
          prev.map((v) => (v.id === variantId ? saved : v)),
        );
        setEditing(null);
      } else {
        setVariants((prev) => [...prev, saved]);
        formEl.reset();
      }
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "تعذر حفظ المتغير.",
      );
    }
  }

  async function deleteVariant(variantId: string) {
    setError(null);
    const response = await fetch(`${API_URL}/products/variants/${variantId}`, {
      method: "DELETE",
      headers: { ...getAdminHeaders() },
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <div className="space-y-3">
        {variants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
            لا توجد متغيرات بعد.
          </div>
        ) : null}
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
          >
            {editing === variant.id ? (
              <VariantFields
                onSubmit={(event) => saveVariant(event, variant.id)}
                variant={variant}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{variant.sku}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {[variant.size?.labelAr, variant.color?.nameAr]
                      .filter(Boolean)
                      .join(" / ") || "بدون مقاس/لون"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-pink-50 px-3 py-1 font-bold text-brand-pink">
                    {variant.salePrice ?? variant.price} ج
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-brand-blue">
                    مخزون {variant.stock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold transition hover:border-brand-blue hover:text-brand-blue"
                    onClick={() => setEditing(variant.id)}
                    type="button"
                  >
                    تعديل
                  </button>
                  <button
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                    onClick={() => deleteVariant(variant.id)}
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold">إضافة متغير</h2>
        <VariantFields
          onSubmit={(event) => saveVariant(event)}
        />
      </div>
    </div>
  );
}

type VariantFieldsProps = {
  variant?: Product["variants"][number];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function VariantFields({
  variant,
  onSubmit,
}: VariantFieldsProps) {
  return (
    <form className="grid gap-3 sm:grid-cols-6" onSubmit={onSubmit}>
      <input
        className={`${fieldClass} sm:col-span-2`}
        defaultValue={variant?.sku}
        name="sku"
        placeholder="SKU"
        required
      />
      <input
        className={fieldClass}
        defaultValue={variant?.price}
        min="0"
        name="price"
        placeholder="السعر"
        required
        step="0.01"
        type="number"
      />
      <input
        className={fieldClass}
        defaultValue={variant?.salePrice ?? ""}
        min="0"
        name="salePrice"
        placeholder="سعر الخصم"
        step="0.01"
        type="number"
      />
      <input
        className={fieldClass}
        defaultValue={variant?.stock ?? 0}
        min="0"
        name="stock"
        placeholder="المخزون"
        type="number"
      />
      <input
        className={fieldClass}
        defaultValue={variant?.size?.labelAr ?? ""}
        name="sizeName"
        placeholder="مقاس (مثال: XL)"
      />
      <input
        className={fieldClass}
        defaultValue={variant?.color?.nameAr ?? ""}
        name="colorName"
        placeholder="لون (مثال: موف)"
      />
      <button
        className="rounded-full bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-pink sm:col-span-6"
        type="submit"
      >
        حفظ المتغير
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2 text-sm font-bold text-black ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  if (Array.isArray(body?.message)) return body.message.join("، ");
  if (typeof body?.message === "string") return body.message;
  return "حدث خطأ غير متوقع.";
}
