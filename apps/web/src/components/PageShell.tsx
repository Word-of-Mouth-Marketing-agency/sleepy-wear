type PageShellProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  noContainer?: boolean;
};

export function PageShell({
  title,
  eyebrow,
  children,
  noContainer,
}: PageShellProps) {
  return (
    <section className={`${noContainer ? "" : "container"} space-y-6`}>
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-sm font-semibold text-brand-pink">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}
