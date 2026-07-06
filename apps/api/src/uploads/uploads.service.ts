import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { PrismaService } from "../prisma/prisma.service";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

type AllowedMime = (typeof ALLOWED_TYPES)[number];

type SizeVariant = { suffix: string; width: number };

const SIZES: SizeVariant[] = [
  { suffix: "", width: 1200 },
  { suffix: "-card", width: 400 },
  { suffix: "-thumb", width: 150 },
];

@Injectable()
export class UploadsService {
  private readonly uploadRoot: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadRoot = process.env.UPLOAD_PATH
      ? resolve(process.env.UPLOAD_PATH)
      : resolve(process.cwd(), "../../uploads");
  }

  async uploadProductImage(productId: string, file: Express.Multer.File) {
    this.validateFile(file);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException("Product not found");

    const dir = join(this.uploadRoot, "products");
    await mkdir(dir, { recursive: true });

    const baseName = `${productId}-${Date.now()}`;
    const image = sharp(file.buffer);

    for (const size of SIZES) {
      const filename = `${baseName}${size.suffix}.webp`;
      const filepath = join(dir, filename);
      const resized = image.clone().resize(size.width, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
      await writeFile(filepath, await resized.webp().toBuffer());
    }

    const sortOrder = await this.prisma.productImage.count({
      where: { productId },
    });

    const record = await this.prisma.productImage.create({
      data: {
        productId,
        url: `/media/products/${baseName}.webp`,
        sortOrder,
      },
    });

    return record;
  }

  async deleteProductImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException("Product image not found");

    await this.prisma.productImage.delete({ where: { id: imageId } });

    return { id: imageId, deleted: true };
  }

  async uploadBannerImage(file: Express.Multer.File) {
    this.validateFile(file);

    const dir = join(this.uploadRoot, "banners");
    await mkdir(dir, { recursive: true });

    const baseName = `banner-${Date.now()}`;
    const image = sharp(file.buffer);

    const sizes: SizeVariant[] = [
      { suffix: "", width: 1920 },
      { suffix: "-mobile", width: 768 },
    ];

    for (const size of sizes) {
      const filename = `${baseName}${size.suffix}.webp`;
      const filepath = join(dir, filename);
      const resized = image.clone().resize(size.width, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
      await writeFile(filepath, await resized.webp().toBuffer());
    }

    return { url: `/media/banners/${baseName}.webp` };
  }

  async uploadCategoryImage(file: Express.Multer.File) {
    this.validateFile(file);

    const dir = join(this.uploadRoot, "categories");
    await mkdir(dir, { recursive: true });

    const baseName = `cat-${Date.now()}`;
    const image = sharp(file.buffer);

    const sizes: SizeVariant[] = [
      { suffix: "", width: 600 },
      { suffix: "-thumb", width: 150 },
    ];

    for (const size of sizes) {
      const filename = `${baseName}${size.suffix}.webp`;
      const filepath = join(dir, filename);
      const resized = image.clone().resize(size.width, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
      await writeFile(filepath, await resized.webp().toBuffer());
    }

    return { url: `/media/categories/${baseName}.webp` };
  }

  private validateFile(file: Express.Multer.File) {
    if (!ALLOWED_TYPES.includes(file.mimetype as AllowedMime)) {
      throw new BadRequestException(
        "Invalid file type. Only JPG, PNG, WebP, and AVIF are allowed.",
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException("File too large. Maximum size is 5 MB.");
    }
  }
}
