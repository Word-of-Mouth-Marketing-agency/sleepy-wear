import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CreateUploadPlaceholderDto } from "./dto/create-upload-placeholder.dto";

@Injectable()
export class UploadsService {
  private readonly uploadRoot = process.env.UPLOAD_PATH ?? "./uploads";

  async createProductImagePlaceholder(dto: CreateUploadPlaceholderDto) {
    const productDir = join(this.uploadRoot, "products");
    await mkdir(productDir, { recursive: true });

    const filename = `${dto.slug}.txt`;
    await writeFile(
      join(productDir, filename),
      "Replace with uploaded product image.\n",
      "utf8",
    );

    return { url: `/media/products/${filename}` };
  }

  /*
   * TODO: When adding real image uploads:
   * - validate file type and file size
   * - convert accepted images to webp with sharp
   * - create thumbnail, card, and large versions
   * - store only local paths; avoid Cloudinary/S3 for this phase
   */
}
