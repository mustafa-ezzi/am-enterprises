import { Link } from "react-router-dom";
import type { ProductListItem } from "../types/catalog";
import { formatMoney } from "../lib/api";
import { productImage } from "../lib/productPhotos";
import { Tag } from "./ui/Tag";

type ProductCardProps = {
  product: ProductListItem;
  currency?: string;
};

export function ProductCard({ product, currency = "PKR" }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card__media">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="product-card__body">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {product.brand_name ? (
            <Tag tone="ink">{product.brand_name}</Tag>
          ) : null}
          <Tag>{product.category_name}</Tag>
        </div>
        <Link to={`/products/${product.slug}`}>
          <h3 className="product-card__title">{product.name}</h3>
        </Link>
        <p className="product-card__meta text-body-sm">
          {formatMoney(product.price, currency)}
          {product.compare_at_price
            ? ` · was ${formatMoney(product.compare_at_price, currency)}`
            : ""}
          {" · "}
          {product.in_stock ? "In stock" : "Out of stock"}
        </p>
      </div>
    </article>
  );
}
