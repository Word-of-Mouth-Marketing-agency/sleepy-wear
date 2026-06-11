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
import { AdminGuard } from "../common/guards/admin.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";
import { UpdateVariantStockDto } from "./dto/update-variant-stock.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(":id/variants")
  findVariants(@Param("id") id: string) {
    return this.productsService.findVariants(id);
  }

  @Get(":slug")
  findOne(@Param("slug") slugOrId: string) {
    return this.productsService.findOne(slugOrId);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(AdminGuard)
  @Post(":id/variants")
  createVariant(@Param("id") id: string, @Body() dto: CreateVariantDto) {
    return this.productsService.createVariant(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch("variants/:id")
  updateVariant(@Param("id") id: string, @Body() dto: UpdateVariantDto) {
    return this.productsService.updateVariant(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete("variants/:id")
  removeVariant(@Param("id") id: string) {
    return this.productsService.removeVariant(id);
  }

  @UseGuards(AdminGuard)
  @Patch("variants/:id/stock")
  updateVariantStock(
    @Param("id") id: string,
    @Body() dto: UpdateVariantStockDto,
  ) {
    return this.productsService.updateVariantStock(id, dto.stock);
  }
}
