"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./Footer";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

type ClientShellProps = {
  children: React.ReactNode;
  header: React.ReactNode;
  footerDescription?: string;
  socialUrls?: { facebook?: string; instagram?: string; tiktok?: string; telegram?: string };
};

export function ClientShell({
  children,
  header,
  footerDescription,
  socialUrls,
}: ClientShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      <SiteFooter footerDescription={footerDescription} socialUrls={socialUrls} />
      <FloatingWhatsApp />
    </>
  );
}
