import { IsString } from "class-validator";

export class CreatePaymobIntentionDto {
  @IsString()
  orderId: string;
}
