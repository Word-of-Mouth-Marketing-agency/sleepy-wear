"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, Eye, EyeOff } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

const textareaClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm font-mono outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100 ltr resize-y leading-relaxed";

type MarketingPixelSettings = { enabled: boolean; headScript: string };

const DEFAULT: MarketingPixelSettings = { enabled: false, headScript: "" };

export default function AdminMarketingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pixel, setPixel] = useState<MarketingPixelSettings>(DEFAULT);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      const settings = (await res.json()) as Record<string, unknown>;
      if (settings.marketing_pixel) {
        const raw = settings.marketing_pixel as Record<string, unknown>;
        setPixel({
          enabled: Boolean(raw.enabled),
          headScript: typeof raw.headScript === "string" ? raw.headScript : "",
        });
      }
    } catch {
      setMessage({ type: "error", text: "تعذر تحميل الإعدادات." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleSave() {
    const script = pixel.headScript.trim();
    const enabled = pixel.enabled;

    if (script.length > 20000) {
      showMessage("error", "كود Meta Pixel طويل جدًا");
      return;
    }

    const blockedDomains = /google-analytics|googletagmanager|gtag|tiktok\.com|snap\.chat|pinterest\.com|twitter\.com|linkedin\.com/i;
    if (enabled && script && blockedDomains.test(script)) {
      showMessage("error", "هذا المكان مخصص لكود Meta Pixel فقط. لا تضف أكواد أخرى.");
      return;
    }

    const payload: MarketingPixelSettings = { enabled, headScript: script };

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/settings/marketing_pixel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ value: payload }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const serverMsg =
          typeof body?.message === "string"
            ? body.message
            : Array.isArray(body?.message)
              ? body.message.join("، ")
              : `خطأ ${res.status}`;
        showMessage("error", serverMsg);
        return;
      }
      showMessage("success", "تم حفظ إعدادات التسويق بنجاح");
    } catch (e) {
      showMessage("error", e instanceof Error ? e.message : "فشل الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="إعدادات التسويق" eyebrow="Admin" description="جاري التحميل..." noContainer>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري التحميل...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="إعدادات التسويق"
      eyebrow="Admin"
      description="إدارة أدوات التسويق والتتبع."
      noContainer
      surface="plain"
    >
      {message ? (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-bold leading-7 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-5">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-brand-blue">
                <Megaphone size={20} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Meta Pixel</p>
                <h2 className="mt-1 text-xl font-extrabold text-black">بيكسل ميتا</h2>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <span className="text-sm font-extrabold text-black">
                {pixel.enabled ? (
                  <span className="inline-flex items-center gap-1 text-green-700">
                    <Eye size={16} />
                    مفعّل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                    <EyeOff size={16} />
                    معطّل
                  </span>
                )}
              </span>
              <input
                type="checkbox"
                checked={pixel.enabled}
                onChange={(e) => setPixel({ ...pixel, enabled: e.target.checked })}
                className="h-5 w-5 accent-brand-pink"
              />
            </label>
          </div>

          <p className="mt-4 text-sm font-semibold leading-7 text-[var(--muted)]">
            الصق كود Meta Pixel الذي يوفره Meta هنا. سيتم إدراجه تلقائيًا في صفحات الموقع عند التفعيل.
          </p>

          <div className="mt-4">
            <label className="space-y-1.5 text-sm font-bold text-black">
              <span>كود Meta Pixel داخل head</span>
              <textarea
                className={textareaClass}
                value={pixel.headScript}
                onChange={(e) => setPixel({ ...pixel, headScript: e.target.value })}
                placeholder="الصق كود Meta Pixel هنا..."
                rows={12}
                dir="ltr"
                spellCheck={false}
              />
            </label>
            <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
              انسخ الكود من Meta Events Manager ثم الصقه هنا. يجب أن يحتوي الكود على fbq و connect.facebook.net.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-7 text-amber-800">
            هذا المكان مخصص لكود Meta Pixel فقط. لا تضف أكواد تتبع أخرى.
          </div>

          <button
            onClick={() => void handleSave()}
            disabled={saving}
            type="button"
            className="mt-5 w-full rounded-full bg-brand-pink px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-pink/90 disabled:cursor-not-allowed disabled:bg-pink-200 sm:w-auto"
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">معلومات</p>
          <h2 className="mb-3 mt-1 text-xl font-extrabold text-black">طريقة الإعداد</h2>
          <ol className="grid gap-2 text-sm font-semibold leading-7 text-[var(--muted)]">
            <li>1. افتح Meta Events Manager من حساب الفيسبوك.</li>
            <li>2. اذهب إلى إعدادات Pixel واضغط على إضافة كود يدويًا.</li>
            <li>3. انسخ الكود بالكامل.</li>
            <li>4. ألصق الكود في الحقل أعلاه وفعّل البيكسل.</li>
            <li>5. استخدم Meta Pixel Helper على Chrome للتأكد من عمل البيكسل.</li>
          </ol>
        </section>
      </div>
    </PageShell>
  );
}
