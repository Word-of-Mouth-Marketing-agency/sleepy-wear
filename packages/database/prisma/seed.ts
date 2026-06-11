import { PrismaClient, ProductStatus } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const seedDir = path.dirname(fileURLToPath(import.meta.url));

loadEnv({
  path: path.resolve(seedDir, "../../../.env")
});

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    [
      { nameAr: "بيجامات", nameEn: "Pajamas", slug: "pajamas" },
      { nameAr: "لانجري", nameEn: "Lingerie", slug: "lingerie" },
      { nameAr: "روب منزلي", nameEn: "Robes", slug: "robes" },
    ].map((category, sortOrder) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { ...category, sortOrder, isActive: true },
        create: { ...category, sortOrder, isActive: true },
      }),
    ),
  );

  const sizes = await Promise.all(
    ["S", "M", "L", "XL"].map((name, sortOrder) =>
      prisma.size.upsert({
        where: { id: `seed-size-${name}` },
        update: { name, labelAr: name, sortOrder },
        create: { id: `seed-size-${name}`, name, labelAr: name, sortOrder },
      }),
    ),
  );

  const colors = await Promise.all(
    [
      {
        id: "seed-color-blush",
        nameAr: "وردي",
        nameEn: "Blush",
        hex: "#f4a6b7",
      },
      {
        id: "seed-color-black",
        nameAr: "أسود",
        nameEn: "Black",
        hex: "#111111",
      },
      {
        id: "seed-color-ivory",
        nameAr: "عاجي",
        nameEn: "Ivory",
        hex: "#fff4df",
      },
    ].map((color) =>
      prisma.color.upsert({
        where: { id: color.id },
        update: color,
        create: color,
      }),
    ),
  );

  const products = [
    {
      nameAr: "طقم نوم قطني",
      slug: "cotton-sleep-set",
      category: categories[0],
    },
    { nameAr: "بيجامة ساتان", slug: "satin-pajama", category: categories[0] },
    { nameAr: "روب ناعم", slug: "soft-robe", category: categories[2] },
    {
      nameAr: "طقم لانجري كلاسيك",
      slug: "classic-lingerie-set",
      category: categories[1],
    },
    {
      nameAr: "قميص نوم مريح",
      slug: "comfort-nightdress",
      category: categories[1],
    },
  ];

  for (const [index, item] of products.entries()) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        nameAr: item.nameAr,
        categoryId: item.category.id,
        status: ProductStatus.ACTIVE,
      },
      create: {
        nameAr: item.nameAr,
        nameEn: item.slug.replaceAll("-", " "),
        slug: item.slug,
        descriptionAr: "وصف تجريبي قابل للتعديل من لوحة الإدارة.",
        categoryId: item.category.id,
        status: ProductStatus.ACTIVE,
      },
    });

    await prisma.productImage.upsert({
      where: { id: `seed-image-${item.slug}` },
      update: {
        url: `/media/products/${item.slug}.webp`,
        altAr: item.nameAr,
        sortOrder: 0,
      },
      create: {
        id: `seed-image-${item.slug}`,
        productId: product.id,
        url: `/media/products/${item.slug}.webp`,
        altAr: item.nameAr,
        sortOrder: 0,
      },
    });

    for (const size of sizes.slice(0, 3)) {
      const color = colors[index % colors.length];
      await prisma.productVariant.upsert({
        where: { sku: `SW-${index + 1}-${size.name}` },
        update: {
          price: 850 + index * 50,
          salePrice: index % 2 === 0 ? 790 + index * 50 : null,
          stock: 12 + index,
        },
        create: {
          productId: product.id,
          sizeId: size.id,
          colorId: color.id,
          sku: `SW-${index + 1}-${size.name}`,
          price: 850 + index * 50,
          salePrice: index % 2 === 0 ? 790 + index * 50 : null,
          stock: 12 + index,
        },
      });
    }
  }

  await prisma.setting.upsert({
    where: { key: "store" },
    update: {
      value: {
        name: "SleepyWear",
        domain: "sleepyweareg.com",
        currency: "EGP",
      },
    },
    create: {
      key: "store",
      value: {
        name: "SleepyWear",
        domain: "sleepyweareg.com",
        currency: "EGP",
      },
    },
  });
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
