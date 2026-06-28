import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProductStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where: Prisma.ProductWhereInput = {};

    if (query.status) {
      where.status = query.status;
    } else if (query.includeInactive !== "true") {
      where.status = ProductStatus.ACTIVE;
    }

    if (query.search) {
      where.OR = [
        { nameAr: { contains: query.search, mode: "insensitive" } },
        { nameEn: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    // The current schema does not yet contain featured/best-seller flags.
    void query.featured;
    void query.bestSeller;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(mapProduct),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
      include: productInclude,
    });

    if (!product) throw new NotFoundException("Product not found");
    return mapProduct(product);
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) throw new NotFoundException("Category not found");

    const resolvedVariants = await Promise.all(
      (dto.variants ?? []).map(async (v) => {
        const { sizeId, colorId } = await this.resolveVariantInput(v);
        return {
          sku: v.sku,
          price: new Prisma.Decimal(v.price),
          salePrice: v.salePrice ? new Prisma.Decimal(v.salePrice) : null,
          stock: v.stock ?? 0,
          sizeId,
          colorId,
        };
      }),
    );

    const product = await this.prisma.product.create({
      data: {
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        slug: dto.slug,
        descriptionAr: dto.descriptionAr,
        categoryId: dto.categoryId,
        status: dto.status ?? ProductStatus.DRAFT,
        variants: resolvedVariants.length
          ? { create: resolvedVariants }
          : undefined,
      },
      include: productInclude,
    });

    return mapProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureProduct(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        slug: dto.slug,
        descriptionAr: dto.descriptionAr,
        categoryId: dto.categoryId,
        status: dto.status,
      },
      include: productInclude,
    });

    return mapProduct(product);
  }

  async remove(id: string) {
    const product = await this.ensureProduct(id);

    const orderCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderCount > 0) {
      throw new BadRequestException(
        "لا يمكن حذف هذا المنتج لأنه مرتبط بطلبات سابقة.",
      );
    }

    await this.prisma.cartItem.deleteMany({ where: { productId: id } });

    await this.prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  }

  async findVariants(productId: string) {
    await this.ensureProduct(productId);
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      include: { size: true, color: true },
      orderBy: { sku: "asc" },
    });

    return variants.map(mapVariant);
  }

  async updateVariantStock(variantId: string, stock: number) {
    if (stock < 0) throw new BadRequestException("Stock cannot be negative");

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { size: true, color: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!variant) throw new NotFoundException("Variant not found");

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
      include: { size: true, color: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    return mapVariant(updated);
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    await this.ensureProduct(productId);
    const { sizeId, colorId } = await this.resolveVariantInput(dto);

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        sku: dto.sku,
        price: new Prisma.Decimal(dto.price),
        salePrice: dto.salePrice ? new Prisma.Decimal(dto.salePrice) : null,
        sizeId: sizeId ?? null,
        colorId: colorId ?? null,
        stock: dto.stock,
      },
      include: { size: true, color: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    if (dto.imageId) {
      await this.prisma.productImage.update({
        where: { id: dto.imageId },
        data: { variantId: variant.id },
      });
    }

    return mapVariant(variant);
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    await this.ensureVariant(variantId);

    let sizeId: string | null | undefined = undefined;
    let colorId: string | null | undefined = undefined;

    if (dto.sizeName !== undefined || dto.sizeId !== undefined) {
      const resolved = await this.resolveVariantInput({
        sizeId: dto.sizeId,
        colorId: undefined,
        sizeName: dto.sizeName,
        colorName: undefined,
      });
      sizeId = resolved.sizeId ?? null;
    }
    if (dto.colorName !== undefined || dto.colorId !== undefined) {
      const resolved = await this.resolveVariantInput({
        sizeId: undefined,
        colorId: dto.colorId,
        sizeName: undefined,
        colorName: dto.colorName,
      });
      colorId = resolved.colorId ?? null;
    }

    if (dto.imageId !== undefined) {
      if (dto.imageId) {
        await this.prisma.$transaction([
          this.prisma.productImage.updateMany({
            where: { variantId, id: { not: dto.imageId } },
            data: { variantId: null },
          }),
          this.prisma.productImage.update({
            where: { id: dto.imageId },
            data: { variantId },
          }),
        ]);
      } else {
        await this.prisma.productImage.updateMany({
          where: { variantId },
          data: { variantId: null },
        });
      }
    }

    const variant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        sku: dto.sku,
        price: dto.price ? new Prisma.Decimal(dto.price) : undefined,
        salePrice:
          dto.salePrice === undefined
            ? undefined
            : dto.salePrice
              ? new Prisma.Decimal(dto.salePrice)
              : null,
        sizeId:
          sizeId === undefined
            ? undefined
            : sizeId,
        colorId:
          colorId === undefined
            ? undefined
            : colorId,
        stock: dto.stock,
      },
      include: { size: true, color: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    return mapVariant(variant);
  }

  async removeVariant(variantId: string) {
    await this.ensureVariant(variantId);
    await this.prisma.productVariant.delete({ where: { id: variantId } });
    return { id: variantId, deleted: true };
  }

  private async ensureProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  private async ensureVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });
    if (!variant) throw new NotFoundException("Variant not found");
    return variant;
  }

  private async resolveSizeId(sizeId?: string, sizeName?: string): Promise<string | undefined> {
    if (sizeId) return sizeId;
    if (!sizeName) return undefined;
    const trimmed = sizeName.trim();
    if (!trimmed) return undefined;
    const existing = await this.prisma.size.findFirst({
      where: { labelAr: { equals: trimmed } },
    });
    if (existing) return existing.id;
    const created = await this.prisma.size.create({
      data: { name: trimmed, labelAr: trimmed, sortOrder: 0 },
    });
    return created.id;
  }

  private async resolveColorId(colorId?: string, colorName?: string): Promise<string | undefined> {
    if (colorId) return colorId;
    if (!colorName) return undefined;
    const trimmed = colorName.trim();
    if (!trimmed) return undefined;
    const existing = await this.prisma.color.findFirst({
      where: { nameAr: { equals: trimmed } },
    });
    if (existing) return existing.id;
    const created = await this.prisma.color.create({
      data: { nameAr: trimmed, hex: "#CCCCCC" },
    });
    return created.id;
  }

  private async resolveVariantInput(dto: {
    sizeId?: string;
    colorId?: string;
    sizeName?: string;
    colorName?: string;
  }) {
    const sizeId = await this.resolveSizeId(dto.sizeId, dto.sizeName);
    const colorId = await this.resolveColorId(dto.colorId, dto.colorName);
    return { sizeId, colorId };
  }
}

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  variants: {
    orderBy: { sku: "asc" },
    include: { size: true, color: true, images: { orderBy: { sortOrder: "asc" } } },
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;
type VariantWithRelations = ProductWithRelations["variants"][number];

type VariantWithOptionalImages = Prisma.ProductVariantGetPayload<{
  include: { size: true; color: true };
}>;

export function mapProduct(product: ProductWithRelations) {
  return {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    slug: product.slug,
    descriptionAr: product.descriptionAr,
    descriptionEn: product.descriptionEn,
    status: product.status,
    categoryId: product.categoryId,
    category: product.category,
    images: product.images,
    variants: product.variants.map(mapVariant),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function mapVariant(variant: VariantWithRelations | VariantWithOptionalImages) {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    price: variant.price.toNumber(),
    salePrice: variant.salePrice?.toNumber() ?? null,
    stock: variant.stock,
    size: variant.size,
    color: variant.color,
    images: "images" in variant ? variant.images : undefined,
  };
}
