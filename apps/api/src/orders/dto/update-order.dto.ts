import { IsEnum, IsOptional, IsString } from "class-validator";

enum OrderStatusDto {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatusDto)
  status?: OrderStatusDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
