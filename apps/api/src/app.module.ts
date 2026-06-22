import { Module } from "@nestjs/common";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AuthModule } from "./auth/auth.module";
import { BannersModule } from "./banners/banners.module";
import { CategoriesModule } from "./categories/categories.module";
import { ColorsModule } from "./colors/colors.module";
import { CouponsModule } from "./coupons/coupons.module";
import { CustomersModule } from "./customers/customers.module";
import { HealthModule } from "./health/health.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { SettingsModule } from "./settings/settings.module";
import { ShippingCitiesModule } from "./shipping-cities/shipping-cities.module";
import { SizesModule } from "./sizes/sizes.module";
import { StaticPagesModule } from "./static-pages/static-pages.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    AuthModule,
    AdminUsersModule,
    ProductsModule,
    CategoriesModule,
    SizesModule,
    ColorsModule,
    OrdersModule,
    PaymentsModule,
    CustomersModule,
    CouponsModule,
    UploadsModule,
    SettingsModule,
    ShippingCitiesModule,
    BannersModule,
    StaticPagesModule,
  ],
})
export class AppModule {}
