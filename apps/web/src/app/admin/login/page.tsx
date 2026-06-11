"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-[var(--line)] bg-white p-6">
        <h1 className="mb-2 text-2xl font-bold">تسجيل دخول الإدارة</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          أدخل البريد الإلكتروني وكلمة المرور.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-md border border-[var(--line)] p-3"
            name="email"
            placeholder="البريد الإلكتروني"
            required
            type="email"
          />
          <input
            className="w-full rounded-md border border-[var(--line)] p-3"
            name="password"
            placeholder="كلمة المرور"
            required
            type="password"
          />
          {error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : null}
          <button
            className="w-full rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white disabled:opacity-50"
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
