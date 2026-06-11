import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

enum CouponTypeDto {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(CouponTypeDto)
  type: CouponTypeDto;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
