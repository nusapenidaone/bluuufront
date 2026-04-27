import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "./api/base";
import { buildTourAnalyticsItem, getGaClientId, getUtmParams, trackBeginCheckout, trackPixelInitiateCheckout, trackAddPaymentInfo, trackPixelAddPaymentInfo } from "./lib/analytics";
import { useCurrency } from "./CurrencyContext";
import {
  ArrowLeft,
  BadgeCheck,
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

export default function Payment() {
  const { formatPrice, selectedCurrency, loading: ratesLoading } = useCurrency();
  const isIDR = selectedCurrency === "IDR";

  const fmt = (value) => {
    if (ratesLoading && !isIDR) return "…";
    return isIDR
      ? formatIDR(value)
      : formatPrice(value, { fromCurrency: "IDR" });
  };

  // ── Read URL params ──────────────────────────────────────────────────────
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const date = params.get("date") || "";
  const adults = Math.max(1, parseInt(params.get("adults") || "1", 10));
  const kids = Math.max(0, parseInt(params.get("kids") || "0", 10));
  const boatId = params.get("boat") || "";                    // tour ID
  const availBoatId = params.get("availBoatId") ? parseInt(params.get("availBoatId"), 10) : null;
  const tourType = params.get("tourType") || "private";       // "private" | "shared"
  const styleId = params.get("style") || "";                  // route/program ID
  const pickupAddressParam = params.get("pickup_address") || "";
  const dropoffAddressParam = params.get("dropoff_address") || "";
  const payMode = params.get("payMode") || "full";            // "full" | "part"
  const payMethod = params.get("payMethod") || "card";        // "card" | "paypal"
  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const phone = params.get("phone") || "";
  const requests = params.get("requests") || "";
  const boatPrice = parseFloat(params.get("boatPrice") || "0");       // raw boat_price surcharge
  const totalBoatPrice = parseFloat(params.get("totalBoatPrice") || String(boatPrice)); // pricelist + surcharge
  const guestFeeTotal = parseFloat(params.get("guestFeeTotal") || "0");
  const extrasTotal = parseFloat(params.get("extrasTotal") || "0");
  const restaurantId = params.get("restaurantId")
    ? parseInt(params.get("restaurantId"), 10) || null
    : null;

  const extras = useMemo(() => {
    const raw = params.get("extras");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [params]);

  // ── Derived values ───────────────────────────────────────────────────────
  const totalGuests = adults + kids;
  const deposite = payMode === "part" ? 50 : 100;
  const method = payMethod === "paypal" ? 2 : 1;             // 1=Xendit, 2=PayPal

  // Extract transfer/cover IDs from extras (they use "transfer-{id}", "cover-{id}" prefixes)
  const transferExtra = extras.find((e) => String(e.id).startsWith("transfer-"));
  const coverExtra = extras.find((e) => String(e.id).startsWith("cover-"));
  const selectedTransferId = transferExtra
    ? parseInt(String(transferExtra.id).replace("transfer-", ""), 10) || null
    : null;
  const selectedCoverId = coverExtra
    ? parseInt(String(coverExtra.id).replace("cover-", ""), 10) || null
    : null;
  // Pricing breakdown — transfer/cover are separate from pure extras
  const transferTotalPrice = transferExtra ? (transferExtra.price ?? 0) * (transferExtra.quantity ?? 1) : 0;
  const coverTotalPrice    = coverExtra    ? (coverExtra.price    ?? 0) * (coverExtra.quantity    ?? 1) : 0;
  const pureExtrasTotal    = extras
    .filter((e) => !String(e.id).startsWith("transfer-") && !String(e.id).startsWith("cover-"))
    .reduce((sum, e) => sum + (e.price ?? 0) * (e.quantity ?? 1), 0);

  // Total without discount = all price components summed
  const fullTotal = totalBoatPrice + pureExtrasTotal + transferTotalPrice + coverTotalPrice;
  const depositAmount = Math.round((fullTotal * deposite) / 100);
  const analyticsCurrency = params.get("analyticsCurrency") || "IDR";
  const analyticsTotal = parseFloat(params.get("analyticsTotal") || String(fullTotal));
  const analyticsItemId = params.get("tourId") || boatId || `${tourType}-tour`;
  const analyticsItemName = params.get("tourName") || (tourType === "shared" ? "Shared Tour" : "Private Tour");
  const analyticsItemCategory = params.get("tourCategory") || (tourType === "shared" ? "Shared Tour" : "Private Tour");

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
    trackPixelInitiateCheckout({ contentIds: analyticsItemId, value: analyticsTotal, currency: analyticsCurrency, numItems: totalGuests });
  }, [analyticsCurrency, analyticsItemCategory, analyticsItemId, analyticsItemName, analyticsTotal]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    console.log('[payment] styleId:', styleId, '| restaurantId:', restaurantId, '| URL:', window.location.search);
    if (!name.trim() || !email.trim()) {
      setError("Missing contact details. Please go back and fill in your name and email.");
      return;
    }

    trackAddPaymentInfo({ value: analyticsTotal, currency: analyticsCurrency });
    trackPixelAddPaymentInfo({ value: analyticsTotal, currency: analyticsCurrency });

    setLoading(true);
    setError(null);

    const csrfToken = getCsrfToken();

    const body = {
      tourId: boatId ? parseInt(boatId, 10) : null,
      boatId: availBoatId,
      travelDate: date,
      adults,
      kids,
      children: 0,
      members: totalGuests,
      cars: transferExtra ? (transferExtra.quantity ?? 1) : (parseInt(params.get("cars") || "0", 10) || 0),

      boatPrice,
      tourPrice: (totalBoatPrice - boatPrice) + guestFeeTotal,
      programPrice: 0,
      transferPrice: transferTotalPrice,
      coverPrice: coverTotalPrice,
      extrasTotal: pureExtrasTotal,
      deposite,
      discount: 0,
      totalPrice: fullTotal,
      discountPrice: 0,
      fullPrice: fullTotal,

      selectedTransferId,
      selectedCoverId,
      selectedRouteId: styleId ? parseInt(styleId, 10) || null : null,
      selectedRestaurantId: restaurantId,

      selectedExtras: extras
        .filter((e) => !String(e.id).startsWith("transfer-") && !String(e.id).startsWith("cover-"))
        .map((e) => ({
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
      whatsapp: phone.trim(),
      requests: requests.trim() || null,
      pickupAddress: pickupAddressParam || null,
      dropoffAddress: dropoffAddressParam || null,

      ga_client_id: getGaClientId(),
      utm: getUtmParams(),
      leadId: null,
    };

    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-TOKEN"] = csrfToken;

      const orderEndpoint = tourType === "shared" ? "order/shared" : "order/private";
      const res = await fetch(apiUrl(orderEndpoint), {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        throw new Error("Session expired. Please refresh the page and try again.");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status})`);
      }

      const redirectUrl = await res.json();
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const methodLabel = method === 2 ? "PayPal" : "Card / Bank transfer";
  const depositLabel = payMode === "part" ? "50% deposit" : "Full payment";

  if (ratesLoading && !isIDR) {
    return (
      <div className="min-h-screen bg-neutral-50 text-secondary-900">
        <div className="border-b border-neutral-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <button type="button" onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-500 transition hover:text-secondary-900">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-sm font-bold text-secondary-900">Bluuu · Confirm & Pay</div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary-400">
              <Lock className="h-3.5 w-3.5" /> Secure
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          {/* Skeleton card 1 */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg shadow-neutral-100/40 sm:p-6 space-y-4">
            <div className="h-5 w-32 rounded-lg bg-neutral-200 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-24 rounded-lg bg-neutral-100 animate-pulse" />
              <div className="h-4 w-20 rounded-lg bg-neutral-100 animate-pulse" />
            </div>
            <div className="border-t border-neutral-100 pt-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded-lg bg-neutral-100 animate-pulse" />
                <div className="h-4 w-16 rounded-lg bg-neutral-200 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-36 rounded-lg bg-neutral-100 animate-pulse" />
                <div className="h-4 w-16 rounded-lg bg-neutral-200 animate-pulse" />
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2.5">
                <div className="h-5 w-12 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="h-5 w-20 rounded-lg bg-neutral-300 animate-pulse" />
              </div>
            </div>
          </div>
          {/* Skeleton card 2 */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg shadow-neutral-100/40 sm:p-6 space-y-4">
            <div className="h-5 w-28 rounded-lg bg-neutral-200 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="h-3 w-12 rounded bg-neutral-100 animate-pulse" />
                <div className="h-5 w-32 rounded-lg bg-neutral-200 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-12 rounded bg-neutral-100 animate-pulse" />
                <div className="h-5 w-40 rounded-lg bg-neutral-200 animate-pulse" />
              </div>
            </div>
          </div>
          {/* Skeleton payment summary */}
          <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded-lg bg-primary-200/60 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-primary-200/80 animate-pulse" />
            </div>
          </div>
          {/* Skeleton button */}
          <div className="h-14 w-full rounded-full bg-primary-300/60 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-secondary-900">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-500 transition hover:text-secondary-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-sm font-bold text-secondary-900">
            Bluuu · Confirm & Pay
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary-400">
            <Lock className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-4">
          {/* ── Order summary ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg shadow-neutral-100/40 sm:p-6">
            <div className="text-base font-bold text-secondary-900">Order summary</div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary-500">
              {date && (
                <div className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 text-secondary-400" />
                  {date}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-secondary-400" />
                {adults} adult{adults !== 1 ? "s" : ""}
                {kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mt-4 space-y-2.5 border-t border-neutral-100 pt-4 text-sm">
              {totalBoatPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-secondary-500">{tourType === "shared" ? "Shared tour" : "Private tour"}</span>
                  <span className="font-semibold text-secondary-900">{fmt(totalBoatPrice)}</span>
                </div>
              )}
              {extras.map((e, i) => (
                <div key={i} className="flex justify-between text-xs text-secondary-500">
                  <span>{e.name || `Extra #${e.id}`} ×{e.quantity ?? 1}</span>
                  <span className="font-semibold text-secondary-900">{fmt((e.price ?? 0) * (e.quantity ?? 1))}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-neutral-100 pt-2.5 font-bold text-secondary-900">
                <span>Total</span>
                <span className="text-base">{fmt(fullTotal)}</span>
              </div>
            </div>
          </div>

          {/* ── Contact & payment details ──────────────────────────── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg shadow-neutral-100/40 sm:p-6">
            <div className="text-base font-bold text-secondary-900">Your details</div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-secondary-400">Name</div>
                <div className="mt-1 font-medium text-secondary-900">{name || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-secondary-400">Email</div>
                <div className="mt-1 font-medium text-secondary-900">{email || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-secondary-400">WhatsApp</div>
                <div className="mt-1 font-medium text-secondary-900">{phone || "—"}</div>
              </div>
              {requests && (
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-secondary-400">Requests</div>
                  <div className="mt-1 font-medium text-secondary-900">{requests}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-secondary-600">
                <CreditCard className="h-3.5 w-3.5 text-secondary-400" />
                {methodLabel}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-secondary-600">
                <BadgeCheck className="h-3.5 w-3.5 text-secondary-400" />
                {depositLabel}
              </div>
            </div>
          </div>

          {/* ── Payment summary ────────────────────────────────────── */}
          <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-secondary-900">{depositLabel}</div>
                {payMode === "part" && (
                  <div className="mt-0.5 text-xs text-secondary-500">
                    Remaining {fmt(fullTotal - depositAmount)} due before the tour
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-secondary-900">{fmt(depositAmount)}</div>
            </div>
          </div>

          {/* ── Error ─────────────────────────────────────────────── */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── Submit button ──────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-bold text-white shadow-md shadow-primary-600/20 transition",
              loading
                ? "cursor-not-allowed bg-primary-300"
                : "bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
            )}
          >
            {loading ? "Processing…" : `Confirm & Pay ${fmt(depositAmount)}`}
            {!loading && <CreditCard className="h-5 w-5" />}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-secondary-400">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Secure payment
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Free cancellation 24h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" /> Support on WhatsApp
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
