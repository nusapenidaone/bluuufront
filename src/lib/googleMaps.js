let promise = null;

// Google's official dynamic-library-import bootstrap (un-minified). Defines
// google.maps.importLibrary synchronously so subsequent importLibrary calls
// can lazily fetch the actual API — a plain <script src=...&loading=async>
// tag does NOT set this up on its own, and without it google.maps.Map (and
// friends) are never registered.
function bootstrapLoader(apiKey) {
  if (window.google?.maps?.importLibrary) return;
  ((g) => {
    let h, a, k;
    const p = "The Google Maps JavaScript API";
    const c = "google", l = "importLibrary", q = "__ib__";
    const m = document, b = window;
    b[c] = b[c] || {};
    const d = b[c].maps || (b[c].maps = {});
    const r = new Set();
    const e = new URLSearchParams();
    const u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        a = m.createElement("script");
        e.set("libraries", [...r] + "");
        for (k in g) e.set(k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
    d[l] ? console.warn(p + " only loads once. Ignoring:", g) : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key: apiKey, v: "weekly" });
}

export function loadGoogleMaps() {
  if (promise) return promise;
  bootstrapLoader(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  promise = Promise.all([
    window.google.maps.importLibrary('maps'),
    window.google.maps.importLibrary('places'),
    window.google.maps.importLibrary('geocoding'),
  ]).then(() => window.google);
  return promise;
}
