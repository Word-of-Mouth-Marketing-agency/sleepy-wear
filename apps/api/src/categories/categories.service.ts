import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma, ProductStatus } from "@prisma/client";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { mapProduct } from "../products/products.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const categories = await this.prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
      include: {
        _count: {
          select: {
            products: { where: { status: ProductStatus.ACTIVE } },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      slug: category.slug,
      descriptionAr: category.descriptionAr,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount: category._count.products,
    }));
  }

  async findOne(slug: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException("Category not found");
    }

    const where: Prisma.ProductWhereInput = {
      categoryId: category.id,
      status: ProductStatus.ACTIVE,
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: {
            orderBy: { sku: "asc" },
            include: { size: true, color: true, images: { orderBy: { sortOrder: "asc" } } },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      category: {
        id: category.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        slug: category.slug,
        descriptionAr: category.descriptionAr,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
        productCount: total,
      },
      products: {
        items: products.map(mapProduct),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureCategory(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const category = await this.ensureCategory(id);

    const count = await this.prisma.product.count({ where: { categoryId: id } });
    if (count === 0) {
      await this.prisma.category.delete({ where: { id } });
      return { id, deleted: true, reassignedProducts: 0 };
    }

    if (category.slug === "uncategorized") {
      throw new ConflictException(
        "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u062a\u0635\u0646\u064a\u0641 \u063a\u064a\u0631 \u0645\u0635\u0646\u0641 \u0644\u0623\u0646\u0647 \u064a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0645\u0646\u062a\u062c\u0627\u062a.",
      );
    }

    const uncategorized = await this.prisma.$transaction(async (tx) => {
      const fallback = await tx.category.upsert({
        where: { slug: "uncategorized" },
        update: {
          isActive: false,
          nameAr: "\u063a\u064a\u0631 \u0645\u0635\u0646\u0641",
          nameEn: "Uncategorized",
        },
        create: {
          nameAr: "\u063a\u064a\u0631 \u0645\u0635\u0646\u0641",
          nameEn: "Uncategorized",
          slug: "uncategorized",
          isActive: false,
          sortOrder: 9999,
        },
      });

      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallback.id },
      });

      await tx.category.delete({ where: { id } });
      return fallback;
    });

    return {
      id,
      deleted: true,
      reassignedProducts: count,
      reassignedToCategoryId: uncategorized.id,
    };
  }

  private async ensureCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }
}
