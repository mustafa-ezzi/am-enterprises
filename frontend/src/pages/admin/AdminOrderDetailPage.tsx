import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import {
  Input,
  PillFilledButton,
  PillGhostButton,
  Select,
  Tag,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/adminApi";
import { formatMoney } from "../../lib/api";
import type { Order } from "../../types/commerce";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function AdminOrderDetailPage() {
  const { orderNumber = "" } = useParams();
  const { push } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("pending");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    adminApi
      .order(orderNumber)
      .then((data) => {
        setOrder(data);
        setStatus(data.status);
        setTracking(data.tracking_number || "");
        setNotes(data.notes || "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!orderNumber) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateOrder(orderNumber, {
        status,
        tracking_number: tracking,
        notes,
      });
      setOrder(updated);
      push("Order updated");
    } catch (err) {
      push(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout
      title={order?.order_number || "Order"}
      subtitle={order ? `${order.full_name} · ${order.email}` : undefined}
      actions={<PillGhostButton to="/admin/orders">← Orders</PillGhostButton>}
    >
      <PageMeta title={`Order ${orderNumber}`} />
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {order ? (
        <div
          style={{
            display: "grid",
            gap: 32,
            gridTemplateColumns: "1fr",
          }}
          className="order-detail"
        >
          <div>
            <Tag>{order.status}</Tag>
            <p className="text-body" style={{ margin: "16px 0" }}>
              {formatMoney(order.total, order.currency)}
            </p>
            <p className="text-body-sm">
              {order.address}, {order.city} {order.postal_code}
            </p>
            <p className="text-body-sm">
              {order.phone} · {order.shipping_method} · {order.payment_method}
            </p>

            <h2 className="text-subheading" style={{ margin: "28px 0 12px" }}>
              Items
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {order.items.map((item) => (
                <li key={item.id} className="text-body-sm" style={{ marginBottom: 8 }}>
                  {item.product_name} × {item.quantity} —{" "}
                  {formatMoney(item.line_total, order.currency)}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={onSave}
            style={{
              border: "1px solid var(--color-charcoal-ink)",
              padding: 20,
              display: "grid",
              gap: 14,
              alignSelf: "start",
            }}
          >
            <h2 className="text-subheading" style={{ margin: 0 }}>
              Fulfillment
            </h2>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={STATUSES.map((s) => ({ value: s, label: s }))}
            />
            <Input
              label="Tracking number"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <PillFilledButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Update order"}
            </PillFilledButton>
          </form>
        </div>
      ) : null}

      <style>{`
        @media (min-width: 900px) {
          .order-detail {
            grid-template-columns: 1.2fr 0.8fr !important;
            align-items: start;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
