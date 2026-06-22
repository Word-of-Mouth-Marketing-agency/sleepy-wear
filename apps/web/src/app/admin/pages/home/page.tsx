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
import type { Banner, Category, Product } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { getMediaUrl } from "@/lib/media";
import { API_URL, getAdminHeaders } from "@/lib/api";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

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

  // Mid-banner state
  const [midBanner, setMidBanner] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    enabled: true,
  });

  // Marquee state
  const [marqueeMessages, setMarqueeMessages] = useState<string[]>([
    "توصيل مجاني", "خصم 10%", "جودة من المصنع",
  ]);

  // Best sellers state
  const [bestSellerIds, setBestSellerIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Why SleepyWear state
  const [whySection, setWhySection] = useState({
    title: "",
    subtitle: "",
    enabled: true,
    reasons: [
      { title: "", description: "", icon: "factory", enabled: true },
      { title: "", description: "", icon: "refresh", enabled: true },
      { title: "", description: "", icon: "chat", enabled: true },
      { title: "", description: "", icon: "truck", enabled: true },
    ],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [bannerRes, catRes, settingsRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/banners/admin`, {
          headers: { ...getAdminHeaders(), Accept: "application/json" },
        }),
        fetch(`${API_URL}/categories?includeInactive=true`, {
          headers: { Accept: "application/json" },
        }),
        fetch(`${API_URL}/settings`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }),
        fetch(`${API_URL}/products?includeInactive=true&limit=1000`, {
          headers: { Accept: "application/json" },
        }),
      ]);
      if (!bannerRes.ok || !catRes.ok) throw new Error("Failed");
      setBanners((await bannerRes.json()) as Banner[]);
      setCategories((await catRes.json()) as Category[]);

      if (settingsRes.ok) {
        const settings = (await settingsRes.json()) as Record<string, unknown>;
        if (settings.homepage_mid_banner) {
          setMidBanner(settings.homepage_mid_banner as typeof midBanner);
        }
        if (settings.homepage_why_sleepywear) {
          setWhySection(settings.homepage_why_sleepywear as typeof whySection);
        }
        if (settings.homepage_marquee) {
          const ms = settings.homepage_marquee as { messages: string[] };
          if (ms.messages?.length) setMarqueeMessages(ms.messages);
        }
        if (settings.homepage_best_sellers) {
          const bs = settings.homepage_best_sellers as { productIds: string[] };
          if (bs.productIds) setBestSellerIds(bs.productIds);
        }
      }

      if (productsRes.ok) {
        const data = (await productsRes.json()) as { items: Product[] };
        setAllProducts(data.items ?? []);
      }
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

  async function handleSaveMidBanner() {
    try {
      const res = await fetch(`${API_URL}/settings/homepage_mid_banner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ value: midBanner }),
      });
      if (!res.ok) throw new Error();
      showMessage("success", "تم حفظ بانر المنتصف بنجاح");
    } catch {
      showMessage("error", "فشل حفظ بانر المنتصف");
    }
  }

  async function handleSaveMarquee() {
    try {
      const res = await fetch(`${API_URL}/settings/homepage_marquee`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          value: { messages: marqueeMessages.filter((m) => m.trim()) },
        }),
      });
      if (!res.ok) throw new Error();
      showMessage("success", "تم حفظ الشريط المتحرك بنجاح");
    } catch {
      showMessage("error", "فشل حفظ الشريط المتحرك");
    }
  }

  async function handleSaveBestSellers() {
    try {
      const res = await fetch(`${API_URL}/settings/homepage_best_sellers`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ value: { productIds: bestSellerIds } }),
      });
      if (!res.ok) throw new Error();
      showMessage("success", "تم حفظ المنتجات المميزة بنجاح");
    } catch {
      showMessage("error", "فشل حفظ المنتجات المميزة");
    }
  }

  function handleToggleBestSeller(productId: string) {
    setBestSellerIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function handleMoveBestSeller(index: number, direction: "up" | "down") {
    setBestSellerIds((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }

  async function handleSaveWhySection() {
    try {
      const res = await fetch(`${API_URL}/settings/homepage_why_sleepywear`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ value: whySection }),
      });
      if (!res.ok) throw new Error();
      showMessage("success", "تم حفظ قسم \"ليه SleepyWear\" بنجاح");
    } catch {
      showMessage("error", "فشل حفظ القسم");
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
          {/* Marquee */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
                Marquee
              </p>
              <h2 className="mt-1 text-xl font-extrabold">الشريط المتحرك</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                النصوص التي تظهر في الشريط المتحرك أعلى الصفحة الرئيسية.
              </p>
            </div>
            <div className="space-y-3">
              {marqueeMessages.map((msg, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={msg}
                    onChange={(e) => {
                      const copy = [...marqueeMessages];
                      copy[i] = e.target.value;
                      setMarqueeMessages(copy);
                    }}
                    placeholder={`رسالة ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-red-200 px-3 text-xs font-bold text-red-700 transition hover:bg-red-50"
                    onClick={() => setMarqueeMessages((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    حذف
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold transition hover:border-brand-pink hover:text-brand-pink"
                onClick={() => setMarqueeMessages((prev) => [...prev, ""])}
              >
                + إضافة رسالة
              </button>
            </div>
            <button onClick={handleSaveMarquee} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90">حفظ الشريط</button>
          </section>

          {/* Best Sellers */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">
                Featured
              </p>
              <h2 className="mt-1 text-xl font-extrabold">المنتجات المميزة</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                المنتجات التي تظهر في قسم "الأكثر مبيعاً" في الصفحة الرئيسية.
              </p>
            </div>
            <div className="mb-4 flex gap-2">
              <input
                className={inputClass}
                placeholder="ابحث عن منتج..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <div className="mb-4 max-h-48 overflow-y-auto rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-2">
              {allProducts
                .filter(
                  (p) =>
                    p.status !== "ARCHIVED" &&
                    (!productSearch.trim() ||
                      p.nameAr.includes(productSearch.trim())),
                )
                .slice(0, 20)
                .map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-pink-50"
                  >
                    <input
                      type="checkbox"
                      checked={bestSellerIds.includes(p.id)}
                      onChange={() => handleToggleBestSeller(p.id)}
                      className="h-4 w-4 accent-brand-pink"
                    />
                    <span className="font-bold">{p.nameAr}</span>
                    <span className="text-xs text-[var(--muted)]">/{p.slug}</span>
                  </label>
                ))}
            </div>
            {bestSellerIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-[var(--muted)]">ترتيب العرض:</p>
                {bestSellerIds.map((id, i) => {
                  const p = allProducts.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-2 text-sm"
                    >
                      <span className="font-bold">{p?.nameAr ?? id}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => handleMoveBestSeller(i, "up")}
                          className="rounded-full border border-[var(--line)] px-2 py-1 text-xs transition hover:border-brand-blue disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={i === bestSellerIds.length - 1}
                          onClick={() => handleMoveBestSeller(i, "down")}
                          className="rounded-full border border-[var(--line)] px-2 py-1 text-xs transition hover:border-brand-blue disabled:opacity-30"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBestSeller(id)}
                          className="rounded-full border border-red-200 px-2 py-1 text-xs font-bold text-red-700 transition hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pink-200 p-6 text-center text-sm font-semibold text-[var(--muted)]">
                لم تختر أي منتجات بعد. سيتم عرض أول 4 منتجات افتراضياً.
              </div>
            )}
            <button onClick={handleSaveBestSellers} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90">حفظ المنتجات المميزة</button>
          </section>

          {/* Mid-page banner */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
                Banner
              </p>
              <h2 className="mt-1 text-xl font-extrabold">بانر المنتصف</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                يظهر بين المنتجات الأكثر مبيعاً وآخر المنتجات.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="العنوان">
                <input className={inputClass} value={midBanner.title} onChange={(e) => setMidBanner({ ...midBanner, title: e.target.value })} placeholder="مثال: خصم 10% على أول طلب" />
              </Field>
              <Field label="العنوان الفرعي">
                <input className={inputClass} value={midBanner.subtitle} onChange={(e) => setMidBanner({ ...midBanner, subtitle: e.target.value })} placeholder="مثال: عرض خاص" />
              </Field>
              <Field label="الوصف" className="sm:col-span-2">
                <input className={inputClass} value={midBanner.description} onChange={(e) => setMidBanner({ ...midBanner, description: e.target.value })} placeholder="مثال: + توصيل مجاني للطلبات فوق 999 جنيه" />
              </Field>
              <Field label="نص الزر">
                <input className={inputClass} value={midBanner.buttonText} onChange={(e) => setMidBanner({ ...midBanner, buttonText: e.target.value })} placeholder="مثال: تسوق الآن" />
              </Field>
              <Field label="رابط الزر">
                <input className={inputClass} value={midBanner.buttonUrl} onChange={(e) => setMidBanner({ ...midBanner, buttonUrl: e.target.value })} placeholder="مثال: /products" />
              </Field>
              <label className="flex items-center gap-3 self-end pb-1">
                <input type="checkbox" checked={midBanner.enabled} onChange={(e) => setMidBanner({ ...midBanner, enabled: e.target.checked })} className="h-4 w-4 accent-brand-pink" />
                <span className="text-sm font-bold">مفعل</span>
              </label>
            </div>
            <button onClick={handleSaveMidBanner} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90">حفظ البانر</button>
          </section>

          {/* Why SleepyWear */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">
                Reasons
              </p>
              <h2 className="mt-1 text-xl font-extrabold">ليه SleepyWear؟</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                قسم أسباب اختيار سليبي وير يظهر أسفل الصفحة الرئيسية.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان القسم">
                <input className={inputClass} value={whySection.title} onChange={(e) => setWhySection({ ...whySection, title: e.target.value })} />
              </Field>
              <Field label="النص الفرعي">
                <input className={inputClass} value={whySection.subtitle} onChange={(e) => setWhySection({ ...whySection, subtitle: e.target.value })} />
              </Field>
              <label className="flex items-center gap-3 self-end pb-1">
                <input type="checkbox" checked={whySection.enabled} onChange={(e) => setWhySection({ ...whySection, enabled: e.target.checked })} className="h-4 w-4 accent-brand-pink" />
                <span className="text-sm font-bold">مفعل</span>
              </label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {whySection.reasons.map((reason, i) => (
                <div key={i} className="rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-pink">سبب {i + 1}</p>
                  <div className="space-y-3">
                    <Field label="العنوان">
                      <input className={inputClass} value={reason.title} onChange={(e) => { const r = [...whySection.reasons]; r[i] = { ...r[i], title: e.target.value }; setWhySection({ ...whySection, reasons: r }); }} />
                    </Field>
                    <Field label="الوصف">
                      <input className={inputClass} value={reason.description} onChange={(e) => { const r = [...whySection.reasons]; r[i] = { ...r[i], description: e.target.value }; setWhySection({ ...whySection, reasons: r }); }} />
                    </Field>
                    <Field label="الأيقونة">
                      <select className={inputClass} value={reason.icon} onChange={(e) => { const r = [...whySection.reasons]; r[i] = { ...r[i], icon: e.target.value }; setWhySection({ ...whySection, reasons: r }); }}>
                        <option value="factory">مصنع</option>
                        <option value="refresh">تحديث</option>
                        <option value="chat">دردشة</option>
                        <option value="truck">شحن</option>
                      </select>
                    </Field>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={reason.enabled} onChange={(e) => { const r = [...whySection.reasons]; r[i] = { ...r[i], enabled: e.target.checked }; setWhySection({ ...whySection, reasons: r }); }} className="h-4 w-4 accent-brand-pink" />
                      <span className="text-sm font-bold">مفعل</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSaveWhySection} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90">حفظ القسم</button>
          </section>
        </div>
      ) : null}
    </PageShell>
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
    <label className={`space-y-1.5 text-sm font-bold text-black ${className}`}>
      <span>{label}</span>
      {children}
    </label>
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
