import path from "node:path";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { PrismaClient, ProductStatus } from "@prisma/client";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../../..");

loadEnv({ path: path.resolve(projectRoot, ".env") });

const IMAGE_SIZES = [
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

interface EasyOrderVariationProp {
  id: string;
  variation: string;
  variation_prop: string;
}

interface EasyOrderVariant {
  id: string;
  product_id: string;
  price: number;
  sale_price: number | null;
  quantity: number;
  taager_code: string | null;
  expense: number | null;
  thumb: string | null;
  variation_props: EasyOrderVariationProp[];
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
  quantity?: number | null;
  categories?: EasyOrderCategory[] | null;
  variants?: EasyOrderVariant[] | null;
}

interface ImportStats {
  total: number;
  created: number;
  updated: number;
  hidden: number;
  productImagesDl: number;
  productImagesSkipped: number;
  variantImagesDl: number;
  variantsCreated: number;
  variantsUpdated: number;
  oldVariantsDisabled: number;
  sizesCreated: number;
  colorsCreated: number;
  uncategorized: number;
  errors: number;
  errorMessages: string[];
}

const KEPT_CATEGORIES: Record<string, string[]> = {
  lingerie: ["lingerie"],
  cashmaillot: ["cashmaillot"],
  curvy: ["curvy"],
  under_wear: ["under-wear"],
  "under-wear": ["under-wear"],
  bellydance: ["bellydance"],
  belly_dance: ["bellydance"],
  pajamas: ["pajames"],
  pajames: ["pajames"],
  sheinpijama: ["sheinpijama"],
  "shein-pajama": ["sheinpijama"],
  shein_pajama: ["sheinpijama"],
  winterpajamas: ["winterpajamas"],
  "winter-pajamas": ["winterpajamas"],
  satin: ["satin"],
  vipcollection: ["vipcollection"],
  "vip-collection": ["vipcollection"],
  robes: [],
  "": [],
};

const UNCATEGORIZED_SLUG = "uncategorized";

const SIZE_CODES = /^[SMLX\s0-9]+$/i;
const SIZE_PATTERNS = [
  /^\d+$/,
  /^[SMLX]+$/i,
  /^(OneSize|one-?size|onesize).*$/i,
  /^\d+\s*-\s*\d+.*$/,
  /^(Large|Medium|Small)$/i,
];

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  let dir = "";
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir" && i + 1 < args.length) {
      dir = args[i + 1];
      i++;
    }
    if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }
  return { dir, dryRun };
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

function isSizeProp(prop: EasyOrderVariationProp): boolean {
  if (SIZE_CODES.test(prop.variation_prop.trim())) return true;
  for (const pat of SIZE_PATTERNS) {
    if (pat.test(prop.variation_prop.trim())) return true;
  }
  return false;
}

function normalizeSizeName(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (/^S$/.test(trimmed)) return "S";
  if (/^M$/.test(trimmed) || /^MEDIUM$/i.test(trimmed)) return "M";
  if (/^L$/.test(trimmed) || /^LARGE$/i.test(trimmed)) return "L";
  if (/^XL$/.test(trimmed) || /^\s*X\s*LARGE\s*$/i.test(trimmed)) return "XL";
  if (/^XXL$/.test(trimmed) || /^\s*XX\s*LARGE\s*$/i.test(trimmed)) return "XXL";
  if (/^XXXL$/.test(trimmed)) return "XXXL";
  if (/^XXXXL$/.test(trimmed)) return "XXXXL";
  if (/^\d+$/.test(trimmed)) return trimmed;
  if (/^OneSize/i.test(trimmed)) return "OneSize";
  return trimmed.replace(/\s+/g, "").slice(0, 10);
}

async function readJsonFiles(dir: string): Promise<EasyOrderProduct[]> {
  const files = await readdir(dir);
  const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();
  console.log(`Found ${jsonFiles.length} JSON files in ${dir}`);

  const all: EasyOrderProduct[] = [];
  for (const file of jsonFiles) {
    const raw = await readFile(path.join(dir, file), "utf-8");
    const parsed = JSON.parse(raw) as EasyOrderProduct[];
    console.log(`  ${file}: ${parsed.length} products`);
    all.push(...parsed);
  }

  const unique = new Map<string, EasyOrderProduct>();
  for (const p of all) {
    if (!unique.has(p.slug) || p.name > (unique.get(p.slug)?.name ?? "")) {
      unique.set(p.slug, p);
    }
  }

  console.log(`Total unique products: ${unique.size}`);
  return Array.from(unique.values());
}

function mapCategory(eoCategory: EasyOrderCategory): string | null {
  const eoSlug = (eoCategory.slug ?? "").toLowerCase().trim();
  if (!eoSlug) return null;

  const mapped = KEPT_CATEGORIES[eoSlug];
  if (mapped && mapped.length > 0) return mapped[0];

  for (const [key, targets] of Object.entries(KEPT_CATEGORIES)) {
    if (eoSlug.includes(key) || key.includes(eoSlug)) {
      if (targets.length > 0) return targets[0];
    }
  }

  return null;
}

async function getUploadDirs() {
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
    return buffer.length > 0 ? buffer : null;
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
  for (const size of IMAGE_SIZES) {
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

async function ensureSize(name: string, label: string, sortOrder: number): Promise<string> {
  const existing = await prisma.size.findFirst({
    where: { name },
  });
  if (existing) return existing.id;
  const created = await prisma.size.create({
    data: { name, labelAr: label, sortOrder },
  });
  return created.id;
}

async function ensureColor(nameAr: string): Promise<string> {
  const existing = await prisma.color.findFirst({ where: { nameAr } });
  if (existing) return existing.id;
  const id = `import-color-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const created = await prisma.color.create({
    data: { id, nameAr, hex: "#CCCCCC" },
  });
  return created.id;
}

async function ensureUncategorized(dryRun: boolean): Promise<string> {
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
      isActive: false,
    },
  });
  return created.id;
}

async function importProduct(
  product: EasyOrderProduct,
  productDir: string,
  defaultSizeId: string,
  defaultColorId: string,
  uncategorizedId: string,
  dryRun: boolean,
  stats: ImportStats,
) {
  const hidden = product.hidden ?? false;

  if (hidden) {
    stats.hidden++;
    if (dryRun) console.log(`  [HIDDEN] ${product.slug}`);
    return;
  }

  let categoryId: string | null = null;

  for (const cat of product.categories ?? []) {
    const mapped = mapCategory(cat);
    if (mapped) {
      const existing = await prisma.category.findUnique({ where: { slug: mapped } });
      if (existing?.isActive) {
        categoryId = existing.id;
        break;
      }
    }
  }

  if (!categoryId) {
    categoryId = uncategorizedId;
    stats.uncategorized++;
  }

  const realVariants = (product.variants ?? []).filter(
    (v) => v.variation_props && v.variation_props.length > 0,
  );

  if (dryRun) {
    console.log(
      `  [DRY-RUN] ${product.slug} → ${product.name}${realVariants.length > 0 ? ` (${realVariants.length} variants)` : ""}`,
    );
    stats.total++;
    return;
  }

  const existingProduct = await prisma.product.findUnique({
    where: { slug: product.slug },
    include: { images: true },
  });

  const productStatus = ProductStatus.ACTIVE;

  if (existingProduct) {
    const updateData: Record<string, unknown> = {};

    if (
      !existingProduct.descriptionAr ||
      existingProduct.descriptionAr.length < 20
    ) {
      const desc = stripHtml(product.description ?? "");
      if (desc.length > 10) updateData.descriptionAr = desc;
    }

    if (!existingProduct.nameAr || existingProduct.nameAr.length < 3) {
      updateData.nameAr = product.name;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: updateData,
      });
      stats.updated++;
    }

    await importRealVariants(
      existingProduct.id,
      product.slug,
      realVariants,
      defaultSizeId,
      defaultColorId,
      productDir,
      stats,
    );

    await importProductImages(
      existingProduct.id,
      product.slug,
      product.name,
      product.thumb,
      product.images,
      productDir,
      existingProduct.images.length,
      stats,
    );

    stats.total++;
    return;
  }

  // Create new product
  const prismaProduct = await prisma.product.create({
    data: {
      nameAr: product.name,
      slug: product.slug,
      descriptionAr: stripHtml(product.description ?? ""),
      categoryId,
      status: productStatus,
    },
  });

  stats.created++;

  if (realVariants.length > 0) {
    await importRealVariants(
      prismaProduct.id,
      product.slug,
      realVariants,
      defaultSizeId,
      defaultColorId,
      productDir,
      stats,
    );
  } else {
    // No real variants - create one default variant
    const sku = `EO-${product.slug}`.slice(0, 50);
    await prisma.productVariant.create({
      data: {
        productId: prismaProduct.id,
        sizeId: defaultSizeId,
        colorId: defaultColorId,
        sku,
        price: product.price ?? 0,
        salePrice: product.sale_price ?? null,
        stock: 999,
      },
    });
    stats.variantsCreated++;
  }

  await importProductImages(
    prismaProduct.id,
    product.slug,
    product.name,
    product.thumb,
    product.images,
    productDir,
    0,
    stats,
  );

  stats.total++;
}

async function importRealVariants(
  productId: string,
  productSlug: string,
  variants: EasyOrderVariant[],
  defaultSizeId: string,
  defaultColorId: string,
  productDir: string,
  stats: ImportStats,
) {
  const defaultSKU = `EO-${productSlug}`.slice(0, 50);

  const existingDefault = await prisma.productVariant.findFirst({
    where: { productId, sku: { startsWith: "EO-" } },
  });

  let defaultDisabled = false;

  for (const v of variants) {
    const props = v.variation_props ?? [];
    if (props.length === 0) continue;

    let sizeId = defaultSizeId;
    let colorId = defaultColorId;
    let colorName = "";

    for (const prop of props) {
      if (isSizeProp(prop)) {
        const sizeName = normalizeSizeName(prop.variation_prop);
        sizeId = await ensureSize(sizeName, sizeName, 100 + Object.keys(props).length);
        stats.sizesCreated++;
      } else {
        colorName = prop.variation_prop;
        colorId = await ensureColor(colorName);
        stats.colorsCreated++;
      }
    }

    const sku = v.taager_code || `EO-VAR-${v.id}`.slice(0, 50);

    const existingVariant = await prisma.productVariant.findFirst({
      where: { productId, sku },
    });

    if (existingVariant) {
      await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          price: v.price,
          salePrice: v.sale_price,
          stock: v.quantity > 0 ? v.quantity : 999,
          sizeId,
          colorId,
        },
      });
      stats.variantsUpdated++;
    } else {
      await prisma.productVariant.create({
        data: {
          productId,
          sizeId,
          colorId,
          sku,
          price: v.price,
          salePrice: v.sale_price,
          stock: v.quantity > 0 ? v.quantity : 999,
        },
      });
      stats.variantsCreated++;
    }

    // Disable old default EO- variant on first real variant
    if (existingDefault && !defaultDisabled) {
      await prisma.productVariant.update({
        where: { id: existingDefault.id },
        data: { stock: 0 },
      });
      stats.oldVariantsDisabled++;
      defaultDisabled = true;
    }

    // Import variant thumb image if available
    if (v.thumb) {
      const existingVariantImg = await prisma.productImage.findFirst({
        where: { productId, altAr: { startsWith: sku } },
      });
      if (!existingVariantImg) {
        const buffer = await downloadImage(v.thumb);
        if (buffer) {
          const baseName = `${productSlug}-${sku}`;
          const mediaUrl = await processAndSaveImage(buffer, baseName, productDir);
          await prisma.productImage.create({
            data: {
              productId,
              url: mediaUrl,
              altAr: `${sku} ${colorName || ""}`.trim(),
              sortOrder: 9000,
            },
          });
          stats.variantImagesDl++;
        }
      }
    }
  }
}

async function importProductImages(
  productId: string,
  productSlug: string,
  productName: string,
  thumb: string | null | undefined,
  images: string[] | null | undefined,
  productDir: string,
  _existingImageCount: number,
  stats: ImportStats,
) {
  const existingUrls = new Set(
    (await prisma.productImage.findMany({
      where: { productId },
      select: { url: true },
    })).map((i) => i.url),
  );

  const urls: string[] = [];
  if (thumb) urls.push(thumb);
  for (const img of images ?? []) {
    if (!urls.includes(img)) urls.push(img);
  }

  let index = existingUrls.size;
  let downloaded = false;

  for (let i = 0; i < urls.length; i++) {
    const baseName = `${productSlug}-${i}`;
    const mediaUrl = `/media/products/${baseName}.webp`;

    if (existingUrls.has(mediaUrl)) continue;

    const buffer = await downloadImage(urls[i]);
    if (!buffer) {
      stats.errorMessages.push(`${productSlug}: failed to download image ${i}`);
      continue;
    }
    await processAndSaveImage(buffer, baseName, productDir);
    await prisma.productImage.create({
      data: { productId, url: mediaUrl, altAr: productName, sortOrder: index++ },
    });
    stats.productImagesDl++;
    downloaded = true;
  }

  if (!downloaded) {
    stats.productImagesSkipped++;
  }
}

async function main() {
  const { dir, dryRun } = parseArgs();

  if (!dir) {
    console.error("Usage: npx tsx scripts/import-easyorders-json.ts --dir <path> [--dry-run]");
    process.exit(1);
  }

  console.log(dryRun ? "=== DRY RUN ===" : "=== REAL IMPORT ===");
  console.log(`Directory: ${dir}\n`);

  const stats: ImportStats = {
    total: 0,
    created: 0,
    updated: 0,
    hidden: 0,
    productImagesDl: 0,
    productImagesSkipped: 0,
    variantImagesDl: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    oldVariantsDisabled: 0,
    sizesCreated: 0,
    colorsCreated: 0,
    uncategorized: 0,
    errors: 0,
    errorMessages: [],
  };

  const products = await readJsonFiles(dir);
  const { productDir } = await getUploadDirs();

  const defaultSizeId = dryRun ? "dry-run" : (await prisma.size.findFirst({ where: { name: "\u0639\u0627\u0645" } }))?.id ?? "dry-run";
  const defaultColorId = dryRun ? "dry-run" : (await prisma.color.findFirst({ where: { nameAr: "\u0639\u0627\u0645" } }))?.id ?? "dry-run";
  const uncategorizedId = dryRun ? "dry-run-uncategorized" : await ensureUncategorized(dryRun);

  // Pre-count existing sizes and colors for accurate "created" stats
  const existingSizeCount = await prisma.size.count();
  const existingColorCount = await prisma.color.count();
  const existingVariantCount = await prisma.productVariant.count();

  console.log(`Processing ${products.length} products...\n`);

  for (const product of products) {
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
      stats.errors++;
      stats.errorMessages.push(`${product.slug}: ${err}`);
    }
  }

  const finalProductCount = dryRun ? 0 : await prisma.product.count();
  const finalVariantCount = dryRun ? 0 : await prisma.productVariant.count();

  const report = [
    "## EasyOrders JSON Import Report",
    "",
    `**Mode:** ${dryRun ? "DRY RUN" : "REAL IMPORT"}`,
    `**Directory:** ${dir}`,
    "",
    "| Metric | Count |",
    "|--------|-------|",
    `| Products scanned | ${products.length} |`,
    `| Hidden (skipped) | ${stats.hidden} |`,
    `| Products processed | ${stats.total} |`,
    `| Products created | ${stats.created} |`,
    `| Products updated | ${stats.updated} |`,
    `| Real variants created | ${stats.variantsCreated} |`,
    `| Real variants updated | ${stats.variantsUpdated} |`,
    `| Old default variants disabled | ${stats.oldVariantsDisabled} |`,
    `| Sizes created | ${stats.sizesCreated} |`,
    `| Colors created | ${stats.colorsCreated} |`,
    `| Product images downloaded | ${stats.productImagesDl} |`,
    `| Product images skipped | ${stats.productImagesSkipped} |`,
    `| Variant images downloaded | ${stats.variantImagesDl} |`,
    `| Uncategorized | ${stats.uncategorized} |`,
    `| Errors | ${stats.errors} |`,
    `| Final product count | ${finalProductCount} |`,
    `| Final variant count | ${finalVariantCount} |`,
    "",
  ];

  if (stats.errorMessages.length > 0) {
    report.push("### Errors");
    report.push("");
    for (const msg of stats.errorMessages) {
      report.push(`- ${msg}`);
    }
    report.push("");
  }

  report.push("### Baseline counts");
  report.push("");
  report.push(`| Sizes before | ${existingSizeCount} |`);
  report.push(`| Colors before | ${existingColorCount} |`);
  report.push(`| Variants before | ${existingVariantCount} |`);

  const reportText = report.join("\n");
  console.log("\n" + reportText);

  const reportPath = path.resolve(projectRoot, "easyorders-json-import-report.md");
  await writeFile(reportPath, reportText, "utf-8");
  console.log(`\nReport saved: ${reportPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
