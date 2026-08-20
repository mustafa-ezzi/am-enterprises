import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { PageMeta } from "../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../components/StatusBlocks";
import {
  EmptyState,
  PillFilledButton,
  PillGhostButton,
  Tag,
} from "../components/ui";
import { Carousel, FadeContent, Magnet } from "../components/motion";
import { useCart } from "../context/CartContext";
import { api, formatMoney } from "../lib/api";
import { productImage } from "../lib/productPhotos";
import type { ProductDetail, SiteSettings } from "../types/catalog";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [currency, setCurrency] = useState("PKR");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .siteSettings()
      .then((s: SiteSettings) => setCurrency(s.currency || "PKR"))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAdded(false);
    setQty(1);

    api
      .product(slug)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Product not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleAdd() {
    if (!product || !product.in_stock) return;
    setAdding(true);
    await addItem(product, qty);
    setAdded(true);
    setAdding(false);
  }

  const images = product?.images ?? [];
  const slides =
    images.length > 0
      ? images.map((img) => ({
          src: img.image_url || img.image,
          alt: img.alt_text || product?.name,
        }))
      : product
        ? [{ src: productImage(product), alt: product.name }]
        : [];

  return (
    <StorefrontLayout>
      <PageMeta
        title={product?.name ?? "Product"}
        description={
          product?.description?.slice(0, 140) ||
          "Household product from AM Enterprises."
        }
      />
      <SectionBand>
        <PillGhostButton to="/catalogue">← Catalogue</PillGhostButton>

        {loading ? <div style={{ marginTop: 24 }}><LoadingBlock /></div> : null}
        {error ? (
          <div style={{ marginTop: 24 }}>
            <EmptyState
              title="Product not found"
              description={error}
              action={<PillFilledButton to="/catalogue">Browse catalogue</PillFilledButton>}
            />
          </div>
        ) : null}

        {product && !loading ? (
          <div
            className="pdp-grid"
            style={{
              display: "grid",
              gap: 40,
              marginTop: 32,
              gridTemplateColumns: "1fr",
            }}
          >
            <FadeContent y={16}>
              <Carousel slides={slides} aspectRatio="4 / 5" />
            </FadeContent>

            <FadeContent delay={0.1} y={16}>
              <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                {product.brand_name ? (
                  <Tag tone="ink">{product.brand_name}</Tag>
                ) : null}
                <Tag>{product.category_name}</Tag>
              </div>
              <h1 className="text-heading-sm" style={{ margin: "12px 0 16px" }}>
                {product.name}
              </h1>
              <p className="text-caption" style={{ color: "var(--color-pewter)" }}>
                SKU {product.sku}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  margin: "20px 0",
                }}
              >
                <span className="text-subheading" style={{ fontWeight: 600 }}>
                  {formatMoney(product.price, currency)}
                </span>
                {product.compare_at_price ? (
                  <span
                    className="text-body-sm"
                    style={{
                      color: "var(--color-pewter)",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatMoney(product.compare_at_price, currency)}
                  </span>
                ) : null}
              </div>

              <p className="text-body-sm" style={{ marginBottom: 24 }}>
                {product.in_stock
                  ? `${product.stock} in stock`
                  : "Currently out of stock"}
              </p>

              {product.description ? (
                <p className="text-body" style={{ maxWidth: 520, marginBottom: 28 }}>
                  {product.description}
                </p>
              ) : null}

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <label className="text-caption" htmlFor="qty">
                  Qty
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={Math.max(1, product.stock)}
                  value={qty}
                  disabled={!product.in_stock}
                  onChange={(e) =>
                    setQty(
                      Math.min(
                        product.stock,
                        Math.max(1, Number(e.target.value) || 1),
                      ),
                    )
                  }
                  className="field__control"
                  style={{ width: 88 }}
                />
                <Magnet>
                  <PillFilledButton
                    size="standard"
                    disabled={!product.in_stock || adding}
                    onClick={() => void handleAdd()}
                  >
                    {adding ? "Adding…" : added ? "Added ✓" : "Add to cart"}
                  </PillFilledButton>
                </Magnet>
                <PillGhostButton to="/cart">View cart</PillGhostButton>
              </div>

              {added ? (
                <p
                  className="text-body-sm add-to-cart-feedback"
                  role="status"
                  style={{ marginTop: 16 }}
                >
                  Added to cart.{" "}
                  <Link to="/cart" style={{ textDecoration: "underline" }}>
                    Checkout
                  </Link>
                </p>
              ) : null}
              </div>
            </FadeContent>
          </div>
        ) : null}

        {!loading && !error && !product ? (
          <ErrorBlock message="Product unavailable." />
        ) : null}
      </SectionBand>

      <style>{`
        @media (min-width: 900px) {
          .pdp-grid {
            grid-template-columns: 1fr 1fr !important;
            align-items: start;
          }
        }
      `}</style>
    </StorefrontLayout>
  );
}
