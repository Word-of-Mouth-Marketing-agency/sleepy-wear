import Link from "next/link";
import { SITE_NAME } from "@sleepywear/shared";
import { PHONE_LOCAL, EMAIL } from "@/lib/social-contact";
import { SocialLinks } from "./SocialLinks";

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              alt={SITE_NAME}
              className="mb-3 h-10 w-auto sm:h-12"
              src="/brand/pink-logo.png"
            />
            <p className="text-sm text-gray-400 mb-3">
              ملابس منزلية ولانجري بأفضل الأسعار من المصنع مباشرة.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-bold text-sm">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-brand-pink">الرئيسية</Link></li>
              <li><Link href="/products" className="hover:text-brand-pink">المنتجات</Link></li>
              <li><Link href="/cart" className="hover:text-brand-pink">سلة التسوق</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-bold text-sm">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/shipping-policy" className="hover:text-brand-pink">
                  سياسة الشحن
                </Link>
              </li>
              <li>
                <Link href="/returns-policy" className="hover:text-brand-pink">
                  سياسة الاستبدال و الاسترجاع
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-brand-pink">
                  سياسات الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-bold text-sm">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <PhoneSvg />
                <a href={`tel:${PHONE_LOCAL}`} dir="ltr" className="hover:text-brand-pink">
                  {PHONE_LOCAL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MailSvg />
                <a href={`mailto:${EMAIL}`} dir="ltr" className="hover:text-brand-pink">
                  {EMAIL}
                </a>
              </li>
              <li className="pt-2">
                <SocialLinks variant="dark" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4">
        <div className="container text-center text-xs text-gray-500">
          © 2026 {SITE_NAME} — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}

function PhoneSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

