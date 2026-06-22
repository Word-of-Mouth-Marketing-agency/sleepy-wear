import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../common/guards/admin.guard";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findPublic() {
    return this.settingsService.findPublic();
  }

  @UseGuards(AdminGuard)
  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.settingsService.findOne(key);
  }

  @UseGuards(AdminGuard)
  @Patch(":key")
  update(@Param("key") key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(key, dto);
  }
}
