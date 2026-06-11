import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { PrismaClient, ProductStatus } from "@prisma/client";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../../..");

loadEnv({ path: path.resolve(projectRoot, ".env") });

type SizeVariant = { suffix: string; width: number };

const SIZES: SizeVariant[] = [
  { suffix: "", width: 1200 },
  { suffix: "-card", width: 400 },
  { suffix: "-thumb", width: 150 },
];

interface EasyOrderCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
}

interface EasyOrderProduct {
  id: string;
  name: string;
  slug: string;
  price?: number | null;
  sale_price?: number | null;
  description?: string | null;
  thumb?: string | null;
  images?: string[] | null;
  hidden?: boolean | null;
  track_stock?: boolean | null;
  quantity?: number | null;
  categories?: EasyOrderCategory[] | null;
}

const UNCATEGORIZED_SLUG = "uncategorized";

const SITEMAP_URL = "https://sleepy-wear.myeasyorders.com/sitemap.xml";
const JSON_BASE =
  "https://sleepy-wear.myeasyorders.com/_next/data/v4.0.56/products";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  let limit: number | undefined;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && i + 1 < args.length) {
      limit = Number.parseInt(args[i + 1], 10);
      i++;
    }
    if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { limit, dryRun };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToNameEn(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

function safeNumber(val: number | null | undefined, fallback: number): number {
  return typeof val === "number" && !Number.isNaN(val) ? val : fallback;
}

function safeString(val: string | null | undefined, fallback: string): string {
  return typeof val === "string" ? val : fallback;
}

function safeBoolean(
  val: boolean | null | undefined,
  fallback: boolean,
): boolean {
  return typeof val === "boolean" ? val : fallback;
}

async function fetchSitemap(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();

  const slugRegex = /\/products\/([^<]+)<\/loc>/g;
  const slugs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = slugRegex.exec(xml)) !== null) {
    slugs.push(match[1]);
  }

  return [...new Set(slugs)];
}

async function fetchProduct(
  slug: string,
): Promise<EasyOrderProduct | null> {
  try {
    const url = `${JSON_BASE}/${encodeURIComponent(slug)}.json`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`  [SKIP] ${slug} \u2014 HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (data.hasError || !data.pageProps?.product) {
      console.error(`  [SKIP] ${slug} \u2014 hasError or missing product`);
      return null;
    }

    return data.pageProps.product as EasyOrderProduct;
  } catch (err) {
    console.error(`  [SKIP] ${slug} \u2014 fetch error: ${err}`);
    return null;
  }
}

async function getUploadDirs(): Promise<{ uploadRoot: string; productDir: string }> {
  const uploadRoot = process.env.UPLOAD_PATH
    ? path.resolve(process.env.UPLOAD_PATH)
    : path.resolve(projectRoot, "uploads");

  const productDir = path.join(uploadRoot, "products");
  await mkdir(productDir, { recursive: true });

  return { uploadRoot, productDir };
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return null;
    return buffer;
  } catch {
    return null;
  }
}

async function processAndSaveImage(
  buffer: Buffer,
  baseName: string,
  productDir: string,
): Promise<string> {
  const image = sharp(buffer);

  for (const size of SIZES) {
    const filename = `${baseName}${size.suffix}.webp`;
    const filepath = path.join(productDir, filename);
    const resized = image.clone().resize(size.width, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    });
    await writeFile(filepath, await resized.webp().toBuffer());
  }

  return `/media/products/${baseName}.webp`;
}

async function ensureDefaultSize(): Promise<string> {
  const existing = await prisma.size.findFirst({
    where: { name: "\u0639\u0627\u0645" },
  });

  if (existing) return existing.id;

  const created = await prisma.size.create({
    data: {
      id: "import-size-default",
      name: "\u0639\u0627\u0645",
      labelAr: "\u0639\u0627\u0645 / Default",
      sortOrder: 999,
    },
  });

  return created.id;
}

async function ensureDefaultColor(): Promise<string> {
  const existing = await prisma.color.findFirst({
    where: { nameAr: "\u0639\u0627\u0645" },
  });

  if (existing) return existing.id;

  const created = await prisma.color.create({
    data: {
      id: "import-color-default",
      nameAr: "\u0639\u0627\u0645",
      nameEn: "Default",
      hex: "#CCCCCC",
    },
  });

  return created.id;
}

async function ensureUncategorizedCategory(dryRun: boolean): Promise<string | null> {
  const existing = await prisma.category.findUnique({
    where: { slug: UNCATEGORIZED_SLUG },
  });

  if (existing) return existing.id;
  if (dryRun) return `dry-run-${UNCATEGORIZED_SLUG}`;

  const created = await prisma.category.create({
    data: {
      nameAr: "\u063A\u064A\u0631 \u0645\u0635\u0646\u0641",
      nameEn: "Uncategorized",
      slug: UNCATEGORIZED_SLUG,
      sortOrder: 9999,
      isActive: true,
    },
  });

  return created.id;
}

async function importProduct(
  product: EasyOrderProduct,
  productDir: string,
  defaultSizeId: string,
  defaultColorId: string,
  uncategorizedId: string | null,
  dryRun: boolean,
  stats: {
    categories: number;
    products: number;
    images: number;
    variants: number;
    skipped: number;
  },
) {
  const categoryIds: string[] = [];

  for (const cat of safeArray(product.categories)) {
    const catSlug = cat.slug.toLowerCase();
    const existing = await prisma.category.findUnique({
      where: { slug: catSlug },
    });

    if (existing) {
      categoryIds.push(existing.id);
    } else if (!dryRun) {
      const created = await prisma.category.create({
        data: {
          nameAr: cat.name,
          nameEn: slugToNameEn(cat.slug),
          slug: catSlug,
          sortOrder: cat.position,
          isActive: true,
        },
      });
      stats.categories++;
      categoryIds.push(created.id);
    } else {
      stats.categories++;
      categoryIds.push(`dry-run-cat-${catSlug}`);
    }
  }

  let categoryId = categoryIds[0];

  if (!categoryId) {
    if (uncategorizedId) {
      categoryId = uncategorizedId;
      console.warn(
        `  [WARN] ${product.slug} \u2014 no categories, assigned to "Uncategorized"`,
      );
    } else {
      console.error(`  [SKIP] ${product.slug} \u2014 no categories found`);
      stats.skipped++;
      return;
    }
  }

  const hidden = safeBoolean(product.hidden, false);
  const productStatus = hidden
    ? ProductStatus.DRAFT
    : ProductStatus.ACTIVE;
  const description = stripHtml(safeString(product.description, ""));

  if (dryRun) {
    console.log(
      `  [DRY-RUN] Would import: ${product.name} (${product.slug})`,
    );
    console.log(
      `    status: ${productStatus}, price: ${safeNumber(product.price, 0)}, sale: ${safeNumber(product.sale_price, 0) || "N/A"}`,
    );
    console.log(
      `    category: ${categoryId}, images: ${safeArray(product.images).length + (product.thumb ? 1 : 0)}`,
    );
    stats.products++;
    return;
  }

  const prismaProduct = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      nameAr: product.name,
      nameEn: slugToNameEn(product.slug),
      descriptionAr: description,
      categoryId,
      status: productStatus,
    },
    create: {
      nameAr: product.name,
      nameEn: slugToNameEn(product.slug),
      slug: product.slug,
      descriptionAr: description,
      categoryId,
      status: productStatus,
    },
  });

  stats.products++;

  const existingImages = await prisma.productImage.count({
    where: { productId: prismaProduct.id },
  });

  if (existingImages > 0) {
    console.log(
      `  [SKIP] Images for ${product.slug} \u2014 ${existingImages} already exist`,
    );
  } else {
    const imageUrls: string[] = [];

    if (product.thumb) {
      imageUrls.push(product.thumb);
    }

    for (const img of safeArray(product.images)) {
      if (!imageUrls.includes(img)) {
        imageUrls.push(img);
      }
    }

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const imgBuffer = await downloadImage(url);

      if (!imgBuffer) {
        console.error(
          `  [WARN] ${product.slug} \u2014 could not download image ${i + 1}/${imageUrls.length}`,
        );
        continue;
      }

      const baseName = `${product.slug}-${i}`;
      const mediaUrl = await processAndSaveImage(
        imgBuffer,
        baseName,
        productDir,
      );

      await prisma.productImage.create({
        data: {
          productId: prismaProduct.id,
          url: mediaUrl,
          altAr: product.name,
          sortOrder: i,
        },
      });

      stats.images++;
    }
  }

  const sku = `EO-${product.slug}`;
  const existingVariant = await prisma.productVariant.findUnique({
    where: { sku },
  });

  if (existingVariant) {
    console.log(
      `  [SKIP] Variant for ${product.slug} \u2014 SKU ${sku} already exists`,
    );
  } else {
    const trackStock = safeBoolean(product.track_stock, false);
    const stock = trackStock
      ? Math.max(0, safeNumber(product.quantity, 0))
      : 999;

    await prisma.productVariant.create({
      data: {
        productId: prismaProduct.id,
        sizeId: defaultSizeId,
        colorId: defaultColorId,
        sku,
        price: safeNumber(product.price, 0),
        salePrice: safeNumber(product.sale_price, 0) || null,
        stock,
      },
    });

    stats.variants++;
  }
}

async function main() {
  const { limit, dryRun } = parseArgs();

  console.log("=== EasyOrders Product Import ===\n");

  if (dryRun) {
    console.log("DRY RUN \u2014 no changes will be made\n");
  }

  if (limit) {
    console.log(`Limit: ${limit} products\n`);
  }

  console.log("Fetching sitemap...");
  const allSlugs = await fetchSitemap();
  console.log(`Found ${allSlugs.length} product slugs\n`);

  const slugs = limit ? allSlugs.slice(0, limit) : allSlugs;

  const { productDir } = await getUploadDirs();

  let defaultSizeId: string;
  let defaultColorId: string;
  let uncategorizedId: string | null = null;

  if (!dryRun) {
    defaultSizeId = await ensureDefaultSize();
    defaultColorId = await ensureDefaultColor();
    uncategorizedId = await ensureUncategorizedCategory(dryRun);
    console.log(`Default size ID:  ${defaultSizeId}`);
    console.log(`Default color ID: ${defaultColorId}`);
    console.log(`Uncategorized category ID: ${uncategorizedId}\n`);
  } else {
    defaultSizeId = "dry-run-size";
    defaultColorId = "dry-run-color";
    uncategorizedId = "dry-run-uncategorized";
    console.log(`Product images will be saved to: ${productDir}\n`);
  }

  const stats = {
    categories: 0,
    products: 0,
    images: 0,
    variants: 0,
    skipped: 0,
  };

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    console.log(`[${i + 1}/${slugs.length}] ${slug}...`);

    const product = await fetchProduct(slug);

    if (!product) {
      stats.skipped++;
      continue;
    }

    try {
      await importProduct(
        product,
        productDir,
        defaultSizeId,
        defaultColorId,
        uncategorizedId,
        dryRun,
        stats,
      );
    } catch (err) {
      console.error(
        `  [ERROR] ${slug} \u2014 unexpected error: ${err}`,
      );
      stats.skipped++;
    }

    if (!dryRun && i < slugs.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`  Categories:   ${stats.categories}`);
  console.log(`  Products:     ${stats.products}`);
  console.log(`  Images:       ${stats.images}`);
  console.log(`  Variants:     ${stats.variants}`);
  console.log(`  Skipped:      ${stats.skipped}`);
  console.log(`  Total slugs:  ${slugs.length}`);

  if (dryRun) {
    console.log("\nDRY RUN completed \u2014 no changes were made");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
