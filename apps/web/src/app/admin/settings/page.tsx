"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

const inputClass =
  "w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100";

type NoticeSettings = { text: string; enabled: boolean };
type FooterSettings = { description: string };
type SocialSettings = { facebook: string; instagram: string; tiktok: string; telegram: string };

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notice, setNotice] = useState<NoticeSettings>({ text: "", enabled: true });
  const [footer, setFooter] = useState<FooterSettings>({ description: "" });
  const [social, setSocial] = useState<SocialSettings>({ facebook: "", instagram: "", tiktok: "", telegram: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      const settings = (await res.json()) as Record<string, unknown>;
      if (settings.site_notice) setNotice(settings.site_notice as NoticeSettings);
      if (settings.site_footer_text) setFooter(settings.site_footer_text as FooterSettings);
      if (settings.site_social_links) setSocial(settings.site_social_links as SocialSettings);
    } catch {
      setMessage({ type: "error", text: "تعذر تحميل الإعدادات." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function saveSetting(key: string, value: unknown) {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/settings/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error();
      showMessage("success", "تم الحفظ بنجاح");
    } catch {
      showMessage("error", "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="إعدادات الموقع" eyebrow="Admin" description="جاري التحميل..." noContainer>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">جاري التحميل...</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="إعدادات الموقع" eyebrow="Admin" description="التحكم في النصوص والروابط العامة للموقع." noContainer surface="plain">
      {message ? (
        <div className={`mb-4 rounded-2xl border p-4 text-sm font-semibold ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-5">
        {/* Notice bar */}
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">Notice</p>
          <h2 className="mb-4 text-xl font-extrabold">الشريط العلوي</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نص التنبيه العلوي" className="sm:col-span-2">
              <input className={inputClass} value={notice.text} onChange={(e) => setNotice({ ...notice, text: e.target.value })} placeholder="نص الشريط العلوي" />
            </Field>
            <label className="flex items-center gap-3 pb-1">
              <input type="checkbox" checked={notice.enabled} onChange={(e) => setNotice({ ...notice, enabled: e.target.checked })} className="h-4 w-4 accent-brand-pink" />
              <span className="text-sm font-bold">إظهار الشريط العلوي</span>
            </label>
          </div>
          <button onClick={() => saveSetting("site_notice", notice)} disabled={saving} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90 disabled:opacity-50">حفظ</button>
        </section>

        {/* Footer text */}
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Footer</p>
          <h2 className="mb-4 text-xl font-extrabold">الفوتر</h2>
          <Field label="نص أسفل اللوجو في الفوتر">
            <textarea className={`${inputClass} min-h-24 resize-y leading-7`} value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} placeholder="وصف الموقع في الفوتر" />
          </Field>
          <button onClick={() => saveSetting("site_footer_text", footer)} disabled={saving} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90 disabled:opacity-50">حفظ</button>
        </section>

        {/* Social links */}
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">Social</p>
          <h2 className="mb-4 text-xl font-extrabold">روابط التواصل الاجتماعي</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="فيسبوك">
              <input className={inputClass} value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="رابط فيسبوك" dir="ltr" />
            </Field>
            <Field label="انستجرام">
              <input className={inputClass} value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="رابط انستجرام" dir="ltr" />
            </Field>
            <Field label="تيك توك">
              <input className={inputClass} value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} placeholder="رابط تيك توك" dir="ltr" />
            </Field>
            <Field label="تليجرام">
              <input className={inputClass} value={social.telegram} onChange={(e) => setSocial({ ...social, telegram: e.target.value })} placeholder="رابط تليجرام" dir="ltr" />
            </Field>
          </div>
          <button onClick={() => saveSetting("site_social_links", social)} disabled={saving} type="button" className="mt-4 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink/90 disabled:opacity-50">حفظ</button>
        </section>
      </div>
    </PageShell>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`space-y-1.5 text-sm font-bold text-black ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
