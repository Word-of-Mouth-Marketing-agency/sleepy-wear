"use client";

import { useEffect, useState } from "react";
import { API_URL, getAdminHeaders } from "@/lib/api";

export function AdminOrderCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/orders?limit=1`, {
      headers: { Accept: "application/json", ...getAdminHeaders() },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCount(data?.meta?.total ?? null))
      .catch(() => setCount(null));
  }, []);

  return <>{count ?? "-"}</>;
}
