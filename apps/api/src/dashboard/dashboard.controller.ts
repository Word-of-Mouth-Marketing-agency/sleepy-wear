import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
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

  @Get("statistics")
  getStatistics(
    @Query("preset") preset?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    if (from && isNaN(new Date(from).getTime())) {
      throw new BadRequestException("تاريخ البداية غير صالح");
    }
    if (to && isNaN(new Date(to).getTime())) {
      throw new BadRequestException("تاريخ النهاية غير صالح");
    }
    return this.dashboardService.getStatistics({ preset, from, to });
  }
}
