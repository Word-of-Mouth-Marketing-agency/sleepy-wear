import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        titleAr: dto.titleAr ?? "بانر",
        titleEn: dto.titleEn,
        imageUrl: dto.imageUrl,
        href: dto.href,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
