import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ProductStatus } from "@prisma/client";

class ProductVariantDto {
  @IsString()
  sku: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  salePrice?: string;

  @IsOptional()
  @IsString()
  sizeId?: string;

  @IsOptional()
  @IsString()
  colorId?: string;

  @IsOptional()
  @IsString()
  sizeName?: string;

  @IsOptional()
  @IsString()
  colorName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  slug: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
