"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Product } from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import {
  classifyImage,
  dedupeImages,
} from "@/lib/product-variants";

type ImageManagerProps = {
  product: Product;
};

const IMAGE_LABELS = {
  product: { label: "صورة المنتج", className: "text-green-700" },
  variation: { label: "صورة متغير", className: "text-amber-700" },
  "assigned-variant": { label: "مستخدمة مع متغير", className: "text-brand-pink" },
} as const;

export function ImageManager({ product }: ImageManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const groupedImages = useMemo(() => {
    const deduped = dedupeImages(product.images);
    const groups: Record<string, typeof deduped> = {
      product: [],
      variation: [],
      "assigned-variant": [],
    };
    for (const img of deduped) {
      const type = classifyImage(img);
      groups[type].push(img);
    }
    return groups;
  }, [product.images]);

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

      {product.images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
          لا توجد صور للمنتج بعد.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs font-bold text-brand-blue">
            إجمالي الصور: {dedupeImages(product.images).length}
          </div>
          {(Object.keys(IMAGE_LABELS) as Array<keyof typeof IMAGE_LABELS>).map(
            (type) => {
              const images = groupedImages[type];
              const info = IMAGE_LABELS[type];
              if (images.length === 0) return null;
              return (
                <div key={type}>
                  <p
                    className={`mb-2 text-xs font-bold ${info.className}`}
                  >
                    {info.label}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[#fbf7fa]"
                      >
                        <img
                          alt={image.altAr ?? product.nameAr}
                          className="aspect-[4/3] w-full object-cover"
                          src={getMediaUrl(image.url)}
                        />
                        <div className="absolute bottom-2 right-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-black shadow-sm">
                          {info.label}
                        </div>
                        <button
                          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                          onClick={() => handleDelete(image.id)}
                          type="button"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
