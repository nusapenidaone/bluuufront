function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getGaClientId() {
  const rawValue = readCookie("_ga");
  if (!rawValue) return null;

  const parts = rawValue.split(".");
  if (parts.length < 4) return rawValue;

  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
}

export function buildTourAnalyticsItem({
  itemId,
  itemName,
  itemCategory,
  price,
  quantity = 1,
  currency = "IDR",
  itemBrand = "bluuu",
  discount = 0,
}) {
  const item = {
    item_id: String(itemId || "unknown"),
    item_name: itemName || "Bluuu Tour",
    currency,
    item_brand: itemBrand,
    item_category: itemCategory || "Tour",
    price: toNumber(price),
    quantity: Math.max(1, toNumber(quantity) || 1),
  };

  if (toNumber(discount) > 0) {
    item.discount = toNumber(discount);
  }

  return item;
}

export function pushEcommerceEvent(eventName, { value, currency = "IDR", items = [], dedupeKey } = {}) {
  if (typeof window === "undefined") return false;

  if (dedupeKey && typeof window.sessionStorage !== "undefined") {
    if (window.sessionStorage.getItem(dedupeKey)) {
      return false;
    }
    window.sessionStorage.setItem(dedupeKey, "1");
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ecommerce: {
      value: toNumber(value),
      currency,
      items: items.filter(Boolean),
    },
  });

  return true;
}

export function trackAddToCart(payload) {
  return pushEcommerceEvent("add_to_cart", payload);
}

export function trackBeginCheckout(payload) {
  return pushEcommerceEvent("begin_checkout", payload);
}

// ── Meta Pixel helpers ────────────────────────────────────────────────────────

function fbq(...args) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/**
 * ViewContent — fire when a tour page loads and tour data is ready.
 * @param {{ contentName: string, value: number, currency?: string }} param
 */
export function trackPixelViewContent({ contentName, value, currency = "IDR" }) {
  fbq("track", "ViewContent", {
    content_name: contentName,
    content_type: "product",
    value: toNumber(value),
    currency,
  });
}

/**
 * InitiateCheckout — fire when user lands on the payment page.
 * @param {{ value: number, currency?: string }} param
 */
export function trackPixelInitiateCheckout({ value, currency = "IDR" }) {
  fbq("track", "InitiateCheckout", {
    value: toNumber(value),
    currency,
  });
}

/**
 * Purchase — fire after successful payment redirect.
 * @param {{ value: number, currency?: string, orderId?: string }} param
 */
export function trackPixelPurchase({ value, currency = "IDR", orderId }) {
  fbq("track", "Purchase", {
    value: toNumber(value),
    currency,
    ...(orderId ? { order_id: String(orderId) } : {}),
  });
}
