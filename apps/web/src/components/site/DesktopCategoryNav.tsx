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
      "relative px-1 py-1 font-semibold transition-colors duration-200",
      isActive
        ? "text-brand-pink"
        : "text-[var(--muted)] hover:text-brand-pink",
      "after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-center after:rounded-full after:bg-brand-pink after:transition-transform after:duration-200",
      isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
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
