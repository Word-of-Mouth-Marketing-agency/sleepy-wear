"use client";

import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Download,
  Info,
  MonitorSmartphone,
  RefreshCw,
  Send,
  Smartphone,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import {
  type AdminPushDevice,
  type NotificationLog,
  disableCurrentAdminPushDevice,
  getBrowserDeviceName,
  getBrowserPlatform,
  getCurrentPushSubscription,
  getAdminDashboardSummary,
  listAdminPushDevices,
  listNotificationLogs,
  hashPushEndpoint,
  registerAdminPushDevice,
  sendOrderNotificationTest,
  sendTestNotification,
  subscribeAdminToPush,
} from "@/lib/admin-push";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";
import { canUseServiceWorker } from "@/lib/pwa";

type DeviceStatus = {
  serviceWorker: boolean;
  notifications: boolean;
  pushManager: boolean;
};

const yes = "نعم";
const no = "لا";

export default function AdminNotificationSettingsPage() {
  const installPrompt = usePwaInstallPrompt();
  const notificationPermission = useNotificationPermission();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    serviceWorker: false,
    notifications: false,
    pushManager: false,
  });
  const [devices, setDevices] = useState<AdminPushDevice[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [currentEndpointHash, setCurrentEndpointHash] = useState<string | null>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [orderTestId, setOrderTestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"enable" | "test" | "orderTest" | "disable" | "refresh" | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [subscription, nextDevices, nextLogs] = await Promise.all([
        getCurrentPushSubscription().catch(() => null),
        listAdminPushDevices().catch(() => []),
        listNotificationLogs().catch(() => []),
      ]);
      const dashboard = await getAdminDashboardSummary().catch(() => null);
      const endpoint = subscription?.endpoint ?? null;
      const endpointHash = endpoint ? await hashPushEndpoint(endpoint) : null;

      setCurrentEndpoint(endpoint);
      setCurrentEndpointHash(endpointHash);
      setDevices(nextDevices);
      setLogs(nextLogs);
      const nextLatestOrderId = dashboard?.latestOrders?.[0]?.id ?? null;
      setLatestOrderId(nextLatestOrderId);
      setOrderTestId((current) => current || nextLatestOrderId || "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDeviceStatus({
      serviceWorker: canUseServiceWorker(),
      notifications: "Notification" in window,
      pushManager: "PushManager" in window,
    });

    void refreshData();
  }, [refreshData]);

  const currentDevice = useMemo(() => {
    if (!currentEndpointHash) return null;
    return (
      devices.find((device) => device.endpointHash === currentEndpointHash) ??
      null
    );
  }, [currentEndpointHash, devices]);

  const installState = getInstallState(installPrompt);
  const permissionState = getPermissionState(notificationPermission.permission);

  async function handleEnableNotifications() {
    setBusy("enable");
    setMessage(null);

    try {
      const permission = await notificationPermission.requestPermission();

      if (permission !== "granted") {
        setMessage({
          type: "error",
          text:
            permission === "denied"
              ? "تم حظر الإشعارات. فعّلها من إعدادات المتصفح ثم حاول مرة أخرى."
              : "لم يتم السماح بالإشعارات بعد.",
        });
        return;
      }

      const subscription = await subscribeAdminToPush();
      await registerAdminPushDevice({
        subscription,
        deviceName: getBrowserDeviceName(),
        platform: getBrowserPlatform(),
      });
      const endpointHash = await hashPushEndpoint(subscription.endpoint);

      setCurrentEndpoint(subscription.endpoint);
      setCurrentEndpointHash(endpointHash);
      setMessage({
        type: "success",
        text: "تم حفظ هذا الجهاز لاستقبال إشعارات الإدارة التجريبية.",
      });
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "تعذر تفعيل الإشعارات.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleTestNotification() {
    setBusy("test");
    setMessage(null);

    try {
      const result = await sendTestNotification(currentEndpoint ?? undefined);
      setMessage({
        type: result.ok ? "success" : "error",
        text: result.ok
          ? "تم إرسال إشعار اختبار لهذا الجهاز."
          : "لم يتم إرسال إشعار الاختبار. راجع السجل بالأسفل.",
      });
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "تعذر إرسال إشعار الاختبار.",
      });
      await refreshData();
    } finally {
      setBusy(null);
    }
  }

  async function handleOrderTestNotification() {
    const targetOrderId = orderTestId.trim();

    if (!targetOrderId) {
      setMessage({ type: "error", text: "أدخل رقم تعريف الطلب أولًا." });
      return;
    }

    setBusy("orderTest");
    setMessage(null);

    try {
      const result = await sendOrderNotificationTest(
        targetOrderId,
        currentEndpoint ?? undefined,
      );
      setMessage({
        type: result.ok ? "success" : "error",
        text: result.ok
          ? "تم إرسال إشعار طلب تجريبي."
          : "لم يتم إرسال إشعار الطلب التجريبي. راجع السجل بالأسفل.",
      });
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "تعذر إرسال إشعار الطلب التجريبي.",
      });
      await refreshData();
    } finally {
      setBusy(null);
    }
  }

  async function handleRefresh() {
    setBusy("refresh");
    setMessage(null);

    try {
      await refreshData();
      setMessage({ type: "info", text: "تم تحديث حالة الجهاز والسجلات." });
    } finally {
      setBusy(null);
    }
  }

  async function handleDisableCurrentDevice() {
    if (!currentEndpoint) return;

    setBusy("disable");
    setMessage(null);

    try {
      await disableCurrentAdminPushDevice(currentEndpoint);
      setMessage({ type: "success", text: "تم تعطيل هذا الجهاز." });
      await refreshData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "تعذر تعطيل الجهاز.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <PageShell
      title="إشعارات الطلبات"
      eyebrow="Admin"
      description="ثبّت لوحة الإدارة كتطبيق على الهاتف وسجّل هذا الجهاز لاستقبال إشعارات الإدارة."
      noContainer
      surface="plain"
      actions={
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={busy === "refresh"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-extrabold text-black transition hover:border-brand-pink hover:text-brand-pink disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw size={16} aria-hidden />
          تحديث
        </button>
      }
    >
      {message ? (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold leading-7 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-blue-200 bg-blue-50 text-brand-blue"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid min-w-0 gap-5">
          <GuideCard
            eyebrow="Admin App Install Status"
            title="تثبيت تطبيق الإدارة"
            icon={Download}
          >
            <StatusPill tone={installState.tone} label={installState.label} />
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              استخدم هذا التثبيت لفتح لوحة الإدارة بسرعة من شاشة الهاتف. هذا لا يضيف أي تخزين أوفلاين ولا يغيّر تجربة المتجر للعملاء.
            </p>
            <button
              type="button"
              onClick={() => void installPrompt.installApp()}
              disabled={!installPrompt.canInstall || installPrompt.isInstalled}
              className="mt-5 w-full rounded-full bg-brand-pink px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-pink/90 disabled:cursor-not-allowed disabled:bg-pink-200 sm:w-auto"
            >
              تثبيت تطبيق الإدارة
            </button>
            {installPrompt.isIos ? (
              <p className="mt-3 text-xs font-semibold leading-6 text-[var(--muted)]">
                على iPhone يتم التثبيت يدويًا من Safari عبر زر المشاركة ثم Add to Home Screen.
              </p>
            ) : null}
          </GuideCard>

          <GuideCard
            eyebrow="Enable Notifications"
            title="تفعيل هذا الجهاز"
            icon={Bell}
          >
            <StatusPill tone={permissionState.tone} label={permissionState.label} />
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              عند الضغط سيتم طلب صلاحية الإشعارات، إنشاء Push Subscription، ثم حفظ هذا الجهاز في لوحة الإدارة.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleEnableNotifications()}
                disabled={busy === "enable"}
                className="w-full rounded-full bg-brand-pink px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-pink/90 disabled:cursor-not-allowed disabled:bg-pink-200 sm:w-auto"
              >
                {busy === "enable"
                  ? "جاري التفعيل..."
                  : "تفعيل صلاحية الإشعارات"}
              </button>
              <button
                type="button"
                onClick={() => void handleDisableCurrentDevice()}
                disabled={!currentDevice || busy === "disable"}
                className="w-full rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                تعطيل هذا الجهاز
              </button>
            </div>
            <PermissionHelper permission={notificationPermission.permission} />
          </GuideCard>

          <GuideCard
            eyebrow="Test Notification"
            title="اختبار الإشعار"
            icon={Send}
          >
            <button
              type="button"
              onClick={() => void handleTestNotification()}
              disabled={!currentDevice?.enabled || busy === "test"}
              className="w-full rounded-full bg-brand-blue px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:bg-blue-200 sm:w-auto"
            >
              {busy === "test" ? "جاري الإرسال..." : "اختبار الإشعار"}
            </button>
            <p className="mt-3 text-sm font-semibold leading-7 text-[var(--muted)]">
              يرسل هذا الزر إشعارًا عامًا لهذا الجهاز فقط. لا يتم إرسال أي بيانات عملاء في الإشعار.
            </p>
          </GuideCard>

          <GuideCard
            eyebrow="Order Notification Test"
            title="اختبار إشعار طلب"
            icon={BellRing}
          >
            <p className="text-sm leading-7 text-[var(--muted)]">
              يرسل إشعارًا بنفس شكل إشعار الطلب الحقيقي بدون إنشاء طلب جديد وبدون تعديل حالة أو مخزون.
            </p>
            <input
              value={orderTestId}
              onChange={(event) => setOrderTestId(event.target.value)}
              placeholder={latestOrderId ? "آخر طلب جاهز للاختبار" : "Order ID"}
              dir="ltr"
              className="mt-4 w-full rounded-2xl border border-[var(--line)] bg-[#fbf7fa] px-4 py-3 text-sm font-bold outline-none transition focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-pink-100"
            />
            <button
              type="button"
              onClick={() => void handleOrderTestNotification()}
              disabled={!currentDevice?.enabled || busy === "orderTest"}
              className="mt-3 w-full rounded-full bg-brand-blue px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:bg-blue-200 sm:w-auto"
            >
              {busy === "orderTest"
                ? "جاري الإرسال..."
                : "اختبار إشعار آخر طلب"}
            </button>
            {latestOrderId ? (
              <p className="mt-3 text-xs font-semibold leading-6 text-[var(--muted)]">
                تم ملء آخر طلب تلقائيًا. يمكنك تغيير الرقم يدويًا إذا احتجت.
              </p>
            ) : null}
          </GuideCard>

          <GuideCard
            eyebrow="How notifications will work"
            title="كيف تعمل إشعارات الطلبات"
            icon={BellRing}
          >
            <p className="text-sm font-bold text-black">عند وصول طلب جديد:</p>
            <ol className="mt-3 grid gap-2 text-sm leading-7 text-[var(--muted)]">
              <li>1. يتم إنشاء الطلب في الموقع بشكل طبيعي.</li>
              <li>2. السيرفر يرسل إشعارًا لأجهزة الإدارة المسجلة.</li>
              <li>3. عند الضغط على الإشعار يتم فتح صفحة تفاصيل الطلب.</li>
            </ol>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-7 text-amber-800">
              إشعارات الطلبات ترسل الآن بعد نجاح إنشاء الطلب. أي فشل في الإرسال يتم تسجيله ولا يمنع إتمام الطلب.
            </div>
          </GuideCard>
        </div>

        <div className="grid min-w-0 gap-5">
          <GuideCard
            eyebrow="Current device/browser status"
            title="حالة هذا الجهاز"
            icon={MonitorSmartphone}
          >
            <div className="grid gap-3">
              <StatusRow label="المتصفح يدعم Service Worker" value={deviceStatus.serviceWorker ? yes : no} ok={deviceStatus.serviceWorker} />
              <StatusRow label="المتصفح يدعم Push Manager" value={deviceStatus.pushManager ? yes : no} ok={deviceStatus.pushManager} />
              <StatusRow label="المتصفح يدعم إشعارات الويب" value={deviceStatus.notifications ? yes : no} ok={deviceStatus.notifications} />
              <StatusRow label="حالة الصلاحية" value={permissionState.label} ok={notificationPermission.permission === "granted"} />
              <StatusRow label="مثبت كتطبيق" value={installPrompt.isInstalled ? yes : no} ok={installPrompt.isInstalled} />
              <StatusRow label="Push Subscription موجود" value={currentEndpoint ? yes : no} ok={Boolean(currentEndpoint)} />
              <StatusRow label="الجهاز محفوظ في السيرفر" value={currentDevice ? yes : no} ok={Boolean(currentDevice)} />
              <StatusRow label="الجهاز مفعّل" value={currentDevice?.enabled ? yes : no} ok={Boolean(currentDevice?.enabled)} />
            </div>
            {currentDevice ? (
              <div className="mt-4 rounded-2xl bg-[#fbf7fa] p-4 text-xs font-semibold leading-6 text-[var(--muted)]">
                <p>آخر ظهور: {formatDate(currentDevice.lastSeenAt)}</p>
                <p>الجهاز: {currentDevice.deviceName ?? "غير محدد"}</p>
                <p>المنصة: {currentDevice.platform ?? "غير محددة"}</p>
              </div>
            ) : loading ? (
              <p className="mt-4 text-sm font-semibold text-[var(--muted)]">
                جاري قراءة حالة الجهاز...
              </p>
            ) : null}
          </GuideCard>

          <GuideCard
            eyebrow="Recent Notification Logs"
            title="آخر سجلات الإشعارات"
            icon={Info}
          >
            {logs.length > 0 ? (
              <div className="grid gap-3">
                {logs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-[var(--line)] p-4 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-extrabold text-black">
                        {log.type}
                      </span>
                      <StatusPill
                        tone={log.status === "sent" ? "success" : "danger"}
                        label={log.status === "sent" ? "تم الإرسال" : "فشل"}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                      {formatDate(log.createdAt)}
                    </p>
                    {log.orderId ? (
                      <p className="mt-1 text-xs font-semibold text-[var(--muted)]" dir="ltr">
                        order: {log.orderId}
                      </p>
                    ) : null}
                    {log.errorMessage ? (
                      <p className="mt-2 text-xs font-semibold leading-6 text-red-700">
                        {log.errorMessage}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold leading-7 text-[var(--muted)]">
                لا توجد سجلات إشعارات بعد.
              </p>
            )}
          </GuideCard>

          <GuideCard
            eyebrow="Production setup"
            title="ملاحظات التشغيل على الهاتف"
            icon={Info}
          >
            <div className="grid gap-2 text-sm font-semibold leading-7 text-[var(--muted)]">
              <p>اختبار الهاتف الحقيقي يحتاج HTTPS أو الدومين الإنتاجي.</p>
              <p>على iPhone يجب فتح لوحة الإدارة من أيقونة الشاشة الرئيسية بعد التثبيت.</p>
              <p>لا تتوقع عمل إشعارات iPhone من تبويب Safari العادي.</p>
            </div>
          </GuideCard>

          <GuideCard
            eyebrow="iPhone setup guide"
            title="إعداد iPhone"
            icon={Smartphone}
          >
            <p className="text-sm font-bold text-black">
              لتفعيل الإشعارات على iPhone:
            </p>
            <ol className="mt-3 grid gap-2 text-sm leading-7 text-[var(--muted)]">
              <li>1. افتح لوحة الإدارة من Safari.</li>
              <li>2. اضغط زر المشاركة.</li>
              <li>3. اختر Add to Home Screen.</li>
              <li>4. افتح أيقونة Admin الجديدة من الشاشة الرئيسية.</li>
              <li>5. اضغط تفعيل صلاحية الإشعارات من هذه الصفحة.</li>
            </ol>
            <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50 p-4 text-sm font-semibold leading-7 text-black">
              مهم: إشعارات iPhone تعمل بعد تثبيت لوحة الإدارة على الشاشة الرئيسية. لا تتوقع أن تعمل الإشعارات من تبويب Safari العادي.
            </div>
          </GuideCard>

          <GuideCard
            eyebrow="Android setup guide"
            title="إعداد Android"
            icon={Smartphone}
          >
            <ol className="grid gap-2 text-sm leading-7 text-[var(--muted)]">
              <li>1. افتح لوحة الإدارة من Chrome.</li>
              <li>2. اضغط زر تثبيت تطبيق الإدارة إذا ظهر.</li>
              <li>3. افتح التطبيق من الشاشة الرئيسية.</li>
              <li>4. اضغط تفعيل صلاحية الإشعارات من هذه الصفحة.</li>
            </ol>
          </GuideCard>
        </div>
      </div>
    </PageShell>
  );
}

function GuideCard({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pink-50 text-brand-pink">
          <Icon size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-black">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "info" | "warning" | "muted" | "danger";
}) {
  const classes = {
    success: "border-green-200 bg-green-50 text-green-700",
    info: "border-blue-200 bg-blue-50 text-brand-blue",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    muted: "border-gray-200 bg-gray-50 text-gray-600",
    danger: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${classes[tone]}`}>
      {label}
    </span>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbf7fa] px-4 py-3 text-sm">
      <span className="font-bold text-black">{label}</span>
      <span className={`inline-flex items-center gap-1.5 font-extrabold ${ok ? "text-green-700" : "text-[var(--muted)]"}`}>
        <Icon size={16} aria-hidden />
        {value}
      </span>
    </div>
  );
}

function PermissionHelper({
  permission,
}: {
  permission: "unsupported" | "default" | "granted" | "denied";
}) {
  if (permission === "granted") {
    return (
      <p className="mt-3 text-sm font-semibold leading-7 text-green-700">
        تم السماح بالإشعارات من المتصفح. يمكنك الآن حفظ الجهاز وإرسال إشعار اختبار.
      </p>
    );
  }

  if (permission === "denied") {
    return (
      <p className="mt-3 text-sm font-semibold leading-7 text-red-700">
        تم حظر الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.
      </p>
    );
  }

  if (permission === "unsupported") {
    return (
      <p className="mt-3 text-sm font-semibold leading-7 text-[var(--muted)]">
        هذا المتصفح لا يدعم إشعارات الويب.
      </p>
    );
  }

  return (
    <p className="mt-3 text-sm font-semibold leading-7 text-[var(--muted)]">
      لن يظهر طلب صلاحية الإشعارات إلا بعد الضغط على زر التفعيل.
    </p>
  );
}

function getInstallState(installPrompt: ReturnType<typeof usePwaInstallPrompt>) {
  if (installPrompt.isInstalled) {
    return { label: "مثبت", tone: "success" as const };
  }

  if (installPrompt.canInstall) {
    return { label: "يمكن التثبيت", tone: "info" as const };
  }

  if (installPrompt.isIos) {
    return { label: "iPhone يحتاج تثبيت يدوي", tone: "warning" as const };
  }

  return { label: "تثبيت يدوي أو غير مدعوم", tone: "muted" as const };
}

function getPermissionState(permission: "unsupported" | "default" | "granted" | "denied") {
  if (permission === "granted") {
    return { label: "مسموح", tone: "success" as const };
  }

  if (permission === "denied") {
    return { label: "محظور", tone: "danger" as const };
  }

  if (permission === "unsupported") {
    return { label: "غير مدعوم", tone: "muted" as const };
  }

  return { label: "لم يتم الطلب", tone: "warning" as const };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
