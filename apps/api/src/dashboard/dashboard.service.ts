import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type DateRange = { start: Date; end: Date };

const PRESETS = ["today", "yesterday", "this_week", "this_month"] as const;
type Preset = (typeof PRESETS)[number];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(query: { preset?: string; from?: string; to?: string }) {
    const range = resolveDateRange(query, true);
    const deliveredCount = await this.prisma.order.count({
      where: { createdAt: { gte: range.start, lt: range.end }, status: OrderStatus.DELIVERED },
    });
    const cancelledCount = await this.prisma.order.count({
      where: { createdAt: { gte: range.start, lt: range.end }, status: OrderStatus.CANCELLED },
    });

    const [
      totalOrdersCount,
      nonCancelledAgg,
      deliveredAgg,
      cancelledAgg,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      codAgg,
      codCount,
      onlineAgg,
      onlineCount,
      paidAgg,
      paidCount,
      unpaidAgg,
      unpaidCount,
      itemsSold,
    ] = await this.prisma.$transaction([
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lt: range.end } },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          status: OrderStatus.DELIVERED,
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          status: OrderStatus.CANCELLED,
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lt: range.end }, status: OrderStatus.PENDING },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lt: range.end }, status: OrderStatus.CONFIRMED },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lt: range.end }, status: OrderStatus.PROCESSING },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lt: range.end }, status: OrderStatus.SHIPPED },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentMethod: PaymentMethod.COD,
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentMethod: PaymentMethod.COD,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentMethod: PaymentMethod.PAYMOB,
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentMethod: PaymentMethod.PAYMOB,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentStatus: PaymentStatus.PAID,
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentStatus: PaymentStatus.PAID,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentStatus: PaymentStatus.PENDING,
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentStatus: PaymentStatus.PENDING,
        },
      }),
      this.prisma.orderItem.aggregate({
        where: { order: { createdAt: { gte: range.start, lt: range.end } } },
        _sum: { quantity: true },
      }),
    ]);

    const totalValue = toNumber(nonCancelledAgg._sum.total);
    const nonCancelledCount = totalOrdersCount - cancelledCount;

    return {
      totalOrdersCount,
      totalOrdersValue: totalValue,
      deliveredOrdersCount: deliveredCount,
      deliveredOrdersValue: toNumber(deliveredAgg._sum.total),
      cancelledOrdersCount: cancelledCount,
      cancelledOrdersValue: toNumber(cancelledAgg._sum.total),
      pendingOrdersCount: pendingCount,
      confirmedOrdersCount: confirmedCount,
      processingOrdersCount: processingCount,
      shippedOrdersCount: shippedCount,
      averageOrderValue: nonCancelledCount > 0 ? Math.round(totalValue / nonCancelledCount) : 0,
      totalItemsSold: itemsSold._sum.quantity ?? 0,
      codOrdersCount: codCount,
      codOrdersValue: toNumber(codAgg._sum.total),
      onlineOrdersCount: onlineCount,
      onlineOrdersValue: toNumber(onlineAgg._sum.total),
      paidOrdersCount: paidCount,
      paidOrdersValue: toNumber(paidAgg._sum.total),
      unpaidOrdersCount: unpaidCount,
      unpaidOrdersValue: toNumber(unpaidAgg._sum.total),
    };
  }

  async getSummary(query: { preset?: string; from?: string; to?: string }) {
    const range = resolveDateRange(query);

    const [
      periodOrders,
      periodValue,
      periodPaidRevenue,
      pendingOrders,
      paidOrders,
      cancelledOrders,
      latestOrders,
      enabledDevices,
      recentFailures,
    ] = await this.prisma.$transaction([
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lt: range.end } },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          paymentStatus: PaymentStatus.PAID,
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: range.start, lt: range.end } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      this.prisma.adminPushDevice.count({ where: { enabled: true } }),
      this.prisma.notificationLog.count({
        where: {
          createdAt: { gte: range.start, lt: range.end },
          status: { in: ["failed", "disabled_expired"] },
        },
      }),
    ]);

    return {
      periodOrders,
      periodOrderValue: toNumber(periodValue._sum.total),
      periodPaidRevenue: toNumber(periodPaidRevenue._sum.total),
      pendingOrders,
      paidOrders,
      cancelledOrders,
      latestOrders: latestOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total.toNumber(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      })),
      notifications: {
        enabledDevices,
        recentFailures,
      },
    };
  }
}

function resolveDateRange(query: { preset?: string; from?: string; to?: string }, allowAll?: boolean): DateRange {
  if (query.preset === "all" && allowAll) {
    return { start: new Date(0), end: new Date("2100-01-01") };
  }
  if (query.preset && PRESETS.includes(query.preset as Preset)) {
    return getPresetRange(query.preset as Preset);
  }

  if (query.from || query.to) {
    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;

    if (from && isNaN(from.getTime())) {
      throw new BadRequestException("تاريخ البداية غير صالح");
    }
    if (to && isNaN(to.getTime())) {
      throw new BadRequestException("تاريخ النهاية غير صالح");
    }
    if (from && to && from > to) {
      throw new BadRequestException("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
    }

    const start = from ? new Date(from) : new Date(0);
    start.setHours(0, 0, 0, 0);

    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);
    end.setMilliseconds(999);

    const nextDay = new Date(end);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    return { start, end: nextDay };
  }

  return getPresetRange("today");
}

function getPresetRange(preset: Preset): DateRange {
  const now = new Date();

  switch (preset) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    case "yesterday": {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    case "this_week": {
      const start = new Date(now);
      const day = start.getDay();
      const diffToSun = day === 0 ? 0 : 7 - day;
      start.setDate(start.getDate() + diffToSun - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() + diffToSun + 1);
      end.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start, end };
    }
  }
}

function toNumber(value: Prisma.Decimal | null) {
  return value?.toNumber() ?? 0;
}
