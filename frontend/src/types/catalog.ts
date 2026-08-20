export type Brand = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  in_stock: boolean;
  brand: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  category: number;
  category_name: string;
  is_featured: boolean;
  is_active: boolean;
  primary_image: string | null;
  created_at: string;
};

export type ProductImage = {
  id: number;
  product: number;
  /** Cloudflare CDN URL (alias of image_url) */
  image: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  in_stock: boolean;
  brand: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  category: number;
  category_name: string;
  is_featured: boolean;
  is_active: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description: string;
  sort_order: number;
  is_active: boolean;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  slogan: string;
  logo: string | null;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  about_blurb: string;
  currency: string;
  updated_at: string;
  cloudflare_configured?: boolean;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ProductQuery = {
  page?: number;
  search?: string;
  category?: string;
  category__slug?: string;
  brand?: string;
  brand__slug?: string;
  is_featured?: boolean;
  ordering?: string;
  in_stock?: boolean;
};
