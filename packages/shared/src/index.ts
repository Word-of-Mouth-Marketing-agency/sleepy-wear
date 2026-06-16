export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type Category = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  descriptionAr?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  productCount?: number;
};

export type ProductImage = {
  id: string;
  productId: string;
  variantId?: string | null;
  colorId?: string | null;
  url: string;
  altAr?: string | null;
  altEn?: string | null;
  sortOrder: number;
};

export type Size = {
  id: string;
  name: string;
  labelAr: string;
  sortOrder: number;
};

export type Color = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  hex: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  size?: Size | null;
  color?: Color | null;
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
  descriptionEn?: string | null;
  status: ProductStatus;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
};

export type CartItem = {
  variantId: string;
  productId: string;
  nameAr: string;
  sku: string;
  quantity: number;
  price: number;
  variantInfo?: string;
};

export type CreateOrderItemInput = {
  variantId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  items: CreateOrderItemInput[];
};

export type OrderItem = {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  productNameSnapshot: string;
  variantInfoSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  total: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  email?: string | null;
  address?: string;
  city?: string;
  notes?: string | null;
  subtotal?: number;
  discountTotal?: number;
  shippingTotal?: number;
  total: number;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
};

export type Banner = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  imageUrl: string;
  href?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type CategoryDetails = {
  category: Category;
  products: PaginatedResponse<Product>;
};

export const SITE_NAME = "SleepyWear";
export const DOMAIN = "sleepyweareg.com";
