"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@sleepywear/shared";
import { API_URL } from "@/lib/api";

type ImageManagerProps = {
  product: Product;
};

export function ImageManager({ product }: ImageManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
        { method: "DELETE" },
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
      <h2 className="text-xl font-bold">صور المنتج</h2>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {product.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {product.images.map((image) => (
            <div
              key={image.id}
              className="group relative rounded-md border border-[var(--line)]"
            >
              <img
                alt={image.altAr ?? product.nameAr}
                className="aspect-[4/3] w-full rounded-md object-cover"
                src={image.url}
              />
              <button
                className="absolute right-1 top-1 rounded-md bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleDelete(image.id)}
                type="button"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)]">لا توجد صور للمنتج بعد.</p>
      )}

      <label className="inline-block cursor-pointer rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--line)]">
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
  );
}
