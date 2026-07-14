import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AdminGuard } from "../common/guards/admin.guard";
import { CouponsService } from "./coupons.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Controller("coupons")
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get("validate")
  validate(@Query("code") code: string, @Query("subtotal") subtotal: string) {
    return this.couponsService.validate(code, Number(subtotal) || 0);
  }

  @UseGuards(AdminGuard)
  @Get(":code")
  findOne(@Param("code") code: string) {
    return this.couponsService.findOne(code);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.couponsService.remove(id);
  }
}
