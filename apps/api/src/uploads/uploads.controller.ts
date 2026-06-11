import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdminGuard } from "../common/guards/admin.guard";
import { UploadsService } from "./uploads.service";

@UseGuards(AdminGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("product-image")
  @UseInterceptors(FileInterceptor("file"))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body("productId") productId?: string,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    if (!productId) throw new BadRequestException("productId is required");
    return this.uploadsService.uploadProductImage(productId, file);
  }

  @Delete("product-image/:id")
  deleteProductImage(@Param("id") id: string) {
    return this.uploadsService.deleteProductImage(id);
  }
}
