import { Body, Controller, Post, Query } from "@nestjs/common";
import { CreatePaymobIntentionDto } from "./dto/create-paymob-intention.dto";
import { PaymobService } from "./paymob.service";

@Controller("payments/paymob")
export class PaymobController {
  constructor(private readonly paymobService: PaymobService) {}

  @Post("create-intention")
  createIntention(@Body() dto: CreatePaymobIntentionDto) {
    return this.paymobService.createIntention(dto.orderId);
  }

  @Post("webhook")
  webhook(@Body() body: Record<string, unknown>, @Query("hmac") hmac?: string) {
    return this.paymobService.handleWebhook(body, hmac);
  }
}
