import { ProductStatus } from "@prisma/client";
import { IsBooleanString, IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class ListProductsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsBooleanString()
  featured?: string;

  @IsOptional()
  @IsBooleanString()
  bestSeller?: string;

  @IsOptional()
  @IsBooleanString()
  includeInactive?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
