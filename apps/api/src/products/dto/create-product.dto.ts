import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

enum ProductStatusDto {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

class ProductVariantDto {
  @IsString()
  sku: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  salePrice?: string;

  @IsOptional()
  sizeId?: string;

  @IsOptional()
  colorId?: string;
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
  slug: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsEnum(ProductStatusDto)
  status?: ProductStatusDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
