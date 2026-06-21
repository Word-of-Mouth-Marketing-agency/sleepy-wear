import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { DOMAIN, SITE_NAME } from "@sleepywear/shared";
import { ClientShell } from "@/components/site/ClientShell";
import { SiteHeader } from "@/components/site/Header";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "متجر ملابس منزلية ولانجري — جودة عالية وأسعار من المصنع مباشرة",
  metadataBase: new URL(`https://${DOMAIN}`),
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <ClientShell header={<SiteHeader />}>{children}</ClientShell>
      </body>
    </html>
  );
}
