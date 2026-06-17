"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "فشل تسجيل الدخول");
      }

      const data = (await response.json()) as { token: string };
      localStorage.setItem("admin_token", data.token);
      router.replace("/admin");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "فشل تسجيل الدخول",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf7fa] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-6 shadow-xl shadow-pink-100/50 sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-pink text-white">
            <LockKeyhole size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">تسجيل دخول الإدارة</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              أدخل البريد الإلكتروني وكلمة المرور.
            </p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-3.5 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100"
            name="email"
            placeholder="البريد الإلكتروني"
            required
            type="email"
          />
          <input
            className="w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] p-3.5 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100"
            name="password"
            placeholder="كلمة المرور"
            required
            type="password"
          />
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
          <button
            className="w-full rounded-full bg-black px-4 py-3.5 font-bold text-white transition hover:bg-brand-pink disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
