import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SEO from "./components/SEO";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Button from "./components/common/Button";
import CustomDatePicker from "./components/common/CustomDatePicker";
import { apiUrl } from "./api/base";
import { cn } from "./lib/utils";
import {
  ChevronLeft,
  CalendarDays,
  Users,
  Minus,
  Plus,
  Info,
  X,
  Map,
  ShieldCheck,
  Car,
  Sparkles,
  Wallet,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useSiteContacts } from "./hooks/useSiteContacts";
import { WA, EMAIL } from "./lib/contacts";

function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function toISODate(d) {
  if (!d) return "";
  const x = d instanceof Date ? d : new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function SectionCard({ title, icon: Icon, hint, children }) {
  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
      {title && (
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-secondary-900">
            {Icon && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Icon className="h-3.5 w-3.5" />
              </span>
            )}
            {title}
          </h2>
          {hint && <p className="mt-1.5 text-xs text-secondary-500">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2.5 last:border-0">
      <span className="text-sm text-secondary-500">{label}</span>
      <span className="text-right text-sm font-semibold text-secondary-900">{value || "—"}</span>
    </div>
  );
}

function StepperRow({ value, onChange, min = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
          value <= min ? "border-neutral-100 text-neutral-200 cursor-not-allowed" : "border-neutral-300 text-secondary-600 hover:border-secondary-900 hover:text-secondary-900"
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[24px] text-center text-base font-semibold text-secondary-900 tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-secondary-600 transition-colors hover:border-secondary-900 hover:text-secondary-900"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Date field: button + dropdown panel with the same CustomDatePicker used
// across the site, with days disabled when the tour has no availability.
// Mirrors the site's own logic (private.jsx / shared.jsx):
//  - private: date is binary available/not (boat exclusivity), not guest-aware
//  - shared: date must have available_seats >= guests (shared.jsx:7286) ────────
function DateField({ tourId, isPrivate, guests, value, onChange, open, onToggle, onClose }) {
  const panelRef = useRef(null);
  const [monthCursor, setMonthCursor] = useState(() => (value ? new Date(value) : new Date()));
  const [availByDate, setAvailByDate] = useState({}); // private: {date: 0|1} | shared: {date: available_seats}

  useEffect(() => {
    function onDocClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  useEffect(() => {
    if (!tourId || !open) return;
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth() + 1;
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const endpoint = isPrivate ? "private" : "shared";
    fetch(apiUrl(`availability/${endpoint}/${tourId}?start=${start}&end=${end}`))
      .then(r => r.json())
      .then(data => {
        if (isPrivate) {
          // {date: 0|1}
          setAvailByDate(prev => ({ ...prev, ...data }));
        } else {
          // [{date, available_seats, ...}, ...]
          const seatsByDate = {};
          for (const entry of (data || [])) {
            if (entry?.date) seatsByDate[entry.date] = entry.available_seats ?? 0;
          }
          setAvailByDate(prev => ({ ...prev, ...seatsByDate }));
        }
      })
      .catch(() => {});
  }, [tourId, isPrivate, open, monthCursor]);

  const filterDate = (date) => {
    const key = toISODate(date);
    if (key === value) return true; // the order's current date is always selectable
    if (!(key in availByDate)) return true; // unknown yet — don't block while loading
    return isPrivate ? availByDate[key] !== 0 : availByDate[key] >= guests;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full flex-col rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-left transition-colors",
          open ? "border-primary-300 ring-2 ring-primary-100" : "hover:border-primary-200"
        )}
      >
        <span className={fieldLabel + " mb-0"}>Travel date</span>
        <span className="text-sm font-semibold text-secondary-900">{value ? fmtDate(value) : "Select a date"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-max max-sm:fixed max-sm:inset-0 max-sm:mt-0 max-sm:flex max-sm:w-full max-sm:items-end max-sm:justify-center max-sm:bg-black/30 max-sm:backdrop-blur-sm"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl shadow-black/10 max-sm:w-full max-sm:rounded-t-2xl max-sm:rounded-b-none">
              <div className="mb-2 flex items-center justify-between sm:hidden">
                <span className="text-sm font-semibold text-secondary-900">Select a date</span>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <CustomDatePicker
                mode="single"
                inline
                selected={value || null}
                onSelect={(d) => { onChange(toISODate(d)); onClose(); }}
                filterDate={filterDate}
                onMonthChange={(d) => setMonthCursor(d)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Guests field: button + dropdown panel with adult/kid steppers, same
// visual pattern used in the booking flow ─────────────────────────────────
function GuestsField({ adults, kids, onAdultsChange, onKidsChange, open, onToggle, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  const summary = `${adults} adult${adults !== 1 ? "s" : ""}${kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}`;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full flex-col rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-left transition-colors",
          open ? "border-primary-300 ring-2 ring-primary-100" : "hover:border-primary-200"
        )}
      >
        <span className={fieldLabel + " mb-0"}>Guests</span>
        <span className="text-sm font-semibold text-secondary-900">{summary}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-max max-sm:fixed max-sm:inset-0 max-sm:mt-0 max-sm:flex max-sm:w-full max-sm:items-end max-sm:justify-center max-sm:bg-black/30 max-sm:backdrop-blur-sm"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/10 max-sm:w-full max-sm:rounded-t-2xl max-sm:rounded-b-none">
              <div className="mb-3 flex items-center justify-between sm:hidden">
                <span className="text-sm font-semibold text-secondary-900">Guests</span>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-secondary-900">Adults</div>
                      <div className="text-xs text-secondary-400">Ages 12+</div>
                    </div>
                  </div>
                  <StepperRow value={adults} onChange={v => onAdultsChange(Math.max(1, v))} min={1} />
                </div>
                <div className="h-px bg-neutral-100" />
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-secondary-900">Kids</div>
                      <div className="text-xs text-secondary-400">Ages 3-11</div>
                    </div>
                  </div>
                  <StepperRow value={kids} onChange={v => onKidsChange(Math.max(0, v))} min={0} />
                </div>
                <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                    <p className="text-left text-xs leading-relaxed text-secondary-500">
                      Toddlers under 3 go free.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fieldLabel = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-500";
const fieldInput =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export default function Cabinet({ odooId }) {
  const contacts = useSiteContacts();
  const waLink = contacts?.whatsapp?.link || `https://wa.me/${WA.google}`;
  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get("paid") === "1";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPanel, setOpenPanel] = useState(null); // "date" | "guests" | null

  // Edit state
  const [editDate, setEditDate] = useState("");
  const [editPickup, setEditPickup] = useState("");
  const [editDropoff, setEditDropoff] = useState("");
  const [editAdults, setEditAdults] = useState(0);
  const [editKids, setEditKids] = useState(0);
  const [editTransfer, setEditTransfer] = useState("");
  const [editCover, setEditCover] = useState("");
  const [editRoute, setEditRoute] = useState("");
  const [editExtras, setEditExtras] = useState({}); // id -> { id, name, price, qty }

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lastPrices, setLastPrices] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!odooId) { setError("No order id provided"); setLoading(false); return; }
    try {
      const res = await fetch(apiUrl(`cabinet/${odooId}`));
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
      setEditRoute(json.local.route_id ? String(json.local.route_id) : "");
      const extrasMap = {};
      for (const item of (json.local.extras || [])) {
        if (!item?.id) continue;
        extrasMap[item.id] = { id: item.id, name: item.name, price: Number(item.price) || 0, qty: Number(item.qty ?? item.quantity ?? 1) };
      }
      setEditExtras(extrasMap);
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [odooId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const selectedRoute = useMemo(() => {
    const routes = data?.options?.routes || [];
    return routes.find(r => String(r.id) === editRoute) || null;
  }, [data, editRoute]);

  const catalogExtras = selectedRoute?.extras || [];
  const lockedExtras = Object.values(editExtras).filter(
    e => e.qty > 0 && !catalogExtras.some(c => c.id === e.id)
  );

  const setExtraQty = (item, qty) => {
    setEditExtras(prev => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = { id: item.id, name: item.name, price: item.price, qty };
      }
      return next;
    });
  };

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const isPrivate = !!data?.local?.is_private;
      const payload = {
        date: editDate,
        pickup_address: editPickup,
        dropoff_address: editDropoff,
        adults: editAdults,
        kids: editKids,
        transfer_id: editTransfer ? Number(editTransfer) : null,
        cover_id: editCover ? Number(editCover) : null,
        extras: Object.values(editExtras).map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      };
      if (isPrivate && editRoute) {
        payload.route_id = Number(editRoute);
      }
      const res = await fetch(apiUrl(`cabinet/${odooId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setLastPrices(json.prices || null);
      } else {
        setSaveError(json.error || "Could not update the order");
      }
      await fetchOrder();
    } catch {
      setSaveError("Could not update the order");
    } finally {
      setSaving(false);
    }
  };

  const payCollect = async () => {
    setPaying(true);
    try {
      const res = await fetch(apiUrl(`cabinet/${odooId}/pay`), { method: "POST" });
      const json = await res.json();
      if (json.payment_url) {
        window.location.href = json.payment_url;
      } else {
        alert(json.error || "Payment unavailable");
      }
    } finally {
      setPaying(false);
    }
  };

  const renderShell = (content) => (
    <div className="min-h-screen bg-neutral-100 text-secondary-900">
      <SEO title="My Booking | Bluuu Tours" description="Manage your Bluuu Tours booking." noindex />
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private-tour-to-nusa-penida" }}
      />
      <main className="container max-w-2xl flex-1 py-8 sm:py-12">{content}</main>
      <Footer />
    </div>
  );

  if (!odooId) return renderShell(
    <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-red-500">
      No order id. Please use the link from your email.
    </p>
  );

  if (loading) return renderShell(
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-primary-500" />
    </div>
  );

  if (error) return renderShell(
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 text-4xl">🔍</div>
      <h1 className="text-xl font-bold text-secondary-900">Order not found</h1>
      <p className="mt-2 text-sm text-secondary-500">Please check the link from your confirmation email.</p>
    </div>
  );

  const { local, odoo, options } = data;
  const collect = odoo.collect || 0;
  const depositPaid = odoo.deposit_paid || 0;

  return renderShell(
    <>
      <a
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition hover:text-primary-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </a>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
          My Booking
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">{local.tour_name}</h1>
        <p className="mt-1 text-sm text-secondary-500">{odoo.order_number}</p>
        {justPaid && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            Payment received — thank you!
          </div>
        )}
      </div>

      <SectionCard title="Order Summary" icon={Map}>
        <SummaryRow label="Date" value={fmtDate(local.travel_date)} />
        <SummaryRow label="Boat" value={odoo.boat_name} />
        <SummaryRow label="Route" value={local.route_name || odoo.route} />
        <SummaryRow label="Guests" value={`${local.adults} adult${local.adults !== 1 ? "s" : ""}${local.kids > 0 ? `, ${local.kids} kid${local.kids !== 1 ? "s" : ""}` : ""}`} />
        <SummaryRow label="Transfer" value={local.transfer_name} />
        <SummaryRow label="Insurance" value={local.cover_name} />
        {local.pickup_address && <SummaryRow label="Pickup" value={local.pickup_address} />}
        {local.dropoff_address && <SummaryRow label="Drop-off" value={local.dropoff_address} />}
      </SectionCard>

      <SectionCard title="Pricing" icon={Wallet}>
        <SummaryRow label="Deposit paid" value={`IDR ${fmt(depositPaid)}`} />
        {lastPrices && <SummaryRow label="Updated total" value={`IDR ${fmt(lastPrices.full_price)}`} />}
        <div className="flex items-center justify-between py-3">
          <span className={`text-sm font-bold ${collect > 0 ? "text-red-500" : "text-emerald-600"}`}>
            {collect > 0 ? "Remaining to pay" : "Fully paid"}
          </span>
          {collect > 0 && <span className="text-lg font-extrabold text-red-500">IDR {fmt(collect)}</span>}
        </div>
        {collect > 0 && (
          <Button onClick={payCollect} disabled={paying}>
            {paying ? "Redirecting…" : `Pay remaining IDR ${fmt(collect)}`}
          </Button>
        )}
      </SectionCard>

      <SectionCard
        title="Change Your Booking"
        icon={CalendarDays}
        hint="Saving here updates your order and recreates it in our system (~5 sec)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField
            tourId={local.tours_id}
            isPrivate={local.is_private}
            guests={editAdults + editKids}
            value={editDate}
            onChange={setEditDate}
            open={openPanel === "date"}
            onToggle={() => setOpenPanel(openPanel === "date" ? null : "date")}
            onClose={() => setOpenPanel(null)}
          />

          <GuestsField
            adults={editAdults}
            kids={editKids}
            onAdultsChange={setEditAdults}
            onKidsChange={setEditKids}
            open={openPanel === "guests"}
            onToggle={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
            onClose={() => setOpenPanel(null)}
          />
        </div>

        {local.is_private && (options.routes || []).length > 0 && (
          <div className="mt-4">
            <label className={fieldLabel}>Route</label>
            <select value={editRoute} onChange={e => setEditRoute(e.target.value)} className={fieldInput}>
              {(options.routes || []).map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        )}

        {local.transfer_id && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={fieldLabel}>Pickup address</label>
              <input
                type="text"
                value={editPickup}
                onChange={e => setEditPickup(e.target.value)}
                placeholder="Your hotel / address"
                className={fieldInput}
              />
            </div>
            <div>
              <label className={fieldLabel}>Drop-off address</label>
              <input
                type="text"
                value={editDropoff}
                onChange={e => setEditDropoff(e.target.value)}
                placeholder="Your hotel / address"
                className={fieldInput}
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>
              <span className="inline-flex items-center gap-1"><Car className="h-3.5 w-3.5" /> Transfer</span>
            </label>
            <select value={editTransfer} onChange={e => setEditTransfer(e.target.value)} className={fieldInput}>
              <option value="">No transfer</option>
              {(options.transfers || []).map(t => (
                <option key={t.id} value={t.id}>{t.name} — IDR {fmt(t.price)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Insurance</span>
            </label>
            <select value={editCover} onChange={e => setEditCover(e.target.value)} className={fieldInput}>
              <option value="">No insurance</option>
              {(options.covers || []).map(c => (
                <option key={c.id} value={c.id}>{c.name} — IDR {fmt(c.price)}</option>
              ))}
            </select>
          </div>
        </div>

        {local.is_private && (
          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary-900">
              <Sparkles className="h-4 w-4 text-primary-600" />
              Extras
            </div>
            {catalogExtras.length === 0 && lockedExtras.length === 0 && (
              <p className="text-sm text-secondary-400">No extras available for this route.</p>
            )}
            <div className="divide-y divide-neutral-100">
              {catalogExtras.map(item => {
                const qty = editExtras[item.id]?.qty || 0;
                return (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-semibold text-secondary-900">{item.name}</div>
                      <div className="text-xs text-secondary-500">IDR {fmt(item.price)}</div>
                    </div>
                    <StepperRow value={qty} onChange={v => setExtraQty(item, v)} min={0} />
                  </div>
                );
              })}
              {lockedExtras.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-semibold text-secondary-900">{item.name}</div>
                    <div className="text-xs text-secondary-400">IDR {fmt(item.price)} · kept from previous route</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExtraQty(item, Math.max(0, item.qty - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-secondary-600 transition-colors hover:border-secondary-900 hover:text-secondary-900"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex items-center gap-4">
          <Button onClick={saveAll} disabled={saving}>
            {saving ? "Updating…" : "Save changes"}
          </Button>
          {saved && <span className="text-sm font-semibold text-emerald-600">Updated!</span>}
          {saveError && <span className="text-sm font-semibold text-red-500">{saveError}</span>}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="mb-3 text-sm text-secondary-500">Questions? Contact us:</p>
        <div className="flex flex-wrap gap-4">
          <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 transition-colors hover:text-primary-600">
            <MessageCircle className="h-3.5 w-3.5 text-primary-500" />
            WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 transition-colors hover:text-primary-600">
            <Mail className="h-3.5 w-3.5 text-primary-500" />
            {EMAIL}
          </a>
        </div>
      </SectionCard>
    </>
  );
}
