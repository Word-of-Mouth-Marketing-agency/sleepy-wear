"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [passwordResetId, setPasswordResetId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Accept: "application/json", ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error();
      setUsers((await res.json()) as AdminUser[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleAddUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      name: String(form.get("name") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "فشل إضافة المستخدم");
      }
      showMessage("success", "تمت إضافة المستخدم بنجاح");
      setShowAddForm(false);
      fetchUsers();
    } catch (caught) {
      showMessage("error", caught instanceof Error ? caught.message : "فشل إضافة المستخدم");
    }
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordResetId) return;
    const form = new FormData(event.currentTarget);
    const payload = { password: String(form.get("password") ?? "") };
    try {
      const res = await fetch(`${API_URL}/admin/users/${passwordResetId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "فشل تغيير كلمة المرور");
      }
      showMessage("success", "تم تغيير كلمة المرور بنجاح");
      setPasswordResetId(null);
    } catch (caught) {
      showMessage("error", caught instanceof Error ? caught.message : "فشل تغيير كلمة المرور");
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!window.confirm(`هل أنت متأكد من حذف "${userName}"؟`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "فشل حذف المستخدم");
      }
      showMessage("success", "تم حذف المستخدم بنجاح");
      fetchUsers();
    } catch (caught) {
      showMessage("error", caught instanceof Error ? caught.message : "فشل حذف المستخدم");
    }
  }

  return (
    <PageShell
      title="المستخدمين"
      eyebrow="Admin"
      description="إدارة حسابات الإدارة — إضافة، تغيير كلمة المرور، حذف."
      noContainer
      surface="plain"
    >
      {message ? (
        <div className={`mb-4 rounded-2xl border p-4 text-sm font-semibold ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      {!showAddForm && !passwordResetId ? (
        <button
          className="mb-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90"
          onClick={() => setShowAddForm(true)}
          type="button"
        >
          + إضافة مستخدم
        </button>
      ) : null}

      {/* Add user form */}
      {showAddForm ? (
        <div className="mb-5 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">إضافة مستخدم</h2>
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={handleAddUser}>
            <div className="space-y-1.5">
              <span className="text-sm font-bold">الاسم</span>
              <input className={inputClass} name="name" placeholder="الاسم" required />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-bold">البريد الإلكتروني</span>
              <input className={inputClass} name="email" placeholder="admin@example.com" required type="email" />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-bold">كلمة المرور</span>
              <input className={inputClass} name="password" placeholder="حد أدنى 8 أحرف" required type="password" minLength={8} />
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <button className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90" type="submit">إضافة</button>
              <button className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-red-200 hover:text-red-700" onClick={() => setShowAddForm(false)} type="button">إلغاء</button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Password reset form */}
      {passwordResetId ? (
        <div className="mb-5 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">تغيير كلمة المرور</h2>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleChangePassword}>
            <div className="space-y-1.5">
              <span className="text-sm font-bold">كلمة المرور الجديدة</span>
              <input className={inputClass} name="password" placeholder="حد أدنى 8 أحرف" required type="password" minLength={8} />
            </div>
            <div className="flex items-end gap-2">
              <button className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90" type="submit">حفظ</button>
              <button className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--muted)] transition hover:border-red-200 hover:text-red-700" onClick={() => setPasswordResetId(null)} type="button">إلغاء</button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">جاري التحميل...</div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">تعذر تحميل المستخدمين.</p>
      ) : null}

      {!loading && !error && users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">لا توجد حسابات.</div>
      ) : null}

      {!loading && !error && users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold">{user.name}</p>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${user.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                      {user.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
                  <p className="text-xs text-[var(--muted)]">
                    أضيف في {new Date(user.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-bold transition hover:border-brand-blue hover:text-brand-blue"
                    onClick={() => { setPasswordResetId(user.id); setShowAddForm(false); }}
                    type="button"
                  >
                    تغيير كلمة المرور
                  </button>
                  <button
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    type="button"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
