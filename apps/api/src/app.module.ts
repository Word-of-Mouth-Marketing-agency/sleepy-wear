import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { CouponsModule } from "./coupons/coupons.module";
import { CustomersModule } from "./customers/customers.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { ProductsModule } from "./products/products.module";
import { SettingsModule } from "./settings/settings.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    HealthModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CustomersModule,
    CouponsModule,
    UploadsModule,
    SettingsModule,
  ],
})
export class AppModule {}
