import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { PageMeta } from "../../components/PageMeta";
import { ErrorBlock, LoadingBlock } from "../../components/StatusBlocks";
import {
  Input,
  PillFilledButton,
  PillGhostButton,
  Select,
} from "../../components/ui";
import { Stepper } from "../../components/motion";
import { useToast } from "../../context/ToastContext";
import { adminApi, listAllBrands, listAllCategories } from "../../lib/adminApi";
import type { Brand, Category, ProductDetail } from "../../types/catalog";

type FormState = {
  name: string;
  sku: string;
  description: string;
  price: string;
  compare_at_price: string;
  stock: string;
  brand: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  sku: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "0",
  brand: "",
  category: "",
  is_featured: false,
  is_active: true,
};

export function AdminProductFormPage() {
  const { slug } = useParams();
  const isNew = !slug || slug === "new";
  const navigate = useNavigate();
  const { push } = useToast();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    Promise.all([listAllCategories(), listAllBrands()])
      .then(([cats, brandList]) => {
        setCategories(cats);
        setBrands(brandList);
        if (isNew) {
          setForm((f) => ({
            ...f,
            category: cats[0] ? String(cats[0].id) : f.category,
            brand: brandList[0] ? String(brandList[0].id) : f.brand,
          }));
        }
      })
      .catch(() => undefined);
  }, [isNew]);

  useEffect(() => {
    if (isNew || !slug) return;
    setLoading(true);
    adminApi
      .product(slug)
      .then((p) => {
        setProduct(p);
        setForm({
          name: p.name,
          sku: p.sku,
          description: p.description,
          price: p.price,
          compare_at_price: p.compare_at_price ?? "",
          stock: String(p.stock),
          brand: p.brand != null ? String(p.brand) : "",
          category: String(p.category),
          is_featured: p.is_featured,
          is_active: p.is_active,
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isNew, slug]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      price: form.price,
      compare_at_price: form.compare_at_price || null,
      stock: Number(form.stock) || 0,
      brand: form.brand ? Number(form.brand) : null,
      category: Number(form.category),
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    try {
      let savedSlug = slug || "";
      let productId = product?.id;
      if (isNew) {
        const created = await adminApi.createProduct(payload);
        savedSlug = created.slug;
        productId = created.id;
        push("Product created");
      } else if (slug) {
        await adminApi.updateProduct(slug, payload);
        savedSlug = slug;
        push("Product saved");
      }

      if (productId) {
        if (file) {
          await adminApi.uploadProductImage(productId, file, form.name);
          push("Image uploaded to Cloudflare");
        } else if (imageUrl.trim()) {
          await adminApi.addProductImageUrl(productId, imageUrl.trim(), form.name);
          push("Image URL saved");
        }
      }

      navigate(`/admin/products/${savedSlug}`);
      if (!isNew) {
        const refreshed = await adminApi.product(savedSlug);
        setProduct(refreshed);
        setFile(null);
        setImageUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      push("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeImage(id: number) {
    if (!window.confirm("Remove this image?")) return;
    try {
      await adminApi.deleteProductImage(id);
      push("Image removed");
      if (slug) {
        const refreshed = await adminApi.product(slug);
        setProduct(refreshed);
      }
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  return (
    <AdminLayout
      title={isNew ? "New product" : "Edit product"}
      subtitle={isNew ? "Add a catalogue item" : form.name || slug}
      actions={<PillGhostButton to="/admin/products">← Products</PillGhostButton>}
    >
      <PageMeta title={isNew ? "New product" : "Edit product"} />
      {loading ? <LoadingBlock /> : null}
      {error ? <ErrorBlock message={error} /> : null}

      {!loading ? (
        <form
          onSubmit={onSubmit}
          style={{ display: "grid", gap: 16, maxWidth: 640 }}
        >
          <Stepper
            steps={[{ label: "Basics" }, { label: "Pricing & media" }]}
            current={step}
            onChange={setStep}
            style={{ marginBottom: 8 }}
          />

          {step === 1 ? (
            <>
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
              <Input
                label="SKU"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                required
              />
              <Select
                label="Brand"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                options={brands.map((b) => ({
                  value: String(b.id),
                  label: b.name,
                }))}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                options={categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              <label className="text-body-sm" style={{ display: "flex", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => update("is_active", e.target.checked)}
                />
                Published
              </label>
              <label className="text-body-sm" style={{ display: "flex", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => update("is_featured", e.target.checked)}
                />
                Featured on landing
              </label>
              <PillGhostButton type="button" onClick={() => setStep(2)}>
                Next →
              </PillGhostButton>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                }}
              >
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  required
                />
                <Input
                  label="Compare at"
                  type="number"
                  step="0.01"
                  value={form.compare_at_price}
                  onChange={(e) => update("compare_at_price", e.target.value)}
                />
                <Input
                  label="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  required
                />
              </div>

              <Input
                label="Cloudflare image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://imagedelivery.net/…/public"
              />
              <p className="text-caption" style={{ margin: 0, color: "var(--color-pewter)" }}>
                Prefer pasting an R2 public URL. File upload goes to the Cloudflare R2
                bucket am-media when env is set — Railway only stores the URL.
              </p>
              <div className="field">
                <span className="field__label">Or upload file → R2 (am-media)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {product?.images?.length ? (
                <div
                  style={{ display: "grid", gap: 12 }}
                >
                  {product.images.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={img.image_url || img.image}
                        alt={img.alt_text || form.name}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 12,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          className="text-caption"
                          style={{
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={img.image_url || img.image}
                        >
                          {img.image_url || img.image}
                        </p>
                        <PillGhostButton
                          type="button"
                          onClick={() => void removeImage(img.id)}
                        >
                          Remove
                        </PillGhostButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <PillGhostButton type="button" onClick={() => setStep(1)}>
                  ← Back
                </PillGhostButton>
                <PillFilledButton type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save product"}
                </PillFilledButton>
                <PillGhostButton to="/admin/products">Cancel</PillGhostButton>
              </div>
            </>
          )}
        </form>
      ) : null}
    </AdminLayout>
  );
}
