import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AdminGuard } from "../common/guards/admin.guard";
import {
  DisableAdminPushDeviceDto,
  RegisterAdminPushDeviceDto,
  SendTestNotificationDto,
  SendOrderNotificationTestDto,
} from "./dto/register-admin-push-device.dto";
import { NotificationsService } from "./notifications.service";

@UseGuards(AdminGuard)
@Controller("admin/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("vapid-public-key")
  getVapidPublicKey() {
    return this.notificationsService.getVapidPublicKey();
  }

  @Post("devices/register")
  registerDevice(
    @Req() req: Request,
    @Body() dto: RegisterAdminPushDeviceDto,
  ) {
    const admin = (req as any).admin;
    return this.notificationsService.registerAdminPushDevice(admin.id, dto);
  }

  @Post("devices/disable-current")
  disableCurrentDevice(
    @Req() req: Request,
    @Body() dto: DisableAdminPushDeviceDto,
  ) {
    const admin = (req as any).admin;
    return this.notificationsService.disableAdminPushDevice(admin.id, dto);
  }

  @Get("devices")
  listDevices(@Req() req: Request) {
    const admin = (req as any).admin;
    return this.notificationsService.listAdminPushDevices(admin.id);
  }

  @Post("test")
  sendTestNotification(
    @Req() req: Request,
    @Body() dto: SendTestNotificationDto,
  ) {
    const admin = (req as any).admin;
    return this.notificationsService.sendTestNotification(admin.id, dto);
  }

  @Post("orders/:orderId/test")
  sendOrderNotificationTest(
    @Req() req: Request,
    @Param("orderId") orderId: string,
    @Body() dto: SendOrderNotificationTestDto,
  ) {
    const admin = (req as any).admin;
    return this.notificationsService.sendOrderNotificationTest(
      admin.id,
      orderId,
      dto,
    );
  }

  @Get("logs")
  listLogs(@Req() req: Request) {
    const admin = (req as any).admin;
    return this.notificationsService.listNotificationLogs(admin.id);
  }
}
