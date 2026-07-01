"use client";

import { useEffect } from "react";
import { registerAdminServiceWorker } from "@/lib/pwa";

export function AdminPwaBootstrap() {
  useEffect(() => {
    let cancelled = false;

    void registerAdminServiceWorker().then((result) => {
      if (
        cancelled ||
        process.env.NODE_ENV !== "development" ||
        result.ok
      ) {
        return;
      }

      console.info("[admin-pwa] Service worker not registered:", result.reason);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
