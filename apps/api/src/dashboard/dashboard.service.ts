import { Injectable } from "@nestjs/common";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const { start, end } = getTodayRange();

    const [
      todayOrders,
      pendingOrders,
      paidOrders,
      cancelledOrders,
      todayValue,
      paidRevenue,
      latestOrders,
      enabledDevices,
      recentFailures,
    ] = await this.prisma.$transaction([
      this.prisma.order.count({
        where: { createdAt: { gte: start, lt: end } },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lt: end },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lt: end },
          paymentStatus: PaymentStatus.PAID,
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
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
          createdAt: { gte: start, lt: end },
          status: { in: ["failed", "disabled_expired"] },
        },
      }),
    ]);

    return {
      todayOrders,
      pendingOrders,
      paidOrders,
      cancelledOrders,
      todayOrderValue: toNumber(todayValue._sum.total),
      paidRevenueToday: toNumber(paidRevenue._sum.total),
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

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function toNumber(value: Prisma.Decimal | null) {
  return value?.toNumber() ?? 0;
}
