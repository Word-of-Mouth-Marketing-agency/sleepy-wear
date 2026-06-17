"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import type { Banner, Category } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { getMediaUrl } from "@/lib/media";
import { API_URL, getAdminHeaders } from "@/lib/api";

export default function AdminHomePageEditor() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [catUploading, setCatUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [bannerRes, catRes] = await Promise.all([
        fetch(`${API_URL}/banners/admin`, {
          headers: { ...getAdminHeaders(), Accept: "application/json" },
        }),
        fetch(`${API_URL}/categories?includeInactive=true`, {
          headers: { Accept: "application/json" },
        }),
      ]);
      if (!bannerRes.ok || !catRes.ok) throw new Error("Failed");
      setBanners((await bannerRes.json()) as Banner[]);
      setCategories((await catRes.json()) as Category[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      if (fileRef.current) fileRef.current.value = "";
      fetchData();
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
      fetchData();
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
      fetchData();
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
      fetchData();
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
      fetchData();
    } catch {
      showMessage("error", "فشل تغيير الترتيب");
    }
  }

  async function handleCategoryImageUpload(catId: string, file: File) {
    setCatUploading(catId);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch(`${API_URL}/uploads/category-image`, {
        method: "POST",
        headers: { ...getAdminHeaders() },
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = (await uploadRes.json()) as { url: string };

      const updateRes = await fetch(`${API_URL}/categories/${catId}`, {
        method: "PATCH",
        headers: {
          ...getAdminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!updateRes.ok) throw new Error("Update failed");

      showMessage("success", "تم تغيير صورة التصنيف بنجاح");
      fetchData();
    } catch {
      showMessage("error", "فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setCatUploading(null);
    }
  }

  async function handleRemoveCategoryImage(catId: string) {
    try {
      const res = await fetch(`${API_URL}/categories/${catId}`, {
        method: "PATCH",
        headers: {
          ...getAdminHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: null }),
      });
      if (!res.ok) throw new Error("Remove failed");
      showMessage("success", "تم إزالة الصورة");
      fetchData();
    } catch {
      showMessage("error", "فشل إزالة الصورة");
    }
  }

  return (
    <PageShell
      title="تعديل الصفحة الرئيسية"
      eyebrow="Admin"
      description="إدارة بانرات الهيرو وصور التصنيفات التي تظهر في واجهة المتجر."
      noContainer
      surface="plain"
    >
      {message ? (
        <div
          className={`mb-4 rounded-2xl border p-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري التحميل...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-5">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
                  Hero
                </p>
                <h2 className="mt-1 text-xl font-extrabold">بانرات الهيرو</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {banners.length} بانر في الصفحة الرئيسية
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-pink px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-pink/90">
                <Plus size={17} />
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
              <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-brand-blue">
                جاري رفع الصورة...
              </div>
            ) : null}

            {banners.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-pink-200 p-10 text-center text-sm font-semibold text-[var(--muted)]">
                لا توجد بانرات بعد. أضف بانر جديد من زر إضافة بانر.
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`grid gap-4 rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-3 sm:grid-cols-[auto_auto_180px_1fr_auto] sm:items-center ${
                      !banner.isActive ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex gap-1 sm:flex-col">
                      <IconButton
                        label="تحريك لأعلى"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp size={14} />
                      </IconButton>
                      <IconButton
                        label="تحريك لأسفل"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === banners.length - 1}
                      >
                        <ArrowDown size={14} />
                      </IconButton>
                    </div>

                    <GripVertical
                      size={18}
                      className="hidden shrink-0 text-[var(--muted)] sm:block"
                    />

                    <img
                      src={getMediaUrl(banner.imageUrl)}
                      alt=""
                      className="aspect-[16/7] w-full rounded-2xl object-cover sm:h-24"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-extrabold">{banner.titleAr}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        ترتيب: {banner.sortOrder}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(banner)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-bold transition ${
                          banner.isActive
                            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {banner.isActive ? "مفعل" : "غير مفعل"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(banner.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">
                Categories
              </p>
              <h2 className="mt-1 text-xl font-extrabold">
                صور تصنيفات الصفحة الرئيسية
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                الصور هنا تتحكم في شكل كروت التصنيفات على الصفحة الرئيسية.
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-pink-200 p-10 text-center text-sm font-semibold text-[var(--muted)]">
                لا توجد تصنيفات
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-3"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white">
                      {cat.imageUrl ? (
                        <img
                          src={getMediaUrl(cat.imageUrl)}
                          alt={cat.nameAr}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-pink-50 text-center text-[10px] font-bold text-brand-pink">
                          <ImagePlus size={18} />
                          {cat.nameAr}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold">{cat.nameAr}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {cat.productCount ?? 0} منتج
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold transition hover:border-brand-blue hover:text-brand-blue">
                        <Upload size={12} />
                        {catUploading === cat.id ? "رفع..." : "تغيير"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          disabled={catUploading === cat.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryImageUpload(cat.id, file);
                          }}
                        />
                      </label>
                      {cat.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategoryImage(cat.id)}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          إزالة
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}

function IconButton({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-[var(--line)] bg-white p-1.5 text-[var(--muted)] transition hover:border-brand-pink hover:text-brand-pink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
