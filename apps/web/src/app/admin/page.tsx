import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const links = [
  { href: "/admin/products", label: "إدارة المنتجات" },
  { href: "/admin/orders", label: "إدارة الطلبات" },
  { href: "/admin/categories", label: "إدارة التصنيفات" },
];

export default function AdminPage() {
  return (
    <PageShell title="لوحة الإدارة" eyebrow="حماية مؤقتة لاحقا">
      <div className="grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-[var(--line)] p-4 font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
