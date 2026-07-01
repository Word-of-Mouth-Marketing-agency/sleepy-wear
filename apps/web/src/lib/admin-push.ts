import { API_URL, getAdminHeaders } from "@/lib/api";
import { registerAdminServiceWorker } from "@/lib/pwa";

export type AdminPushDevice = {
  id: string;
  deviceName: string | null;
  platform: string | null;
  endpointHash: string;
  enabled: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationLog = {
  id: string;
  type: string;
  orderId: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  deviceId: string | null;
};

export type AdminDashboardSummary = {
  todayOrders: number;
  pendingOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  todayOrderValue: number;
  paidRevenueToday: number;
  latestOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  notifications: {
    enabledDevices: number;
    recentFailures: number;
  };
};

type RegisterDeviceInput = {
  subscription: PushSubscription;
  deviceName: string;
  platform: string;
};

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...getAdminHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === "string"
        ? body.message
        : Array.isArray(body?.message)
          ? body.message.join("، ")
          : `API request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getVapidPublicKey() {
  const result = await adminFetch<{ publicKey: string }>(
    "/admin/notifications/vapid-public-key",
  );

  return result.publicKey;
}

export async function subscribeAdminToPush() {
  const registrationResult = await registerAdminServiceWorker();

  if (!registrationResult.ok) {
    throw new Error(registrationResult.reason);
  }

  const publicKey = await getVapidPublicKey();

  if (!publicKey) {
    throw new Error("Web Push public key is not configured");
  }

  const existingSubscription =
    await registrationResult.registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registrationResult.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function getCurrentPushSubscription() {
  const registrationResult = await registerAdminServiceWorker();

  if (!registrationResult.ok) {
    return null;
  }

  return registrationResult.registration.pushManager.getSubscription();
}

export async function registerAdminPushDevice(input: RegisterDeviceInput) {
  const subscriptionJson = input.subscription.toJSON();

  return adminFetch<AdminPushDevice>("/admin/notifications/devices/register", {
    method: "POST",
    body: JSON.stringify({
      deviceName: input.deviceName,
      platform: input.platform,
      subscription: {
        endpoint: subscriptionJson.endpoint,
        keys: subscriptionJson.keys,
      },
    }),
  });
}

export async function disableCurrentAdminPushDevice(endpoint: string) {
  return adminFetch<{ ok: true; disabled: boolean }>(
    "/admin/notifications/devices/disable-current",
    {
      method: "POST",
      body: JSON.stringify({ endpoint }),
    },
  );
}

export async function sendTestNotification(endpoint?: string) {
  return adminFetch<{
    ok: boolean;
    sent: number;
    failed: number;
    results: Array<{
      deviceId: string;
      status: "sent" | "failed" | "disabled_expired" | "skipped";
      errorMessage?: string;
    }>;
  }>("/admin/notifications/test", {
    method: "POST",
    body: JSON.stringify(endpoint ? { endpoint } : {}),
  });
}

export async function sendOrderNotificationTest(
  orderId: string,
  endpoint?: string,
) {
  return adminFetch<{
    ok: boolean;
    attempted: number;
    sent: number;
    failed: number;
    disabledExpired: number;
    skipped: number;
  }>(`/admin/notifications/orders/${orderId}/test`, {
    method: "POST",
    body: JSON.stringify(endpoint ? { endpoint } : {}),
  });
}

export async function listAdminPushDevices() {
  return adminFetch<AdminPushDevice[]>("/admin/notifications/devices");
}

export async function listNotificationLogs() {
  return adminFetch<NotificationLog[]>("/admin/notifications/logs");
}

export async function getAdminDashboardSummary() {
  return adminFetch<AdminDashboardSummary>("/admin/dashboard/summary");
}

export function getBrowserDeviceName() {
  if (typeof window === "undefined") {
    return "Admin browser";
  }

  const ua = window.navigator.userAgent;

  if (/iphone|ipad|ipod/i.test(ua)) return "Safari on iPhone";
  if (/android/i.test(ua) && /chrome/i.test(ua)) return "Chrome on Android";
  if (/edg/i.test(ua)) return "Microsoft Edge";
  if (/chrome/i.test(ua)) return "Google Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";

  return "Admin browser";
}

export function getBrowserPlatform() {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const ua = window.navigator.userAgent;

  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  if (/windows/i.test(ua)) return "windows";
  if (/macintosh|mac os x/i.test(ua)) return "macos";

  return "web";
}

export async function hashPushEndpoint(endpoint: string) {
  if (
    typeof window === "undefined" ||
    !window.crypto?.subtle ||
    typeof TextEncoder === "undefined"
  ) {
    return null;
  }

  const buffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(endpoint),
  );
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
