import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../common/guards/admin.guard";
import { ShippingCitiesService } from "./shipping-cities.service";
import { CreateShippingCityDto } from "./dto/create-shipping-city.dto";
import { UpdateShippingCityDto } from "./dto/update-shipping-city.dto";

@Controller("shipping-cities")
export class ShippingCitiesController {
  constructor(
    private readonly shippingCitiesService: ShippingCitiesService,
  ) {}

  @Get()
  findActive() {
    return this.shippingCitiesService.findActive();
  }

  @UseGuards(AdminGuard)
  @Get("admin")
  findAll() {
    return this.shippingCitiesService.findAll();
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateShippingCityDto) {
    return this.shippingCitiesService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateShippingCityDto) {
    return this.shippingCitiesService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.shippingCitiesService.remove(id);
  }
}
