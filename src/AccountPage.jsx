import { useEffect, useState, useCallback } from "react";
import { useSiteContacts } from "./hooks/useSiteContacts";

const API = "/api/new/account/";

function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "24px 28px", marginBottom: 20 }}>
      {title && <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>{title}</h2>}
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{value || "—"}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #1a9fd4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", small = false }) {
  const bg = variant === "primary" ? "#1a9fd4" : variant === "danger" ? "#ef4444" : "#f1f5f9";
  const color = variant === "ghost" ? "#0f172a" : "#fff";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#cbd5e1" : bg,
        color: disabled ? "#94a3b8" : color,
        border: "none",
        borderRadius: 10,
        padding: small ? "8px 16px" : "12px 24px",
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export default function AccountPage() {
  const contacts = useSiteContacts();
  const waLink = contacts?.whatsapp?.link || "https://wa.me/6281547483381";
  const params = new URLSearchParams(window.location.search);
  const key = params.get("key") || "";
  const justPaid = params.get("paid") === "1";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit state
  const [editDate, setEditDate] = useState("");
  const [editPickup, setEditPickup] = useState("");
  const [editDropoff, setEditDropoff] = useState("");
  const [editAdults, setEditAdults] = useState(0);
  const [editKids, setEditKids] = useState(0);
  const [editTransfer, setEditTransfer] = useState("");
  const [editCover, setEditCover] = useState("");

  // Saving state
  const [savingSimple, setSavingSimple] = useState(false);
  const [savingProducts, setSavingProducts] = useState(false);
  const [savingPay, setSavingPay] = useState(false);
  const [savedSimple, setSavedSimple] = useState(false);
  const [savedProducts, setSavedProducts] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!key) { setError("No order key provided"); setLoading(false); return; }
    try {
      const res = await fetch(API + key);
      if (!res.ok) { setError("Order not found"); setLoading(false); return; }
      const json = await res.json();
      setData(json);
      setEditDate(json.local.travel_date || "");
      setEditPickup(json.local.pickup_address || "");
      setEditDropoff(json.local.dropoff_address || "");
      setEditAdults(json.local.adults || 0);
      setEditKids(json.local.kids || 0);
      setEditTransfer(json.local.transfer_id ? String(json.local.transfer_id) : "");
      setEditCover(json.local.cover_id ? String(json.local.cover_id) : "");
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const saveSimple = async () => {
    setSavingSimple(true);
    setSavedSimple(false);
    try {
      await fetch(API + key + "/simple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          pickup_address: editPickup,
          dropoff_address: editDropoff,
        }),
      });
      setSavedSimple(true);
      await fetchOrder();
    } finally {
      setSavingSimple(false);
    }
  };

  const saveProducts = async () => {
    setSavingProducts(true);
    setSavedProducts(false);
    try {
      await fetch(API + key + "/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adults: editAdults,
          kids: editKids,
          transfer_id: editTransfer ? Number(editTransfer) : null,
          cover_id: editCover ? Number(editCover) : null,
        }),
      });
      setSavedProducts(true);
      await fetchOrder();
    } finally {
      setSavingProducts(false);
    }
  };

  const payCollect = async () => {
    setSavingPay(true);
    try {
      const res = await fetch(API + key + "/pay", { method: "POST" });
      const json = await res.json();
      if (json.payment_url) {
        window.location.href = json.payment_url;
      } else {
        alert(json.error || "Payment unavailable");
      }
    } finally {
      setSavingPay(false);
    }
  };

  if (!key) return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <p style={{ color: "#ef4444", textAlign: "center" }}>No order key. Please use the link from your email.</p>
      </div>
    </div>
  );

  if (loading) return <div style={pageStyle}><Spinner /></div>;

  if (error) return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Order not found</h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>Please check the link from your confirmation email.</p>
        </div>
      </div>
    </div>
  );

  const { local, odoo, options } = data;
  const collect = odoo.collect || 0;
  const depositPaid = odoo.deposit_paid || 0;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌊</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>My Booking</h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>{odoo.order_number}</p>
          {justPaid && (
            <div style={{ marginTop: 12, background: "#dcfce7", color: "#166534", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600 }}>
              Payment received — thank you!
            </div>
          )}
        </div>

        {/* Order summary */}
        <Card title="Order Summary">
          <Row label="Tour" value={local.tour_name} />
          <Row label="Date" value={fmtDate(local.travel_date)} />
          <Row label="Boat" value={odoo.boat_name} />
          <Row label="Route" value={odoo.route} />
          <Row label="Guests" value={`${local.adults} adult${local.adults !== 1 ? "s" : ""}${local.kids > 0 ? `, ${local.kids} kid${local.kids !== 1 ? "s" : ""}` : ""}`} />
          <Row label="Transfer" value={local.transfer_name} />
          <Row label="Insurance" value={local.cover_name} />
          {local.pickup_address && <Row label="Pickup" value={local.pickup_address} />}
          {local.dropoff_address && <Row label="Drop-off" value={local.dropoff_address} />}
        </Card>

        {/* Pricing */}
        <Card title="Pricing">
          <Row label="Deposit paid" value={`IDR ${fmt(depositPaid)}`} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", marginTop: 4 }}>
            <span style={{ color: collect > 0 ? "#ef4444" : "#22c55e", fontWeight: 700, fontSize: 15 }}>
              {collect > 0 ? "Remaining to pay" : "Fully paid"}
            </span>
            {collect > 0 && (
              <span style={{ fontWeight: 800, fontSize: 18, color: "#ef4444" }}>IDR {fmt(collect)}</span>
            )}
          </div>
          {collect > 0 && (
            <div style={{ marginTop: 12 }}>
              <Btn onClick={payCollect} disabled={savingPay}>
                {savingPay ? "Redirecting…" : `Pay remaining IDR ${fmt(collect)}`}
              </Btn>
            </div>
          )}
        </Card>

        {/* Edit: date & address */}
        <Card title="Change Date or Address">
          <label style={labelStyle}>Travel date</label>
          <input
            type="date"
            value={editDate}
            onChange={e => setEditDate(e.target.value)}
            style={inputStyle}
          />
          {local.transfer_id && (
            <>
              <label style={labelStyle}>Pickup address</label>
              <input
                type="text"
                value={editPickup}
                onChange={e => setEditPickup(e.target.value)}
                placeholder="Your hotel / address"
                style={inputStyle}
              />
              <label style={labelStyle}>Drop-off address</label>
              <input
                type="text"
                value={editDropoff}
                onChange={e => setEditDropoff(e.target.value)}
                placeholder="Your hotel / address"
                style={inputStyle}
              />
            </>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <Btn onClick={saveSimple} disabled={savingSimple}>
              {savingSimple ? "Saving…" : "Save"}
            </Btn>
            {savedSimple && <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>Saved!</span>}
          </div>
        </Card>

        {/* Edit: guests, transfer, cover */}
        <Card title="Change Guests, Transfer or Insurance">
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            Changing these will recreate your order in the system (~5 sec).
          </p>

          <label style={labelStyle}>Adults</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Btn small variant="ghost" onClick={() => setEditAdults(a => Math.max(1, a - 1))}>−</Btn>
            <span style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{editAdults}</span>
            <Btn small variant="ghost" onClick={() => setEditAdults(a => a + 1)}>+</Btn>
          </div>

          <label style={labelStyle}>Kids (7+)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Btn small variant="ghost" onClick={() => setEditKids(k => Math.max(0, k - 1))}>−</Btn>
            <span style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{editKids}</span>
            <Btn small variant="ghost" onClick={() => setEditKids(k => k + 1)}>+</Btn>
          </div>

          <label style={labelStyle}>Transfer</label>
          <select value={editTransfer} onChange={e => setEditTransfer(e.target.value)} style={inputStyle}>
            <option value="">No transfer</option>
            {(options.transfers || []).map(t => (
              <option key={t.id} value={t.id}>{t.name} — IDR {fmt(t.price)}</option>
            ))}
          </select>

          <label style={labelStyle}>Insurance (cover)</label>
          <select value={editCover} onChange={e => setEditCover(e.target.value)} style={inputStyle}>
            <option value="">No insurance</option>
            {(options.covers || []).map(c => (
              <option key={c.id} value={c.id}>{c.name} — IDR {fmt(c.price)}</option>
            ))}
          </select>

          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <Btn onClick={saveProducts} disabled={savingProducts}>
              {savingProducts ? "Updating…" : "Save & update order"}
            </Btn>
            {savedProducts && <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>Updated!</span>}
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Questions? Contact us:</span>
            <a href={waLink} target="_blank" rel="noreferrer" style={{ color: "#1a9fd4", fontWeight: 600, textDecoration: "none" }}>WhatsApp</a>
            <a href="mailto:info@bluuu.tours" style={{ color: "#1a9fd4", fontWeight: 600, textDecoration: "none" }}>info@bluuu.tours</a>
          </div>
        </Card>

      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "24px 16px 48px",
};

const containerStyle = {
  maxWidth: 520,
  margin: "0 auto",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
  boxSizing: "border-box",
  marginBottom: 14,
  outline: "none",
};
