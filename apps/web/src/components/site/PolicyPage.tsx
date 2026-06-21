import type { ReactNode } from "react";

export function PolicyPage({
  title,
  content,
  children,
}: {
  title: string;
  content?: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-brand-light-pink/30 p-6 sm:p-10">
          <h1 className="mb-8 text-2xl font-black text-brand-black sm:text-3xl">
            {title}
          </h1>
          <div className="space-y-4 text-sm leading-8 text-[var(--muted)] sm:text-base sm:leading-9">
            {content ? <PolicyContent content={content} /> : children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyContent({ content }: { content: string }) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => (
      <p key={index} className="whitespace-pre-line">
        {block}
      </p>
    ));
}
