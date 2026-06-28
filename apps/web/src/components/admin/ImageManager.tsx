"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Product } from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import { filterProductGalleryImages } from "@/lib/product-variants";

type ImageManagerProps = {
  product: Product;
};

export function ImageManager({ product }: ImageManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const galleryImages = useMemo(
    () => filterProductGalleryImages(product.images),
    [product.images],
  );

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("productId", product.id);

        const response = await fetch(`${API_URL}/uploads/product-image`, {
          method: "POST",
          headers: { ...getAdminHeaders() },
          body: form,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message ?? "فشل رفع الصورة.");
        }
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "فشل رفع الصورة.",
        );
        break;
      }
    }

    setUploading(false);
    router.refresh();
  }

  async function handleDelete(imageId: string) {
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/uploads/product-image/${imageId}`,
        {
          method: "DELETE",
          headers: { ...getAdminHeaders() },
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "فشل حذف الصورة.");
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "فشل حذف الصورة.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">صور المنتج الأساسية</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ارفع صورا واضحة لتظهر في كروت المنتج والمعرض الرئيسي. صور المتغيرات تدار من قسم المتغيرات.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand-pink hover:text-brand-pink">
          <ImagePlus size={17} aria-hidden="true" />
          {uploading ? "جاري الرفع..." : "رفع صور"}
          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            multiple
            disabled={uploading}
            onChange={(event) => handleUpload(event.target.files)}
            type="file"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[#fbf7fa]"
            >
              <img
                alt={image.altAr ?? product.nameAr}
                className="aspect-[4/3] w-full object-cover"
                src={getMediaUrl(image.url)}
              />
              <button
                className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-red-700 opacity-0 shadow-sm transition group-hover:opacity-100"
                onClick={() => handleDelete(image.id)}
                type="button"
              >
                <Trash2 size={13} aria-hidden="true" />
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
          لا توجد صور أساسية للمنتج بعد.
        </div>
      )}
    </div>
  );
}
