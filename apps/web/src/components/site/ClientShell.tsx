"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./Footer";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

export function ClientShell({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  );
}
