import { Type } from "class-transformer";
import { IsInt, IsString, Min } from "class-validator";

export class CreateSizeDto {
  @IsString()
  name: string;

  @IsString()
  labelAr: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder = 0;
}
