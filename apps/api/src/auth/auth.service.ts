import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compareSync, hashSync } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async adminLogin(dto: LoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !compareSync(dto.password, admin.passwordHash)) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!admin.isActive) {
      throw new UnauthorizedException("Account is disabled");
    }

    const token = this.jwt.sign({ sub: admin.id, email: admin.email });

    return {
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async seedAdmin(email: string, password: string, name: string) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) return existing;

    return this.prisma.adminUser.create({
      data: {
        email,
        name,
        passwordHash: hashSync(password, 12),
      },
    });
  }
}
