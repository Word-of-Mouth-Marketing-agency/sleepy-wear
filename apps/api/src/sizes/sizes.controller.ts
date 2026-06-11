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
import { CreateSizeDto } from "./dto/create-size.dto";
import { UpdateSizeDto } from "./dto/update-size.dto";
import { SizesService } from "./sizes.service";

@Controller("sizes")
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Get()
  findAll() {
    return this.sizesService.findAll();
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateSizeDto) {
    return this.sizesService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSizeDto) {
    return this.sizesService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sizesService.remove(id);
  }
}
