import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../common/guards/admin.guard";
import { DashboardService } from "./dashboard.service";

@UseGuards(AdminGuard)
@Controller("admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  getSummary(
    @Query("preset") preset?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.dashboardService.getSummary({ preset, from, to });
  }
}
