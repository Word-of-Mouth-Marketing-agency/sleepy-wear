import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PaymobController } from "./paymob.controller";
import { PaymobService } from "./paymob.service";

@Module({
  imports: [PrismaModule],
  controllers: [PaymobController],
  providers: [PaymobService],
})
export class PaymentsModule {}
