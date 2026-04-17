import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "./api/base";
import { buildTourAnalyticsItem, getGaClientId, getUtmParams, trackBeginCheckout, trackPixelInitiateCheckout } from "./lib/analytics";
import PhoneInput from "./components/common/PhoneInput";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Lock,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const INPUT_BASE =
  "h-10 w-full rounded-xl border border-neutral-200 bg-white text-sm text-secondary-900 placeholder-secondary-400 transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 px-3";

/**
 * Try to get the Laravel CSRF token from:
 * 1. <meta name="csrf-token"> injected by October CMS theme
 * 2. window.csrfToken global set by theme script
 * 3. XSRF-TOKEN cookie set by Laravel middleware
 */
function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta?.content) return meta.content;
  if (typeof window !== "undefined" && typeof window.csrfToken === "string") {
    return window.csrfToken;
  }
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

function formatIDR(value) {
  if (!value && value !== 0) return "IDR 0";
  return "IDR " + Number(value).toLocaleString("id-ID");
}

const PICKUP_LABELS = {
  "free-shuttle": "Free shuttle",
  "private-one-way": "Private pick up / drop off",
  "private-round-trip": "Private pick up + drop off",
  "no-pickup": "No transfer (meet at lounge)",
};

export default function Checkout() {
  // ── Read URL params ──────────────────────────────────────────────────────
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const tourId = params.get("tourId");
  const boatId = params.get("boatId") ? parseInt(params.get("boatId"), 10) : null;
  const routeId = params.get("routeId") ? parseInt(params.get("routeId"), 10) || null : null;
  const date = params.get("date") || "";
  const adults = Math.max(1, parseInt(params.get("adults") || "1", 10));
  const kids = Math.max(0, parseInt(params.get("kids") || "0", 10));
  const pricePerPerson = parseFloat(params.get("pricePerPerson") || "0");
  const extrasTotal = parseFloat(params.get("extrasTotal") || "0");
  const pickup = params.get("pickup") || "free-shuttle";
  const pickupPrice = parseFloat(params.get("pickupPrice") || "0");

  const extras = useMemo(() => {
    const raw = params.get("extras");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [params]);

  // ── Pricing ──────────────────────────────────────────────────────────────
  const totalGuests = adults + kids;
  const tourPrice = pricePerPerson * totalGuests;
  const fullTotal = tourPrice + extrasTotal + pickupPrice;
  const analyticsCurrency = params.get("analyticsCurrency") || "IDR";
  const analyticsTotal = parseFloat(params.get("analyticsTotal") || String(fullTotal));
  const analyticsItemId = params.get("tourId") || tourId || "shared-tour";
  const analyticsItemName = params.get("tourName") || "Shared Tour";
  const analyticsItemCategory = params.get("tourCategory") || "Shared Tour";

  useEffect(() => {
    trackBeginCheckout({
      value: analyticsTotal,
      currency: analyticsCurrency,
      items: [
        buildTourAnalyticsItem({
          itemId: analyticsItemId,
          itemName: analyticsItemName,
          itemCategory: analyticsItemCategory,
          price: analyticsTotal,
          currency: analyticsCurrency,
        }),
      ],
      dedupeKey: `ga4:begin_checkout:${window.location.pathname}:${window.location.search}`,
    });
    trackPixelInitiateCheckout({ value: analyticsTotal, currency: analyticsCurrency });
  }, [analyticsCurrency, analyticsItemCategory, analyticsItemId, analyticsItemName, analyticsTotal]);

  // ── Form state (restored from sessionStorage on back-navigation) ─────────
  const STORAGE_KEY = "bluuu_checkout_form";
  const saved = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
  }, []);

  const [name, setName] = useState(saved?.name ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(saved?.whatsapp ?? "");
  const [requests, setRequests] = useState(saved?.requests ?? "");

  // ── Payment state ────────────────────────────────────────────────────────
  const [method, setMethod] = useState(saved?.method ?? 1); // 1 = Xendit, 2 = PayPal
  const [depositPct, setDepositPct] = useState(saved?.depositPct ?? 100);

  // Persist form to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email, whatsapp, requests, method, depositPct }));
    } catch { /* quota exceeded or private mode */ }
  }, [name, email, whatsapp, requests, method, depositPct]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const depositAmount = Math.round((fullTotal * depositPct) / 100);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Please fill in Name and Email.");
      return;
    }

    setLoading(true);
    setError(null);

    const csrfToken = getCsrfToken();

    const body = {
      tourId: tourId ? parseInt(tourId, 10) : null,
      boatId: boatId,
      travelDate: date,
      adults,
      kids,
      children: 0,
      cars: pickup && pickup !== 'no-pickup' ? 1 : 0,
      pricePerPerson,
      boatPrice: 0,
      tourPrice,
      programPrice: 0,
      transferPrice: pickupPrice,
      coverPrice: 0,
      extrasTotal,
      deposite: depositPct,
      discount: 0,
      totalPrice: fullTotal,
      discountPrice: 0,
      fullPrice: fullTotal,
      selectedTransferId: null,
      selectedCoverId: null,
      selectedRouteId: routeId,
      selectedExtras: extras.map((e) => ({
        id: e.id,
        qty: e.quantity ?? 1,
        price: e.price ?? 0,
        name: e.name ?? "",
      })),
      method,
      promocode: null,
      agent_fee: 0,
      agent_name: null,
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      requests: requests.trim() || null,
      pickupAddress: null,
      dropoffAddress: null,
      ga_client_id: getGaClientId(),
      utm: getUtmParams(),
      leadId: null,
    };

    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-TOKEN"] = csrfToken;

      const res = await fetch(apiUrl("order/shared"), {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        throw new Error(
          "Session expired. Please refresh the page and try again."
        );
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status})`);
      }

      const redirectUrl = await res.json();
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50 text-secondary-900">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-600 hover:text-secondary-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-sm font-semibold text-secondary-900">
            Bluuu · Checkout
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-secondary-500">
            <Lock className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* ── Left: form fields ──────────────────────────────────── */}
            <div className="space-y-5">
              {/* Contact details */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="text-base font-semibold text-secondary-900">
                  Your details
                </div>
                <div className="mt-4 space-y-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-secondary-600">
                      Full name{" "}
                      <span className="text-danger">*</span>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className={INPUT_BASE}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-secondary-600">
                      Email <span className="text-danger">*</span>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={INPUT_BASE}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-secondary-600">
                      WhatsApp <span className="text-secondary-400">(optional)</span>
                    </span>
                    <PhoneInput value={whatsapp} onChange={setWhatsapp} />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-secondary-600">
                      Special requests (optional)
                    </span>
                    <textarea
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                      placeholder="Dietary requirements, celebration, etc."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-secondary-900 placeholder-secondary-400 transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </label>
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="text-base font-semibold text-secondary-900">
                  Payment method
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    {
                      id: 1,
                      label: "Card / Bank transfer",
                      sub: "Visa, Mastercard, BCA, Mandiri, GoPay & more",
                    },
                    { id: 2, label: "PayPal", sub: "Pay in USD" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition",
                        method === opt.id
                          ? "border-primary-300 bg-primary-50"
                          : "border-neutral-200 bg-white"
                      )}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={method === opt.id}
                        onChange={() => setMethod(opt.id)}
                        className="mt-0.5 h-4 w-4 accent-primary-600"
                      />
                      <div>
                        <div className="text-sm font-semibold text-secondary-900">
                          {opt.label}
                        </div>
                        <div className="text-xs text-secondary-500">
                          {opt.sub}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deposit amount */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="text-base font-semibold text-secondary-900">
                  How much to pay now
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { pct: 30, label: "30% deposit", sub: "Pay the rest before the tour" },
                    { pct: 50, label: "50% deposit", sub: "Pay the rest before the tour" },
                    { pct: 100, label: "Full amount", sub: "No balance due" },
                  ].map((opt) => (
                    <label
                      key={opt.pct}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition",
                        depositPct === opt.pct
                          ? "border-primary-300 bg-primary-50"
                          : "border-neutral-200 bg-white"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="deposit"
                          checked={depositPct === opt.pct}
                          onChange={() => setDepositPct(opt.pct)}
                          className="h-4 w-4 accent-primary-600"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-secondary-900">
                            {opt.label}
                          </span>
                          <span className="text-xs text-secondary-500">
                            {opt.sub}
                          </span>
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-secondary-900">
                        {formatIDR(Math.round((fullTotal * opt.pct) / 100))}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: summary + submit ────────────────────────────── */}
            <div className="sticky top-6 self-start space-y-4">
              {/* Order summary */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="text-base font-semibold text-secondary-900">
                  Order summary
                </div>

                <div className="mt-4 space-y-2 text-sm text-secondary-600">
                  {date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-secondary-400" />
                      {date}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-secondary-400" />
                    {adults} adult{adults !== 1 ? "s" : ""}
                    {kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}
                  </div>
                  {pickup && pickup !== "free-shuttle" && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 shrink-0 text-secondary-400" />
                      {PICKUP_LABELS[pickup] ?? pickup}
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
                  {pricePerPerson > 0 && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">
                        Tour × {totalGuests}
                      </span>
                      <span className="font-semibold text-secondary-900">
                        {formatIDR(tourPrice)}
                      </span>
                    </div>
                  )}
                  {pickupPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Transfer</span>
                      <span className="font-semibold text-secondary-900">
                        {formatIDR(pickupPrice)}
                      </span>
                    </div>
                  )}
                  {extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Extras</span>
                      <span className="font-semibold text-secondary-900">
                        {formatIDR(extrasTotal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold text-secondary-900">
                    <span>Total</span>
                    <span>{formatIDR(fullTotal)}</span>
                  </div>
                  {depositPct < 100 && (
                    <div className="flex justify-between font-semibold text-primary-600">
                      <span>Due now ({depositPct}%)</span>
                      <span>{formatIDR(depositAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Extras list */}
                {extras.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
                      Extras
                    </div>
                    {extras.map((e, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs text-secondary-600"
                      >
                        <span>
                          {e.name} ×{e.quantity ?? 1}
                        </span>
                        <span>
                          {formatIDR((e.price ?? 0) * (e.quantity ?? 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-danger bg-red-50 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white",
                  loading
                    ? "cursor-not-allowed bg-primary-300"
                    : "btn-primary bg-primary-600"
                )}
              >
                {loading
                  ? "Processing…"
                  : `Pay ${formatIDR(depositAmount)}`}
                {!loading && <CreditCard className="h-4 w-4" />}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-secondary-400">
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Secure payment
                </span>
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Free cancellation 24h
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
