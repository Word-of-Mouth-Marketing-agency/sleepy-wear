"use client";

import { useEffect, useState } from "react";
import type { Order, PaginatedResponse } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PaginatedResponse<Order> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/orders?limit=50`, {
      headers: { Accept: "application/json", ...getAdminHeaders() },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<PaginatedResponse<Order>>;
      })
      .then(setOrders)
      .catch(() => setError(true));
  }, []);

  return (
    <PageShell title="إدارة الطلبات" eyebrow="Admin" noContainer>
      {error ? <p className="text-red-700">تعذر تحميل الطلبات.</p> : null}
      {!error && orders?.items.length === 0 ? (
        <p className="text-[var(--muted)]">لا توجد طلبات حتى الآن.</p>
      ) : null}
      {!error && orders && orders.items.length > 0 ? (
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
