import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { PageMeta } from "../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../components/StatusBlocks";
import {
  EmptyState,
  Input,
  PillFilledButton,
  PillGhostButton,
  Select,
  Tag,
} from "../components/ui";
import { useCart } from "../context/CartContext";
import { ApiError, api, formatMoney, getCartKey } from "../lib/api";
import type { Order } from "../types/commerce";
import { Stepper } from "../components/motion";

export type CheckoutDraft = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  shippingMethod: "standard" | "express";
  paymentMethod: "cod" | "bank_transfer";
  notes: string;
};

const shippingRates = {
  standard: 250,
  express: 550,
} as const;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, subtotal, clear, itemCount } = useCart();
  const [currency, setCurrency] = useState("PKR");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutDraft>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    shippingMethod: "standard",
    paymentMethod: "cod",
    notes: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutDraft, string>>
  >({});

  useEffect(() => {
    api
      .siteSettings()
      .then((s) => setCurrency(s.currency || "PKR"))
      .catch(() => undefined);
  }, []);

  const shipping = shippingRates[form.shippingMethod];
  const total = subtotal + shipping;

  const canContinueAddress = useMemo(() => {
    return Boolean(
      form.fullName.trim() &&
        form.email.trim() &&
        form.phone.trim() &&
        form.address.trim() &&
        form.city.trim(),
    );
  }, [form]);

  function update<K extends keyof CheckoutDraft>(key: K, value: CheckoutDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateAddress() {
    const next: typeof errors = {};
    if (!form.fullName.trim()) next.fullName = "Required";
    if (!form.email.trim() || !form.email.includes("@"))
      next.email = "Valid email required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.address.trim()) next.address = "Required";
    if (!form.city.trim()) next.city = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    if (!validateAddress() || lines.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const order = await api.checkout({
        cart_key: getCartKey(),
        items: lines.map((line) => ({
          product_id: line.productId,
          quantity: line.quantity,
        })),
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postal_code: form.postalCode.trim(),
        notes: form.notes.trim(),
        shipping_method: form.shippingMethod,
        payment_method: form.paymentMethod,
      });
      await clear();
      navigate(`/checkout/confirmation?order=${order.order_number}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not place order. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (itemCount === 0 && !submitting) {
    return (
      <StorefrontLayout>
        <PageMeta title="Checkout" />
        <SectionBand>
          <EmptyState
            title="Nothing to checkout"
            description="Add products to your cart first."
            action={
              <PillFilledButton to="/catalogue">Shop catalogue</PillFilledButton>
            }
          />
        </SectionBand>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <PageMeta title="Checkout" description="Complete your AM Enterprises order." />
      <SectionBand>
        <Tag>Checkout</Tag>
        <h1 className="text-heading" style={{ margin: "16px 0 12px" }}>
          Checkout
        </h1>
        <p
          className="text-caption"
          style={{ marginBottom: 32, color: "var(--color-pewter)" }}
        >
          Step {step} of 3 · Order saved to database · Payment gateway in Phase 5
        </p>

        <Stepper
          steps={[
            { label: "Address" },
            { label: "Shipping" },
            { label: "Payment" },
          ]}
          current={step}
          onChange={(n) => {
            if (n === 1) setStep(1);
            if (n === 2 && canContinueAddress) setStep(2);
            if (n === 3 && canContinueAddress) setStep(3);
          }}
          style={{ marginBottom: 32 }}
        />

        {submitError ? (
          <div style={{ marginBottom: 24 }}>
            <ErrorBlock message={submitError} />
          </div>
        ) : null}

        <form
          onSubmit={placeOrder}
          className="checkout-layout"
          style={{
            display: "grid",
            gap: 40,
            gridTemplateColumns: "1fr",
          }}
        >
          <div>
            {step === 1 ? (
              <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
                <Input
                  label="Full name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  error={errors.fullName}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  error={errors.phone}
                  required
                />
                <Input
                  label="Address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  error={errors.address}
                  required
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  error={errors.city}
                  required
                />
                <Input
                  label="Postal code"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                />
                <PillFilledButton
                  type="button"
                  onClick={() => {
                    if (validateAddress()) setStep(2);
                  }}
                >
                  Continue to shipping
                </PillFilledButton>
              </div>
            ) : null}

            {step === 2 ? (
              <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
                <Select
                  label="Shipping method"
                  value={form.shippingMethod}
                  onChange={(e) =>
                    update(
                      "shippingMethod",
                      e.target.value as CheckoutDraft["shippingMethod"],
                    )
                  }
                  options={[
                    {
                      value: "standard",
                      label: `Standard — ${formatMoney(shippingRates.standard, currency)}`,
                    },
                    {
                      value: "express",
                      label: `Express — ${formatMoney(shippingRates.express, currency)}`,
                    },
                  ]}
                />
                <Input
                  label="Order notes (optional)"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <PillGhostButton type="button" onClick={() => setStep(1)}>
                    Back
                  </PillGhostButton>
                  <PillFilledButton type="button" onClick={() => setStep(3)}>
                    Continue to payment
                  </PillFilledButton>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
                <Select
                  label="Payment method"
                  value={form.paymentMethod}
                  onChange={(e) =>
                    update(
                      "paymentMethod",
                      e.target.value as CheckoutDraft["paymentMethod"],
                    )
                  }
                  options={[
                    { value: "cod", label: "Cash on delivery" },
                    { value: "bank_transfer", label: "Bank transfer" },
                  ]}
                />
                <p className="text-body-sm" style={{ margin: 0 }}>
                  {form.paymentMethod === "cod"
                    ? "Pay when your order arrives. Order is created as pending."
                    : "Bank transfer details will follow by email (console in dev)."}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <PillGhostButton type="button" onClick={() => setStep(2)}>
                    Back
                  </PillGhostButton>
                  <PillFilledButton type="submit" disabled={submitting}>
                    {submitting ? "Placing order…" : "Place order"}
                  </PillFilledButton>
                </div>
              </div>
            ) : null}
          </div>

          <aside
            style={{
              border: "1px solid var(--color-charcoal-ink)",
              padding: 24,
              alignSelf: "start",
            }}
          >
            <h2 className="text-subheading" style={{ margin: "0 0 16px" }}>
              Order summary
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="text-body-sm"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBlock: 10,
                    borderBottom: "1px solid var(--color-newsprint-gray)",
                  }}
                >
                  <span>
                    {line.name} × {line.quantity}
                  </span>
                  <span>
                    {formatMoney(Number(line.price) * line.quantity, currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p
              className="text-body-sm"
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "16px 0 8px",
              }}
            >
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </p>
            <p
              className="text-body-sm"
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "0 0 8px",
              }}
            >
              <span>Shipping</span>
              <span>{formatMoney(shipping, currency)}</span>
            </p>
            <p
              className="text-body"
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "16px 0 0",
                fontWeight: 600,
              }}
            >
              <span>Total</span>
              <span>{formatMoney(total, currency)}</span>
            </p>
          </aside>
        </form>
      </SectionBand>

      <style>{`
        @media (min-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1.3fr 0.9fr !important;
            align-items: start;
          }
        }
      `}</style>
    </StorefrontLayout>
  );
}

export function ConfirmationPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setError("Missing order number.");
      return;
    }
    let cancelled = false;
    api
      .orderByNumber(orderNumber)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Order not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  return (
    <StorefrontLayout>
      <PageMeta title="Order confirmed" />
      <SectionBand>
        <Tag>Confirmed</Tag>
        <h1 className="text-heading" style={{ margin: "16px 0 12px" }}>
          Thank you
        </h1>

        {loading ? <LoadingBlock label="Loading order…" /> : null}
        {error ? (
          <EmptyState
            title="Order not found"
            description={error}
            action={<PillFilledButton to="/catalogue">Shop catalogue</PillFilledButton>}
          />
        ) : null}

        {order ? (
          <>
            <p className="text-body" style={{ maxWidth: 520, marginBottom: 12 }}>
              Your order <strong>{order.order_number}</strong> is saved.
            </p>
            <p
              className="text-body-sm"
              style={{ color: "var(--color-pewter)", marginBottom: 32 }}
            >
              Status: {order.status} · A confirmation email was sent to the console
              in development.
            </p>

            <div
              style={{
                border: "1px solid var(--color-charcoal-ink)",
                padding: 24,
                maxWidth: 560,
                marginBottom: 28,
              }}
            >
              <p className="text-subheading" style={{ margin: "0 0 16px" }}>
                {formatMoney(order.total, order.currency)}
              </p>
              <p className="text-body-sm" style={{ margin: "0 0 8px" }}>
                {order.full_name} · {order.email}
              </p>
              <p className="text-body-sm" style={{ margin: "0 0 8px" }}>
                {order.address}, {order.city}
              </p>
              <p className="text-body-sm" style={{ margin: "0 0 16px" }}>
                {order.shipping_method} shipping · {order.payment_method}
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {order.items.map((item) => (
                  <li key={item.id} className="text-body-sm">
                    {item.product_name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <PillFilledButton to="/catalogue">Continue shopping</PillFilledButton>
              <PillGhostButton to="/">Home</PillGhostButton>
            </div>
          </>
        ) : null}
      </SectionBand>
    </StorefrontLayout>
  );
}
