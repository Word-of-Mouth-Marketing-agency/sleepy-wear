import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  nameAr: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
