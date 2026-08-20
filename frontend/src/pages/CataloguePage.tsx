import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { ProductCard } from "../components/ProductCard";
import { PageMeta } from "../components/PageMeta";
import { ErrorBlock, ProductCardSkeleton } from "../components/StatusBlocks";
import {
  EmptyState,
  Input,
  PillFilledButton,
  PillGhostButton,
  Select,
  Tag,
} from "../components/ui";
import { AnimatedList, PillNav } from "../components/motion";
import { api, formatMoney, listBrands, listCategories } from "../lib/api";
import type { Brand, Category, ProductListItem, SiteSettings } from "../types/catalog";

const PAGE_SIZE = 12;

export function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [count, setCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currency, setCurrency] = useState("PKR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(params.get("search") ?? "");

  const page = Number(params.get("page") || "1");
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const search = params.get("search") ?? "";
  const ordering = params.get("ordering") ?? "name";
  const availability = params.get("availability") ?? "all";

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    listBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
    api
      .siteSettings()
      .then((s: SiteSettings) => setCurrency(s.currency || "PKR"))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .products({
        page,
        search: search || undefined,
        category__slug: category || undefined,
        brand__slug: brand || undefined,
        ordering,
      })
      .then((data) => {
        if (cancelled) return;
        let results = data.results ?? [];
        if (availability === "in_stock") {
          results = results.filter((p) => p.in_stock);
        } else if (availability === "out_of_stock") {
          results = results.filter((p) => !p.in_stock);
        }
        setProducts(results);
        setCount(data.count ?? results.length);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Could not load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, category, brand, ordering, availability]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / PAGE_SIZE)),
    [count],
  );

  function updateParam(key: string, value: string, resetPage = true) {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || (key === "ordering" && value === "name" && !params.get("ordering"))) {
      if (key === "ordering" && value === "name") {
        next.delete(key);
      } else if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    } else {
      next.set(key, value);
    }
    if (resetPage && key !== "page") next.delete("page");
    setParams(next);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", searchDraft.trim());
  }

  return (
    <StorefrontLayout>
      <PageMeta
        title="Catalogue"
        description="Browse household products from AM Enterprises."
      />
      <SectionBand tone="cream">
        <Tag>Shop</Tag>
        <hr className="rule-red" />
        <h1 className="text-heading" style={{ margin: "0 0 12px" }}>
          Catalogue
        </h1>
        <p className="text-body" style={{ maxWidth: 520, marginBottom: 24 }}>
          Shop by AM Enterprises sub-brands — Daisy and Kitchenware — or browse
          by room.
        </p>

        <p className="text-caption" style={{ marginBottom: 10, color: "var(--color-gold)" }}>
          Brands
        </p>
        <PillNav
          items={[
            {
              label: "All brands",
              active: !brand,
              onClick: () => updateParam("brand", ""),
            },
            ...brands.map((b) => ({
              label: b.name,
              active: brand === b.slug,
              onClick: () => updateParam("brand", b.slug),
            })),
          ]}
          style={{ marginBottom: 20 }}
        />

        <p className="text-caption" style={{ marginBottom: 10, color: "var(--color-gold)" }}>
          Categories
        </p>
        <PillNav
          items={[
            {
              label: "All",
              active: !category,
              onClick: () => updateParam("category", ""),
            },
            ...categories.map((c) => ({
              label: c.name,
              active: category === c.slug,
              onClick: () => updateParam("category", c.slug),
            })),
          ]}
          style={{ marginBottom: 28 }}
        />

        <form
          onSubmit={submitSearch}
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr",
            marginBottom: 28,
          }}
          className="catalogue-filters"
        >
          <Input
            label="Search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search products"
          />
          <Select
            label="Sort"
            value={ordering}
            onChange={(e) => updateParam("ordering", e.target.value)}
            options={[
              { value: "name", label: "Name A–Z" },
              { value: "-name", label: "Name Z–A" },
              { value: "price", label: "Price low–high" },
              { value: "-price", label: "Price high–low" },
              { value: "-created_at", label: "Newest" },
            ]}
          />
          <Select
            label="Availability"
            value={availability}
            onChange={(e) => updateParam("availability", e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "in_stock", label: "In stock" },
              { value: "out_of_stock", label: "Out of stock" },
            ]}
          />
          <div style={{ display: "flex", alignItems: "end" }}>
            <PillFilledButton type="submit">Apply search</PillFilledButton>
          </div>
        </form>

        <p className="text-caption" style={{ marginBottom: 20, color: "var(--color-pewter)" }}>
          {loading ? "Loading…" : `${count} products`}
          {brand ? ` · ${brands.find((b) => b.slug === brand)?.name ?? brand}` : ""}
          {category ? ` · ${categories.find((c) => c.slug === category)?.name ?? category}` : ""}
        </p>

        {error ? <ErrorBlock message={error} /> : null}
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try another search or clear filters."
            action={
              <PillGhostButton
                onClick={() => {
                  setParams(new URLSearchParams());
                  setSearchDraft("");
                }}
              >
                Clear filters
              </PillGhostButton>
            }
          />
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <AnimatedList
            className="product-grid"
            deps={`${search}|${brand}|${category}|${ordering}|${availability}|${page}|${products.map((p) => p.id).join(",")}`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </AnimatedList>
        ) : null}

        {!loading && totalPages > 1 ? (
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 40,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <PillGhostButton
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1), false)}
            >
              Previous
            </PillGhostButton>
            <span className="text-caption">
              Page {page} of {totalPages}
            </span>
            <PillGhostButton
              disabled={page >= totalPages}
              onClick={() => updateParam("page", String(page + 1), false)}
            >
              Next
            </PillGhostButton>
          </div>
        ) : null}

        <p className="text-caption" style={{ marginTop: 24, color: "var(--color-pewter)" }}>
          Prices in {formatMoney(0, currency).split(" ")[0]}
        </p>
      </SectionBand>

      <style>{`
        @media (min-width: 768px) {
          .catalogue-filters {
            grid-template-columns: 1.4fr 1fr 1fr auto !important;
            align-items: end;
          }
        }
      `}</style>
    </StorefrontLayout>
  );
}
