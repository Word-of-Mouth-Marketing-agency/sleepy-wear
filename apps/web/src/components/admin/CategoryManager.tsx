"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";

type CategoryManagerProps = {
  categories: Category[];
};

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>, categoryId?: string) {
    event.preventDefault();
    setError(null);
    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    const payload = {
      nameAr: String(data.get("nameAr") ?? ""),
      nameEn: String(data.get("nameEn") ?? "") || undefined,
      slug: String(data.get("slug") ?? ""),
      descriptionAr: String(data.get("descriptionAr") ?? "") || undefined,
      isActive: data.get("isActive") === "on",
    };

    const response = await fetch(
      categoryId
        ? `${API_URL}/categories/${categoryId}`
        : `${API_URL}/categories`,
      {
        method: categoryId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    if (categoryId) {
      setEditingId(null);
    } else {
      formEl.reset();
    }
    router.refresh();
  }

  async function remove(categoryId: string) {
    if (!window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
    setError(null);
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "DELETE",
      headers: { ...getAdminHeaders() },
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setError(null);
    setItems((current) =>
      current.filter((category) => category.id !== categoryId),
    );
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold">إضافة تصنيف</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            يظهر التصنيف النشط في واجهات المتجر حسب إعدادات القائمة.
          </p>
        </div>
        <CategoryForm onSubmit={(event) => save(event)} />
      </div>
      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-8 text-center text-sm font-semibold text-[var(--muted)]">
            لا توجد تصنيفات.
          </div>
        ) : null}
        {items.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
          >
            {editingId === category.id ? (
              <CategoryForm
                category={category}
                onSubmit={(event) => save(event, category.id)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold">{category.nameAr}</p>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                        category.isActive
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}
                    >
                      {category.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    /{category.slug} - {category.productCount ?? 0} منتج
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold transition hover:border-brand-blue hover:text-brand-blue"
                    onClick={() => setEditingId(category.id)}
                    type="button"
                  >
                    تعديل
                  </button>
                  <button
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                    onClick={() => remove(category.id)}
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
    </div>
  );
}

type CategoryFormProps = {
  category?: Category;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function CategoryForm({ category, onSubmit }: CategoryFormProps) {
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
      <input
        className={inputClass}
        defaultValue={category?.nameAr}
        name="nameAr"
        placeholder="اسم التصنيف بالعربي"
        required
      />
      <input
        className={inputClass}
        defaultValue={category?.nameEn ?? ""}
        name="nameEn"
        placeholder="اسم إنجليزي"
      />
      <input
        className={inputClass}
        defaultValue={category?.slug}
        name="slug"
        placeholder="slug"
        required
      />
      <input
        className={inputClass}
        defaultValue={category?.descriptionAr ?? ""}
        name="descriptionAr"
        placeholder="وصف مختصر"
      />
      <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm font-bold">
        <input
          defaultChecked={category?.isActive ?? true}
          name="isActive"
          type="checkbox"
          className="h-4 w-4 accent-brand-pink"
        />
        نشط
      </label>
      <button
        className="rounded-full bg-brand-pink px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-pink/90 sm:col-span-2"
        type="submit"
      >
        حفظ التصنيف
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
