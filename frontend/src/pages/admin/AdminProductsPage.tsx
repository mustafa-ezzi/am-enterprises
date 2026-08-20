import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { DataTable } from "../../components/admin/DataTable";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import {
  EmptyState,
  Input,
  PillFilledButton,
  PillGhostButton,
  Select,
  Tag,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/adminApi";
import { formatMoney } from "../../lib/api";
import type { ProductListItem } from "../../types/catalog";

export function AdminProductsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.products({
        search: search || undefined,
        is_active: status === "all" ? undefined : status === "active",
      });
      setRows(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => rows, [rows]);

  async function toggleActive(product: ProductListItem) {
    try {
      await adminApi.updateProduct(product.slug, {
        is_active: !product.is_active,
      });
      push(product.is_active ? "Unpublished" : "Published");
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Update failed", "error");
    }
  }

  async function remove(product: ProductListItem) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await adminApi.deleteProduct(product.slug);
      push("Product deleted");
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  return (
    <AdminLayout
      title="Products"
      subtitle="Create, edit, publish, and feature catalogue items"
      actions={<PillFilledButton to="/admin/products/new">New product</PillFilledButton>}
    >
      <PageMeta title="Admin products" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
          marginBottom: 24,
        }}
        className="admin-filters"
      >
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or SKU"
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Published" },
            { value: "inactive", label: "Draft" },
          ]}
        />
        <div style={{ display: "flex", alignItems: "end" }}>
          <PillGhostButton type="submit">Filter</PillGhostButton>
        </div>
      </form>

      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {!loading && !error ? (
        <DataTable
          rows={filtered}
          rowKey={(r) => r.id}
          empty={
            <EmptyState
              title="No products"
              description="Add your first household product."
              action={<PillFilledButton to="/admin/products/new">New product</PillFilledButton>}
            />
          }
          columns={[
            {
              key: "name",
              header: "Product",
              render: (r) => (
                <div>
                  <Link to={`/admin/products/${r.slug}`} style={{ fontWeight: 600 }}>
                    {r.name}
                  </Link>
                  <div style={{ color: "var(--color-pewter)", marginTop: 4 }}>
                    {r.sku} · {r.category_name}
                  </div>
                </div>
              ),
            },
            {
              key: "price",
              header: "Price",
              render: (r) => formatMoney(r.price, "PKR"),
            },
            {
              key: "stock",
              header: "Stock",
              render: (r) => (
                <span style={{ color: r.stock <= 5 ? "var(--color-signal-red)" : undefined }}>
                  {r.stock}
                </span>
              ),
            },
            {
              key: "flags",
              header: "Flags",
              render: (r) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Tag tone={r.is_active ? "ink" : "muted"}>
                    {r.is_active ? "Live" : "Draft"}
                  </Tag>
                  {r.is_featured ? <Tag>Featured</Tag> : null}
                </div>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (r) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <PillGhostButton to={`/admin/products/${r.slug}`}>Edit</PillGhostButton>
                  <PillGhostButton onClick={() => void toggleActive(r)}>
                    {r.is_active ? "Unpublish" : "Publish"}
                  </PillGhostButton>
                  <PillGhostButton onClick={() => void remove(r)}>Delete</PillGhostButton>
                </div>
              ),
            },
          ]}
        />
      ) : null}

      <style>{`
        @media (min-width: 768px) {
          .admin-filters {
            grid-template-columns: 1.4fr 0.8fr auto !important;
            align-items: end;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
