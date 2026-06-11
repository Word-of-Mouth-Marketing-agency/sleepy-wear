import type { Order, PaginatedResponse } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { apiGet } from "@/lib/api";

export default async function AdminOrdersPage() {
  const orders = await apiGet<PaginatedResponse<Order>>(
    "/orders?limit=50",
  ).catch(() => null);

  return (
    <PageShell title="إدارة الطلبات" eyebrow="Admin">
      {!orders ? <p className="text-red-700">تعذر تحميل الطلبات.</p> : null}
      {orders && orders.items.length === 0 ? (
        <p className="text-[var(--muted)]">لا توجد طلبات حتى الآن.</p>
      ) : null}
      {orders && orders.items.length > 0 ? (
        <div className="space-y-3">
          {orders.items.map((order) => (
            <div
              key={order.id}
              className="rounded-md border border-[var(--line)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {order.customerName} - {order.phone}
                  </p>
                </div>
                <div className="text-sm">
                  <p>{order.status}</p>
                  <p className="font-bold text-[var(--accent)]">
                    {order.total} جنيه
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                {order.items?.map((item) => (
                  <li key={item.id}>
                    {item.productNameSnapshot} - {item.variantInfoSnapshot} -{" "}
                    {item.quantity} × {item.unitPriceSnapshot}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
