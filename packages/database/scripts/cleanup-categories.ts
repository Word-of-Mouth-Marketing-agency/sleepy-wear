import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

loadEnv({
  path: path.resolve(scriptDir, "../../../.env"),
});

const prisma = new PrismaClient();

const KEEP_SLUGS = new Set([
  "satin",
  "vipcollection",
  "curvy",
  "under-wear",
  "winterpajamas",
  "pajames",
  "cashmaillot",
  "bellydance",
  "lingerie",
  "sheinpijama",
]);

const SORT_ORDER: Record<string, number> = {
  satin: 1,
  vipcollection: 2,
  curvy: 3,
  "under-wear": 4,
  winterpajamas: 5,
  pajames: 6,
  cashmaillot: 7,
  bellydance: 8,
  lingerie: 9,
  sheinpijama: 10,
};

async function main() {
  const allCategories = await prisma.category.findMany();
  const uncategorized = allCategories.find((c) => c.slug === "uncategorized");

  if (!uncategorized) {
    console.error("Uncategorized category not found!");
    process.exit(1);
  }

  console.log(`Total categories: ${allCategories.length}`);
  console.log(`Uncategorized id: ${uncategorized.id}`);

  let productCount = await prisma.product.count();
  console.log(`Products before: ${productCount}`);

  // Deactivate unwanted categories and move their products
  for (const cat of allCategories) {
    if (KEEP_SLUGS.has(cat.slug)) continue;
    if (cat.slug === "uncategorized") continue;

    console.log(
      `Deactivating: ${cat.nameAr} (${cat.slug}, id: ${cat.id})`,
    );

    const moved = await prisma.product.updateMany({
      where: { categoryId: cat.id },
      data: { categoryId: uncategorized.id },
    });

    if (moved.count > 0) {
      console.log(`  Moved ${moved.count} products to uncategorized`);
    }

    await prisma.category.update({
      where: { id: cat.id },
      data: { isActive: false },
    });
  }

  // Set sort orders for kept categories
  for (const [slug, order] of Object.entries(SORT_ORDER)) {
    await prisma.category.update({
      where: { slug },
      data: { sortOrder: order, isActive: true },
    });
    console.log(`Reordered: ${slug} → sortOrder ${order}`);
  }

  // Fix lingerie spelling
  await prisma.category.update({
    where: { slug: "lingerie" },
    data: { nameAr: "لانچيرى" },
  });
  console.log("Fixed lingerie spelling → لانچيرى");

  // Ensure uncategorized stays inactive
  await prisma.category.update({
    where: { id: uncategorized.id },
    data: { isActive: false },
  });

  // Verify
  productCount = await prisma.product.count();
  const activeCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`\nProducts after: ${productCount}`);
  console.log(`Active categories: ${activeCategories.length}`);
  for (const c of activeCategories) {
    console.log(`  ${c.sortOrder}. ${c.nameAr} (${c.slug})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
