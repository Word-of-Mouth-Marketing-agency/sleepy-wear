import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CouponType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return coupons.map(mapCoupon);
  }

  async findOne(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });
    if (!coupon) throw new NotFoundException("الكوبون غير موجود");
    return mapCoupon(coupon);
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new BadRequestException("كود الكوبون موجود بالفعل");

    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code,
        type: dto.type,
        value:
          dto.type === CouponType.FREE_DELIVERY
            ? new Prisma.Decimal(0)
            : new Prisma.Decimal(dto.value),
        minimumOrderAmount: dto.minimumOrderAmount
          ? new Prisma.Decimal(dto.minimumOrderAmount)
          : undefined,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        usageLimit: dto.usageLimit,
      },
    });
    return mapCoupon(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.ensureCoupon(id);
    const data: Prisma.CouponUpdateInput = {};
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.type === CouponType.FREE_DELIVERY) {
      data.value = new Prisma.Decimal(0);
    } else if (dto.value !== undefined) {
      data.value = new Prisma.Decimal(dto.value);
    }
    if (dto.minimumOrderAmount !== undefined) {
      data.minimumOrderAmount = dto.minimumOrderAmount
        ? new Prisma.Decimal(dto.minimumOrderAmount)
        : null;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.startsAt !== undefined) data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data,
    });
    return mapCoupon(coupon);
  }

  async remove(id: string) {
    await this.ensureCoupon(id);
    const orderCount = await this.prisma.order.count({
      where: { couponId: id },
    });
    if (orderCount > 0) {
      throw new BadRequestException(
        "لا يمكن حذف هذا الكوبون لأنه مستخدم في طلبات سابقة.",
      );
    }
    await this.prisma.coupon.delete({ where: { id } });
    return { id, deleted: true };
  }

  async validate(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return { valid: false, discountAmount: 0, freeDelivery: false, message: "الكود غير صحيح" };
    }

    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, freeDelivery: false, message: "هذا الكوبون غير نشط" };
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return { valid: false, discountAmount: 0, freeDelivery: false, message: "هذا الكوبون لم يبدأ بعد" };
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { valid: false, discountAmount: 0, freeDelivery: false, message: "انتهت صلاحية هذا الكوبون" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, freeDelivery: false, message: "تم استخدام هذا الكوبون لأقصى عدد مرات مسموح به" };
    }

    const subtotalDec = new Prisma.Decimal(subtotal);
    if (coupon.minimumOrderAmount && subtotalDec.lessThan(coupon.minimumOrderAmount)) {
      return {
        valid: false,
        discountAmount: 0,
        freeDelivery: false,
        message: `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${coupon.minimumOrderAmount.toNumber()} جنيه`,
      };
    }

    if (coupon.type === CouponType.FREE_DELIVERY) {
      return { valid: true, discountAmount: 0, freeDelivery: true, message: "تم تطبيق الكوبون: شحن مجاني" };
    }

    if (coupon.type === CouponType.FIXED) {
      const discount = Math.min(coupon.value.toNumber(), subtotal);
      return { valid: true, discountAmount: discount, freeDelivery: false, message: `تم تطبيق الكوبون: خصم ${discount} جنيه` };
    }

    if (coupon.type === CouponType.PERCENTAGE) {
      const percent = coupon.value.toNumber();
      const discount = Math.min(subtotal * (percent / 100), subtotal);
      return { valid: true, discountAmount: discount, freeDelivery: false, message: `تم تطبيق الكوبون: خصم ${percent}%` };
    }

    return { valid: false, discountAmount: 0, freeDelivery: false, message: "الكود غير صالح" };
  }

  private async ensureCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException("Coupon not found");
    return coupon;
  }
}

function mapCoupon(coupon: {
  id: string;
  code: string;
  type: CouponType;
  value: Prisma.Decimal;
  minimumOrderAmount: Prisma.Decimal | null;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value.toNumber(),
    minimumOrderAmount: coupon.minimumOrderAmount?.toNumber() ?? null,
    isActive: coupon.isActive,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}
