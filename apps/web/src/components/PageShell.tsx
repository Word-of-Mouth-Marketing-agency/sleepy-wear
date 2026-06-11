type PageShellProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function PageShell({ title, eyebrow, children }: PageShellProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-sm font-semibold text-[var(--accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="rounded-lg border border-[var(--line)] bg-white p-6">
        {children}
      </div>
    </section>
  );
}
