"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { StaticPage } from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

const textareaClass = `${inputClass} min-h-[360px] resize-y leading-7`;

export function StaticPagesManager() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [form, setForm] = useState({
    titleAr: "",
    contentAr: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? null,
    [pages, selectedSlug],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadPages() {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/pages/admin/list`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = (await response.json()) as StaticPage[];
      if (!isMounted) return;
      setPages(data);
      setSelectedSlug(data[0]?.slug ?? "");
    }

    loadPages()
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "تعذر تحميل الصفحات.",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPage) return;
    setForm({
      titleAr: selectedPage.titleAr,
      contentAr: selectedPage.contentAr,
      isActive: selectedPage.isActive,
    });
    setError(null);
    setMessage(null);
  }, [selectedPage]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPage) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      titleAr: form.titleAr.trim(),
      contentAr: form.contentAr.trim(),
      isActive: form.isActive,
    };

    const response = await fetch(`${API_URL}/pages/admin/${selectedPage.slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders(),
      },
      body: JSON.stringify(payload),
    });

    setIsSaving(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    const updated = (await response.json()) as StaticPage;
    setPages((current) =>
      current.map((page) => (page.slug === updated.slug ? updated : page)),
    );
    setMessage("تم حفظ الصفحة بنجاح.");
  }

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-pink">صفحات ثابتة</p>
          <h2 className="mt-1 text-xl font-extrabold text-brand-black">
            تحرير صفحات السياسات
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            عدل عنوان ومحتوى صفحات الفوتر بالعربية. يتم حفظ الفقرات كما هي عند
            عرضها في الموقع.
          </p>
        </div>
        {selectedPage ? (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              selectedPage.isActive
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-500"
            }`}
          >
            {selectedPage.isActive ? "نشطة" : "غير نشطة"}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-brand-light-pink/30 p-8 text-center text-sm font-semibold text-[var(--muted)]">
          جار تحميل الصفحات...
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {!isLoading && pages.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-brand-light-pink/30 p-8 text-center text-sm font-semibold text-[var(--muted)]">
          لا توجد صفحات قابلة للتحرير.
        </div>
      ) : null}

      {!isLoading && selectedPage ? (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setSelectedSlug(page.slug)}
                className={`w-full rounded-2xl border px-4 py-3 text-right text-sm font-bold transition ${
                  page.slug === selectedSlug
                    ? "border-brand-pink bg-brand-light-pink text-brand-black"
                    : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-brand-pink/40 hover:text-brand-black"
                }`}
              >
                <span className="block">{page.titleAr}</span>
                <span className="mt-1 block text-xs font-semibold opacity-70">
                  {page.slug}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={save} className="space-y-4">
            {message ? (
              <p className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <label className="space-y-2 text-sm font-bold text-brand-black">
              <span>عنوان الصفحة</span>
              <input
                className={inputClass}
                value={form.titleAr}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    titleAr: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="space-y-2 text-sm font-bold text-brand-black">
              <span>محتوى الصفحة</span>
              <textarea
                className={textareaClass}
                value={form.contentAr}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contentAr: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-bold text-brand-black">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-[var(--line)] accent-brand-pink"
              />
              <span>الحالة: نشطة</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-brand-pink px-6 py-3 text-sm font-extrabold text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "جار الحفظ..." : "حفظ"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  if (typeof body?.message === "string") return body.message;
  if (Array.isArray(body?.message)) return body.message.join("، ");
  return "حدث خطأ أثناء تنفيذ الطلب.";
}
