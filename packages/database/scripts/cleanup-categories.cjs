const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const rootDir = path.resolve(__dirname, "../../..");
const envPath = path.join(rootDir, ".env");

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] ||= value;
  }
}

const prisma = new PrismaClient();

const desiredCategories = [
  {
    slug: "pajames",
    nameAr: "بيچامات",
    nameEn: "Pajamas",
  },
  {
    slug: "winterpajamas",
    nameAr: "كوليكشن الشتوي",
    nameEn: "Winter Collection",
  },
  {
    slug: "bellydance",
    nameAr: "الرقص الشرقي",
    nameEn: "Belly Dance",
  },
  {
    slug: "lingerie",
    nameAr: "لانچيرى",
    nameEn: "Lingerie",
  },
  {
    slug: "sheinpijama",
    nameAr: "بيجامات شي إن",
    nameEn: "Shein Pajamas",
  },
  {
    slug: "cashmaillot",
    nameAr: "كاشـات و فساتيـن",
    nameEn: "Coverups and Dresses",
  },
  {
    slug: "curvy",
    nameAr: "الكيرفي & مقاسـات كبيره",
    nameEn: "Curvy and Plus Sizes",
  },
  {
    slug: "satin",
    nameAr: "سـاتـان حريـر - Silky Satin",
    nameEn: "Silky Satin",
  },
  {
    slug: "under-wear",
    nameAr: "ملابس داخلية",
    nameEn: "Underwear",
  },
  {
    slug: "vipcollection",
    nameAr: "VIP - عرائس و هوانم",
    nameEn: "VIP Collection",
  },
];

const desiredSlugs = new Set(desiredCategories.map((category) => category.slug));

function escapeCell(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

async function categorySnapshot() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    include: {
      _count: { select: { products: true } },
      products: { select: { status: true } },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    nameAr: category.nameAr,
    nameEn: category.nameEn,
    slug: category.slug,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
    activeProductCount: category.products.filter(
      (product) => product.status === "ACTIVE",
    ).length,
  }));
}

function isAdminTest(category) {
  const text = `${category.nameAr ?? ""} ${category.nameEn ?? ""} ${category.slug}`.toLowerCase();
  return text.includes("admin test") || text.includes("admin-test");
}

function isUncategorized(category) {
  const text = `${category.nameAr ?? ""} ${category.nameEn ?? ""} ${category.slug}`.toLowerCase();
  return (
    text.includes("uncategorized") ||
    text.includes("غير مصنف") ||
    text.includes("بدون تصنيف")
  );
}

async function main() {
  const before = await categorySnapshot();
  const actions = [];

  await prisma.$transaction(async (tx) => {
    for (const [index, desired] of desiredCategories.entries()) {
      const existing = await tx.category.findUnique({
        where: { slug: desired.slug },
      });

      if (existing) {
        await tx.category.update({
          where: { slug: desired.slug },
          data: {
            nameAr: desired.nameAr,
            nameEn: desired.nameEn,
            isActive: true,
            sortOrder: index + 1,
          },
        });
        actions.push(
          `Updated ${desired.slug} -> ${desired.nameAr}, sortOrder ${index + 1}, active`,
        );
      } else {
        await tx.category.create({
          data: {
            slug: desired.slug,
            nameAr: desired.nameAr,
            nameEn: desired.nameEn,
            isActive: true,
            sortOrder: index + 1,
          },
        });
        actions.push(`Created missing desired category ${desired.slug}`);
      }
    }

    const allCategories = await tx.category.findMany({
      include: { _count: { select: { products: true } } },
    });

    for (const category of allCategories) {
      if (desiredSlugs.has(category.slug)) continue;

      if (isAdminTest(category) && category._count.products === 0) {
        await tx.category.delete({ where: { id: category.id } });
        actions.push(`Deleted empty admin test category ${category.slug}`);
        continue;
      }

      await tx.category.update({
        where: { id: category.id },
        data: { isActive: false, sortOrder: 9000 },
      });

      if (isAdminTest(category)) {
        actions.push(
          `Deactivated admin test category ${category.slug} because it has ${category._count.products} product(s)`,
        );
      } else if (isUncategorized(category)) {
        actions.push(
          `Deactivated Uncategorized category ${category.slug}; products were not changed`,
        );
      } else {
        actions.push(
          `Deactivated non-header category ${category.slug}; products were not changed`,
        );
      }
    }
  });

  const after = await categorySnapshot();
  const finalHeader = after
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.nameAr.localeCompare(b.nameAr));

  const productsAffected = before
    .filter(
      (category) =>
        !desiredSlugs.has(category.slug) &&
        category.productCount > 0 &&
        after.some((next) => next.slug === category.slug && !next.isActive),
    )
    .map((category) => ({
      slug: category.slug,
      nameAr: category.nameAr,
      productCount: category.productCount,
      action: "Category deactivated only; products unchanged",
    }));

  const report = [
    "# SleepyWear Category Cleanup Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Categories Before",
    "",
    markdownTable(
      ["Arabic name", "English name", "Slug", "Active", "Sort", "Products"],
      before.map((category) => [
        category.nameAr,
        category.nameEn,
        category.slug,
        category.isActive ? "Active" : "Inactive",
        category.sortOrder,
        category.productCount,
      ]),
    ),
    "",
    "## Actions",
    "",
    ...actions.map((action) => `- ${action}`),
    "",
    "## Categories After",
    "",
    markdownTable(
      ["Arabic name", "English name", "Slug", "Active", "Sort", "Products"],
      after.map((category) => [
        category.nameAr,
        category.nameEn,
        category.slug,
        category.isActive ? "Active" : "Inactive",
        category.sortOrder,
        category.productCount,
      ]),
    ),
    "",
    "## Final Header Order",
    "",
    markdownTable(
      ["Order", "Arabic name", "English name", "Slug", "Products"],
      finalHeader.map((category) => [
        category.sortOrder,
        category.nameAr,
        category.nameEn,
        category.slug,
        category.productCount,
      ]),
    ),
    "",
    "## Products Affected",
    "",
    productsAffected.length
      ? markdownTable(
          ["Category", "Slug", "Products", "Action"],
          productsAffected.map((category) => [
            category.nameAr,
            category.slug,
            category.productCount,
            category.action,
          ]),
        )
      : "No products were changed or moved.",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(rootDir, "category-cleanup-report.md"),
    report,
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        beforeCount: before.length,
        afterCount: after.length,
        activeAfter: finalHeader.length,
        finalHeader: finalHeader.map((category) => ({
          sortOrder: category.sortOrder,
          nameAr: category.nameAr,
          slug: category.slug,
          products: category.productCount,
        })),
        productsAffected,
        report: path.join(rootDir, "category-cleanup-report.md"),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
