import Link from "next/link";

type SectionHeadingProps = {
  title: string;
  link?: { href: string; label: string };
};

export function SectionHeading({ title, link }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
      {link ? (
        <Link
          href={link.href}
          className="shrink-0 rounded-md border border-brand-pink px-4 py-2 text-sm font-semibold text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
