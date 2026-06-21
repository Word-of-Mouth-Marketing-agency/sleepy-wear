export function PolicyPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="container py-10 sm:py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-brand-light-pink/30 p-6 sm:p-10">
          <h1 className="mb-8 text-2xl font-black text-brand-black sm:text-3xl">
            {title}
          </h1>
          <div className="space-y-4 text-sm leading-8 text-[var(--muted)] sm:text-base sm:leading-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
