import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

class PushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;

  @IsOptional()
  expirationTime: unknown;
}

export class RegisterAdminPushDeviceDto {
  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;
}

export class DisableAdminPushDeviceDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}

export class SendTestNotificationDto {
  @IsOptional()
  @IsString()
  endpoint?: string;
}

export class SendOrderNotificationTestDto {
  @IsOptional()
  @IsString()
  endpoint?: string;
}
