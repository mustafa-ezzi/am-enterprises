import type {
  Brand,
  Category,
  Paginated,
  ProductDetail,
  ProductListItem,
  ProductQuery,
  SiteSettings,
} from "../types/catalog";
import type { CartApi, CheckoutPayload, Order } from "../types/commerce";
import { productImage } from "./productPhotos";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const CART_KEY_STORAGE = "am-enterprises-cart-key";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function getCartKey(): string {
  let key = localStorage.getItem(CART_KEY_STORAGE);
  if (!key) {
    key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now()}${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(CART_KEY_STORAGE, key);
  }
  return key;
}

export function setCartKey(key: string) {
  localStorage.setItem(CART_KEY_STORAGE, key);
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Ensure Django csrftoken cookie exists (needed when SessionAuthentication is active). */
async function ensureCsrf(): Promise<string> {
  const existing = getCookie("csrftoken");
  if (existing) return existing;
  // On Railway, API is a different host — cookie is not readable via document.cookie.
  const res = await fetch(`${API_BASE}/api/auth/csrf/`, { credentials: "include" });
  if (res.ok) {
    try {
      const data = (await res.json()) as { csrfToken?: string };
      if (data.csrfToken) return data.csrfToken;
    } catch {
      /* fall through */
    }
  }
  return getCookie("csrftoken") || "";
}

async function request<T>(
  path: string,
  init?: RequestInit & { cartKey?: boolean },
): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (init?.cartKey !== false) {
    headers["X-Cart-Key"] = getCartKey();
  }

  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrf = getCookie("csrftoken") || (await ensureCsrf());
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    let body: unknown = null;
    let detail = res.statusText;
    try {
      body = await res.json();
      if (body && typeof body === "object") {
        const obj = body as Record<string, unknown>;
        detail =
          (typeof obj.detail === "string" && obj.detail) ||
          JSON.stringify(body);
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(detail || "Request failed", res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === false) return;
    qs.set(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const api = {
  health: () =>
    request<{ status: string; service: string; slogan: string }>("/api/health/", {
      cartKey: false,
    }),

  siteSettings: () =>
    request<SiteSettings>("/api/site-settings/", { cartKey: false }),

  categories: () =>
    request<Paginated<Category> | Category[]>("/api/categories/", {
      cartKey: false,
    }),

  brands: () =>
    request<Paginated<Brand> | Brand[]>("/api/brands/", {
      cartKey: false,
    }),

  products: (query: ProductQuery = {}) =>
    request<Paginated<ProductListItem>>(
      `/api/products/${toQuery({
        page: query.page,
        search: query.search,
        category: query.category,
        category__slug: query.category__slug,
        brand: query.brand,
        brand__slug: query.brand__slug,
        is_featured: query.is_featured,
        ordering: query.ordering,
      })}`,
      { cartKey: false },
    ),

  product: (slug: string) =>
    request<ProductDetail>(`/api/products/${encodeURIComponent(slug)}/`, {
      cartKey: false,
    }),

  getCart: () => request<CartApi>("/api/cart/"),

  clearCart: () =>
    request<void>("/api/cart/", { method: "DELETE" }),

  addCartItem: (productId: number, quantity = 1) =>
    request<CartApi>("/api/cart/items/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateCartItem: (itemId: number, quantity: number) =>
    request<CartApi>(`/api/cart/items/${itemId}/`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (itemId: number) =>
    request<CartApi>(`/api/cart/items/${itemId}/`, {
      method: "DELETE",
    }),

  syncCart: (items: Array<{ product_id: number; quantity: number }>) =>
    request<CartApi>("/api/cart/sync/", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),

  checkout: (payload: CheckoutPayload) =>
    request<Order>("/api/checkout/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  orderByNumber: (orderNumber: string) =>
    request<Order>(`/api/orders/by-number/${encodeURIComponent(orderNumber)}/`, {
      cartKey: false,
    }),
};

export async function listCategories(): Promise<Category[]> {
  const data = await api.categories();
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function listBrands(): Promise<Brand[]> {
  const data = await api.brands();
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export function formatMoney(value: string | number, currency = "PKR") {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);
  return `${currency} ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function mapCartToLines(cart: CartApi) {
  return cart.items.map((item) => ({
    itemId: item.id,
    productId: item.product_id,
    slug: item.product_slug,
    name: item.product_name,
    price: item.price,
    compareAtPrice: item.compare_at_price,
    image:
      item.primary_image ||
      productImage({ sku: item.product_sku, primary_image: item.primary_image }),
    stock: item.stock,
    quantity: item.quantity,
  }));
}
