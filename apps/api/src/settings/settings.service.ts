import { Injectable } from "@nestjs/common";
import { UpdateSettingDto } from "./dto/update-setting.dto";

@Injectable()
export class SettingsService {
  findPublic() {
    return { name: "SleepyWear", domain: "sleepyweareg.com", currency: "EGP" };
  }

  update(key: string, dto: UpdateSettingDto) {
    return { key, value: dto.value };
  }
}
