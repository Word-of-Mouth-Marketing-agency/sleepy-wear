export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type Category = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  descriptionAr?: string | null;
  isActive: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  altAr?: string | null;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
};

export type Product = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  descriptionAr?: string | null;
  status: ProductStatus;
  categoryId: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type CartItem = {
  variantId: string;
  productId: string;
  nameAr: string;
  sku: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  total: number;
  createdAt: string;
};

export const SITE_NAME = "SleepyWear";
export const DOMAIN = "sleepyweareg.com";
