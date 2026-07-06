import { PrismaClient, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const seedDir = path.dirname(fileURLToPath(import.meta.url));

loadEnv({
  path: path.resolve(seedDir, "../../../.env"),
});

const prisma = new PrismaClient();

const staticPages = [
  {
    slug: "shipping-policy",
    titleAr: "\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0634\u062d\u0646",
    contentAr: [
      "\u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u0634\u0631\u0627\u0621\u060c \u0646\u0642\u0648\u0645 \u0628\u0634\u062d\u0646 \u0648\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0646\u062a\u062c \u0639\u0628\u0631 \u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062a\u064a \u0642\u0645\u062a\u0645 \u0628\u0627\u062e\u062a\u064a\u0627\u0631\u0647\u0627\u060c \u0625\u0645\u0627 \u0639\u0628\u0631 \u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0634\u062d\u0646 \u0627\u0644\u062e\u0627\u0635 \u0628\u0646\u0627 \u0623\u0648 \u0639\u0628\u0631 \u062e\u062f\u0645\u0629 \u0623\u0645\u0627\u0646\u0629 \u0625\u0643\u0633\u0628\u0631\u064a\u0633.",
      "\u0637\u0631\u0642 \u0627\u0644\u0634\u062d\u0646:",
      "\u0623\u0645\u0627\u0646\u0629 \u0625\u0643\u0633\u0628\u0631\u064a\u0633: \u062e\u062f\u0645\u0629 \u062a\u0636\u0645\u0646 \u0644\u0643\u0645 \u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644\u064a\u0627\u062a \u0625\u0644\u0649 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0641\u064a \u0645\u062f\u0629 \u062a\u062a\u0631\u0627\u0648\u062d \u0628\u064a\u0646 3 \u0623\u064a\u0627\u0645 \u0648 7 \u0623\u064a\u0627\u0645 \u0646\u062d\u0648 \u0627\u0644\u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629.",
      "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0634\u062d\u0646: \u0645\u062a\u062c\u0631\u0646\u0627 \u064a\u062a\u0639\u0627\u0642\u062f \u0645\u0639 \u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u0646 \u0645\u0633\u0624\u0648\u0644\u064a \u0627\u0644\u0634\u062d\u0646 \u0628\u0645\u062c\u0645\u0648\u0639\u0629 \u0645\u0646 \u0627\u0644\u0645\u062f\u0646 \u064a\u0642\u0648\u0645\u0648\u0646 \u0628\u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0641\u064a \u0645\u062f\u0629 \u062a\u062a\u0631\u0627\u0648\u062d \u0628\u064a\u0646 \u064a\u0648\u0645 \u0648 3 \u0623\u064a\u0627\u0645.",
    ].join("\n\n"),
    isActive: true,
  },
  {
    slug: "privacy-policy",
    titleAr: "\u0633\u064a\u0627\u0633\u0627\u062a \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
    contentAr: [
      "\u0645\u0648\u0642\u0639\u0646\u0627 \u064a\u062d\u062a\u0631\u0645 \u062e\u0635\u0648\u0635\u064a\u062a\u0643 \u0648\u064a\u0633\u0639\u0649 \u0644\u062d\u0645\u0627\u064a\u0629 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0627\u0644\u0634\u062e\u0635\u064a\u0629.",
      "\u062a\u0648\u0636\u062d \u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629 \u0643\u064a\u0641\u064a\u0629 \u062c\u0645\u0639 \u0648\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0648\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u0645\u062a\u0628\u0639\u0629 \u0644\u0636\u0645\u0627\u0646 \u062e\u0635\u0648\u0635\u064a\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062a\u0643.",
      "\u0625\u0646 \u062d\u0645\u0627\u064a\u0629 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0623\u0645\u0631 \u0647\u0627\u0645 \u062c\u062f\u0627 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0625\u0644\u064a\u0646\u0627\u060c \u0648\u0646\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0642\u062f\u0645\u0647\u0627 \u0644\u0645\u0639\u0627\u0644\u062c\u0629 \u0637\u0644\u0628\u0627\u062a\u0643 \u0648\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.",
      "\u064a\u0645\u0643\u0646\u0643 \u062a\u0635\u0641\u062d \u0627\u0644\u0645\u0648\u0642\u0639 \u062f\u0648\u0646 \u0627\u0644\u062d\u0627\u062c\u0629 \u0625\u0644\u0649 \u062a\u0642\u062f\u064a\u0645 \u0623\u064a \u0628\u064a\u0627\u0646\u0627\u062a \u0634\u062e\u0635\u064a\u0629\u060c \u0648\u062a\u0628\u0642\u0649 \u0647\u0648\u064a\u062a\u0643 \u0645\u062c\u0647\u0648\u0644\u0629 \u062d\u062a\u0649 \u062a\u0642\u0648\u0645 \u0628\u062a\u0633\u062c\u064a\u0644 \u0637\u0644\u0628 \u0623\u0648 \u062a\u0642\u062f\u064a\u0645 \u0628\u064a\u0627\u0646\u0627\u062a \u0644\u0644\u062a\u0648\u0627\u0635\u0644.",
      "\u0646\u0633\u062a\u062e\u062f\u0645 \u062a\u0642\u0646\u064a\u0627\u062a \u0648\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0623\u0645\u0627\u0646 \u0645\u0644\u0627\u0626\u0645\u0629 \u0644\u0645\u0646\u0639 \u0623\u064a \u0648\u0635\u0648\u0644 \u063a\u064a\u0631 \u0645\u0635\u0631\u062d \u0628\u0647 \u0623\u0648 \u063a\u064a\u0631 \u0642\u0627\u0646\u0648\u0646\u064a \u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a\u0643.",
    ].join("\n\n"),
    isActive: true,
  },
  {
    slug: "returns-policy",
    titleAr: "\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0648 \u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639",
    contentAr: [
      "\u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u062d\u0642 \u0645\u0636\u0645\u0648\u0646 \u0644\u0643\u0644 \u0639\u0645\u0644\u0627\u0626\u0646\u0627 \u0648\u0647\u0648 \u064a\u0634\u0645\u0644 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u062a\u064a \u0646\u0639\u0631\u0636\u0647\u0627 \u0639\u0644\u0649 \u0645\u062a\u062c\u0631\u0646\u0627.",
      "\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629 \u0639\u0644\u0649 \u0645\u062a\u062c\u0631\u0646\u0627 \u0642\u0627\u0628\u0644\u0629 \u0644\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0648\u0641\u0642 \u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062d\u0643\u0627\u0645 \u0627\u0644\u0645\u0646\u0635\u0648\u0635 \u0639\u0644\u064a\u0647\u0627 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629.",
      "\u064a\u0645\u0643\u0646 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u0623\u0648 \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0645\u0646\u062a\u062c \u0628\u0646\u0641\u0633 \u062d\u0627\u0644\u062a\u0647 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0639\u0646\u062f \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0645\u063a\u0644\u0641\u0627 \u0628\u0627\u0644\u063a\u0644\u0627\u0641 \u0627\u0644\u0623\u0635\u0644\u064a.",
      "\u064a\u062a\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0623\u0648 \u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u062e\u0644\u0627\u0644 3 \u0623\u064a\u0627\u0645 \u0639\u0645\u0644.",
      "\u0641\u064a \u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062a\u0631\u062c\u0627\u0639 \u0648\u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644\u060c \u064a\u0635\u0644 \u0627\u0644\u0645\u0646\u062f\u0648\u0628 \u0644\u0644\u0639\u0645\u064a\u0644 \u062e\u0644\u0627\u0644 3-5 \u0623\u064a\u0627\u0645 \u0639\u0645\u0644.",
      "\u064a\u0631\u062c\u0649 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0639\u0628\u0631 \u062a\u0637\u0628\u064a\u0642 WhatsApp \u0644\u0637\u0644\u0628 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u0623\u0648 \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0645\u0639 \u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628.",
    ].join("\n\n"),
    isActive: true,
  },
] as const;

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existing = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    if (!existing) {
      await prisma.adminUser.create({
        data: {
          email: adminEmail,
          name: "Admin",
          passwordHash: bcrypt.hashSync(adminPassword, 12),
        },
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }
  } else {
    console.log(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.",
    );
  }
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
        descriptionAr: "وصف تجريبي قابل للتعديل من لوحة الإدارة.",
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
          sizeId: size.id,
          colorId: color.id,
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

  const shippingCities = [
    { nameAr: "القاهرة", nameEn: "Cairo", price: 50, sortOrder: 1 },
    { nameAr: "الجيزة", nameEn: "Giza", price: 50, sortOrder: 2 },
    { nameAr: "الإسكندرية", nameEn: "Alexandria", price: 60, sortOrder: 3 },
    { nameAr: "الدقهلية", nameEn: "Dakahlia", price: 60, sortOrder: 4 },
    { nameAr: "البحيرة", nameEn: "Beheira", price: 60, sortOrder: 5 },
    { nameAr: "القليوبية", nameEn: "Qalyubia", price: 50, sortOrder: 6 },
    { nameAr: "المنوفية", nameEn: "Monufia", price: 60, sortOrder: 7 },
    { nameAr: "الغربية", nameEn: "Gharbia", price: 60, sortOrder: 8 },
    { nameAr: "الشرقية", nameEn: "Sharqia", price: 60, sortOrder: 9 },
    { nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", price: 60, sortOrder: 10 },
    { nameAr: "دمياط", nameEn: "Damietta", price: 60, sortOrder: 11 },
    { nameAr: "بورسعيد", nameEn: "Port Said", price: 70, sortOrder: 12 },
    { nameAr: "الإسماعيلية", nameEn: "Ismailia", price: 70, sortOrder: 13 },
    { nameAr: "السويس", nameEn: "Suez", price: 70, sortOrder: 14 },
    { nameAr: "الفيوم", nameEn: "Fayoum", price: 65, sortOrder: 15 },
    { nameAr: "بني سويف", nameEn: "Beni Suef", price: 65, sortOrder: 16 },
    { nameAr: "المنيا", nameEn: "Minya", price: 70, sortOrder: 17 },
    { nameAr: "أسيوط", nameEn: "Asyut", price: 75, sortOrder: 18 },
    { nameAr: "سوهاج", nameEn: "Sohag", price: 75, sortOrder: 19 },
    { nameAr: "قنا", nameEn: "Qena", price: 80, sortOrder: 20 },
    { nameAr: "الأقصر", nameEn: "Luxor", price: 85, sortOrder: 21 },
    { nameAr: "أسوان", nameEn: "Aswan", price: 90, sortOrder: 22 },
    { nameAr: "البحر الأحمر", nameEn: "Red Sea", price: 90, sortOrder: 23 },
    { nameAr: "الوادي الجديد", nameEn: "New Valley", price: 95, sortOrder: 24 },
    { nameAr: "مطروح", nameEn: "Matrouh", price: 85, sortOrder: 25 },
    { nameAr: "شمال سيناء", nameEn: "North Sinai", price: 90, sortOrder: 26 },
    { nameAr: "جنوب سيناء", nameEn: "South Sinai", price: 90, sortOrder: 27 },
  ];

  for (const city of shippingCities) {
    await prisma.shippingCity.upsert({
      where: { id: `seed-city-${city.nameEn!.replace(/\s+/g, "-").toLowerCase()}` },
      update: { nameAr: city.nameAr, nameEn: city.nameEn, price: city.price, sortOrder: city.sortOrder, isActive: true },
      create: { id: `seed-city-${city.nameEn!.replace(/\s+/g, "-").toLowerCase()}`, ...city, isActive: true },
    });
  }
  console.log(`Seeded ${shippingCities.length} shipping cities`);

  for (const page of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
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
