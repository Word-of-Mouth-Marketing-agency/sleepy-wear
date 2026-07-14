"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";
import type {
  Category,
  Product,
  ProductStatus,
} from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import {
  classifyImage,
  dedupeImages,
} from "@/lib/product-variants";

type ProductFormProps = {
  categories: Category[];
  product?: Product;
  formId?: string;
  formRef?: React.RefObject<HTMLFormElement | null>;
};

const statuses: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

const fieldClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

export function ProductForm({
  categories,
  product,
  formId,
  formRef,
}: ProductFormProps) {
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
    <form
      id={formId}
      ref={formRef}
      className="space-y-6"
      onSubmit={submit}
    >
      <section className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-black text-black">
          البيانات الأساسية
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
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
              defaultValue={product?.slug.trim()}
              name="slug"
              placeholder="product-slug"
              required
            />
          </Field>
          <Field label="الوصف العربي" className="sm:col-span-2">
            <textarea
              className={`${fieldClass} min-h-36 resize-y leading-7`}
              defaultValue={product?.descriptionAr ?? ""}
              name="descriptionAr"
              placeholder="اكتب وصفا مختصرا يساعد العميل على الاختيار"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-black text-black">
          التصنيف والظهور
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
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
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {isSaving ? (
        <p className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-brand-blue">
          جاري حفظ بيانات المنتج...
        </p>
      ) : null}
      <button type="submit" className="hidden" />
    </form>
  );
}

type PricingSectionProps = {
  product: Product;
};

export function PricingSection({ product }: PricingSectionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const simpleVariant =
    product.variants.length === 1 &&
    !product.variants[0].size &&
    !product.variants[0].color
      ? product.variants[0]
      : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!simpleVariant) return;
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      price: String(form.get("price") ?? ""),
      salePrice: String(form.get("salePrice") ?? "") || undefined,
      stock: Number(form.get("stock") ?? 0),
    };

    try {
      const response = await fetch(
        `${API_URL}/products/variants/${simpleVariant.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error(await readError(response));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "تعذر حفظ السعر.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!simpleVariant) {
    const prices = product.variants.map((v) =>
      Number(v.salePrice ?? v.price),
    );
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm font-bold">
          <span className="rounded-full bg-pink-50 px-3 py-1.5 text-brand-pink">
            {prices.length > 0
              ? `السعر: ${Math.min(...prices)} - ${Math.max(...prices)} ج`
              : "لا توجد أسعار بعد"}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-brand-blue">
            إجمالي المخزون: {totalStock}
          </span>
          <span className="rounded-full bg-[#fbf7fa] px-3 py-1.5 text-[var(--muted)]">
            عدد المتغيرات: {product.variants.length}
          </span>
        </div>
        <p className="text-sm font-semibold text-[var(--muted)]">
          هذا المنتج له متغيرات، عدّل السعر والمخزون لكل متغير من قسم
          المتغيرات بالأسفل.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="السعر">
          <input
            className={fieldClass}
            defaultValue={simpleVariant.price}
            min="0"
            name="price"
            required
            step="0.01"
            type="number"
          />
        </Field>
        <Field label="سعر الخصم">
          <input
            className={fieldClass}
            defaultValue={simpleVariant.salePrice ?? ""}
            min="0"
            name="salePrice"
            placeholder="اختياري"
            step="0.01"
            type="number"
          />
        </Field>
        <Field label="المخزون">
          <input
            className={fieldClass}
            defaultValue={simpleVariant.stock}
            min="0"
            name="stock"
            type="number"
          />
        </Field>
      </div>
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <button
        className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink disabled:opacity-50"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "جاري الحفظ..." : "حفظ السعر والمخزون"}
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
  const [imagePickerFor, setImagePickerFor] = useState<string | null>(null);

  const groupedImageOptions = useMemo(() => {
    const deduped = dedupeImages(product.images);

    const productImages = deduped.filter(
      (img) => classifyImage(img) === "product",
    );
    const variationImages = deduped.filter(
      (img) => classifyImage(img) === "variation",
    );
    const assignedImages = deduped.filter(
      (img) => classifyImage(img) === "assigned-variant",
    );

    return { productImages, variationImages, assignedImages };
  }, [product.images]);

  function getVariantImage(
    variant: (typeof variants)[number],
  ) {
    return (
      variant.images?.[0] ??
      product.images.find((img) => img.variantId === variant.id) ??
      null
    );
  }

  function getVariantImageBySku(variant: (typeof variants)[number]) {
    return product.images.find((img) =>
      img.altAr?.startsWith(variant.sku),
    );
  }

  async function assignImage(variantId: string, imageId: string | null) {
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/products/variants/${variantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({ imageId }),
        },
      );
      if (!response.ok) throw new Error(await readError(response));
      const updated = (await response.json()) as Product["variants"][number];
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? updated : v)),
      );
      setImagePickerFor(null);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "تعذر تحديث الصورة.",
      );
    }
  }

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
        ) : (
          variants.map((variant) => {
            const variantImage = getVariantImage(variant) ?? getVariantImageBySku(variant);
            const isEditing = editing === variant.id;
            const isPicking = imagePickerFor === variant.id;

            return (
              <div
                key={variant.id}
                className="rounded-2xl border border-[var(--line)] bg-white shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-black">
                          تعديل المتغير
                        </h4>
                        <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                          عدّل السعر أو المخزون أو بيانات المقاس واللون.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] transition hover:border-brand-pink hover:text-brand-pink"
                      >
                        إلغاء
                      </button>
                    </div>
                    <VariantFields
                      onSubmit={(event) => saveVariant(event, variant.id)}
                      variant={variant}
                      submitLabel="حفظ التعديل"
                    />
                  </div>
                ) : (
                  <div className="grid gap-3 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4 xl:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
                    <button
                      type="button"
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-brand-light-pink transition hover:border-brand-pink sm:h-14 sm:w-14"
                      onClick={() =>
                        setImagePickerFor(
                          isPicking ? null : variant.id,
                        )
                      }
                      title="اختيار صورة المتغير"
                    >
                      {variantImage ? (
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          src={getMediaUrl(variantImage.url)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                          <ImageIcon size={18} aria-hidden="true" />
                        </div>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-sm">
                        {[variant.color?.nameAr, variant.size?.labelAr]
                          .filter(Boolean)
                          .join(" / ") || variant.sku}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)] truncate">
                        {variant.sku}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      {variant.salePrice ? (
                        <span className="text-xs text-[var(--muted)] line-through">
                          {variant.price} ج
                        </span>
                      ) : null}
                      <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-brand-pink">
                        {variant.salePrice ?? variant.price} ج
                      </span>
                      <StockBadge stock={variant.stock} />
                    </div>

                    <div className="flex shrink-0 gap-1.5 sm:col-span-3 xl:col-span-1 xl:justify-end">
                      <button
                        className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-bold transition hover:border-brand-blue hover:text-brand-blue sm:px-3"
                        onClick={() => setEditing(variant.id)}
                        type="button"
                      >
                        تعديل
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700 transition hover:bg-red-50 sm:px-3"
                        onClick={() => deleteVariant(variant.id)}
                        type="button"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                )}

                {isPicking ? (
                  <div className="border-t border-[var(--line)] bg-brand-light-pink/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-[var(--muted)]">
                        اختر صورة للمتغير من الصور المتاحة
                      </p>
                      <button
                        type="button"
                        className="rounded-full p-1 text-[var(--muted)] transition hover:bg-white hover:text-black"
                        onClick={() => setImagePickerFor(null)}
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <button
                        type="button"
                        className={`h-14 w-14 overflow-hidden rounded-xl border-2 bg-brand-light-pink transition ${
                          !variantImage
                            ? "border-brand-pink"
                            : "border-transparent hover:border-brand-pink/50"
                        }`}
                        onClick={() => assignImage(variant.id, null)}
                        title="بدون صورة"
                      >
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[var(--muted)]">
                          بدون
                        </div>
                      </button>

                      {groupedImageOptions.productImages.length > 0 ? (
                        <div>
                          <p className="mb-1 text-[10px] font-bold text-green-700">
                            صور المنتج الأساسية
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {groupedImageOptions.productImages.map((img) => (
                              <ImageOption
                                key={img.id}
                                img={img}
                                selected={variantImage?.id === img.id}
                                onClick={() => assignImage(variant.id, img.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {groupedImageOptions.variationImages.length > 0 ? (
                        <div>
                          <p className="mb-1 text-[10px] font-bold text-amber-700">
                            صور المتغيرات
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {groupedImageOptions.variationImages.map((img) => (
                              <ImageOption
                                key={img.id}
                                img={img}
                                selected={variantImage?.id === img.id}
                                onClick={() => assignImage(variant.id, img.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {groupedImageOptions.assignedImages.length > 0 ? (
                        <div>
                          <p className="mb-1 text-[10px] font-bold text-brand-pink">
                            مستخدمة مع متغير آخر
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {groupedImageOptions.assignedImages.map((img) => (
                              <ImageOption
                                key={img.id}
                                img={img}
                                selected={variantImage?.id === img.id}
                                onClick={() => assignImage(variant.id, img.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-extrabold">إضافة متغير جديد</h3>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            اترك المقاس أو اللون فارغا إذا كان المنتج بسيطا.
          </p>
        </div>
        <VariantFields
          onSubmit={(event) => saveVariant(event)}
          submitLabel="إضافة المتغير"
        />
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
        غير متوفر
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        متبقي {stock}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-blue">
      مخزون {stock}
    </span>
  );
}

type VariantFieldsProps = {
  variant?: Product["variants"][number];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
};

function VariantFields({
  variant,
  onSubmit,
  submitLabel = "حفظ المتغير",
}: VariantFieldsProps) {
  return (
    <form className="grid gap-3 sm:grid-cols-6" onSubmit={onSubmit}>
      <Field label="SKU" className="sm:col-span-2">
        <input
          className={fieldClass}
          defaultValue={variant?.sku}
          name="sku"
          placeholder="SKU"
          required
        />
      </Field>
      <Field label="السعر">
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
      </Field>
      <Field label="سعر الخصم">
        <input
          className={fieldClass}
          defaultValue={variant?.salePrice ?? ""}
          min="0"
          name="salePrice"
          placeholder="اختياري"
          step="0.01"
          type="number"
        />
      </Field>
      <Field label="المخزون">
        <input
          className={fieldClass}
          defaultValue={variant?.stock ?? 0}
          min="0"
          name="stock"
          placeholder="0"
          type="number"
        />
      </Field>
      <Field label="المقاس">
        <input
          className={fieldClass}
          defaultValue={variant?.size?.labelAr ?? ""}
          name="sizeName"
          placeholder="مثال: XL"
        />
      </Field>
      <Field label="اللون" className="sm:col-span-2">
        <input
          className={fieldClass}
          defaultValue={variant?.color?.nameAr ?? ""}
          name="colorName"
          placeholder="مثال: موف"
        />
      </Field>
      <button
        className="rounded-full bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-pink sm:col-span-6"
        type="submit"
      >
        {submitLabel}
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

function ImageOption({
  img,
  selected,
  onClick,
}: {
  img: Product["images"][number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`h-14 w-14 overflow-hidden rounded-xl border-2 transition ${
        selected
          ? "border-brand-pink"
          : "border-transparent hover:border-brand-pink/50"
      }`}
      onClick={onClick}
    >
      <img
        alt=""
        className="h-full w-full object-cover"
        src={getMediaUrl(img.url)}
      />
    </button>
  );
}

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  if (Array.isArray(body?.message)) return body.message.join("، ");
  if (typeof body?.message === "string") return body.message;
  return "حدث خطأ غير متوقع.";
}
