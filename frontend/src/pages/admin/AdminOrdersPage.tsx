import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { DataTable } from "../../components/admin/DataTable";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import {
  EmptyState,
  Input,
  PillGhostButton,
  Select,
  Tag,
} from "../../components/ui";
import { adminApi } from "../../lib/adminApi";
import { formatMoney } from "../../lib/api";
import type { Order } from "../../types/commerce";

export function AdminOrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.orders({
        search: search || undefined,
        status: status || undefined,
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

  return (
    <AdminLayout title="Orders" subtitle="Fulfillment and status updates">
      <PageMeta title="Admin orders" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        className="admin-filters"
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
          marginBottom: 24,
        }}
      >
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order #, email, name"
        />
        <Select
          label="Status"
          value={status || "all"}
          onChange={(e) =>
            setStatus(e.target.value === "all" ? "" : e.target.value)
          }
          options={[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "processing", label: "Processing" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
            { value: "cancelled", label: "Cancelled" },
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
          rows={rows}
          rowKey={(r) => r.id}
          empty={<EmptyState title="No orders yet" />}
          columns={[
            {
              key: "number",
              header: "Order",
              render: (r) => (
                <Link to={`/admin/orders/${r.order_number}`} style={{ fontWeight: 600 }}>
                  {r.order_number}
                </Link>
              ),
            },
            {
              key: "customer",
              header: "Customer",
              render: (r) => (
                <div>
                  {r.full_name}
                  <div style={{ color: "var(--color-pewter)" }}>{r.email}</div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => <Tag>{r.status}</Tag>,
            },
            {
              key: "total",
              header: "Total",
              render: (r) => formatMoney(r.total, r.currency),
            },
            {
              key: "date",
              header: "Created",
              render: (r) => new Date(r.created_at).toLocaleString(),
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
