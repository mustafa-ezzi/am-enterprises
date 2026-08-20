export type CartApiItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_sku: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  primary_image: string | null;
  quantity: number;
  line_total: string;
};

export type CartApi = {
  id: number;
  cart_key: string;
  items: CartApiItem[];
  subtotal: string;
  item_count: number;
  updated_at: string;
};

export type CheckoutPayload = {
  cart_key?: string;
  items?: Array<{ product_id: number; quantity: number }>;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  notes?: string;
  shipping_method: "standard" | "express";
  payment_method: "cod" | "bank_transfer";
};

export type OrderItem = {
  id: number;
  product: number | null;
  product_name: string;
  product_sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string;
  shipping_method: string;
  payment_method: string;
  currency: string;
  subtotal: string;
  shipping_cost: string;
  total: string;
  tracking_number: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};
