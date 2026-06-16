"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import type { Banner } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { getMediaUrl } from "@/lib/media";
import { API_URL, getAdminHeaders } from "@/lib/api";

export default function AdminHomePageEditor() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/banners/admin`, {
        headers: { ...getAdminHeaders(), Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      setBanners((await res.json()) as Banner[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch(`${API_URL}/uploads/banner-image`, {
        method: "POST",
        headers: { ...getAdminHeaders() },
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = (await uploadRes.json()) as { url: string };

      const createRes = await fetch(`${API_URL}/banners`, {
        method: "POST",
        headers: {
          ...getAdminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titleAr: "بانر",
          imageUrl: url,
          sortOrder: banners.length,
        }),
      });
      if (!createRes.ok) throw new Error("Create failed");

      showMessage("success", "تمت إضافة البانر بنجاح");
      fileRef.current!.value = "";
      fetchBanners();
    } catch {
      showMessage("error", "فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API_URL}/banners/${id}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error("Delete failed");
      showMessage("success", "تم حذف البانر");
      fetchBanners();
    } catch {
      showMessage("error", "فشل حذف البانر");
    }
  }

  async function handleToggleActive(banner: Banner) {
    try {
      const res = await fetch(`${API_URL}/banners/${banner.id}`, {
        method: "PATCH",
        headers: {
          ...getAdminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      fetchBanners();
    } catch {
      showMessage("error", "فشل تغيير الحالة");
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const arr = [...banners];
    const prev = arr[index - 1];
    const curr = arr[index];
    try {
      await Promise.all([
        fetch(`${API_URL}/banners/${curr.id}`, {
          method: "PATCH",
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sortOrder: curr.sortOrder - 1 }),
        }),
        fetch(`${API_URL}/banners/${prev.id}`, {
          method: "PATCH",
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sortOrder: prev.sortOrder + 1 }),
        }),
      ]);
      fetchBanners();
    } catch {
      showMessage("error", "فشل تغيير الترتيب");
    }
  }

  async function handleMoveDown(index: number) {
    if (index === banners.length - 1) return;
    const arr = [...banners];
    const next = arr[index + 1];
    const curr = arr[index];
    try {
      await Promise.all([
        fetch(`${API_URL}/banners/${curr.id}`, {
          method: "PATCH",
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sortOrder: curr.sortOrder + 1 }),
        }),
        fetch(`${API_URL}/banners/${next.id}`, {
          method: "PATCH",
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sortOrder: next.sortOrder - 1 }),
        }),
      ]);
      fetchBanners();
    } catch {
      showMessage("error", "فشل تغيير الترتيب");
    }
  }

  return (
    <PageShell title="تعديل الصفحة الرئيسية" eyebrow="Admin" noContainer>
      {message ? (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--muted)]">
          جاري التحميل…
        </p>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          تعذر تحميل البانرات. يرجى المحاولة مرة أخرى.
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              {banners.length} بانر{banners.length !== 1 ? "ات" : ""}
            </p>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-pink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              <Plus size={16} />
              إضافة بانر
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
            </label>
          </div>

          {uploading ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              جاري رفع الصورة…
            </div>
          ) : null}

          {banners.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">
              لا توجد بانرات بعد. اضف بانر جديد من زر &quot;إضافة بانر&quot;
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`flex items-center gap-4 rounded-lg border bg-white p-3 ${
                    !banner.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="rounded p-0.5 text-[var(--muted)] hover:bg-[var(--line)] disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === banners.length - 1}
                      className="rounded p-0.5 text-[var(--muted)] hover:bg-[var(--line)] disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <GripVertical
                    size={18}
                    className="shrink-0 text-[var(--muted)]"
                  />

                  <img
                    src={getMediaUrl(banner.imageUrl)}
                    alt=""
                    className="h-16 w-28 shrink-0 rounded-md object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {banner.titleAr}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      ترتيب: {banner.sortOrder}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    className={`rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${
                      banner.isActive
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {banner.isActive ? "مفعل" : "غير مفعل"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id)}
                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </PageShell>
  );
}
