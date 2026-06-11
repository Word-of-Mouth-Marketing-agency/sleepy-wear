import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../common/guards/admin.guard";
import { CreateUploadPlaceholderDto } from "./dto/create-upload-placeholder.dto";
import { UploadsService } from "./uploads.service";

@UseGuards(AdminGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("product-image-placeholder")
  createProductImagePlaceholder(@Body() dto: CreateUploadPlaceholderDto) {
    return this.uploadsService.createProductImagePlaceholder(dto);
  }
}
