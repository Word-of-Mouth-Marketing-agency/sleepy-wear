import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../../..");

loadEnv({ path: path.resolve(projectRoot, ".env") });

const prisma = new PrismaClient();

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(dryRun ? "=== DRY RUN ===" : "=== REAL CLEANUP ===");

  const allImages = await prisma.productImage.findMany({
    orderBy: { sortOrder: "asc" },
    include: { product: { select: { slug: true } } },
  });

  const seen = new Map<string, string[]>();
  for (const img of allImages) {
    const key = `${img.productId}|${img.url}`;
    const list = seen.get(key) ?? [];
    list.push(img.id);
    seen.set(key, list);
  }

  const toDelete: string[] = [];
  for (const [, ids] of seen) {
    if (ids.length > 1) {
      toDelete.push(...ids.slice(1));
    }
  }

  console.log(`Total images: ${allImages.length}`);
  console.log(`Duplicate images to remove: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log("No duplicates found.");
    return;
  }

  if (dryRun) {
    console.log("\nWould delete these IDs:");
    const detail = toDelete.map((id) => {
      const img = allImages.find((i) => i.id === id)!;
      return `${img.product.slug}: ${img.url} (sortOrder: ${img.sortOrder})`;
    });
    for (const d of detail.slice(0, 20)) console.log(`  ${d}`);
    if (detail.length > 20) console.log(`  ... and ${detail.length - 20} more`);
    return;
  }

  await prisma.productImage.deleteMany({
    where: { id: { in: toDelete } },
  });

  const remaining = await prisma.productImage.count();
  console.log(`Remaining images: ${remaining}`);

  const report = [
    `## Image Dedupe Report`,
    ``,
    `Total images before: ${allImages.length}`,
    `Duplicates removed: ${toDelete.length}`,
    `Remaining images: ${remaining}`,
    ``,
  ].join("\n");

  console.log(`\n${report}`);
  await writeFile(
    path.resolve(projectRoot, "image-dedupe-report.md"),
    report,
    "utf-8",
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
