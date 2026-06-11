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
          className="text-sm font-semibold text-brand-pink hover:underline shrink-0"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
