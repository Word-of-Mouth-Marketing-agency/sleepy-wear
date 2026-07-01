import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { DOMAIN, SITE_NAME } from "@sleepywear/shared";
import { API_URL } from "@/lib/api";
import { ClientShell } from "@/components/site/ClientShell";
import { SiteHeader } from "@/components/site/Header";
import { MetaPixel } from "@/components/site/MetaPixel";
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

  const pixelSettings = settings?.marketing_pixel as
    | { enabled?: boolean; headScript?: string; pixelId?: string }
    | undefined;

  const isPixelEnabled = Boolean(pixelSettings?.enabled);

  let headScript: string | null = null;
  if (pixelSettings?.headScript && typeof pixelSettings.headScript === "string" && pixelSettings.headScript.trim()) {
    headScript = pixelSettings.headScript.trim();
  } else if (pixelSettings?.pixelId && typeof pixelSettings.pixelId === "string" && pixelSettings.pixelId.trim()) {
    const pid = pixelSettings.pixelId.trim();
    headScript = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pid}');fbq('track','PageView');`;
  }

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <MetaPixel enabled={isPixelEnabled} headScript={headScript} />
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
