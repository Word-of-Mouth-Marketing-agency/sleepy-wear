import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CouponType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from "@prisma/client";
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

    let shippingTotal = new Prisma.Decimal(0);
    if (dto.shippingCityId) {
      const shippingCity = await this.prisma.shippingCity.findUnique({
        where: { id: dto.shippingCityId, isActive: true },
      });
      if (!shippingCity)
        throw new BadRequestException("Invalid shipping city");
      shippingTotal = new Prisma.Decimal(shippingCity.price);
    }

    let couponId: string | null = null;
    let couponCode: string | null = null;
    let couponType: CouponType | null = null;
    let couponDiscountAmt = new Prisma.Decimal(0);
    let freeDelivery = false;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });
      if (!coupon) throw new BadRequestException("الكوبون غير صحيح");
      if (!coupon.isActive) throw new BadRequestException("هذا الكوبون غير نشط");
      const now = new Date();
      if (coupon.startsAt && coupon.startsAt > now)
        throw new BadRequestException("هذا الكوبون لم يبدأ بعد");
      if (coupon.expiresAt && coupon.expiresAt < now)
        throw new BadRequestException("انتهت صلاحية هذا الكوبون");
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
        throw new BadRequestException("تم استخدام هذا الكوبون لأقصى عدد مرات مسموح به");

      freeDelivery = coupon.type === CouponType.FREE_DELIVERY;

      couponId = coupon.id;
      couponCode = coupon.code;
      couponType = coupon.type;
    }

    return this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { include: { category: true } }, size: true, color: true },
      });

      if (variants.length !== variantIds.length) {
        throw new NotFoundException(
          "\u0628\u0639\u0636 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0641\u064a \u0627\u0644\u0633\u0644\u0629 \u0644\u0645 \u062a\u0639\u062f \u0645\u062a\u0648\u0641\u0631\u0629",
        );
      }

      for (const variant of variants) {
        const quantity = quantities.get(variant.id) ?? 0;
        if (
          variant.product.status !== ProductStatus.ACTIVE ||
          !variant.product.category.isActive
        ) {
          throw new BadRequestException(OUT_OF_STOCK_MESSAGE);
        }
        if (variant.stock <= 0) {
          throw new BadRequestException(OUT_OF_STOCK_MESSAGE);
        }
        if (variant.stock < quantity) {
          throw new BadRequestException(INSUFFICIENT_STOCK_MESSAGE);
        }
      }

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

      if (couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
        if (!coupon) throw new BadRequestException("الكوبون غير صحيح");

        if (coupon.minimumOrderAmount && subtotal.lessThan(coupon.minimumOrderAmount)) {
          throw new BadRequestException(
            `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${coupon.minimumOrderAmount.toNumber()} جنيه`,
          );
        }

        if (coupon.type === CouponType.FIXED) {
          couponDiscountAmt = Prisma.Decimal.min(coupon.value, subtotal);
        } else if (coupon.type === CouponType.PERCENTAGE) {
          const percent = coupon.value.toNumber();
          couponDiscountAmt = subtotal.mul(percent).div(100);
          couponDiscountAmt = Prisma.Decimal.min(couponDiscountAmt, subtotal);
        }

        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      const finalShipping = freeDelivery ? new Prisma.Decimal(0) : shippingTotal;
      const discountTotal = couponDiscountAmt;
      const total = subtotal.add(finalShipping).sub(discountTotal);

      for (const variant of variants) {
        const quantity = quantities.get(variant.id) ?? 0;
        const result = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            stock: { gte: quantity },
            product: {
              status: ProductStatus.ACTIVE,
              category: { isActive: true },
            },
          },
          data: { stock: { decrement: quantity } },
        });
        if (result.count !== 1)
          throw new BadRequestException(INSUFFICIENT_STOCK_MESSAGE);
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
          shippingTotal: finalShipping,
          discountTotal,
          total,
          couponId,
          couponCode,
          couponType,
          couponDiscount: discountTotal,
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

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.order.delete({ where: { id } });
    return { id, deleted: true };
  }
}

const OUT_OF_STOCK_MESSAGE =
  "\u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u062d\u0627\u0644\u064a\u064b\u0627";
const INSUFFICIENT_STOCK_MESSAGE =
  "\u0627\u0644\u0643\u0645\u064a\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629";

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
    paymobClientSecret: order.paymobClientSecret,
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
    couponId: order.couponId,
    couponCode: order.couponCode,
    couponType: order.couponType,
    couponDiscount: order.couponDiscount?.toNumber() ?? null,
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
