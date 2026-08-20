import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import { Input, PillFilledButton } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/adminApi";
import type { SiteSettings } from "../../types/catalog";

export function AdminSettingsPage() {
  const { push } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    site_name: "",
    slogan: "Your trust, our commitment",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    about_blurb: "",
    currency: "PKR",
  });

  useEffect(() => {
    adminApi
      .siteSettings()
      .then((data) => {
        setSettings(data);
        setForm({
          site_name: data.site_name,
          slogan: data.slogan,
          logo_url: data.logo_url || "",
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_address: data.contact_address,
          about_blurb: data.about_blurb,
          currency: data.currency,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let updated: SiteSettings;
      if (logoFile) {
        const body = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (k === "logo_url") return;
          body.append(k, v);
        });
        body.append("logo_file", logoFile);
        updated = await adminApi.updateSiteSettings(body);
      } else {
        updated = await adminApi.updateSiteSettings(form);
      }
      setSettings(updated);
      setLogoFile(null);
      setForm((f) => ({ ...f, logo_url: updated.logo_url || "" }));
      push("Settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      push("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const preview = form.logo_url || settings?.logo_url;

  return (
    <AdminLayout
      title="Site settings"
      subtitle="Brand, contact, and storefront copy — logo via R2 URL"
    >
      <PageMeta title="Admin settings" />
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {!loading ? (
        <form
          onSubmit={onSubmit}
          style={{ display: "grid", gap: 16, maxWidth: 640 }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Logo"
              style={{ width: 96, height: 96, objectFit: "contain", borderRadius: 16 }}
            />
          ) : null}
          <Input
            label="Logo R2 public URL"
            value={form.logo_url}
            onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
            placeholder="https://pub-xxxx.r2.dev/…"
          />
          <div className="field">
            <span className="field__label">Or upload logo → R2 (am-media)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-caption" style={{ margin: "8px 0 0", color: "var(--color-pewter)" }}>
              {settings?.cloudflare_configured
                ? "Cloudflare R2 is configured on the API."
                : "R2 not configured — paste a logo_url instead of uploading."}
            </p>
          </div>
          <Input
            label="Site name"
            value={form.site_name}
            onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))}
          />
          <Input
            label="Slogan"
            value={form.slogan}
            onChange={(e) => setForm((f) => ({ ...f, slogan: e.target.value }))}
          />
          <Input
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
          />
          <Input
            label="Contact email"
            type="email"
            value={form.contact_email}
            onChange={(e) =>
              setForm((f) => ({ ...f, contact_email: e.target.value }))
            }
          />
          <Input
            label="Contact phone"
            value={form.contact_phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, contact_phone: e.target.value }))
            }
          />
          <Input
            label="Address"
            value={form.contact_address}
            onChange={(e) =>
              setForm((f) => ({ ...f, contact_address: e.target.value }))
            }
          />
          <Input
            label="About blurb"
            value={form.about_blurb}
            onChange={(e) =>
              setForm((f) => ({ ...f, about_blurb: e.target.value }))
            }
          />
          <PillFilledButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </PillFilledButton>
        </form>
      ) : null}
    </AdminLayout>
  );
}
