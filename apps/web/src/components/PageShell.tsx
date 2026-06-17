type PageShellProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  noContainer?: boolean;
  description?: string;
  actions?: React.ReactNode;
  surface?: "card" | "plain";
};

export function PageShell({
  title,
  eyebrow,
  children,
  noContainer,
  description,
  actions,
  surface = "card",
}: PageShellProps) {
  return (
    <section className={`${noContainer ? "" : "container"} space-y-5`}>
      <div className="flex flex-col gap-4 rounded-2xl border border-pink-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-pink">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {surface === "card" ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
