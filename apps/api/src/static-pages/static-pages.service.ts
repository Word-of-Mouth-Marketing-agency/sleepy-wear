import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateStaticPageDto } from "./dto/update-static-page.dto";

@Injectable()
export class StaticPagesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly pageSelect = {
    id: true,
    slug: true,
    titleAr: true,
    contentAr: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  findAll() {
    return this.prisma.staticPage.findMany({
      select: this.pageSelect,
      orderBy: { slug: "asc" },
    });
  }

  async findPublicBySlug(slug: string) {
    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
      select: this.pageSelect,
    });

    if (!page || !page.isActive) {
      throw new NotFoundException("Page not found");
    }

    return page;
  }

  async findAdminBySlug(slug: string) {
    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
      select: this.pageSelect,
    });

    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  async update(slug: string, dto: UpdateStaticPageDto) {
    await this.findAdminBySlug(slug);

    return this.prisma.staticPage.update({
      where: { slug },
      data: dto,
      select: this.pageSelect,
    });
  }
}
