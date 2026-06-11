"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@sleepywear/shared";
import { API_URL, getAdminHeaders } from "@/lib/api";

type CategoryManagerProps = {
  categories: Category[];
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>, categoryId?: string) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      nameAr: String(form.get("nameAr") ?? ""),
      nameEn: String(form.get("nameEn") ?? "") || undefined,
      slug: String(form.get("slug") ?? ""),
      descriptionAr: String(form.get("descriptionAr") ?? "") || undefined,
      isActive: form.get("isActive") === "on",
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

    setEditingId(null);
    event.currentTarget.reset();
    router.refresh();
  }

  async function remove(categoryId: string) {
    setError(null);
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "DELETE",
      headers: { ...getAdminHeaders() },
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="rounded-md border border-[var(--line)] p-4">
        <h2 className="mb-3 font-semibold">إضافة تصنيف</h2>
        <CategoryForm onSubmit={(event) => save(event)} />
      </div>
      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-[var(--muted)]">لا توجد تصنيفات.</p>
        ) : null}
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-md border border-[var(--line)] p-3"
          >
            {editingId === category.id ? (
              <CategoryForm
                category={category}
                onSubmit={(event) => save(event, category.id)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{category.nameAr}</p>
                  <p className="text-sm text-[var(--muted)]">
                    /{category.slug} - {category.productCount ?? 0} منتج
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-[var(--line)] px-3 py-2 text-sm"
                    onClick={() => setEditingId(category.id)}
                    type="button"
                  >
                    تعديل
                  </button>
                  <button
                    className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700"
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
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={category?.nameAr}
        name="nameAr"
        placeholder="اسم التصنيف بالعربي"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={category?.nameEn ?? ""}
        name="nameEn"
        placeholder="اسم إنجليزي"
      />
      <input
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={category?.slug}
        name="slug"
        placeholder="slug"
        required
      />
      <input
        className="rounded-md border border-[var(--line)] p-2"
        defaultValue={category?.descriptionAr ?? ""}
        name="descriptionAr"
        placeholder="وصف مختصر"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          defaultChecked={category?.isActive ?? true}
          name="isActive"
          type="checkbox"
        />
        نشط
      </label>
      <button
        className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white sm:col-span-2"
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
