"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Category,
  Color,
  Product,
  ProductStatus,
  Size,
} from "@sleepywear/shared";
import { API_URL } from "@/lib/api";

type ProductFormProps = {
  categories: Category[];
  product?: Product;
};

const statuses: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

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
      nameEn: String(form.get("nameEn") ?? "") || undefined,
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(await readError(response));

      const saved = (await response.json()) as Product;
      router.push(`/admin/products/${saved.id}/edit`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر حفظ المنتج.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      <input
        className="rounded-md border border-[var(--line)] p-3"
        defaultValue={product?.nameAr}
        name="nameAr"
        placeholder="اسم المنتج بالعربي"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-3"
        defaultValue={product?.nameEn ?? ""}
        name="nameEn"
        placeholder="اسم إنجليزي اختياري"
      />
      <input
        className="rounded-md border border-[var(--line)] p-3"
        defaultValue={product?.slug}
        name="slug"
        placeholder="product-slug"
        required
      />
      <select
        className="rounded-md border border-[var(--line)] p-3"
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
      <select
        className="rounded-md border border-[var(--line)] p-3"
        defaultValue={product?.status ?? "DRAFT"}
        name="status"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <textarea
        className="rounded-md border border-[var(--line)] p-3 sm:col-span-2"
        defaultValue={product?.descriptionAr ?? ""}
        name="descriptionAr"
        placeholder="وصف عربي"
      />
      {error ? (
        <p className="text-sm text-red-700 sm:col-span-2">{error}</p>
      ) : null}
      <button
        className="rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2"
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
  sizes: Size[];
  colors: Color[];
};

export function VariantManager({
  product,
  sizes,
  colors,
}: VariantManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  async function saveVariant(
    event: FormEvent<HTMLFormElement>,
    variantId?: string,
  ) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      sku: String(form.get("sku") ?? ""),
      price: String(form.get("price") ?? ""),
      salePrice: String(form.get("salePrice") ?? "") || undefined,
      stock: Number(form.get("stock") ?? 0),
      sizeId: String(form.get("sizeId") ?? "") || undefined,
      colorId: String(form.get("colorId") ?? "") || undefined,
    };

    try {
      const response = await fetch(
        variantId
          ? `${API_URL}/products/variants/${variantId}`
          : `${API_URL}/products/${product.id}/variants`,
        {
          method: variantId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(await readError(response));

      setEditing(null);
      event.currentTarget.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر حفظ المتغير.");
    }
  }

  async function deleteVariant(variantId: string) {
    setError(null);
    const response = await fetch(`${API_URL}/products/variants/${variantId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="space-y-3">
        {product.variants.length === 0 ? (
          <p className="text-[var(--muted)]">لا توجد متغيرات بعد.</p>
        ) : null}
        {product.variants.map((variant) => (
          <div
            key={variant.id}
            className="rounded-md border border-[var(--line)] p-3"
          >
            {editing === variant.id ? (
              <VariantFields
                colors={colors}
                onSubmit={(event) => saveVariant(event, variant.id)}
                sizes={sizes}
                variant={variant}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{variant.sku}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {[variant.size?.labelAr, variant.color?.nameAr]
                      .filter(Boolean)
                      .join(" / ") || "بدون مقاس/لون"}
                  </p>
                </div>
                <p className="text-sm">
                  السعر: {variant.salePrice ?? variant.price} / المخزون:{" "}
                  {variant.stock}
                </p>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-[var(--line)] px-3 py-2 text-sm"
                    onClick={() => setEditing(variant.id)}
                    type="button"
                  >
                    تعديل
                  </button>
                  <button
                    className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700"
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
      <div className="rounded-md border border-[var(--line)] p-4">
        <h2 className="mb-3 font-semibold">إضافة متغير</h2>
        <VariantFields
          colors={colors}
          onSubmit={(event) => saveVariant(event)}
          sizes={sizes}
        />
      </div>
    </div>
  );
}

type VariantFieldsProps = {
  colors: Color[];
  sizes: Size[];
  variant?: Product["variants"][number];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function VariantFields({
  colors,
  sizes,
  variant,
  onSubmit,
}: VariantFieldsProps) {
  return (
    <form className="grid gap-3 sm:grid-cols-6" onSubmit={onSubmit}>
      <input
        className="rounded-md border border-[var(--line)] p-2 sm:col-span-2"
        defaultValue={variant?.sku}
        name="sku"
        placeholder="SKU"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={variant?.price}
        min="0"
        name="price"
        placeholder="السعر"
        required
        step="0.01"
        type="number"
      />
      <input
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={variant?.salePrice ?? ""}
        min="0"
        name="salePrice"
        placeholder="سعر الخصم"
        step="0.01"
        type="number"
      />
      <input
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={variant?.stock ?? 0}
        min="0"
        name="stock"
        placeholder="المخزون"
        type="number"
      />
      <select
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={variant?.size?.id ?? ""}
        name="sizeId"
      >
        <option value="">مقاس</option>
        {sizes.map((size) => (
          <option key={size.id} value={size.id}>
            {size.labelAr}
          </option>
        ))}
      </select>
      <select
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={variant?.color?.id ?? ""}
        name="colorId"
      >
        <option value="">لون</option>
        {colors.map((color) => (
          <option key={color.id} value={color.id}>
            {color.nameAr}
          </option>
        ))}
      </select>
      <button
        className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white sm:col-span-6"
        type="submit"
      >
        حفظ المتغير
      </button>
    </form>
  );
}

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  if (Array.isArray(body?.message)) return body.message.join("، ");
  if (typeof body?.message === "string") return body.message;
  return "حدث خطأ غير متوقع.";
}
