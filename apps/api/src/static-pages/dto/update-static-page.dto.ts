import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateStaticPageDto {
  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  contentAr?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
