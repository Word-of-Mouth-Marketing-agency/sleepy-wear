import Link from "next/link";

type FullWidthBannerProps = {
  banner: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
};

export function FullWidthBanner({ banner }: FullWidthBannerProps) {
  return (
    <section className="w-full bg-brand-light-pink">
      <div className="container flex flex-col items-center justify-center gap-5 px-6 py-12 text-center sm:py-16">
        <div className="space-y-4">
          {banner.subtitle ? (
            <p className="text-sm font-semibold text-brand-pink">
              {banner.subtitle}
            </p>
          ) : null}
          <h2 className="text-2xl font-extrabold text-brand-black sm:text-4xl">
            {banner.title}
          </h2>
          {banner.description ? (
            <p className="text-sm text-[var(--muted)]">
              {banner.description}
            </p>
          ) : null}
        </div>
        <Link
          href={banner.buttonUrl}
          className="inline-block rounded-full bg-brand-pink px-8 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-blue"
        >
          {banner.buttonText}
        </Link>
      </div>
    </section>
  );
}
