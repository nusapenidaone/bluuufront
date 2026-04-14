import { useEffect } from "react";
import { trackPixelPurchase } from "./lib/analytics";

export default function SuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type"); // "private" | "shared" | "request"
  const amount = parseFloat(params.get("amount") || "0");
  const currency = params.get("currency") || "IDR";

  const isRequest = type === "request";

  useEffect(() => {
    if (!isRequest && amount > 0) {
      trackPixelPurchase({ value: amount, currency });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      background: "#f8fafc",
      padding: "24px",
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        padding: "48px 40px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {isRequest ? "📩" : "✅"}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
          {isRequest ? "Request received!" : "Payment confirmed!"}
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, margin: "0 0 32px" }}>
          {isRequest
            ? "We've received your booking request and will get back to you shortly to confirm availability."
            : "Thank you for your payment. Check your email — we've sent a booking confirmation with all the details."}
        </p>
        <a
          href="/new"
          style={{
            display: "inline-block",
            background: "#0ea5e9",
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            padding: "12px 32px",
            borderRadius: 12,
            textDecoration: "none",
          }}
        >
          Back to tours
        </a>
      </div>
    </div>
  );
}
