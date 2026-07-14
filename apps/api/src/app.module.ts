import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AuthModule } from "./auth/auth.module";
import { BannersModule } from "./banners/banners.module";
import { CategoriesModule } from "./categories/categories.module";
import { ColorsModule } from "./colors/colors.module";
import { CouponsModule } from "./coupons/coupons.module";
import { CustomersModule } from "./customers/customers.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";
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
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 60000,
        limit: 60,
      },
    ]),
    HealthModule,
    PrismaModule,
    AuthModule,
    AdminUsersModule,
    ProductsModule,
    CategoriesModule,
    SizesModule,
    ColorsModule,
    OrdersModule,
    NotificationsModule,
    PaymentsModule,
    CustomersModule,
    DashboardModule,
    CouponsModule,
    UploadsModule,
    SettingsModule,
    ShippingCitiesModule,
    BannersModule,
    StaticPagesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
