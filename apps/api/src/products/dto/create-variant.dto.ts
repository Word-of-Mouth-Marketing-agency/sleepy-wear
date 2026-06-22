import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateVariantDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock = 0;
}
