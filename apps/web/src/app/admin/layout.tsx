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
  Truck,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "التصنيفات", icon: Grid3X3 },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/coupons", label: "الكوبونات", icon: Tag },
  { href: "/admin/settings", label: "إعدادات الموقع", icon: Settings },
  { href: "/admin/pages", label: "الصفحات", icon: FileText },
  { href: "/admin/shipping", label: "الشحن", icon: Truck },
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
    <div className="flex min-h-screen bg-[#fbf7fa] text-black">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Mobile top bar */}
      <div className="fixed right-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-pink-100 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-full border border-[var(--line)] p-2 text-black transition-colors hover:border-brand-pink hover:text-brand-pink"
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>
        <span className="text-sm font-extrabold text-brand-pink">SleepyWear Admin</span>
        <div className="w-9" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-pink-100 bg-white shadow-2xl shadow-pink-100/40 transition-transform lg:static lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-pink-100 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-pink text-lg font-extrabold tracking-tight text-white shadow-sm">
              SW
            </span>
            <span>
              <span className="block text-base font-extrabold leading-none text-black">
                SleepyWear
              </span>
              <span className="mt-1 block text-xs font-semibold text-[var(--muted)]">
                مركز الإدارة
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-2 text-[var(--muted)] transition-colors hover:bg-pink-50 hover:text-brand-pink lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            الإدارة
          </p>
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-brand-pink text-white shadow-sm shadow-pink-200"
                    : "text-[var(--muted)] hover:bg-pink-50 hover:text-black"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#fbf7fa] text-black group-hover:bg-white group-hover:text-brand-pink"
                  }`}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-pink-100 px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf7fa]">
              <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10">{children}</div>
      </main>
    </div>
  );
}
