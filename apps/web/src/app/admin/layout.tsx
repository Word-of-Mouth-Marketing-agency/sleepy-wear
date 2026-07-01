import type { Metadata, Viewport } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Store Admin",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F389D4",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
