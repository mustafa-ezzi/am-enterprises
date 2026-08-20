import { useState } from "react";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { ProductCard } from "../components/ProductCard";
import {
  EmptyState,
  Input,
  Modal,
  PillFilledButton,
  PillGhostButton,
  Select,
  Tag,
} from "../components/ui";
import type { ProductListItem } from "../types/catalog";

const sampleProduct: ProductListItem = {
  id: 1,
  name: "Stainless Steel Mixing Bowl Set",
  slug: "stainless-steel-mixing-bowl-set",
  sku: "AM-KIT-001",
  price: "2499.00",
  compare_at_price: "2999.00",
  stock: 40,
  in_stock: true,
  brand: 2,
  brand_name: "Kitchenware",
  brand_slug: "kitchenware",
  category: 1,
  category_name: "Kitchen Essentials",
  is_featured: true,
  is_active: true,
  primary_image: null,
  created_at: new Date().toISOString(),
};

function SandboxBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--color-charcoal-ink)",
        paddingTop: 32,
        marginTop: 40,
      }}
    >
      <h2 className="text-subheading" style={{ margin: "0 0 20px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export function UiSandboxPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState("kitchen-essentials");

  return (
    <StorefrontLayout>
      <SectionBand>
        <Tag>Phase 2</Tag>
        <h1 className="text-heading" style={{ margin: "16px 0 12px" }}>
          UI kit
        </h1>
        <p className="text-body" style={{ maxWidth: 560, margin: 0 }}>
          Editorial brutalism atoms for AM Enterprises — flat surfaces, pill
          actions, signal red for labels only.
        </p>

        <SandboxBlock title="Typography">
          <div style={{ display: "grid", gap: 16 }}>
            <p className="text-display" style={{ margin: 0 }}>
              Display
            </p>
            <p className="text-heading-lg" style={{ margin: 0 }}>
              Heading LG
            </p>
            <p className="text-heading" style={{ margin: 0 }}>
              Heading
            </p>
            <p className="text-heading-sm" style={{ margin: 0 }}>
              Heading SM
            </p>
            <p className="text-subheading" style={{ margin: 0 }}>
              Subheading
            </p>
            <p className="text-body" style={{ margin: 0 }}>
              Body — Your trust, our commitment.
            </p>
            <p className="text-body-sm" style={{ margin: 0 }}>
              Body SM supporting copy.
            </p>
            <p className="text-caption" style={{ margin: 0 }}>
              Caption / helper
            </p>
          </div>
        </SandboxBlock>

        <SandboxBlock title="Buttons">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PillGhostButton>Ghost compact</PillGhostButton>
            <PillGhostButton size="standard">Ghost standard</PillGhostButton>
            <PillFilledButton>Filled compact</PillFilledButton>
            <PillFilledButton size="standard">Filled standard</PillFilledButton>
            <PillGhostButton to="/catalogue">As link</PillGhostButton>
            <PillFilledButton disabled>Disabled</PillFilledButton>
          </div>
        </SandboxBlock>

        <SandboxBlock title="Tags">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Tag>Kitchen Essentials</Tag>
            <Tag tone="ink">In stock</Tag>
            <Tag tone="muted">SKU AM-KIT-001</Tag>
          </div>
        </SandboxBlock>

        <SandboxBlock title="Form controls">
          <div
            style={{
              display: "grid",
              gap: 20,
              maxWidth: 420,
            }}
          >
            <Input label="Full name" placeholder="Ayesha Khan" />
            <Input
              label="Email"
              type="email"
              error="Enter a valid email address"
              defaultValue="bad@"
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "kitchen-essentials", label: "Kitchen Essentials" },
                { value: "cleaning-supplies", label: "Cleaning Supplies" },
                { value: "laundry", label: "Laundry" },
              ]}
            />
          </div>
        </SandboxBlock>

        <SandboxBlock title="Product card">
          <div style={{ maxWidth: 360 }}>
            <ProductCard product={sampleProduct} />
          </div>
        </SandboxBlock>

        <SandboxBlock title="Empty state">
          <EmptyState
            title="Your cart is empty"
            description="Browse the catalogue and add household essentials."
            action={<PillFilledButton to="/catalogue">Shop now</PillFilledButton>}
          />
        </SandboxBlock>

        <SandboxBlock title="Modal">
          <PillGhostButton onClick={() => setModalOpen(true)}>
            Open modal
          </PillGhostButton>
          <Modal
            open={modalOpen}
            title="Confirm action"
            onClose={() => setModalOpen(false)}
            footer={
              <>
                <PillGhostButton onClick={() => setModalOpen(false)}>
                  Cancel
                </PillGhostButton>
                <PillFilledButton onClick={() => setModalOpen(false)}>
                  Confirm
                </PillFilledButton>
              </>
            }
          >
            Flat dialog with hairline border — no shadow, Escape to close.
          </Modal>
        </SandboxBlock>

        <SandboxBlock title="Color tokens">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {[
              ["Charcoal ink", "var(--color-charcoal-ink)", "#fff"],
              ["Paper white", "var(--color-paper-white)", "#000"],
              ["Newsprint gray", "var(--color-newsprint-gray)", "#000"],
              ["Pewter", "var(--color-pewter)", "#000"],
              ["Signal red", "var(--color-signal-red)", "#fff"],
              ["Signal red", "var(--color-signal-red)", "#fff"],
            ].map(([name, bg, fg]) => (
              <div
                key={name}
                style={{
                  background: bg,
                  color: fg,
                  border: "1px solid var(--color-charcoal-ink)",
                  padding: 16,
                  minHeight: 88,
                }}
              >
                <p className="text-caption" style={{ margin: 0 }}>
                  {name}
                </p>
              </div>
            ))}
          </div>
        </SandboxBlock>
      </SectionBand>
    </StorefrontLayout>
  );
}
