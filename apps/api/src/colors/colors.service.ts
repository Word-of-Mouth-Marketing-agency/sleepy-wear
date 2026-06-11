import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateColorDto } from "./dto/create-color.dto";
import { UpdateColorDto } from "./dto/update-color.dto";

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.color.findMany({ orderBy: { nameAr: "asc" } });
  }

  create(dto: CreateColorDto) {
    return this.prisma.color.create({ data: dto });
  }

  async update(id: string, dto: UpdateColorDto) {
    await this.ensureColor(id);
    return this.prisma.color.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureColor(id);
    await this.prisma.color.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureColor(id: string) {
    const color = await this.prisma.color.findUnique({ where: { id } });
    if (!color) throw new NotFoundException("Color not found");
    return color;
  }
}
