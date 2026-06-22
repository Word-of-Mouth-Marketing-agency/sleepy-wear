import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { DOMAIN, SITE_NAME } from "@sleepywear/shared";
import { API_URL } from "@/lib/api";
import { ClientShell } from "@/components/site/ClientShell";
import { SiteHeader } from "@/components/site/Header";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | ملابس منزلية ولانجري`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "متجر ملابس منزلية ولانجري بجودة عالية وأسعار من المصنع مباشرة.",
  metadataBase: new URL(`https://${DOMAIN}`),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: "تسوقي ملابس منزلية ولانجري بجودة عالية وأسعار من المصنع مباشرة.",
    url: `https://${DOMAIN}`,
    siteName: SITE_NAME,
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "ملابس منزلية ولانجري بجودة عالية وأسعار من المصنع مباشرة.",
  },
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

async function getSiteSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error();
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  const footerText = (settings?.site_footer_text ?? {
    description: "ملابس منزلية ولانجري بأفضل الأسعار من المصنع مباشرة.",
  }) as { description: string };

  const socialUrls = settings?.site_social_links as
    | { facebook?: string; instagram?: string; tiktok?: string; telegram?: string }
    | undefined;

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <ClientShell
          header={<SiteHeader />}
          footerDescription={footerText.description}
          socialUrls={socialUrls}
        >
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
