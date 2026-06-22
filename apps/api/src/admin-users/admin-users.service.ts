import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { hashSync } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true, updatedAt: true },
    });
    return users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
  }

  async create(dto: CreateAdminUserDto) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("البريد الإلكتروني مستخدم بالفعل");

    const user = await this.prisma.adminUser.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashSync(dto.password, 12),
      },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true },
    });
    return { ...user, createdAt: user.createdAt.toISOString() };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("المستخدم غير موجود");

    await this.prisma.adminUser.update({
      where: { id },
      data: { passwordHash: hashSync(dto.password, 12) },
    });
    return { id, changed: true };
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException("لا يمكن حذف حسابك الحالي");
    }

    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("المستخدم غير موجود");

    const total = await this.prisma.adminUser.count();
    if (total <= 1) {
      throw new BadRequestException("لا يمكن حذف آخر مستخدم في النظام");
    }

    await this.prisma.adminUser.delete({ where: { id } });
    return { id, deleted: true };
  }
}
