import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ListOrdersQueryDto } from "./dto/list-orders-query.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = query.status
      ? { status: query.status }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true, customer: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map(mapOrder),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });

    if (!order) throw new NotFoundException("Order not found");
    return mapOrder(order);
  }

  async create(dto: CreateOrderDto) {
    if (!dto.items.length)
      throw new BadRequestException("Order must include at least one item");

    const quantities = new Map<string, number>();
    for (const item of dto.items) {
      if (item.quantity < 1)
        throw new BadRequestException("Quantity must be at least 1");
      quantities.set(
        item.variantId,
        (quantities.get(item.variantId) ?? 0) + item.quantity,
      );
    }

    const variantIds = [...quantities.keys()];
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true, size: true, color: true },
    });

    if (variants.length !== variantIds.length) {
      throw new NotFoundException(
        "One or more product variants were not found",
      );
    }

    for (const variant of variants) {
      const quantity = quantities.get(variant.id) ?? 0;
      if (variant.stock < quantity)
        throw new BadRequestException(`Insufficient stock for ${variant.sku}`);
    }

    let shippingTotal = new Prisma.Decimal(0);
    if (dto.shippingCityId) {
      const shippingCity = await this.prisma.shippingCity.findUnique({
        where: { id: dto.shippingCityId, isActive: true },
      });
      if (!shippingCity)
        throw new BadRequestException("Invalid shipping city");
      shippingTotal = new Prisma.Decimal(shippingCity.price);
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone: dto.phone },
        update: {
          name: dto.customerName,
          email: dto.email,
          address: dto.address,
          city: dto.city,
        },
        create: {
          name: dto.customerName,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          city: dto.city,
        },
      });

      let subtotal = new Prisma.Decimal(0);
      const orderItems = variants.map((variant) => {
        const quantity = quantities.get(variant.id) ?? 0;
        const unitPrice = variant.salePrice ?? variant.price;
        const total = unitPrice.mul(quantity);
        subtotal = subtotal.add(total);

        return {
          productId: variant.productId,
          variantId: variant.id,
          productNameSnapshot: variant.product.nameAr,
          variantInfoSnapshot: [variant.size?.labelAr, variant.color?.nameAr]
            .filter(Boolean)
            .join(" / "),
          skuSnapshot: variant.sku,
          unitPriceSnapshot: unitPrice,
          quantity,
          total,
        };
      });

      for (const variant of variants) {
        const quantity = quantities.get(variant.id) ?? 0;
        const result = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (result.count !== 1)
          throw new BadRequestException(
            `Insufficient stock for ${variant.sku}`,
          );
      }

      const order = await tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          customerId: customer.id,
          customerName: dto.customerName,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          city: dto.city,
          notes: dto.notes,
          status: OrderStatus.PENDING,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          shippingTotal,
          total: subtotal.add(shippingTotal),
          items: { create: orderItems },
        },
        include: { items: true, customer: true },
      });

      return mapOrder(order);
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    const order = await this.prisma.order.update({
      where: { id },
      data: dto,
      include: { items: true, customer: true },
    });
    return mapOrder(order);
  }
}

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true; customer: true };
}>;

function mapOrder(order: OrderWithItems) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymobIntentionId: order.paymobIntentionId,
    paymobTransactionId: order.paymobTransactionId,
    paymobOrderId: order.paymobOrderId,
    paidAt: order.paidAt?.toISOString() ?? null,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    address: order.address,
    city: order.city,
    notes: order.notes,
    subtotal: order.subtotal.toNumber(),
    discountTotal: order.discountTotal.toNumber(),
    shippingTotal: order.shippingTotal.toNumber(),
    total: order.total.toNumber(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productNameSnapshot: item.productNameSnapshot,
      variantInfoSnapshot: item.variantInfoSnapshot,
      skuSnapshot: item.skuSnapshot,
      unitPriceSnapshot: item.unitPriceSnapshot.toNumber(),
      quantity: item.quantity,
      total: item.total.toNumber(),
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function createOrderNumber() {
  return `SW-${Date.now().toString(36).toUpperCase()}`;
}
