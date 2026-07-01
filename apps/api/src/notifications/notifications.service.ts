import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import * as webPush from "web-push";
import { PrismaService } from "../prisma/prisma.service";
import {
  DisableAdminPushDeviceDto,
  RegisterAdminPushDeviceDto,
  SendOrderNotificationTestDto,
  SendTestNotificationDto,
} from "./dto/register-admin-push-device.dto";

type PushSendStatus = "sent" | "failed" | "disabled_expired" | "skipped";

type PushPayload = {
  title: string;
  body: string;
  url: string;
  type: string;
  orderId?: string;
};

type PushDevice = Prisma.AdminPushDeviceGetPayload<Record<string, never>>;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {
    this.configureWebPush();
  }

  getVapidPublicKey() {
    return { publicKey: process.env.WEB_PUSH_PUBLIC_VAPID_KEY ?? "" };
  }

  async registerAdminPushDevice(
    adminUserId: string,
    dto: RegisterAdminPushDeviceDto,
  ) {
    const endpoint = dto.subscription?.endpoint;
    const p256dh = dto.subscription?.keys?.p256dh;
    const auth = dto.subscription?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      throw new BadRequestException("Push subscription keys are required");
    }

    const device = await this.prisma.adminPushDevice.upsert({
      where: { endpoint },
      create: {
        adminUserId,
        deviceName: dto.deviceName,
        platform: dto.platform,
        endpoint,
        p256dh,
        auth,
        enabled: true,
        lastSeenAt: new Date(),
      },
      update: {
        adminUserId,
        deviceName: dto.deviceName,
        platform: dto.platform,
        p256dh,
        auth,
        enabled: true,
        lastSeenAt: new Date(),
      },
    });

    return this.toSafeDevice(device);
  }

  async disableAdminPushDevice(
    adminUserId: string,
    dto: DisableAdminPushDeviceDto,
  ) {
    const device = await this.prisma.adminPushDevice.findFirst({
      where: { adminUserId, endpoint: dto.endpoint },
    });

    if (!device) {
      return { ok: true, disabled: false };
    }

    await this.prisma.adminPushDevice.update({
      where: { id: device.id },
      data: { enabled: false },
    });

    return { ok: true, disabled: true };
  }

  async listAdminPushDevices(adminUserId: string) {
    const devices = await this.prisma.adminPushDevice.findMany({
      where: { adminUserId },
      orderBy: { lastSeenAt: "desc" },
    });

    return devices.map((device) => this.toSafeDevice(device));
  }

  async sendTestNotification(
    adminUserId: string,
    dto: SendTestNotificationDto,
  ) {
    this.assertWebPushConfigured();

    const devices = await this.prisma.adminPushDevice.findMany({
      where: {
        adminUserId,
        enabled: true,
        ...(dto.endpoint ? { endpoint: dto.endpoint } : {}),
      },
    });

    if (devices.length === 0) {
      throw new BadRequestException("No enabled push devices found");
    }

    return this.sendPayloadToDevices({
      devices,
      payload: {
        title: "Test notification",
        body: "Admin notifications are ready.",
        url: "/admin",
        type: "test",
      },
      logType: "test",
    });
  }

  async sendOrderNotificationTest(
    adminUserId: string,
    orderId: string,
    dto: SendOrderNotificationTestDto,
  ) {
    this.assertWebPushConfigured();

    const order = await this.getOrderForNotification(orderId);
    const devices = await this.prisma.adminPushDevice.findMany({
      where: {
        adminUserId,
        enabled: true,
        ...(dto.endpoint ? { endpoint: dto.endpoint } : {}),
      },
    });

    if (devices.length === 0) {
      throw new BadRequestException("No enabled push devices found");
    }

    return this.sendPayloadToDevices({
      devices,
      payload: this.createOrderPayload(order, "order_created_test"),
      logType: "order_created_test",
      orderId: order.id,
    });
  }

  async sendNewOrderNotification(orderId: string) {
    const order = await this.getOrderForNotification(orderId);
    const devices = await this.prisma.adminPushDevice.findMany({
      where: { enabled: true },
    });

    if (devices.length === 0) {
      return {
        attempted: 0,
        sent: 0,
        failed: 0,
        disabledExpired: 0,
        skipped: 0,
        results: [],
      };
    }

    if (!this.isWebPushConfigured()) {
      return this.logConfigurationFailureForDevices({
        devices,
        logType: "order_created",
        orderId: order.id,
      });
    }

    return this.sendPayloadToDevices({
      devices,
      payload: this.createOrderPayload(order, "order_created"),
      logType: "order_created",
      orderId: order.id,
      skipSuccessfulDuplicates: true,
    });
  }

  async listNotificationLogs(adminUserId: string) {
    return this.prisma.notificationLog.findMany({
      where: { adminUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        orderId: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        deviceId: true,
      },
    });
  }

  async logNotificationResult(input: {
    type: string;
    adminUserId?: string;
    deviceId?: string;
    status: string;
    errorMessage?: string;
    orderId?: string;
  }) {
    return this.prisma.notificationLog.create({
      data: {
        type: input.type,
        adminUserId: input.adminUserId,
        deviceId: input.deviceId,
        status: input.status,
        errorMessage: input.errorMessage,
        orderId: input.orderId,
      },
    });
  }

  private async sendPayloadToDevices(input: {
    devices: PushDevice[];
    payload: PushPayload;
    logType: string;
    orderId?: string;
    skipSuccessfulDuplicates?: boolean;
  }) {
    const results = [];

    for (const device of input.devices) {
      if (input.skipSuccessfulDuplicates && input.orderId) {
        const existingSuccess = await this.prisma.notificationLog.findFirst({
          where: {
            type: input.logType,
            orderId: input.orderId,
            deviceId: device.id,
            status: "sent",
          },
          select: { id: true },
        });

        if (existingSuccess) {
          results.push({ deviceId: device.id, status: "skipped" as const });
          continue;
        }
      }

      try {
        await webPush.sendNotification(
          {
            endpoint: device.endpoint,
            keys: {
              p256dh: device.p256dh,
              auth: device.auth,
            },
          },
          JSON.stringify(input.payload),
        );

        await this.logNotificationResult({
          adminUserId: device.adminUserId,
          deviceId: device.id,
          status: "sent",
          type: input.logType,
          orderId: input.orderId,
        });

        results.push({ deviceId: device.id, status: "sent" as const });
      } catch (error) {
        const statusCode = this.getWebPushStatusCode(error);
        const errorMessage = this.getSafePushErrorMessage(
          error,
          device.endpoint,
        );
        const expired = statusCode === 404 || statusCode === 410;
        const status = expired ? "disabled_expired" : "failed";

        if (expired) {
          await this.prisma.adminPushDevice.update({
            where: { id: device.id },
            data: { enabled: false },
          });
        }

        await this.logNotificationResult({
          adminUserId: device.adminUserId,
          deviceId: device.id,
          status,
          type: input.logType,
          orderId: input.orderId,
          errorMessage,
        });

        results.push({
          deviceId: device.id,
          status: status as PushSendStatus,
          errorMessage,
        });
      }
    }

    return {
      attempted: input.devices.length,
      sent: results.filter((result) => result.status === "sent").length,
      failed: results.filter((result) => result.status === "failed").length,
      disabledExpired: results.filter(
        (result) => result.status === "disabled_expired",
      ).length,
      skipped: results.filter((result) => result.status === "skipped").length,
      ok: results.some((result) => result.status === "sent"),
      results,
    };
  }

  private async logConfigurationFailureForDevices(input: {
    devices: PushDevice[];
    logType: string;
    orderId?: string;
  }) {
    const errorMessage = "Web Push VAPID keys are not configured";

    for (const device of input.devices) {
      await this.logNotificationResult({
        adminUserId: device.adminUserId,
        deviceId: device.id,
        status: "failed",
        type: input.logType,
        orderId: input.orderId,
        errorMessage,
      });
    }

    return {
      attempted: input.devices.length,
      sent: 0,
      failed: input.devices.length,
      disabledExpired: 0,
      skipped: 0,
      ok: false,
      results: input.devices.map((device) => ({
        deviceId: device.id,
        status: "failed" as const,
        errorMessage,
      })),
    };
  }

  private async getOrderForNotification(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  private createOrderPayload(
    order: {
      id: string;
      orderNumber: string;
      total: Prisma.Decimal;
    },
    type: "order_created" | "order_created_test",
  ): PushPayload {
    return {
      title: "New order received",
      body: `Order #${order.orderNumber} - ${formatMoney(order.total)} EGP`,
      url: `/admin/orders/${order.id}`,
      type,
      orderId: order.id,
    };
  }

  private configureWebPush() {
    const publicKey = process.env.WEB_PUSH_PUBLIC_VAPID_KEY;
    const privateKey = process.env.WEB_PUSH_PRIVATE_VAPID_KEY;
    const subject =
      process.env.WEB_PUSH_SUBJECT ?? "mailto:admin@sleepyweareg.com";

    if (!publicKey || !privateKey) {
      return;
    }

    webPush.setVapidDetails(subject, publicKey, privateKey);
  }

  private assertWebPushConfigured() {
    if (!this.isWebPushConfigured()) {
      throw new ServiceUnavailableException("Web Push VAPID keys are not configured");
    }
  }

  private isWebPushConfigured() {
    return Boolean(
      process.env.WEB_PUSH_PUBLIC_VAPID_KEY &&
        process.env.WEB_PUSH_PRIVATE_VAPID_KEY,
    );
  }

  private getWebPushStatusCode(error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
    ) {
      return (error as { statusCode: number }).statusCode;
    }

    return undefined;
  }

  private toSafeDevice(device: {
    id: string;
    deviceName: string | null;
    platform: string | null;
    endpoint: string;
    enabled: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: device.id,
      deviceName: device.deviceName,
      platform: device.platform,
      endpointHash: hashEndpoint(device.endpoint),
      enabled: device.enabled,
      lastSeenAt: device.lastSeenAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }

  private getSafePushErrorMessage(error: unknown, endpoint: string) {
    const rawMessage =
      error instanceof Error ? error.message : "Push send failed";
    return rawMessage.replaceAll(endpoint, "[push-endpoint]").slice(0, 500);
  }
}

function formatMoney(value: Prisma.Decimal) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value.toNumber());
}

function hashEndpoint(endpoint: string) {
  return createHash("sha256").update(endpoint).digest("hex");
}
