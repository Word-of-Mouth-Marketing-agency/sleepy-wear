import Link from "next/link";

export function FullWidthBanner() {
  return (
    <section
      className="w-full"
      style={{
        background: "linear-gradient(135deg, #F389D4, #00AEEF)",
      }}
    >
      <div className="container flex flex-col items-center justify-center gap-4 px-6 py-12 text-center text-white sm:flex-row sm:gap-10 sm:py-20">
        <div className="space-y-2">
          <p className="text-sm font-semibold opacity-80">عرض خاص</p>
          <h2 className="text-2xl font-extrabold sm:text-4xl">
            خصم 10% على أول طلب
          </h2>
          <p className="text-sm opacity-80">
            + توصيل مجاني للطلبات فوق 999 جنيه
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <div className="rounded-lg border border-white/30 px-5 py-2 text-lg font-mono font-bold tracking-wider sm:text-2xl">
            BF10
          </div>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-pink transition-colors hover:bg-brand-light-pink"
          >
            تسوق الآن
          </Link>
        </div>
      </div>
    </section>
  );
}
