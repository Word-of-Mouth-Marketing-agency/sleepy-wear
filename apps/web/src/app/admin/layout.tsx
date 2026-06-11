"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/orders", label: "الطلبات" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

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

  function handleLogout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  if (!mounted) return null;

  const isLogin = pathname === "/admin/login";

  return (
    <>
      {!isLogin ? (
        <header className="border-b border-[var(--line)] bg-white">
          <div className="container flex min-h-14 items-center justify-between gap-4">
            <nav className="flex flex-wrap gap-4 text-sm">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname === item.href
                      ? "font-semibold text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              className="text-sm text-[var(--muted)] hover:text-red-700"
              onClick={handleLogout}
              type="button"
            >
              تسجيل خروج
            </button>
          </div>
        </header>
      ) : null}
      <main className="container py-10">{children}</main>
    </>
  );
}
