import type { Paginated, ProductDetail, ProductListItem, Brand, Category, SiteSettings } from "../types/catalog";
import type { Order } from "../types/commerce";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_staff: boolean;
  is_active: boolean;
};

export type AdminStats = {
  orders_today: number;
  revenue_today: string;
  low_stock: number;
  pending_shipments: number;
  recent_orders: Array<{
    order_number: string;
    full_name: string;
    status: string;
    total: string;
    currency: string;
    created_at: string;
  }>;
  status_breakdown: Array<{ status: string; count: number }>;
};

export type CustomerRow = {
  email: string;
  full_name: string;
  phone: string;
  city: string;
  order_count: number;
  total_spent: string;
  last_order_at: string;
};

export class AdminApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function ensureCsrf(): Promise<string> {
  // CSRF cookie is set on the API host; JS on the frontend host cannot read it
  // cross-origin — use the token from the response body.
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

async function adminRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrf = getCookie("csrftoken") || (await ensureCsrf());
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
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
    throw new AdminApiError(detail || "Request failed", res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "" || v === false) return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  ensureCsrf,
  login: (username: string, password: string) =>
    adminRequest<AdminUser>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => adminRequest<{ detail: string }>("/api/auth/logout/", { method: "POST" }),
  me: () => adminRequest<AdminUser>("/api/auth/me/"),
  stats: () => adminRequest<AdminStats>("/api/admin/stats/"),
  customers: (search?: string) =>
    adminRequest<{ count: number; results: CustomerRow[] }>(
      `/api/admin/customers/${qs({ search })}`,
    ),

  products: (params: Record<string, string | number | boolean | undefined> = {}) =>
    adminRequest<Paginated<ProductListItem>>(
      `/api/products/${qs({ page_size: 50, ...params })}`,
    ),
  product: (slug: string) =>
    adminRequest<ProductDetail>(`/api/products/${encodeURIComponent(slug)}/`),
  createProduct: (data: Record<string, unknown>) =>
    adminRequest<ProductListItem & { slug: string }>("/api/products/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (slug: string, data: Record<string, unknown>) =>
    adminRequest<ProductListItem>(`/api/products/${encodeURIComponent(slug)}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProduct: (slug: string) =>
    adminRequest<void>(`/api/products/${encodeURIComponent(slug)}/`, {
      method: "DELETE",
    }),
  uploadProductImage: (productId: number, file: File, alt = "") => {
    const form = new FormData();
    form.append("product", String(productId));
    form.append("file", file);
    form.append("alt_text", alt);
    return adminRequest("/api/product-images/", { method: "POST", body: form });
  },
  addProductImageUrl: (
    productId: number,
    imageUrl: string,
    alt = "",
  ) =>
    adminRequest("/api/product-images/", {
      method: "POST",
      body: JSON.stringify({
        product: productId,
        image_url: imageUrl,
        alt_text: alt,
      }),
    }),
  deleteProductImage: (id: number) =>
    adminRequest<void>(`/api/product-images/${id}/`, { method: "DELETE" }),

  categories: () =>
    adminRequest<Paginated<Category> | Category[]>(
      `/api/categories/${qs({ page_size: 100 })}`,
    ),
  brands: () =>
    adminRequest<Paginated<Brand> | Brand[]>(
      `/api/brands/${qs({ page_size: 100 })}`,
    ),
  createCategory: (data: Record<string, unknown>) =>
    adminRequest<Category>("/api/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (slug: string, data: Record<string, unknown>) =>
    adminRequest<Category>(`/api/categories/${encodeURIComponent(slug)}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCategory: (slug: string) =>
    adminRequest<void>(`/api/categories/${encodeURIComponent(slug)}/`, {
      method: "DELETE",
    }),

  orders: (params: Record<string, string | number | undefined> = {}) =>
    adminRequest<Paginated<Order>>(`/api/orders/${qs({ page_size: 50, ...params })}`),
  order: (orderNumber: string) =>
    adminRequest<Order>(`/api/orders/${encodeURIComponent(orderNumber)}/`),
  updateOrder: (orderNumber: string, data: Record<string, unknown>) =>
    adminRequest<Order>(`/api/orders/${encodeURIComponent(orderNumber)}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  siteSettings: () => adminRequest<SiteSettings>("/api/site-settings/"),
  updateSiteSettings: (data: FormData | Record<string, unknown>) => {
    if (data instanceof FormData) {
      return adminRequest<SiteSettings>("/api/site-settings/", {
        method: "PATCH",
        body: data,
      });
    }
    return adminRequest<SiteSettings>("/api/site-settings/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

export async function listAllCategories(): Promise<Category[]> {
  const data = await adminApi.categories();
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export async function listAllBrands(): Promise<Brand[]> {
  const data = await adminApi.brands();
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}
