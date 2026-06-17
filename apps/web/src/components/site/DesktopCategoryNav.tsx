"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@sleepywear/shared";

export function DesktopCategoryNav({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();

  const activeSlug = pathname.startsWith("/categories/")
    ? pathname.replace("/categories/", "")
    : null;

  const isHome = pathname === "/";
  const isProducts =
    pathname === "/products" || pathname.startsWith("/products/");

  const linkClass = (isActive: boolean) =>
    [
      "relative px-3 py-1.5 rounded-full font-semibold transition-all duration-200",
      isActive
        ? "bg-brand-pink text-white"
        : "text-[var(--muted)] hover:bg-brand-light-pink hover:text-brand-black hover:-translate-y-[1px]",
    ].join(" ");

  return (
    <nav className="desktop-category-nav border-t border-[var(--line)] bg-white">
      <div className="container">
        <ul className="flex justify-center gap-6 overflow-x-auto whitespace-nowrap py-2.5 text-sm hide-scrollbar">
          <li>
            <Link href="/" className={linkClass(isHome)}>
              الرئيسية
            </Link>
          </li>
          <li>
            <Link href="/products" className={linkClass(isProducts)}>
              جميع المنتجات
            </Link>
          </li>
          {categories.slice(0, 8).map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categories/${cat.slug}`}
                className={linkClass(activeSlug === cat.slug)}
              >
                {cat.nameAr}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
