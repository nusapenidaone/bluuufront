import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "./api/base";
import { buildTourAnalyticsItem, getGaClientId, trackBeginCheckout } from "./lib/analytics";
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
  // ── Read URL params ──────────────────────────────────────────────────────
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const date = params.get("date") || "";
  const adults = Math.max(1, parseInt(params.get("adults") || "1", 10));
  const kids = Math.max(0, parseInt(params.get("kids") || "0", 10));
  const boatId = params.get("boat") || "";                    // tour ID
  const tourType = params.get("tourType") || "private";       // "private" | "shared"
  const styleId = params.get("style") || "";                  // route/program ID
  const payMode = params.get("payMode") || "full";            // "full" | "part"
  const payMethod = params.get("payMethod") || "card";        // "card" | "paypal"
  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const phone = params.get("phone") || "";
  const requests = params.get("requests") || "";
  const boatPrice = parseFloat(params.get("boatPrice") || "0");
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
  const selectedProgramId = styleId && !isNaN(parseInt(styleId, 10))
    ? parseInt(styleId, 10)
    : null;

  // Pricing breakdown — transfer/cover are separate from pure extras
  const transferTotalPrice = transferExtra ? (transferExtra.price ?? 0) * (transferExtra.quantity ?? 1) : 0;
  const coverTotalPrice    = coverExtra    ? (coverExtra.price    ?? 0) * (coverExtra.quantity    ?? 1) : 0;
  const pureExtrasTotal    = extras
    .filter((e) => !String(e.id).startsWith("transfer-") && !String(e.id).startsWith("cover-"))
    .reduce((sum, e) => sum + (e.price ?? 0) * (e.quantity ?? 1), 0);

  // Total without discount = all price components summed
  const fullTotal = boatPrice + pureExtrasTotal + transferTotalPrice + coverTotalPrice;
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
  }, [analyticsCurrency, analyticsItemCategory, analyticsItemId, analyticsItemName, analyticsTotal]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Missing contact details. Please go back and fill in your name and email.");
      return;
    }

    setLoading(true);
    setError(null);

    const csrfToken = getCsrfToken();

    const body = {
      tourId: boatId ? parseInt(boatId, 10) : null,
      travelDate: date,
      adults,
      kids,
      children: 0,
      members: totalGuests,
      cars: 0,

      boatPrice,
      tourPrice: boatPrice,
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
      selectedProgramId,
      selectedRestaurantId: restaurantId,

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
      whatsapp: phone.trim(),
      requests: requests.trim() || null,
      pickupAddress: null,
      dropoffAddress: null,

      ga_client_id: getGaClientId(),
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

  return (
    <div className="min-h-screen bg-neutral-50 text-secondary-900">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-600 hover:text-secondary-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-sm font-semibold text-secondary-900">
            Bluuu · Confirm & Pay
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-secondary-500">
            <Lock className="h-3.5 w-3.5" />
            Secure
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-5">
          {/* ── Order summary ──────────────────────────────────────── */}
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
            </div>

            {/* Price breakdown */}
            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
              {boatPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-secondary-600">Private tour</span>
                  <span className="font-semibold text-secondary-900">
                    {formatIDR(boatPrice)}
                  </span>
                </div>
              )}
              {extras.length > 0 &&
                extras.map((e, i) => (
                  <div key={i} className="flex justify-between text-xs text-secondary-600">
                    <span>
                      {e.name || `Extra #${e.id}`} ×{e.quantity ?? 1}
                    </span>
                    <span className="font-semibold text-secondary-900">
                      {formatIDR((e.price ?? 0) * (e.quantity ?? 1))}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold text-secondary-900">
                <span>Total</span>
                <span>{formatIDR(fullTotal)}</span>
              </div>
            </div>
          </div>

          {/* ── Contact & payment details ──────────────────────────── */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="text-base font-semibold text-secondary-900">
              Your details
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-secondary-400">Name</div>
                <div className="mt-0.5 text-secondary-900">{name || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-secondary-400">Email</div>
                <div className="mt-0.5 text-secondary-900">{email || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-secondary-400">WhatsApp</div>
                <div className="mt-0.5 text-secondary-900">{phone || "—"}</div>
              </div>
              {requests && (
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-secondary-400">Requests</div>
                  <div className="mt-0.5 text-secondary-900">{requests}</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-100 pt-4 text-sm">
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                <CreditCard className="h-4 w-4 text-secondary-500" />
                <span className="text-secondary-700">{methodLabel}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                <BadgeCheck className="h-4 w-4 text-secondary-500" />
                <span className="text-secondary-700">{depositLabel}</span>
              </div>
            </div>
          </div>

          {/* ── Payment summary ────────────────────────────────────── */}
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-secondary-900">
                  {depositLabel}
                </div>
                {payMode === "part" && (
                  <div className="mt-0.5 text-xs text-secondary-500">
                    Remaining {formatIDR(fullTotal - depositAmount)} due before the tour
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-secondary-900">
                {formatIDR(depositAmount)}
              </div>
            </div>
          </div>

          {/* ── Error ─────────────────────────────────────────────── */}
          {error && (
            <div className="rounded-xl border border-danger bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* ── Submit button ──────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white transition",
              loading
                ? "cursor-not-allowed bg-primary-300"
                : "bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
            )}
          >
            {loading
              ? "Processing…"
              : `Confirm & Pay ${formatIDR(depositAmount)}`}
            {!loading && <CreditCard className="h-5 w-5" />}
          </button>

          <div className="flex items-center justify-center gap-6 text-xs text-secondary-400">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> Secure payment
            </span>
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3 w-3" /> Free cancellation 24h
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> Support on WhatsApp
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
