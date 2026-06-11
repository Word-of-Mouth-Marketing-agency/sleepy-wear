import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSizeDto } from "./dto/create-size.dto";
import { UpdateSizeDto } from "./dto/update-size.dto";

@Injectable()
export class SizesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.size.findMany({ orderBy: { sortOrder: "asc" } });
  }

  create(dto: CreateSizeDto) {
    return this.prisma.size.create({ data: dto });
  }

  async update(id: string, dto: UpdateSizeDto) {
    await this.ensureSize(id);
    return this.prisma.size.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureSize(id);
    await this.prisma.size.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureSize(id: string) {
    const size = await this.prisma.size.findUnique({ where: { id } });
    if (!size) throw new NotFoundException("Size not found");
    return size;
  }
}
