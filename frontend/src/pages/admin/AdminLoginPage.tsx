import { useState, type FormEvent, type ChangeEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageMeta } from "../../components/PageMeta";
import { Input, PillFilledButton, Tag } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { AdminApiError } from "../../lib/adminApi";

export function AdminLoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from || "/admin";

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Could not sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--color-paper-white)",
      }}
    >
      <PageMeta title="Admin login" />
      <form
        onSubmit={onSubmit}
        style={{
          width: "min(100%, 420px)",
          border: "1px solid var(--color-charcoal-ink)",
          padding: 28,
          display: "grid",
          gap: 16,
        }}
      >
        <div>
          <Tag>Admin</Tag>
          <h1 className="text-heading-sm" style={{ margin: "12px 0 8px" }}>
            Sign in
          </h1>
          <p className="text-body-sm" style={{ margin: 0 }}>
            AM Enterprises control panel
          </p>
         
        </div>
        <Input
          label="Username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="text-body-sm" style={{ margin: 0, color: "var(--color-signal-red)" }}>
            {error}
          </p>
        ) : null}
        <PillFilledButton type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </PillFilledButton>
      </form>
    </div>
  );
}
