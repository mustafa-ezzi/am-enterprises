import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { DataTable } from "../../components/admin/DataTable";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import { EmptyState, Input, PillGhostButton } from "../../components/ui";
import { adminApi, type CustomerRow } from "../../lib/adminApi";
import { formatMoney } from "../../lib/api";

export function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(q = search) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.customers(q || undefined);
      setRows(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout
      title="Customers"
      subtitle="From placed orders — guest checkout included"
    >
      <PageMeta title="Admin customers" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "end",
          marginBottom: 24,
        }}
      >
        <div style={{ flex: "1 1 240px" }}>
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email"
          />
        </div>
        <PillGhostButton type="submit">Search</PillGhostButton>
      </form>

      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {!loading && !error ? (
        <DataTable
          rows={rows}
          rowKey={(r) => r.email}
          empty={<EmptyState title="No customers yet" />}
          columns={[
            {
              key: "name",
              header: "Customer",
              render: (r) => (
                <div>
                  <strong>{r.full_name}</strong>
                  <div style={{ color: "var(--color-pewter)" }}>{r.email}</div>
                </div>
              ),
            },
            {
              key: "phone",
              header: "Phone",
              render: (r) => r.phone || "—",
            },
            {
              key: "city",
              header: "City",
              render: (r) => r.city || "—",
            },
            {
              key: "orders",
              header: "Orders",
              render: (r) => r.order_count,
            },
            {
              key: "spent",
              header: "Spent",
              render: (r) => formatMoney(r.total_spent || 0, "PKR"),
            },
            {
              key: "last",
              header: "Last order",
              render: (r) =>
                r.last_order_at
                  ? new Date(r.last_order_at).toLocaleDateString()
                  : "—",
            },
          ]}
        />
      ) : null}
    </AdminLayout>
  );
}
