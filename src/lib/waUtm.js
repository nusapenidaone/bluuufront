const PHONE_MAP = {
  meta:      "628213845159",
  facebook:  "628213845159",
  instagram: "628213845159",
  google:    "6281547483381",
  tiktok:    "628214097657",
};
const PHONE_DEFAULT = "6281547483381";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

function getUtmSource() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("utm_source");
    if (fromUrl) return fromUrl.toLowerCase().trim();
    const raw = sessionStorage.getItem("bluuu_utm");
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.utm_source) return saved.utm_source.toLowerCase().trim();
    }
  } catch (_) {}
  return "";
}

function buildLandingUrl() {
  const params = new URLSearchParams();
  const search = new URLSearchParams(window.location.search);
  UTM_KEYS.forEach((key) => {
    const val = search.get(key);
    if (val) params.set(key, val);
  });
  const qs = params.toString();
  return window.location.origin + window.location.pathname + (qs ? "?" + qs : "");
}

function handleClick(e) {
  let el = e.target;
  while (el && el.tagName !== "A") el = el.parentElement;
  if (!el) return;
  const href = el.getAttribute("href") || "";
  if (!href || !/wa\.me|api\.whatsapp\.com\/send|web\.whatsapp\.com\/send/.test(href)) return;

  const source = getUtmSource();
  const phone  = PHONE_MAP[source] || PHONE_DEFAULT;
  const url    = buildLandingUrl();
  const msg    = "Hii Bluuu Tours! I want to ask about one of your tours\n\nPlease do not delete this link: " + url;

  el.setAttribute("href", "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg));
}

export function initWaUtm() {
  document.addEventListener("click", handleClick, true);
}
