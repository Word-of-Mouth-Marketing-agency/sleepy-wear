import { Module } from "@nestjs/common";
import { ShippingCitiesController } from "./shipping-cities.controller";
import { ShippingCitiesService } from "./shipping-cities.service";

@Module({
  controllers: [ShippingCitiesController],
  providers: [ShippingCitiesService],
})
export class ShippingCitiesModule {}
