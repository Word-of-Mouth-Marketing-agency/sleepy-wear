import type { Metadata } from "next";
import type { PaginatedResponse, Product } from "@sleepywear/shared";
import { DOMAIN, SITE_NAME } from "@sleepywear/shared";
import { apiGet, apiFetch } from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import ProductDetailsClient from "@/components/site/ProductDetailsClient";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function getRelatedProducts(
  categorySlug: string | undefined,
  currentSlug: string,
): Promise<Product[]> {
  let related: Product[] = [];

  if (categorySlug) {
    const sameCat = await apiGet<PaginatedResponse<Product>>(
      `/products?categorySlug=${categorySlug}&status=ACTIVE&limit=5`,
    ).catch(() => null);

    if (sameCat) {
      related = sameCat.items.filter((p) => p.slug !== currentSlug).slice(0, 4);
    }
  }

  if (related.length < 4) {
    const fillCount = 4 - related.length;
    const fillRes = await apiGet<PaginatedResponse<Product>>(
      `/products?status=ACTIVE&limit=${fillCount + 1}`,
    ).catch(() => null);

    if (fillRes) {
      const existingIds = new Set(related.map((r) => r.id));
      for (const p of fillRes.items) {
        if (p.slug !== currentSlug && !existingIds.has(p.id)) {
          related.push(p);
          if (related.length >= 4) break;
        }
      }
    }
  }

  return related;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await apiFetch<Product>(`/products/${slug}`);

  if (!product) {
    return { title: "المنتج" };
  }

  const productUrl = `https://${DOMAIN}/products/${encodeURIComponent(slug)}`;
  const mainImage = product.images?.[0]?.url
    ? getMediaUrl(product.images[0].url)
    : undefined;

  return {
    title: product.nameAr,
    description:
      product.descriptionAr?.slice(0, 160) ??
      `تسوقي ${product.nameAr} من ${SITE_NAME}`,
    alternates: { canonical: productUrl },
    openGraph: {
      title: product.nameAr,
      description:
        product.descriptionAr?.slice(0, 160) ??
        `تسوقي ${product.nameAr} من ${SITE_NAME}`,
      url: productUrl,
      images: mainImage ? [{ url: mainImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.nameAr,
      description:
        product.descriptionAr?.slice(0, 160) ??
        `تسوقي ${product.nameAr} من ${SITE_NAME}`,
      images: mainImage ? [mainImage] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await apiGet<Product>(`/products/${slug}`);

    if (product.status !== "ACTIVE") {
      return (
        <div className="container py-10">
          <p className="text-[var(--muted)]">هذا المنتج غير متوفر حاليا.</p>
        </div>
      );
    }

    const relatedProducts = await getRelatedProducts(
      product.category?.slug,
      slug,
    );

    const productUrl = `https://${DOMAIN}/products/${encodeURIComponent(slug)}`;
    const cleanSlug = product.slug.trim();
    const mainImage = product.images?.[0]?.url
      ? getMediaUrl(product.images[0].url)
      : undefined;

    const lowestPrice = product.variants.reduce(
      (min, v) => Math.min(min, v.salePrice ?? v.price),
      Infinity,
    );
    const hasStock = product.variants.some((v) => v.stock > 0);

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.nameAr,
      description: product.descriptionAr ?? "",
      image: mainImage ?? undefined,
      url: productUrl,
      sku: cleanSlug,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EGP",
        lowPrice: lowestPrice,
        highPrice: Math.max(
          ...product.variants.map((v) => v.salePrice ?? v.price),
        ),
        availability: hasStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "الرئيسية",
          item: `https://${DOMAIN}`,
        },
        ...(product.category
          ? [
              {
                "@type": "ListItem" as const,
                position: 2,
                name: product.category.nameAr,
                item: `https://${DOMAIN}/categories/${encodeURIComponent(product.category.slug)}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: product.category ? 3 : 2,
          name: product.nameAr,
          item: productUrl,
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
        <ProductDetailsClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </>
    );
  } catch {
    return (
      <div className="container py-10">
        <p className="text-red-700">
          تعذر تحميل المنتج أو أنه غير موجود.
        </p>
      </div>
    );
  }
}