export type ServiceWorkerRegistrationResult =
  | { ok: true; registration: ServiceWorkerRegistration }
  | { ok: false; reason: string };

const ADMIN_SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function isStandaloneMode() {
  if (!isBrowser()) return false;

  const standaloneMedia = window.matchMedia?.("(display-mode: standalone)").matches;
  const navigatorStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return Boolean(standaloneMedia || navigatorStandalone);
}

export function isIosDevice() {
  if (!isBrowser()) return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function canUseServiceWorker() {
  return isBrowser() && "serviceWorker" in window.navigator;
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  if (!canUseServiceWorker()) {
    return { ok: false, reason: "service-worker-unsupported" };
  }

  try {
    const registration = await window.navigator.serviceWorker.register(
      ADMIN_SERVICE_WORKER_PATH,
      { scope: "/admin" },
    );

    return { ok: true, registration };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "service-worker-registration-failed";
    return { ok: false, reason };
  }
}
