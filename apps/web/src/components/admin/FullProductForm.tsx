"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type {
  Category,
  ProductStatus,
} from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";

type FullProductFormProps = {
  categories: Category[];
};

type VariantEntry = {
  key: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  sizeName: string;
  colorName: string;
};

const statuses: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

const fieldClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

let variantKeyCounter = 0;
function nextVariantKey() {
  variantKeyCounter += 1;
  return `v-${variantKeyCounter}`;
}

export function FullProductForm({
  categories,
}: FullProductFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  function handleImagesChange(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviewUrls((prev) => [...prev, ...newUrls]);
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function addVariant() {
    setVariantEntries((prev) => [
      ...prev,
      {
        key: nextVariantKey(),
        sku: "",
        price: "",
        salePrice: "",
        stock: "0",
        sizeName: "",
        colorName: "",
      },
    ]);
  }

  function removeVariant(key: string) {
    setVariantEntries((prev) => prev.filter((v) => v.key !== key));
  }

  function updateVariant(
    key: string,
    field: keyof VariantEntry,
    value: string,
  ) {
    setVariantEntries((prev) =>
      prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)),
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = new FormData(event.currentTarget);

    const variants = variantEntries
      .filter((v) => v.sku.trim() && v.price.trim())
      .map((v) => ({
        sku: v.sku.trim(),
        price: v.price.trim(),
        salePrice: v.salePrice.trim() || undefined,
        stock: Math.max(0, Number(v.stock) || 0),
        sizeName: v.sizeName.trim() || undefined,
        colorName: v.colorName.trim() || undefined,
      }));

    const payload: Record<string, unknown> = {
      nameAr: String(form.get("nameAr") ?? ""),
      slug: String(form.get("slug") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
      descriptionAr: String(form.get("descriptionAr") ?? "") || undefined,
      status: String(form.get("status") ?? "DRAFT"),
    };

    if (variants.length > 0) {
      payload.variants = variants;
    }

    try {
      const createRes = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!createRes.ok) {
        throw new Error(await readError(createRes));
      }

      const saved = (await createRes.json()) as { id: string };

      if (imageFiles.length > 0) {
        const failedImages: number[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
          try {
            const imageForm = new FormData();
            imageForm.append("file", imageFiles[i]);
            imageForm.append("productId", saved.id);

            const uploadRes = await fetch(`${API_URL}/uploads/product-image`, {
              method: "POST",
              headers: { ...getAdminHeaders() },
              body: imageForm,
            });

            if (!uploadRes.ok) {
              failedImages.push(i + 1);
            }
          } catch {
            failedImages.push(i + 1);
          }
        }

        if (failedImages.length > 0) {
          setError(
            `تم حفظ المنتج ولكن فشل رفع الصور رقم: ${failedImages.join("، ")}. يمكنك إضافتها لاحقاً من صفحة تعديل المنتج.`,
          );
          setIsSaving(false);
          router.push(`/admin/products/${saved.id}/edit`);
          router.refresh();
          return;
        }
      }

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
    <div className="mx-auto max-w-3xl pb-16">
      <form ref={formRef} onSubmit={submit}>
        <div className="space-y-6">
          <FormSection title="البيانات الأساسية">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="اسم المنتج (عربي)">
                <input
                  className={fieldClass}
                  name="nameAr"
                  placeholder="مثال: بيجامة قطن ناعمة"
                  required
                />
              </Field>
              <Field label="رابط المنتج">
                <input
                  className={fieldClass}
                  name="slug"
                  placeholder="product-slug"
                  required
                />
              </Field>
              <Field label="التصنيف">
                <select
                  className={fieldClass}
                  defaultValue=""
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
                <select className={fieldClass} name="status">
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="الوصف (عربي)" className="sm:col-span-2">
                <textarea
                  className={`${fieldClass} min-h-32 resize-y leading-7`}
                  name="descriptionAr"
                  placeholder="اكتب وصفا مختصرا يساعد العميل على الاختيار"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="الصور">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand-pink hover:text-brand-pink">
                اختر صوراً
                <input
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  multiple
                  onChange={(e) => handleImagesChange(e.target.files)}
                  type="file"
                />
              </label>
            </div>
            {imagePreviewUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {imagePreviewUrls.map((url, i) => (
                  <div
                    key={url}
                    className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[#fbf7fa]"
                  >
                    <img
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                      src={url}
                    />
                    <button
                      className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                      onClick={() => removeImage(i)}
                      type="button"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
                لم تختر أي صور بعد.
              </div>
            )}
          </FormSection>

          <FormSection title="المتغيرات والمخزون">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand-pink hover:text-brand-pink"
                onClick={addVariant}
                type="button"
              >
                + إضافة متغير
              </button>
            </div>
            {variantEntries.length > 0 ? (
              <div className="space-y-3">
                {variantEntries.map((variant) => (
                  <div
                    key={variant.key}
                    className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
                  >
                    <div className="grid gap-3 sm:grid-cols-7">
                      <input
                        className={`${fieldClass} sm:col-span-2`}
                        placeholder="SKU"
                        required
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.key, "sku", e.target.value)
                        }
                      />
                      <input
                        className={fieldClass}
                        min="0"
                        placeholder="السعر"
                        required
                        step="0.01"
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(variant.key, "price", e.target.value)
                        }
                      />
                      <input
                        className={fieldClass}
                        min="0"
                        placeholder="سعر الخصم"
                        step="0.01"
                        type="number"
                        value={variant.salePrice}
                        onChange={(e) =>
                          updateVariant(variant.key, "salePrice", e.target.value)
                        }
                      />
                      <input
                        className={fieldClass}
                        min="0"
                        placeholder="المخزون"
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.key, "stock", e.target.value)
                        }
                      />
                      <input
                        className={fieldClass}
                        placeholder="مقاس (مثال: XL)"
                        value={variant.sizeName}
                        onChange={(e) =>
                          updateVariant(variant.key, "sizeName", e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <input
                          className={fieldClass}
                          placeholder="لون (مثال: موف)"
                          value={variant.colorName}
                          onChange={(e) =>
                            updateVariant(variant.key, "colorName", e.target.value)
                          }
                        />
                        <button
                          className="rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                          onClick={() => removeVariant(variant.key)}
                          type="button"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
                لم تضف أي متغيرات بعد. إذا أضفت مقاسا أو لونا سيتحول المنتج إلى
                منتج متغير.
              </div>
            )}
          </FormSection>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-pink/90 disabled:opacity-50"
            >
              {isSaving ? "جاري الحفظ..." : "حفظ المنتج"}
            </button>
            <a
              href="/admin/products"
              className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-red-200 hover:text-red-700"
            >
              رجوع
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormSection({
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
