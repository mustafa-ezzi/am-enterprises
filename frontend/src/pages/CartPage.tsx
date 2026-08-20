import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { PageMeta } from "../components/PageMeta";
import {
  EmptyState,
  PillFilledButton,
  PillGhostButton,
  Tag,
} from "../components/ui";
import { AnimatedList } from "../components/motion";
import { useCart } from "../context/CartContext";
import { api, formatMoney } from "../lib/api";

export function CartPage() {
  const { lines, subtotal, setQuantity, removeItem, itemCount } = useCart();
  const [currency, setCurrency] = useState("PKR");

  useEffect(() => {
    api
      .siteSettings()
      .then((s) => setCurrency(s.currency || "PKR"))
      .catch(() => undefined);
  }, []);

  return (
    <StorefrontLayout>
      <PageMeta title="Cart" description="Review your AM Enterprises cart." />
      <SectionBand>
        <Tag>Bag</Tag>
        <h1 className="text-heading" style={{ margin: "16px 0 12px" }}>
          Cart
        </h1>
        <p className="text-body-sm" style={{ marginBottom: 32, color: "var(--color-pewter)" }}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>

        {lines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse the catalogue and add household essentials."
            action={<PillFilledButton to="/catalogue">Shop catalogue</PillFilledButton>}
          />
        ) : (
          <div
            className="cart-layout"
            style={{
              display: "grid",
              gap: 40,
              gridTemplateColumns: "1fr",
            }}
          >
            <AnimatedList
              style={{ display: "grid", gap: 0 }}
              deps={lines.map((l) => `${l.productId}:${l.quantity}`).join("|")}
            >
              {lines.map((line) => (
                <div
                  key={line.productId}
                  style={{
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "96px 1fr",
                    paddingBlock: 20,
                    borderTop: "1px solid var(--color-charcoal-ink)",
                  }}
                >
                  <Link to={`/products/${line.slug}`}>
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        background: "var(--color-newsprint-gray)",
                        overflow: "hidden",
                      }}
                    >
                      {line.image ? (
                        <img
                          src={line.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : null}
                    </div>
                  </Link>
                  <div>
                    <Link to={`/products/${line.slug}`}>
                      <h2
                        style={{
                          margin: "0 0 8px",
                          fontSize: 19,
                          fontWeight: 600,
                          lineHeight: 1.2,
                        }}
                      >
                        {line.name}
                      </h2>
                    </Link>
                    <p className="text-body-sm" style={{ margin: "0 0 12px" }}>
                      {formatMoney(line.price, currency)}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <label className="text-caption" htmlFor={`qty-${line.productId}`}>
                        Qty
                      </label>
                      <input
                        id={`qty-${line.productId}`}
                        type="number"
                        min={1}
                        max={line.stock}
                        value={line.quantity}
                        onChange={(e) => {
                          void setQuantity(
                            line.productId,
                            Number(e.target.value) || 1,
                          );
                        }}
                        className="field__control"
                        style={{ width: 72 }}
                      />
                      <PillGhostButton onClick={() => void removeItem(line.productId)}>
                        Remove
                      </PillGhostButton>
                    </div>
                    <p className="text-caption" style={{ marginTop: 12 }}>
                      Line total:{" "}
                      {formatMoney(Number(line.price) * line.quantity, currency)}
                    </p>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--color-charcoal-ink)" }} />
            </AnimatedList>

            <aside
              style={{
                border: "1px solid var(--color-charcoal-ink)",
                padding: 24,
                alignSelf: "start",
              }}
            >
              <h2 className="text-subheading" style={{ margin: "0 0 16px" }}>
                Summary
              </h2>
              <p
                className="text-body"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "0 0 24px",
                }}
              >
                <span>Subtotal</span>
                <strong>{formatMoney(subtotal, currency)}</strong>
              </p>
              <p className="text-caption" style={{ color: "var(--color-pewter)", marginBottom: 20 }}>
                Shipping calculated at checkout.
              </p>
              <div style={{ display: "grid", gap: 12 }}>
                <PillFilledButton to="/checkout" size="standard">
                  Checkout
                </PillFilledButton>
                <PillGhostButton to="/catalogue">Continue shopping</PillGhostButton>
              </div>
            </aside>
          </div>
        )}
      </SectionBand>

      <style>{`
        @media (min-width: 900px) {
          .cart-layout {
            grid-template-columns: 1.5fr 0.8fr !important;
            align-items: start;
          }
        }
      `}</style>
    </StorefrontLayout>
  );
}
