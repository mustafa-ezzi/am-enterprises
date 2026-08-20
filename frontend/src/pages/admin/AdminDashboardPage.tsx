import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import { Tag } from "../../components/ui";
import { Counter, FadeContent } from "../../components/motion";
import { adminApi, type AdminStats } from "../../lib/adminApi";
import { formatMoney } from "../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "#c4a35a",
  paid: "#5f8f86",
  processing: "#6b8cae",
  shipped: "#7a8799",
  delivered: "#3d6b62",
  cancelled: "#9b3d4a",
};

const CHART_INK = "#162033";
const CHART_MUTED = "#7a8799";
const JADE = "#5f8f86";
const GOLD = "#c4a35a";

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ChartTooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart-tooltip">
      {label ? <p className="admin-chart-tooltip__label">{label}</p> : null}
      {payload.map((entry) => (
        <p key={String(entry.name)} style={{ color: entry.color || CHART_INK }}>
          {entry.name}:{" "}
          <strong>
            {entry.name === "Revenue"
              ? formatMoney(String(entry.value ?? 0), "PKR")
              : entry.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = (silent = false) => {
      if (!silent) setLoading(true);
      adminApi
        .stats()
        .then((data) => {
          if (cancelled) return;
          setStats(data);
          setError(null);
          setUpdatedAt(new Date());
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    load();
    const id = window.setInterval(() => load(true), 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const series = useMemo(
    () =>
      (stats?.series_14d ?? []).map((row) => ({
        ...row,
        revenueNum: Number(row.revenue) || 0,
      })),
    [stats],
  );

  const statusData = useMemo(
    () =>
      (stats?.status_breakdown ?? []).map((row) => ({
        name: statusLabel(row.status),
        value: row.count,
        status: row.status,
      })),
    [stats],
  );

  const topProducts = useMemo(
    () =>
      (stats?.top_products ?? []).map((row) => ({
        name:
          row.product_name.length > 22
            ? `${row.product_name.slice(0, 20)}…`
            : row.product_name,
        fullName: row.product_name,
        units: row.units,
        revenue: Number(row.revenue) || 0,
      })),
    [stats],
  );

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Live shop pulse — orders, revenue, and fulfilment"
    >
      <PageMeta title="Admin dashboard" />
      {loading && !stats ? <LoadingBlock /> : null}
      {error && !stats ? <ErrorBlock message={error} /> : null}

      {stats ? (
        <FadeContent>
          <div className="admin-dash-meta">
            <span className="admin-live-dot" aria-hidden />
            <span className="text-body-sm" style={{ color: "var(--color-pewter)" }}>
              Auto-refreshing
              {updatedAt
                ? ` · updated ${updatedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : ""}
            </span>
          </div>

          <div className="admin-stat-grid">
            <div className="admin-stat-card admin-stat-card--accent-jade">
              <Tag tone="muted">Orders today</Tag>
              <p className="admin-stat-card__value">
                <Counter to={stats.orders_today} duration={0.9} />
              </p>
              <p className="admin-stat-card__hint">
                {stats.orders_week} this week
              </p>
            </div>
            <div className="admin-stat-card admin-stat-card--accent-gold">
              <Tag tone="muted">Revenue today</Tag>
              <p className="admin-stat-card__value">
                {formatMoney(stats.revenue_today, "PKR")}
              </p>
              <p className="admin-stat-card__hint">
                {formatMoney(stats.revenue_week, "PKR")} this week
              </p>
            </div>
            <div className="admin-stat-card admin-stat-card--accent-rose">
              <Tag tone="muted">Low stock</Tag>
              <p className="admin-stat-card__value">
                <Counter to={stats.low_stock} duration={0.9} />
              </p>
              <p className="admin-stat-card__hint">
                ≤ 5 units · {stats.catalog.products} active SKUs
              </p>
            </div>
            <div className="admin-stat-card admin-stat-card--accent-sky">
              <Tag tone="muted">Pending fulfilment</Tag>
              <p className="admin-stat-card__value">
                <Counter to={stats.pending_shipments} duration={0.9} />
              </p>
              <p className="admin-stat-card__hint">
                {stats.catalog.brands} brands · {stats.catalog.categories} categories
              </p>
            </div>
          </div>

          <div className="admin-dash-grid">
            <section className="admin-chart-panel admin-chart-panel--wide">
              <header className="admin-chart-panel__head">
                <div>
                  <h2 className="text-subheading" style={{ margin: 0 }}>
                    Revenue &amp; orders
                  </h2>
                  <p className="text-body-sm" style={{ color: "var(--color-pewter)", margin: "6px 0 0" }}>
                    Last 14 days (excluding cancelled)
                  </p>
                </div>
              </header>
              <div className="admin-chart-panel__body admin-chart-panel__body--tall">
                {series.every((d) => d.orders === 0 && d.revenueNum === 0) ? (
                  <p className="admin-chart-empty">No order activity in this window yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="ordFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={JADE} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={JADE} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(22,32,51,0.08)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: CHART_MUTED, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        yAxisId="rev"
                        tick={{ fill: CHART_MUTED, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                        }
                      />
                      <YAxis
                        yAxisId="ord"
                        orientation="right"
                        tick={{ fill: CHART_MUTED, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltipBox />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: CHART_MUTED }} />
                      <Area
                        yAxisId="rev"
                        type="monotone"
                        dataKey="revenueNum"
                        name="Revenue"
                        stroke={GOLD}
                        strokeWidth={2.2}
                        fill="url(#revFill)"
                        activeDot={{ r: 4 }}
                      />
                      <Area
                        yAxisId="ord"
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke={JADE}
                        strokeWidth={2}
                        fill="url(#ordFill)"
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="admin-chart-panel">
              <header className="admin-chart-panel__head">
                <div>
                  <h2 className="text-subheading" style={{ margin: 0 }}>
                    Order status
                  </h2>
                  <p className="text-body-sm" style={{ color: "var(--color-pewter)", margin: "6px 0 0" }}>
                    All-time mix
                  </p>
                </div>
              </header>
              <div className="admin-chart-panel__body">
                {statusData.length === 0 ? (
                  <p className="admin-chart-empty">No orders to chart yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="52%"
                        outerRadius="78%"
                        paddingAngle={3}
                        stroke="none"
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] || CHART_MUTED}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipBox />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: 11, color: CHART_MUTED }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="admin-chart-panel">
              <header className="admin-chart-panel__head">
                <div>
                  <h2 className="text-subheading" style={{ margin: 0 }}>
                    Top sellers
                  </h2>
                  <p className="text-body-sm" style={{ color: "var(--color-pewter)", margin: "6px 0 0" }}>
                    Units sold
                  </p>
                </div>
              </header>
              <div className="admin-chart-panel__body">
                {topProducts.length === 0 ? (
                  <p className="admin-chart-empty">Sales will appear here after checkout.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid stroke="rgba(22,32,51,0.08)" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={108}
                        tick={{ fill: CHART_INK, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number, _name, item) => [
                          value,
                          (item?.payload as { fullName?: string })?.fullName || "Units",
                        ]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid rgba(22,32,51,0.1)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="units" name="Units" radius={[0, 8, 8, 0]} fill={JADE} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>

          <section className="admin-chart-panel admin-recent-panel">
            <header className="admin-chart-panel__head">
              <div>
                <h2 className="text-subheading" style={{ margin: 0 }}>
                  Recent orders
                </h2>
                <p className="text-body-sm" style={{ color: "var(--color-pewter)", margin: "6px 0 0" }}>
                  Jump into fulfilment
                </p>
              </div>
              <Link to="/admin/orders" className="admin-dash-link">
                View all →
              </Link>
            </header>
            {stats.recent_orders.length === 0 ? (
              <p className="text-body-sm" style={{ color: "var(--color-pewter)", margin: 0 }}>
                No orders yet.
              </p>
            ) : (
              <div className="admin-recent-list">
                {stats.recent_orders.map((order) => (
                  <Link
                    key={order.order_number}
                    to={`/admin/orders/${order.order_number}`}
                    className="admin-recent-row"
                  >
                    <span className="admin-recent-row__main">
                      <strong>{order.order_number}</strong>
                      <span>{order.full_name}</span>
                    </span>
                    <span className="admin-recent-row__meta">
                      <span
                        className="admin-status-pill"
                        data-status={order.status}
                      >
                        {statusLabel(order.status)}
                      </span>
                      <span>{formatMoney(order.total, order.currency)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </FadeContent>
      ) : null}
    </AdminLayout>
  );
}
