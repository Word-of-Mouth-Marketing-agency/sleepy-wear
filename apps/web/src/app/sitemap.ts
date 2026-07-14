import type { MetadataRoute } from "next";
import type { Category, PaginatedResponse, Product } from "@sleepywear/shared";
import { DOMAIN } from "@sleepywear/shared";
import { API_URL } from "@/lib/api";

const baseUrl = `https://${DOMAIN}`;

function encodeSlug(slug: string): string {
  return encodeURIComponent(slug.trim());
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getJson<PaginatedResponse<Product>>(
    "/products?status=ACTIVE&limit=500",
  );
  const categories = await getJson<Category[]>("/categories");

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/shipping-policy",
    "/privacy-policy",
    "/returns-policy",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map(
    (category) => ({
      url: `${baseUrl}/categories/${encodeSlug(category.slug)}`,
      lastModified: now,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = (products?.items ?? []).map(
    (product) => ({
      url: `${baseUrl}/products/${encodeSlug(product.slug)}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    }),
  );

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}