import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import { Tag } from "../../components/ui";
import { Counter, FadeContent } from "../../components/motion";
import { adminApi, type AdminStats } from "../../lib/adminApi";
import { formatMoney } from "../../lib/api";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Live shop metrics — Your trust, our commitment"
    >
      <PageMeta title="Admin dashboard" />
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {stats ? (
        <FadeContent>
          <div
            className="admin-stat-grid"
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              marginBottom: 32,
            }}
          >
            <div className="admin-stat-card">
              <Tag tone="muted">Orders today</Tag>
              <p className="text-heading-sm" style={{ margin: "12px 0 0" }}>
                <Counter to={stats.orders_today} duration={0.9} />
              </p>
            </div>
            <div className="admin-stat-card">
              <Tag tone="muted">Revenue today</Tag>
              <p className="text-heading-sm" style={{ margin: "12px 0 0" }}>
                {formatMoney(stats.revenue_today, "PKR")}
              </p>
            </div>
            <div className="admin-stat-card">
              <Tag tone="muted">Low stock</Tag>
              <p className="text-heading-sm" style={{ margin: "12px 0 0" }}>
                <Counter to={stats.low_stock} duration={0.9} />
              </p>
            </div>
            <div className="admin-stat-card">
              <Tag tone="muted">Pending</Tag>
              <p className="text-heading-sm" style={{ margin: "12px 0 0" }}>
                <Counter to={stats.pending_shipments} duration={0.9} />
              </p>
            </div>
          </div>

          <h2 className="text-subheading" style={{ margin: "0 0 16px" }}>
            Recent orders
          </h2>
          {stats.recent_orders.length === 0 ? (
            <p className="text-body-sm" style={{ color: "var(--color-pewter)" }}>
              No orders yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 0 }}>
              {stats.recent_orders.map((order) => (
                <Link
                  key={order.order_number}
                  to={`/admin/orders/${order.order_number}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "14px 0",
                    borderTop: "1px solid var(--color-charcoal-ink)",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="text-body-sm">
                    <strong>{order.order_number}</strong> · {order.full_name}
                  </span>
                  <span className="text-body-sm">
                    {order.status} · {formatMoney(order.total, order.currency)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </FadeContent>
      ) : null}
    </AdminLayout>
  );
}
