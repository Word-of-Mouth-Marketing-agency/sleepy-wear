import type { Metadata } from "next";
import { DOMAIN, SITE_NAME } from "@sleepywear/shared";
import { ClientShell } from "@/components/site/ClientShell";
import { SiteHeader } from "@/components/site/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "متجر ملابس منزلية ولانجري — جودة عالية وأسعار من المصنع مباشرة",
  metadataBase: new URL(`https://${DOMAIN}`),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ClientShell header={<SiteHeader />}>{children}</ClientShell>
      </body>
    </html>
  );
}
