import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateStaticPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  contentAr?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
