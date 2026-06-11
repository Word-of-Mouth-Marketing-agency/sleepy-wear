import { IsString } from "class-validator";

export class CreateUploadPlaceholderDto {
  @IsString()
  slug: string;
}
