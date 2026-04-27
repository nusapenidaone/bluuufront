function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_referrer"];
const UTM_STORAGE_KEY = "bluuu_utm";

export function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) fromUrl[k] = v;
  });

  // Read existing stored data to merge into
  let existing = {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch { /* ignore */ }

  // URL params always win; start from existing then overlay URL params
  const merged = { ...existing, ...fromUrl };

  // Capture external referrer once — only if not already stored and not internal
  if (!merged['utm_referrer']) {
    const ref = typeof document !== 'undefined' ? document.referrer : '';
    const isExternal = ref && !ref.includes(window.location.hostname);
    if (isExternal) merged['utm_referrer'] = ref;
  }

  if (Object.keys(merged).length > 0) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
  }
}

export function getUtmParams() {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getUtmQueryString() {
  const utm = getUtmParams();
  if (!utm || Object.keys(utm).length === 0) return "";
  return new URLSearchParams(utm).toString();
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

export function trackViewItem(payload) {
  return pushEcommerceEvent("view_item", payload);
}

export function trackAddToCart(payload) {
  return pushEcommerceEvent("add_to_cart", payload);
}

export function trackBeginCheckout(payload) {
  return pushEcommerceEvent("begin_checkout", payload);
}

export function trackAddPaymentInfo(payload) {
  return pushEcommerceEvent("add_payment_info", payload);
}

export function trackPurchase({ value, currency = "IDR", items = [], transactionId, numItems } = {}) {
  if (typeof window === "undefined") return false;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: transactionId || String(Date.now()),
      value: toNumber(value),
      currency,
      num_items: numItems || items.length || 1,
      items: items.filter(Boolean),
    },
  });
  return true;
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
export function trackPixelViewContent({ contentIds, contentName, value, currency = "IDR" }) {
  fbq("track", "ViewContent", {
    content_ids: contentIds ? [String(contentIds)] : [],
    content_name: contentName,
    content_type: "product",
    value: toNumber(value),
    currency,
  });
}

export function trackPixelAddToCart({ contentIds, contentName, value, currency = "IDR" }) {
  fbq("track", "AddToCart", {
    content_ids: contentIds ? [String(contentIds)] : [],
    content_name: contentName,
    content_type: "product",
    value: toNumber(value),
    currency,
  });
}

export function trackPixelAddPaymentInfo({ value, currency = "IDR" }) {
  fbq("track", "AddPaymentInfo", {
    value: toNumber(value),
    currency,
  });
}

/**
 * InitiateCheckout — fire when user lands on the payment page.
 * @param {{ value: number, currency?: string }} param
 */
export function trackPixelInitiateCheckout({ contentIds, value, currency = "IDR", numItems }) {
  fbq("track", "InitiateCheckout", {
    content_ids: contentIds ? [String(contentIds)] : [],
    value: toNumber(value),
    currency,
    ...(numItems ? { num_items: numItems } : {}),
  });
}

/**
 * Purchase — fire after successful payment redirect.
 * @param {{ value: number, currency?: string, orderId?: string }} param
 */
export function trackPixelPurchase({ contentIds, value, currency = "IDR", orderId, numItems }) {
  fbq("track", "Purchase", {
    content_ids: contentIds ? [String(contentIds)] : [],
    value: toNumber(value),
    currency,
    ...(orderId ? { order_id: String(orderId) } : {}),
    ...(numItems ? { num_items: numItems } : {}),
  });
}
