import type { Metadata } from "next";
import Link from "next/link";
import { DOMAIN, SITE_NAME } from "@sleepywear/shared";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Arabic-first commerce foundation for SleepyWear.",
  metadataBase: new URL(`https://${DOMAIN}`),
};

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/cart", label: "السلة" },
  { href: "/admin", label: "الإدارة" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="border-b border-[var(--line)] bg-white">
          <div className="container flex min-h-16 items-center justify-between gap-6">
            <Link href="/" className="text-xl font-bold text-[var(--accent)]">
              {SITE_NAME}
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              {nav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="container py-10">{children}</main>
        <footer className="border-t border-[var(--line)] py-6 text-center text-sm text-[var(--muted)]">
          {SITE_NAME} - {DOMAIN}
        </footer>
      </body>
    </html>
  );
}
