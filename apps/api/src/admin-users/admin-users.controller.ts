import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AdminGuard } from "../common/guards/admin.guard";
import { AdminUsersService } from "./admin-users.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@UseGuards(AdminGuard)
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.create(dto);
  }

  @Patch(":id/password")
  changePassword(
    @Param("id") id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.adminUsersService.changePassword(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() req: Request) {
    const admin = (req as any).admin;
    return this.adminUsersService.remove(id, admin.id);
  }
}
