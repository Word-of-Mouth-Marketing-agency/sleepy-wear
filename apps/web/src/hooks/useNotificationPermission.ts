"use client";

import { useCallback, useEffect, useState } from "react";
import { isBrowser } from "@/lib/pwa";

export type NotificationPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

function readNotificationPermission(): NotificationPermissionState {
  if (!isBrowser() || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.permission;
}

export function useNotificationPermission() {
  const [permission, setPermission] =
    useState<NotificationPermissionState>("unsupported");

  const refreshPermission = useCallback(() => {
    const nextPermission = readNotificationPermission();
    setPermission(nextPermission);
    return nextPermission;
  }, []);

  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  const requestPermission = useCallback(async () => {
    if (!isBrowser() || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }

    try {
      const nextPermission = await window.Notification.requestPermission();
      setPermission(nextPermission);
      return nextPermission;
    } catch {
      return refreshPermission();
    }
  }, [refreshPermission]);

  return {
    permission,
    isSupported: permission !== "unsupported",
    requestPermission,
    refreshPermission,
  };
}
