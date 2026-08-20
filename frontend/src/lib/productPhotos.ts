/** Documentary household photography used when a product has no uploaded image. */

const BY_SKU: Record<string, string> = {
  "AM-KIT-001":
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1400&q=80",
  "AM-KIT-002":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80",
  "AM-KIT-003":
    "https://images.unsplash.com/photo-1606914501449-5a96b8ce8aca?auto=format&fit=crop&w=1400&q=80",
  "AM-CLN-001":
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1400&q=80",
  "AM-CLN-002":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
  "AM-CLN-003":
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1400&q=80",
  "AM-ORG-001":
    "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=80",
  "AM-ORG-002":
    "https://images.unsplash.com/photo-1615874959471-d1b12bf9c19d?auto=format&fit=crop&w=1400&q=80",
  "AM-ORG-003":
    "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80",
  "AM-BTH-001":
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
  "AM-BTH-002":
    "https://images.unsplash.com/photo-1620620174062-a486485e27f1?auto=format&fit=crop&w=1400&q=80",
  "AM-LND-001":
    "https://images.unsplash.com/photo-1517677208171-4bd272803bf9?auto=format&fit=crop&w=1400&q=80",
  "AM-LND-002":
    "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1400&q=80",
  "AM-LND-003":
    "https://images.unsplash.com/photo-1545173166-9a35ecd0a78d?auto=format&fit=crop&w=1400&q=80",
};

const BY_CATEGORY: Record<string, string> = {
  "Kitchen Essentials": BY_SKU["AM-KIT-001"],
  "Cleaning Supplies": BY_SKU["AM-CLN-001"],
  "Home Organization": BY_SKU["AM-ORG-001"],
  Bathroom: BY_SKU["AM-BTH-001"],
  Laundry: BY_SKU["AM-LND-002"],
};

const FALLBACK =
  "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80";

export function productImage(product: {
  sku?: string;
  primary_image?: string | null;
  category_name?: string;
  images?: Array<{ image?: string; image_url?: string }>;
}): string {
  if (product.primary_image) return product.primary_image;
  const uploaded = product.images?.[0]?.image_url || product.images?.[0]?.image;
  if (uploaded) return uploaded;
  if (product.sku && BY_SKU[product.sku]) return BY_SKU[product.sku];
  if (product.category_name && BY_CATEGORY[product.category_name]) {
    return BY_CATEGORY[product.category_name];
  }
  return FALLBACK;
}
