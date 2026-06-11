"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./Header";
import { SiteFooter } from "./Footer";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  );
}
