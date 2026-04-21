import { useEffect } from "react";
import { trackPixelPurchase, trackPurchase } from "./lib/analytics";

function formatAmount(amount, currency) {
  if (!amount) return null;
  if (currency === "IDR") return "IDR " + Number(amount).toLocaleString("id-ID");
  return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BLUE = "#0073E0";
const BLUE_DARK = "#005CB3";
const BLUE_GRADIENT = `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`;
const BLUE_SHADOW = "0 16px 48px rgba(0,115,224,0.28)";

const SCENARIOS = {
  private: {
    kicker: "BOOKING CONFIRMED",
    title: "Your private tour is booked!",
    subtitle: "Deposit received. We've sent the booking confirmation with pickup details to your email.",
    steps: ["Check your email for confirmation", "Save the pickup details", "Show up and enjoy — we handle the rest"],
    gradient: BLUE_GRADIENT,
    shadow: BLUE_SHADOW,
  },
  shared: {
    kicker: "BOOKING CONFIRMED",
    title: "Your shared tour is booked!",
    subtitle: "Deposit received. Confirmation and meeting point details have been sent to your email.",
    steps: ["Check your email for confirmation", "Note the meeting point and time", "Show up and enjoy — we handle the rest"],
    gradient: BLUE_GRADIENT,
    shadow: BLUE_SHADOW,
  },
  request: {
    kicker: "REQUEST RECEIVED",
    title: "We got your request!",
    subtitle: "Our team will check availability and reach out shortly via email or WhatsApp to confirm.",
    steps: ["We review availability", "We contact you to confirm", "You receive booking details"],
    gradient: BLUE_GRADIENT,
    shadow: BLUE_SHADOW,
  },
  default: {
    kicker: "PAYMENT CONFIRMED",
    title: "Thank you for your payment!",
    subtitle: "Your payment has been processed successfully. Check your email for confirmation details.",
    steps: ["Check your email for confirmation", "Review your booking details", "Get ready to explore Nusa Penida"],
    gradient: BLUE_GRADIENT,
    shadow: BLUE_SHADOW,
  },
};

export default function SuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const amount = parseFloat(params.get("amount") || "0");
  const currency = params.get("currency") || "IDR";

  const scene = SCENARIOS[type] || SCENARIOS.default;
  const amountLabel = type !== "request" && amount > 0 ? formatAmount(amount, currency) : null;

  useEffect(() => {
    if (type !== "request" && amount > 0) {
      trackPixelPurchase({ value: amount, currency });
      trackPurchase({ value: amount, currency, numItems: 1 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#f1f5f9",
      padding: "32px 20px",
      textAlign: "center",
    }}>

      {/* Icon */}
      <div style={{
        width: 72, height: 72,
        borderRadius: "50%",
        background: scene.gradient,
        boxShadow: scene.shadow,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 28,
        flexShrink: 0,
      }}>
        {type === "request" ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid #e8edf2",
        padding: "36px 36px 32px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 12 }}>
          {scene.kicker}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
          {scene.title}
        </h1>

        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, margin: "0 0 28px" }}>
          {scene.subtitle}
        </p>

        {amountLabel && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            border: "1px solid #bbf7d0",
            borderRadius: 10, padding: "9px 18px",
            marginBottom: 28,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>{amountLabel} paid</span>
          </div>
        )}

        {/* Steps */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24, marginBottom: 28, textAlign: "left" }}>
          {scene.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < scene.steps.length - 1 ? 14 : 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: scene.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 14, color: "#334155" }}>{step}</span>
            </div>
          ))}
        </div>

        <a
          href="/"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: scene.gradient,
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 28px",
            borderRadius: 14,
            textDecoration: "none",
            boxShadow: scene.shadow,
          }}
        >
          Back to tours
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        Questions? Chat with us on WhatsApp anytime.
      </p>
    </div>
  );
}
