import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProductDetail, ProductListItem } from "../types/catalog";
import { api, mapCartToLines, setCartKey } from "../lib/api";
import { productImage as resolveProductImage } from "../lib/productPhotos";

const LOCAL_MIRROR_KEY = "am-enterprises-cart-v1";

export type CartLine = {
  itemId?: number;
  productId: number;
  slug: string;
  name: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  ready: boolean;
  syncing: boolean;
  addItem: (
    product: ProductListItem | ProductDetail,
    quantity?: number,
  ) => Promise<void>;
  setQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineImage(product: ProductListItem | ProductDetail): string {
  return resolveProductImage(product);
}

function loadMirror(): CartLine[] {
  try {
    const raw = localStorage.getItem(LOCAL_MIRROR_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    typeof window === "undefined" ? [] : loadMirror(),
  );
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const applyCart = useCallback((next: CartLine[], cartKey?: string) => {
    if (cartKey) setCartKey(cartKey);
    setLines(next);
    localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(next));
  }, []);

  const refresh = useCallback(async () => {
    const cart = await api.getCart();
    applyCart(mapCartToLines(cart), cart.cart_key);
  }, [applyCart]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setSyncing(true);
      try {
        const local = loadMirror();
        if (local.length > 0) {
          const cart = await api.syncCart(
            local.map((line) => ({
              product_id: line.productId,
              quantity: line.quantity,
            })),
          );
          if (!cancelled) applyCart(mapCartToLines(cart), cart.cart_key);
        } else {
          const cart = await api.getCart();
          if (!cancelled) applyCart(mapCartToLines(cart), cart.cart_key);
        }
      } catch {
        // Keep local mirror if API is offline
      } finally {
        if (!cancelled) {
          setReady(true);
          setSyncing(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [applyCart]);

  const addItem = useCallback(
    async (product: ProductListItem | ProductDetail, quantity = 1) => {
      setSyncing(true);
      try {
        const cart = await api.addCartItem(product.id, quantity);
        applyCart(mapCartToLines(cart), cart.cart_key);
      } catch {
        // Optimistic local fallback
        setLines((prev) => {
          const qty = Math.max(1, quantity);
          const existing = prev.find((line) => line.productId === product.id);
          const next = existing
            ? prev.map((line) =>
                line.productId === product.id
                  ? {
                      ...line,
                      quantity: Math.min(line.stock, line.quantity + qty),
                      stock: product.stock,
                      price: product.price,
                    }
                  : line,
              )
            : [
                ...prev,
                {
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  compareAtPrice: product.compare_at_price,
                  image: lineImage(product),
                  stock: product.stock,
                  quantity: Math.min(product.stock || qty, qty),
                },
              ];
          localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(next));
          return next;
        });
      } finally {
        setSyncing(false);
      }
    },
    [applyCart],
  );

  const setQuantity = useCallback(
    async (productId: number, quantity: number) => {
      const line = lines.find((l) => l.productId === productId);
      setSyncing(true);
      try {
        if (line?.itemId) {
          const cart =
            quantity < 1
              ? await api.removeCartItem(line.itemId)
              : await api.updateCartItem(line.itemId, quantity);
          applyCart(mapCartToLines(cart), cart.cart_key);
        } else {
          await refresh();
        }
      } catch {
        setLines((prev) => {
          const next = prev
            .map((l) =>
              l.productId === productId
                ? { ...l, quantity: Math.min(l.stock, Math.max(0, quantity)) }
                : l,
            )
            .filter((l) => l.quantity > 0);
          localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(next));
          return next;
        });
      } finally {
        setSyncing(false);
      }
    },
    [lines, applyCart, refresh],
  );

  const removeItem = useCallback(
    async (productId: number) => {
      await setQuantity(productId, 0);
    },
    [setQuantity],
  );

  const clear = useCallback(async () => {
    setSyncing(true);
    try {
      await api.clearCart();
      applyCart([]);
    } catch {
      applyCart([]);
    } finally {
      setSyncing(false);
    }
  }, [applyCart]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce(
      (sum, line) => sum + Number(line.price) * line.quantity,
      0,
    );
    return {
      lines,
      itemCount,
      subtotal,
      ready,
      syncing,
      addItem,
      setQuantity,
      removeItem,
      clear,
      refresh,
    };
  }, [lines, ready, syncing, addItem, setQuantity, removeItem, clear, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
