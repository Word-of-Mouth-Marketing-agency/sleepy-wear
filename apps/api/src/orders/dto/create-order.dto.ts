import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class OrderItemDto {
  @IsString()
  variantId: string;

  @IsString()
  quantity: string;
}

export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
