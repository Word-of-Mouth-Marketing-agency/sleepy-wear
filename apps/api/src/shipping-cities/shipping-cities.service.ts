import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateShippingCityDto } from "./dto/create-shipping-city.dto";
import { UpdateShippingCityDto } from "./dto/update-shipping-city.dto";

@Injectable()
export class ShippingCitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findActive() {
    return this.prisma.shippingCity.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  findAll() {
    return this.prisma.shippingCity.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  create(dto: CreateShippingCityDto) {
    return this.prisma.shippingCity.create({
      data: {
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        price: dto.price ?? 0,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateShippingCityDto) {
    return this.prisma.shippingCity.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.shippingCity.delete({ where: { id } });
  }
}
