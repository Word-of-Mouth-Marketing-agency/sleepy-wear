import { IsOptional, IsString } from "class-validator";

export class CreateColorDto {
  @IsString()
  nameAr: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsString()
  hex: string;
}
