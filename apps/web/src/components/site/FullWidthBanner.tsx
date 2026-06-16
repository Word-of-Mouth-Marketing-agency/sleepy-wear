import Link from "next/link";

export function FullWidthBanner() {
  return (
    <section className="w-full bg-brand-light-pink">
      <div className="container flex flex-col items-center justify-center gap-5 px-6 py-12 text-center text-brand-black sm:flex-row sm:gap-10 sm:py-16">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-pink">عرض خاص</p>
          <h2 className="text-2xl font-extrabold sm:text-4xl">
            خصم 10% على أول طلب
          </h2>
          <p className="text-sm text-[var(--muted)]">
            + توصيل مجاني للطلبات فوق 999 جنيه
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <div className="rounded-lg border border-brand-pink/30 bg-white px-5 py-2 text-lg font-mono font-bold tracking-wider text-brand-pink sm:text-2xl">
            BF10
          </div>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue"
          >
            تسوق الآن
          </Link>
        </div>
      </div>
    </section>
  );
}
