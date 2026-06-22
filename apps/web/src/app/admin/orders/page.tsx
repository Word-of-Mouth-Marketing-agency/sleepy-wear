"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order, PaginatedResponse } from "@sleepywear/shared";
import { PageShell } from "@/components/PageShell";
import { API_URL, getAdminHeaders } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "جديد",
  CONFIRMED: "قيد المراجعة",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-brand-blue",
  PROCESSING: "border-purple-200 bg-purple-50 text-purple-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DELIVERED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

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
    <PageShell
      title="إدارة الطلبات"
      eyebrow="Admin"
      description="متابعة طلبات العملاء ومراجعة المنتجات داخل كل طلب."
      noContainer
      surface="plain"
    >
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تعذر تحميل الطلبات.
        </p>
      ) : null}
      {!error && !orders ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          جاري تحميل الطلبات...
        </div>
      ) : null}
      {!error && orders?.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center text-sm font-semibold text-[var(--muted)] shadow-sm">
          لا توجد طلبات حتى الآن.
        </div>
      ) : null}
      {!error && orders && orders.items.length > 0 ? (
        <div className="space-y-4">
          {orders.items.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-pink/40 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="text-lg font-extrabold">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {order.customerName} - {order.phone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      statusStyles[order.status] ??
                      "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="rounded-full bg-pink-50 px-4 py-1.5 text-sm font-extrabold text-brand-pink">
                    {order.total} جنيه
                  </span>
                </div>
              </div>
              <ul className="mt-4 grid gap-2">
                {order.items?.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fbf7fa] px-4 py-3 text-sm"
                  >
                    <span className="font-bold">
                      {item.productNameSnapshot}
                    </span>
                    <span className="text-[var(--muted)]">
                      {item.variantInfoSnapshot} - {item.quantity} ×{" "}
                      {item.unitPriceSnapshot}
                    </span>
                  </li>
                ))}
                {order.items && order.items.length > 3 ? (
                  <li className="text-center text-xs font-bold text-[var(--muted)]">
                    + {order.items.length - 3} منتجات أخرى
                  </li>
                ) : null}
              </ul>
            </Link>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
