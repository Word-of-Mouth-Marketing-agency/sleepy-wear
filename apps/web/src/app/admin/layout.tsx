"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingCart,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "التصنيفات", icon: Grid3X3 },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/pages", label: "الصفحات", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("admin_token");

    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }

    if (token && pathname === "/admin/login") {
      router.replace("/admin");
    }
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  if (!mounted) return null;

  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Mobile top bar */}
      <div className="fixed right-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-[var(--line)] bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--line)]"
        >
          <Menu size={22} />
        </button>
        <span className="text-sm font-bold text-brand-pink">SleepyWear</span>
        <div className="w-9" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-[var(--line)] bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="rounded-md bg-brand-pink px-2 py-0.5 text-lg font-extrabold tracking-tight text-white">
              SW
            </span>
            <span className="text-sm font-medium text-[var(--muted)]">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--line)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-pink/10 text-brand-pink"
                    : "text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[var(--line)] px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
