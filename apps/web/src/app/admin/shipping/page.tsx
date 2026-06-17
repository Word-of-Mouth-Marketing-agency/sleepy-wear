"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import type { ShippingCity } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

export default function AdminShippingPage() {
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formDefaults = { nameAr: "", nameEn: "", price: 0, isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(formDefaults);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/shipping-cities/admin`, {
        headers: { ...getAdminHeaders(), Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      setCities((await res.json()) as ShippingCity[]);
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

  function resetForm() {
    setForm(formDefaults);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(city: ShippingCity) {
    setForm({
      nameAr: city.nameAr,
      nameEn: city.nameEn ?? "",
      price: city.price,
      isActive: city.isActive,
      sortOrder: city.sortOrder,
    });
    setEditingId(city.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.nameAr.trim()) return;
    setSaving(true);
    try {
      const body = {
        nameAr: form.nameAr,
        nameEn: form.nameEn || undefined,
        price: form.price,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };
      const res = await fetch(
        `${API_URL}/shipping-cities${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            ...getAdminHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error("Save failed");
      showMessage("success", editingId ? "تم تحديث المدينة" : "تمت إضافة المدينة");
      resetForm();
      fetchData();
    } catch {
      showMessage("error", "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه المدينة؟")) return;
    try {
      const res = await fetch(`${API_URL}/shipping-cities/${id}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error("Delete failed");
      showMessage("success", "تم حذف المدينة");
      fetchData();
    } catch {
      showMessage("error", "فشل الحذف");
    }
  }

  return (
    <PageShell title="إدارة الشحن" eyebrow="Admin" noContainer>
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
          تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              {cities.length} مدينة{cities.length !== 1 ? "" : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-brand-pink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              إضافة مدينة
            </button>
          </div>

          {showForm ? (
            <div className="mb-6 rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingId ? "تعديل المدينة" : "إضافة مدينة جديدة"}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--line)]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  className="rounded-lg border border-[var(--line)] p-2.5 text-sm"
                  placeholder="الاسم بالعربية *"
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                />
                <input
                  className="rounded-lg border border-[var(--line)] p-2.5 text-sm"
                  placeholder="الاسم بالإنجليزية"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
                <input
                  className="rounded-lg border border-[var(--line)] p-2.5 text-sm"
                  placeholder="سعر الشحن"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
                <input
                  className="rounded-lg border border-[var(--line)] p-2.5 text-sm"
                  placeholder="الترتيب"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="mt-3 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded"
                  />
                  مفعل
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.nameAr.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-pink px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Check size={16} />
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--line)] text-right text-[var(--muted)]">
                  <th className="p-3 font-semibold">الترتيب</th>
                  <th className="p-3 font-semibold">الاسم</th>
                  <th className="p-3 font-semibold">السعر</th>
                  <th className="p-3 font-semibold">الحالة</th>
                  <th className="p-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id} className="border-t border-[var(--line)]">
                    <td className="p-3">{city.sortOrder}</td>
                    <td className="p-3 font-medium">{city.nameAr}</td>
                    <td className="p-3">
                      {city.price > 0 ? `${city.price} ج` : "مجاني"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          city.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {city.isActive ? "مفعل" : "معطل"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(city)}
                          className="rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--line)] hover:text-brand-blue"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(city.id)}
                          className="rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-sm text-[var(--muted)]">
                      لا توجد مدن شحن بعد. أضف مدينة جديدة.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
