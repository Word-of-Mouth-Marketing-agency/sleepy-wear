import Link from "next/link";

type CategoryPaginationProps = {
  slug: string;
  page: number;
  totalPages: number;
};

export function CategoryPagination({
  slug,
  page,
  totalPages,
}: CategoryPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="تصفح الصفحات"
    >
      {page > 1 ? (
        <Link
          href={page === 2 ? `/categories/${slug}` : `/categories/${slug}?page=${page - 1}`}
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand-pink hover:text-brand-pink"
        >
          السابق
        </Link>
      ) : (
        <span className="rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-2.5 text-sm font-bold text-[var(--muted)] opacity-50">
          السابق
        </span>
      )}

      <div className="mx-2 flex items-center gap-1.5">
        {pages.map((p, i) => {
          if (p === "dots") {
            return (
              <span
                key={`dots-${i}`}
                className="grid h-10 w-10 place-items-center text-sm font-bold text-[var(--muted)]"
              >
                ...
              </span>
            );
          }

          const isActive = p === page;
          return (
            <Link
              key={p}
              href={p === 1 ? `/categories/${slug}` : `/categories/${slug}?page=${p}`}
              className={`grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold transition ${
                isActive
                  ? "bg-brand-pink text-white shadow-sm shadow-pink-200"
                  : "border border-[var(--line)] bg-white hover:border-brand-pink hover:text-brand-pink"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {page < totalPages ? (
        <Link
          href={`/categories/${slug}?page=${page + 1}`}
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand-pink hover:text-brand-pink"
        >
          التالي
        </Link>
      ) : (
        <span className="rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-2.5 text-sm font-bold text-[var(--muted)] opacity-50">
          التالي
        </span>
      )}
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | "dots")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "dots")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("dots");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("dots");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("dots");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("dots");
    pages.push(total);
  }

  return pages;
}
