import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-white py-20">
      <div className="container">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-light-pink text-4xl font-black text-brand-pink">
            !
          </div>
          <h1 className="mt-6 text-3xl font-black text-brand-black">
            الصفحة غير موجودة
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            عذراً، الصفحة التي تبحثين عنها غير متوفرة أو تم نقلها.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
              href="/"
            >
              العودة للرئيسية
            </Link>
            <Link
              className="inline-flex rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-bold text-brand-black transition-colors hover:border-brand-pink hover:text-brand-pink"
              href="/products"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}