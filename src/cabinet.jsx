import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SEO from "./components/SEO";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Button from "./components/common/Button";
import CustomDatePicker from "./components/common/CustomDatePicker";
import { TransfersCompact, CoversCompact } from "./components/booking/TransferCoverPanels";
import { apiUrl } from "./api/base";
import { cn } from "./lib/utils";
import {
  ChevronLeft,
  ChevronRight,
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
  Anchor,
  CheckCircle2,
  CreditCard,
  Navigation2,
  Check,
  AlertCircle,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { useSiteContacts } from "./hooks/useSiteContacts";
import { WA, EMAIL } from "./lib/contacts";
import ScheduleItemCompact from "./components/tour/ScheduleItemCompact";

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

function computeAutoQty(qtyType, members) {
  if (qtyType === "per_car") return Math.max(1, Math.ceil(members / 5));
  if (qtyType === "per_person") return Math.max(1, members);
  if (qtyType === "fixed") return 1;
  return null;
}

function autoQtyLabel(qtyType, qty) {
  if (qtyType === "per_car") return `×${qty} car${qty !== 1 ? "s" : ""} (auto)`;
  if (qtyType === "per_person") return `×${qty} guest${qty !== 1 ? "s" : ""} (auto)`;
  if (qtyType === "fixed") return `×1 (auto)`;
  return null;
}

// ─── Hero chip ───────────────────────────────────────────────────────────────
function HeroChip({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
      {Icon && <Icon className="h-3.5 w-3.5 opacity-75" />}
      {children}
    </div>
  );
}

// ─── Info row (summary card) ─────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 py-3 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-secondary-500">
        {Icon && <Icon className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="text-xs text-secondary-400">{label}</div>
        <div className="mt-0.5 text-sm font-semibold leading-snug text-secondary-900">{value}</div>
      </div>
    </div>
  );
}

// ─── Price row ───────────────────────────────────────────────────────────────
function PriceRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2.5 last:border-0">
      <span className={cn("text-sm", bold ? "font-bold text-secondary-900" : "text-secondary-500")}>{label}</span>
      <span className={cn("text-sm", bold ? "font-extrabold text-secondary-900" : "font-semibold text-secondary-700")}>{value}</span>
    </div>
  );
}

// ─── Section card ────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, hint, children, className }) {
  return (
    <div className={cn("mb-5 rounded-2xl border border-neutral-200 bg-white shadow-sm", className)}>
      {title && (
        <div className="border-b border-neutral-100 px-6 py-4 sm:px-7">
          <h2 className="flex items-center gap-2 text-sm font-bold text-secondary-900">
            {Icon && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Icon className="h-3.5 w-3.5" />
              </span>
            )}
            {title}
          </h2>
          {hint && <p className="mt-1 text-xs text-secondary-400">{hint}</p>}
        </div>
      )}
      <div className="p-6 sm:p-7">{children}</div>
    </div>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────
function StepperRow({ value, onChange, min = 0, max = Infinity }) {
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-l-full text-secondary-500 transition hover:bg-neutral-50 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-secondary-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-r-full text-secondary-500 transition hover:bg-neutral-50 disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Date field (simple — no inline availability filter; check is explicit) ───
function DateField({ value, onChange, open, onToggle, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full flex-col rounded-xl border bg-white px-4 py-3 text-left transition-colors",
          open ? "border-primary-300 ring-2 ring-primary-100" : "border-neutral-200 hover:border-primary-200"
        )}
      >
        <span className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">Travel date</span>
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
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl shadow-black/10 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl">
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
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Guests field ─────────────────────────────────────────────────────────────
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
          "flex w-full flex-col rounded-xl border bg-white px-4 py-3 text-left transition-colors",
          open ? "border-primary-300 ring-2 ring-primary-100" : "border-neutral-200 hover:border-primary-200"
        )}
      >
        <span className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">Guests</span>
        <span className="text-sm font-semibold text-secondary-900">{summary}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-72 max-sm:fixed max-sm:inset-0 max-sm:mt-0 max-sm:flex max-sm:w-full max-sm:items-end max-sm:justify-center max-sm:bg-black/30 max-sm:backdrop-blur-sm"
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/10 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl">
              <div className="mb-3 flex items-center justify-between sm:hidden">
                <span className="text-sm font-semibold text-secondary-900">Guests</span>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-secondary-900">Adults</div>
                    <div className="text-xs text-secondary-400">Ages 12+</div>
                  </div>
                  <StepperRow value={adults} onChange={(v) => onAdultsChange(Math.max(1, v))} min={1} />
                </div>
                <div className="h-px bg-neutral-100" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-secondary-900">Kids</div>
                    <div className="text-xs text-secondary-400">Ages 3–11</div>
                  </div>
                  <StepperRow value={kids} onChange={(v) => onKidsChange(Math.max(0, v))} min={0} />
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary-400" />
                  <p className="text-xs leading-relaxed text-secondary-400">Toddlers under 3 go free.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Extra row (list item matching the site's renderExtraRow style) ──────────
function ExtraRow({ item, members, isSelected, qty, onToggle, onChangeQty, editExtras, onChildQty, locked, savedQty, savedExtrasMap }) {
  const isAuto = item.qty_type && item.qty_type !== "manual";
  const autoQty = isAuto ? computeAutoQty(item.qty_type, members) : null;
  const isSaved = (savedQty || 0) > 0; // this item was on the order when loaded
  const minusDisabled = isAuto ? isSaved : qty <= (savedQty || 0);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const [expanded, setExpanded] = useState(false);

  // Count selected children
  const selectedChildCount = hasChildren
    ? item.children.filter((c) => editExtras && editExtras[c.id] && editExtras[c.id].qty > 0).length
    : 0;

  return (
    <div>
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 transition",
        isSelected && !hasChildren ? "bg-primary-50/60" : "hover:bg-neutral-50"
      )}>
        {/* Thumbnail */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {item.image
            ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
            : <div className="h-full w-full bg-neutral-200" />}
        </div>

        {/* Name + price */}
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-bold text-secondary-900">{item.name}</div>
          <div className="mt-0.5 text-xs text-secondary-500">
            {hasChildren
              ? `from IDR ${fmt(Math.min(...item.children.map((c) => c.price)))}`
              : `IDR ${fmt(item.price)}`}
            {!hasChildren && isAuto && autoQty && <span className="ml-1">{autoQtyLabel(item.qty_type, autoQty)}</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="shrink-0">
          {locked ? (
            qty > 0 || isSelected
              ? <span className="inline-flex h-9 items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 text-sm text-secondary-400">×{isAuto ? autoQty : qty}</span>
              : <span className="inline-flex h-9 items-center rounded-full border border-neutral-100 bg-neutral-50 px-4 text-sm text-secondary-300">Add</span>
          ) : hasChildren ? (
            <button type="button" onClick={() => setExpanded((v) => !v)}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-bold transition",
                selectedChildCount > 0
                  ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
                  : "border-neutral-100 bg-neutral-100 text-primary-600 hover:bg-white"
              )}>
              {selectedChildCount > 0 ? `${selectedChildCount} selected` : `${item.children.length} options`}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
          ) : isAuto ? (
            isSelected ? (
              <div className="inline-flex h-9 items-center rounded-full border border-neutral-200 bg-white px-2 shadow-sm">
                <button type="button" onClick={onToggle} disabled={minusDisabled}
                  className={cn("grid h-7 w-7 place-items-center rounded-full transition", minusDisabled ? "cursor-not-allowed text-secondary-200" : "text-secondary-700 hover:text-primary-600")}>
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">×{autoQty}</span>
                <div className="h-7 w-7" />
              </div>
            ) : (
              <button type="button" onClick={onToggle}
                className="inline-flex h-9 items-center justify-center rounded-full border border-neutral-100 bg-neutral-100 px-4 text-sm font-bold text-primary-600 transition hover:bg-white">
                Add
              </button>
            )
          ) : qty > 0 ? (
            <div className="inline-flex h-9 items-center rounded-full border border-neutral-200 bg-white px-2 shadow-sm">
              <button type="button" onClick={() => onChangeQty(qty - 1)} disabled={minusDisabled}
                className={cn("grid h-7 w-7 place-items-center rounded-full transition", minusDisabled ? "cursor-not-allowed text-secondary-200" : "text-secondary-700 hover:text-primary-600")}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">{qty}</span>
              <button type="button" onClick={() => onChangeQty(qty + 1)}
                className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition hover:text-primary-600">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => onChangeQty(1)}
              className="inline-flex h-9 items-center justify-center rounded-full border border-neutral-100 bg-neutral-100 px-4 text-sm font-bold text-primary-600 transition hover:bg-white">
              Add
            </button>
          )}
        </div>
      </div>

      {/* Children (expanded) */}
      {hasChildren && expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50/60">
          {item.children.map((child) => {
            const childQty = editExtras?.[child.id]?.qty || 0;
            const childIsAuto = child.qty_type && child.qty_type !== "manual";
            const childAutoQty = childIsAuto ? computeAutoQty(child.qty_type, members) : null;
            const childSavedQty = savedExtrasMap?.[child.id] || 0;
            const childMinusDisabled = childIsAuto ? childSavedQty > 0 : childQty <= childSavedQty;
            return (
              <div key={child.id} className={cn(
                "flex items-center gap-3 py-2.5 pl-8 pr-4 transition",
                childQty > 0 ? "bg-primary-50/40" : "hover:bg-neutral-100/80"
              )}>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                  {child.image
                    ? <img src={child.image} alt={child.name} className="h-full w-full object-cover" loading="lazy" />
                    : <div className="h-full w-full bg-neutral-200" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-secondary-900">{child.name}</div>
                  <div className="text-xs text-secondary-500">
                    IDR {fmt(child.price)}
                    {childIsAuto && childAutoQty && <span className="ml-1">{autoQtyLabel(child.qty_type, childAutoQty)}</span>}
                  </div>
                </div>
                <div className="shrink-0">
                  {locked ? (
                    childQty > 0
                      ? <span className="inline-flex h-8 items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 text-sm text-secondary-400">×{childIsAuto ? childAutoQty : childQty}</span>
                      : <span className="inline-flex h-8 items-center rounded-full border border-neutral-100 bg-neutral-50 px-3 text-sm text-secondary-300">Add</span>
                  ) : childIsAuto ? (
                    childQty > 0 ? (
                      <div className="inline-flex h-8 items-center rounded-full border border-neutral-200 bg-white px-2 shadow-sm">
                        <button type="button" onClick={() => onChildQty(child, 0)} disabled={childMinusDisabled}
                          className={cn("grid h-6 w-6 place-items-center rounded-full transition", childMinusDisabled ? "cursor-not-allowed text-secondary-200" : "text-secondary-700 hover:text-primary-600")}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">×{childAutoQty}</span>
                        <div className="h-6 w-6" />
                      </div>
                    ) : (
                      <button type="button" onClick={() => onChildQty(child, childAutoQty || 1)}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-neutral-100 bg-neutral-100 px-3 text-sm font-bold text-primary-600 transition hover:bg-white">
                        Add
                      </button>
                    )
                  ) : childQty > 0 ? (
                    <div className="inline-flex h-8 items-center rounded-full border border-neutral-200 bg-white px-2 shadow-sm">
                      <button type="button" onClick={() => onChildQty(child, childQty - 1)} disabled={childMinusDisabled}
                        className={cn("grid h-6 w-6 place-items-center rounded-full transition", childMinusDisabled ? "cursor-not-allowed text-secondary-200" : "text-secondary-700 hover:text-primary-600")}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">{childQty}</span>
                      <button type="button" onClick={() => onChildQty(child, childQty + 1)}
                        className="grid h-6 w-6 place-items-center rounded-full text-secondary-700 transition hover:text-primary-600">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => onChildQty(child, 1)}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-neutral-100 bg-neutral-100 px-3 text-sm font-bold text-primary-600 transition hover:bg-white">
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Route card (image + title + description + select button) ────────────────
function RouteCard({ route, isSelected, onSelect }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-all",
        isSelected
          ? "border-primary-500 ring-1 ring-primary-500 shadow-lg"
          : "border-neutral-200 hover:border-primary-300 hover:shadow-md"
      )}
    >
      {/* Image */}
      {route.image && (
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          <img src={route.image} alt={route.title} className="h-full w-full object-cover" />
          {isSelected && (
            <>
              <div className="absolute inset-0 bg-primary-600/25" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                  <Check className="h-5 w-5 text-primary-600" strokeWidth={3} />
                </div>
                <span className="rounded-full bg-white px-4 py-1 text-sm font-bold text-primary-600 shadow-md">Selected</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        <div className="text-base font-bold leading-snug text-secondary-900">{route.title}</div>
        {route.description && (
          <div className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-secondary-500">{route.description}</div>
        )}
        {Array.isArray(route.highlights) && route.highlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {route.highlights.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-secondary-600">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                {typeof h === "string" ? h : (h.label || "")}
              </div>
            ))}
          </div>
        )}
        {route.best_for && (
          <div className="mt-2.5 flex items-start gap-1.5 text-xs font-semibold text-secondary-700">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {route.best_for}
          </div>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onSelect(String(route.id))}
            className={cn(
              "w-full rounded-full py-2.5 text-sm font-bold transition",
              isSelected
                ? "bg-primary-600 text-white"
                : "border border-neutral-200 text-secondary-700 hover:border-primary-300 hover:text-primary-700"
            )}
          >
            {isSelected ? "✓ Selected" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldLabel = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary-400";

// ─── EditableRow: read-only row with inline editor on "Edit" ─────────────────
function EditableRow({ icon: Icon, label, value, isEditing, onEdit, doneDisabled, disabled, noPadding, children }) {
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-secondary-500">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-secondary-400">{label}</div>
          <div className="mt-0.5 text-sm font-semibold leading-snug text-secondary-900">{value || "—"}</div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-secondary-600 transition hover:border-secondary-400 hover:text-secondary-900"
          >
            {isEditing ? "Close" : "Edit"}
          </button>
        )}
      </div>
      {isEditing && (
        <div className={cn("border-t border-neutral-50 pb-5 pt-3", !noPadding && "px-4")}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── GuestsInline: inline stepper (no popup) ─────────────────────────────────
function GuestsInline({ adults, kids, onAdultsChange, onKidsChange, capacity }) {
  const maxAdults = capacity ? Math.max(1, capacity - kids) : Infinity;
  const maxKids   = capacity ? Math.max(0, capacity - adults) : Infinity;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-secondary-900">Adults</span>
          <span className="text-xs text-secondary-400">12+</span>
        </div>
        <StepperRow value={adults} onChange={(v) => onAdultsChange(Math.max(1, v))} min={1} max={maxAdults} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-secondary-900">Kids</span>
          <span className="text-xs text-secondary-400">3–11</span>
        </div>
        <StepperRow value={kids} onChange={(v) => onKidsChange(Math.max(0, v))} min={0} max={maxKids} />
      </div>
      {capacity && (
        <p className="text-xs text-secondary-300">Max {capacity} guests · Toddlers under 3 go free</p>
      )}
      {!capacity && (
        <p className="text-xs text-secondary-300">Toddlers under 3 go free</p>
      )}
    </div>
  );
}

// ─── Cabinet page ─────────────────────────────────────────────────────────────
export default function Cabinet({ odooId, uniqueKey }) {
  const contacts = useSiteContacts();
  const params = new URLSearchParams(window.location.search);
  const justPaid  = params.get("paid")  === "1";
  const justSaved = params.get("saved") === "1";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);

  const [editDate, setEditDate] = useState("");
  const [editPickup, setEditPickup] = useState("");
  const [editDropoff, setEditDropoff] = useState("");
  const [editAdults, setEditAdults] = useState(0);
  const [editKids, setEditKids] = useState(0);
  const [editTransfer, setEditTransfer] = useState(null);
  const [editCover, setEditCover] = useState(null);
  const [editRoute, setEditRoute] = useState("");
  // editExtras: id → { id, name, price, qty, qty_type }
  const [editExtras, setEditExtras] = useState({});

  // Saved (initial) values — used to enforce add-only restrictions
  const [savedTransferId, setSavedTransferId] = useState(null);
  const [savedCoverId, setSavedCoverId] = useState(null);
  const [savedExtrasMap, setSavedExtrasMap] = useState({}); // id → min qty
  const [managerPopup, setManagerPopup] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lastPrices, setLastPrices] = useState(null);
  const [initialAddOns, setInitialAddOns] = useState(null);
  const [paying, setPaying] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState(null);
  const [upgradeChecked, setUpgradeChecked] = useState(false);
  const [upgradeChecking, setUpgradeChecking] = useState(false);
  const [upgradeCheckData, setUpgradeCheckData] = useState(null);
  const [upgradeCheckError, setUpgradeCheckError] = useState(null);

  // Tour details tab (Itinerary / What's included)
  const [detailTab, setDetailTab] = useState("itinerary");
  const [showTourDetails, setShowTourDetails] = useState(false);

  // Tick every second (used for the final-hours hh:mm:ss countdown; also keeps lock states live)
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1_000);
    return () => clearInterval(id);
  }, []);

  const [showRouteContactModal, setShowRouteContactModal] = useState(false);
  const [showSharedEditModal, setShowSharedEditModal] = useState(false);
  const [showUpgradeContactModal, setShowUpgradeContactModal] = useState(false);
  const [upgradeContactTier, setUpgradeContactTier] = useState("");

  // Active category tab in the extras panel
  const [extrasActiveCat, setExtrasActiveCat] = useState(null);
  const extrasCatsScrollRef = useRef(null);
  // Which field is expanded for editing (null = all collapsed)
  const [editingField, setEditingField] = useState(null);

  // Availability check (triggered explicitly by the user after picking date+guests)
  const [availChecking, setAvailChecking] = useState(false);
  const [availChecked, setAvailChecked] = useState(false);
  const [availResult, setAvailResult] = useState(null); // true=available, false=not available

  const fetchOrder = useCallback(async () => {
    if (!odooId || !uniqueKey) { setError("No order link provided"); setLoading(false); return; }
    try {
      const res = await fetch(apiUrl(`cabinet/${odooId}/${uniqueKey}`));
      if (!res.ok) { setError("Order not found"); setLoading(false); return; }
      const json = await res.json();
      setData(json);
      setEditDate(json.local.travel_date || "");
      setEditPickup(json.local.pickup_address || "");
      setEditDropoff(json.local.dropoff_address || "");
      setEditAdults(json.local.adults || 0);
      setEditKids(json.local.kids || 0);
      const initTransfer = json.local.transfer_id ? Number(json.local.transfer_id) : null;
      const initCover    = json.local.cover_id    ? Number(json.local.cover_id)    : null;
      setEditTransfer(initTransfer);
      setEditCover(initCover);
      setSavedTransferId(initTransfer);
      setSavedCoverId(initCover);
      const firstRouteId = (json.options?.routes || [])[0]?.id;
      setEditRoute(json.local.route_id
        ? String(json.local.route_id)
        : firstRouteId ? String(firstRouteId) : "");

      // Build flat extras map from all routes' catalogs to recover qty_type (including children)
      const allExtrasById = {};
      for (const route of (json.options?.routes || [])) {
        for (const e of (route.extras || [])) {
          allExtrasById[e.id] = e;
          for (const child of (e.children || [])) allExtrasById[child.id] = child;
        }
      }
      const extrasMap = {};
      for (const item of (json.local.extras || [])) {
        if (!item?.id) continue;
        const cat = allExtrasById[item.id];
        extrasMap[item.id] = {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          qty: Number(item.qty ?? item.quantity ?? 1),
          qty_type: cat?.qty_type || "manual",
          image: cat?.image || null,
        };
      }
      setEditExtras(extrasMap);
      // Build the minimum-qty map from the initial saved extras
      const savedMap = {};
      for (const item of (json.local.extras || [])) {
        if (item?.id) savedMap[item.id] = Number(item.qty ?? item.quantity ?? 1);
      }
      setSavedExtrasMap(savedMap);
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [odooId, uniqueKey]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Reset + auto-check availability (debounced) whenever date or guest count changes
  useEffect(() => {
    setAvailChecked(false);
    setAvailResult(null);
    setUpgradeChecked(false);
    setUpgradeCheckData(null);
    setUpgradeCheckError(null);
    if (!data || !editDate || editAdults + editKids <= 0) return;
    const origDate    = data.local?.travel_date || "";
    const origAdults  = data.local?.adults || 0;
    const origKids    = data.local?.kids   || 0;
    if (editDate === origDate && editAdults === origAdults && editKids === origKids) return;
    const t = setTimeout(checkAvailability, 700);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDate, editAdults, editKids, data]);

  const checkAvailability = async () => {
    const toursId  = data?.local?.tours_id;
    const isPrivate = !!data?.local?.is_private;
    if (!editDate || !toursId) return;
    setAvailChecking(true);
    try {
      const endpoint = isPrivate ? "private" : "shared";
      const res = await fetch(
        apiUrl(`availability/${endpoint}/${toursId}?start=${editDate}&end=${editDate}`)
      );
      const avData = await res.json();
      let available;
      if (isPrivate) {
        available = !(editDate in avData) || avData[editDate] !== 0;
      } else {
        const entry = (avData || []).find((e) => e.date === editDate);
        available = !entry || (entry.available_seats ?? 0) >= editMembers;
      }
      setAvailResult(available);
      setAvailChecked(true);
    } catch {
      setAvailResult(null);
      setAvailChecked(false);
    } finally {
      setAvailChecking(false);
    }
  };

  const toggleEdit = (field) => {
    setEditingField((prev) => (prev === field ? null : field));
    setOpenPanel(null);
  };

  const selectedRoute = useMemo(() => {
    const routes = data?.options?.routes || [];
    return routes.find((r) => String(r.id) === editRoute) || null;
  }, [data, editRoute]);

  const catalogCategories = selectedRoute?.categories || [];
  const catalogExtrasFlat = selectedRoute?.extras || [];

  // All IDs in the current route catalog (parents + their children)
  const catalogAllIds = useMemo(() => {
    const ids = new Set();
    for (const e of catalogExtrasFlat) {
      ids.add(e.id);
      for (const c of (e.children || [])) ids.add(c.id);
    }
    return ids;
  }, [catalogExtrasFlat]);

  // Extras that are saved on the order but not in the current route's catalog
  const lockedExtras = useMemo(
    () => Object.values(editExtras).filter((e) => !catalogAllIds.has(e.id)),
    [editExtras, catalogAllIds]
  );

  const setExtraQty = (item, qty) => {
    // Never let qty drop below the saved minimum
    const minQty = savedExtrasMap[item.id] || 0;
    const safeQty = Math.max(minQty, qty);
    setEditExtras((prev) => {
      const next = { ...prev };
      if (safeQty <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = { id: item.id, name: item.name, price: item.price, qty: safeQty, qty_type: item.qty_type || "manual", image: item.image || null };
      }
      return next;
    });
  };

  const toggleAutoExtra = (item) => {
    // Saved extras can't be removed, only newly added ones can be toggled off
    if (savedExtrasMap[item.id]) return;
    setEditExtras((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = { id: item.id, name: item.name, price: item.price, qty: 1, qty_type: item.qty_type || "manual", image: item.image || null };
      }
      return next;
    });
  };

  // Transfer/cover change — intercept downgrade/removal and show manager popup instead
  const handleTransferChange = (v) => {
    const newId = v ? Number(v) : null;
    if (savedTransferId !== null) {
      if (newId === null) { setManagerPopup(true); return; }
      const savedT = (data?.options?.transfers || []).find((t) => Number(t.id) === savedTransferId);
      const newT   = (data?.options?.transfers || []).find((t) => Number(t.id) === newId);
      if (savedT && newT && Number(newT.price) < Number(savedT.price)) { setManagerPopup(true); return; }
    }
    setEditTransfer(newId);
  };

  const handleCoverChange = (v) => {
    const newId = v ? Number(v) : null;
    if (savedCoverId !== null && newId === null) { setManagerPopup(true); return; }
    setEditCover(newId);
  };

  const editMembers = editAdults + editKids;

  const resetChanges = () => {
    if (!data) return;
    const { local } = data;
    setEditDate(local.travel_date || "");
    setEditPickup(local.pickup_address || "");
    setEditDropoff(local.dropoff_address || "");
    setEditAdults(local.adults || 0);
    setEditKids(local.kids || 0);
    setEditTransfer(local.transfer_id ? Number(local.transfer_id) : null);
    setEditCover(local.cover_id ? Number(local.cover_id) : null);
    setEditRoute(local.route_id ? String(local.route_id) : "");
    const extrasMap = {};
    for (const item of (local.extras || [])) {
      if (!item?.id) continue;
      extrasMap[item.id] = { id: item.id, name: item.name, price: Number(item.price) || 0, qty: Number(item.qty ?? 1), qty_type: "manual", image: null };
    }
    setEditExtras(extrasMap);
    setEditingField(null);
    setSaveError("");
  };

  const originalDate = data?.local?.travel_date || "";
  const originalMembers = (data?.local?.adults || 0) + (data?.local?.kids || 0);
  const dateOrGuestsChanged = editDate !== originalDate || editMembers !== originalMembers;
  const saveBlocked = dateOrGuestsChanged && (!availChecked || availResult === false);

  // Live add-ons price estimate (instant, no server round-trip)
  const livePrices = useMemo(() => {
    if (!data) return null;
    const isPrivate = !!data.local.is_private;

    let transferPrice = 0;
    if (editTransfer) {
      const t = (data.options.transfers || []).find((t) => Number(t.id) === Number(editTransfer));
      if (t) {
        const cars = [1, 2].includes(Number(editTransfer)) ? Math.max(1, Math.ceil(editMembers / 5)) : 0;
        const unitPrice = editMembers > 5 && t.bus_price ? t.bus_price : t.price;
        transferPrice = unitPrice * Math.max(1, cars);
      }
    }

    let coverPrice = 0;
    if (editCover) {
      const c = (data.options.covers || []).find((c) => Number(c.id) === Number(editCover));
      if (c) coverPrice = c.price * (isPrivate ? 1 : Math.max(1, editMembers));
    }

    let extrasTotal = 0;
    for (const item of Object.values(editExtras)) {
      const autoQty = computeAutoQty(item.qty_type, editMembers);
      const qty = autoQty !== null ? autoQty : item.qty;
      extrasTotal += item.price * Math.max(1, qty || 1);
    }

    return { transferPrice, coverPrice, extrasTotal, total: transferPrice + coverPrice + extrasTotal };
  }, [data, editAdults, editKids, editTransfer, editCover, editExtras]);

  // Capture the initial add-ons total once after data first loads
  useEffect(() => {
    if (data && livePrices !== null && initialAddOns === null) {
      setInitialAddOns(livePrices.total);
    }
  }, [data, livePrices, initialAddOns]);

  const checkUpgradeLive = async () => {
    setUpgradeChecking(true);
    setUpgradeCheckError(null);
    setUpgradeCheckData(null);
    try {
      const res = await fetch(apiUrl(`cabinet/${odooId}/${uniqueKey}/upgrade`));
      const json = await res.json();
      setUpgradeCheckData(json);
      setUpgradeChecked(true);
    } catch {
      setUpgradeCheckError("Could not check availability");
    } finally {
      setUpgradeChecking(false);
    }
  };

  const doUpgrade = async (toursId) => {
    setUpgrading(true);
    setUpgradeError(null);
    try {
      const res = await fetch(apiUrl(`cabinet/${odooId}/${uniqueKey}/upgrade`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tours_id: toursId }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchOrder();
      } else {
        setUpgradeError(json.error || "Upgrade failed");
      }
    } catch (e) {
      setUpgradeError("Network error");
    } finally {
      setUpgrading(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const payload = {
        date: editDate,
        pickup_address: editPickup,
        dropoff_address: editDropoff,
        adults: editAdults,
        kids: editKids,
        transfer_id: editTransfer || null,
        cover_id: editCover || null,
        extras: Object.values(editExtras).map(({ id, name, price, qty, qty_type }) => {
          const autoQty = computeAutoQty(qty_type, editMembers);
          return { id, name, price, qty: autoQty !== null ? autoQty : qty };
        }),
      };

      const res = await fetch(apiUrl(`cabinet/${odooId}/${uniqueKey}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setLastPrices(json.prices || null);
        setSaved(true);
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 3500);
        await fetchOrder();
        return true;
      } else {
        setSaveError(json.error || "Could not update the order");
        return false;
      }
    } catch {
      setSaveError("Could not update the order");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAndPay = async () => {
    const ok = await saveAll();
    if (ok) await payCollect();
  };

  const payCollect = async () => {
    setPaying(true);
    try {
      const res = await fetch(apiUrl(`cabinet/${odooId}/${uniqueKey}/pay`), { method: "POST" });
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
      <main className="container max-w-5xl flex-1 py-8 sm:py-12">{content}</main>
      <Footer />
    </div>
  );

  if (!odooId || !uniqueKey) return renderShell(
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
      <p className="text-sm text-secondary-500">Invalid link. Please use the link from your confirmation email.</p>
    </div>
  );

  if (loading) return renderShell(
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-primary-500" />
    </div>
  );

  if (error) return renderShell(
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
      <h1 className="text-xl font-bold text-secondary-900">Order not found</h1>
      <p className="mt-2 text-sm text-secondary-500">Please check the link from your confirmation email.</p>
    </div>
  );

  const { local, odoo, options } = data;
  const collect = odoo.collect || 0;

  // Route schedule: for private use currently-selected route's schedule; for shared use options.route_schedule
  const currentScheduleData = local.is_private
    ? ((options.routes || []).find((r) => String(r.id) === String(editRoute))?.schedule || null)
    : (options.route_schedule || null);
  const scheduleItems = [
    ...(currentScheduleData?.before_lunch || []),
    ...(currentScheduleData?.after_lunch  || []),
  ];
  const tourIncluded = options.tour_included || [];
  const tourIncludes = options.tour_includes || [];
  const hasScheduleSection = scheduleItems.length > 0 || tourIncluded.length > 0 || tourIncludes.length > 0;
  const waNumber = contacts?.whatsapp?.number || WA.google;
  const waMsg = encodeURIComponent(`Hii Bluuu Tours! I want to ask about one of your tours ${odoo.order_number || odooId}`);
  const waLink = `https://wa.me/${waNumber}?text=${waMsg}`;
  const depositPaid = odoo.deposit_paid || 0;

  // Time-based edit restrictions
  const hoursUntilTour = (() => {
    const start = odoo.rental_start_date;
    if (!start) return null;
    const tourMs = new Date(start + "Z").getTime(); // UTC string → ms
    return (tourMs - Date.now()) / 3_600_000;
  })();
  // Source-based restriction: date & guest count only editable for Bluuu.tours bookings
  const sourceIsOurs   = local.source_id === 1;
  // All editing locks 24 h before the tour; check-in opens at the same moment
  const editLocked     = hoursUntilTour !== null && hoursUntilTour <= 24;
  const dateEditLocked = editLocked || !sourceIsOurs;
  const allEditLocked  = editLocked;

  // Countdown to check-in opening (= 24 h before rental_start_date)
  const checkinOpenMs = odoo.rental_start_date
    ? new Date(odoo.rental_start_date + "Z").getTime() - 24 * 3_600_000
    : null;
  const checkinCountdown = (() => {
    if (!checkinOpenMs) return null;
    const ms = checkinOpenMs - Date.now();
    if (ms <= 0) return null;
    const totalSecs = Math.ceil(ms / 1_000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return { d, h, m, s };
  })();

  // Display summaries for each editable field
  const transferOpt = (options.transfers || []).find((t) => Number(t.id) === Number(editTransfer));
  const coverOpt    = (options.covers || []).find((c) => Number(c.id) === Number(editCover));
  const extrasCount = Object.keys(editExtras).length;

  const guestSummary = `${editAdults} adult${editAdults !== 1 ? "s" : ""}${editKids > 0 ? `, ${editKids} kid${editKids !== 1 ? "s" : ""}` : ""}`;
  const transferSummary = editTransfer
    ? [(transferOpt?.name || "Transfer"), editPickup && `from ${editPickup}`].filter(Boolean).join(" • ")
    : "No transfer";
  const coverSummary = editCover ? (coverOpt?.name || "Insurance") : "None";
  const extrasNames = Object.values(editExtras).filter(Boolean).map((e) => e.name);
  const extrasSummary = extrasNames.length > 0
    ? (extrasNames.length <= 2 ? extrasNames.join(", ") : `${extrasNames.slice(0, 2).join(", ")} +${extrasNames.length - 2} more`)
    : "None";
  const routeSummary = selectedRoute?.title || local.route_name || "—";

  const extrasChanged = (() => {
    const cur = Object.entries(editExtras).sort(([a],[b]) => Number(a)-Number(b)).map(([id,e]) => ({ id: Number(id), qty: e.qty }));
    const orig = [...(local.extras || [])].sort((a,b) => a.id-b.id).map(e => ({ id: e.id, qty: e.qty }));
    return JSON.stringify(cur) !== JSON.stringify(orig);
  })();

  const hasChanges =
    editDate          !== (local.travel_date || "") ||
    editAdults        !== (local.adults || 0) ||
    editKids          !== (local.kids || 0) ||
    editTransfer      !== (local.transfer_id ? Number(local.transfer_id) : null) ||
    editCover         !== (local.cover_id ? Number(local.cover_id) : null) ||
    editPickup        !== (local.pickup_address || "") ||
    editDropoff       !== (local.dropoff_address || "") ||
    extrasChanged;

  const savedAddOns = lastPrices
    ? (lastPrices.transfer_price || 0) + (lastPrices.cover_price || 0) + (lastPrices.extras_total || 0)
    : (initialAddOns ?? 0);
  const liveAddOns  = livePrices?.total || 0;
  const addonsDelta = hasChanges ? liveAddOns - savedAddOns : 0;

  // Tour price delta from guest count change using server pricelist
  const pricelist = options.price_list || [];
  const plLookup  = (members) => {
    const e = pricelist.find((r) => Number(r.members_count) === Number(members));
    return e ? Number(e.price) : null;
  };
  const baseTourPrice = plLookup(local.members);
  const liveTourPrice = plLookup(editAdults + editKids);
  const tourPriceDelta = hasChanges && baseTourPrice !== null && liveTourPrice !== null
    ? liveTourPrice - baseTourPrice
    : 0;

  const priceDelta  = addonsDelta + tourPriceDelta;

  // estNewTotal: swap add-ons + tour portion
  const odooTotal   = (collect || 0) + (depositPaid || 0);
  const estNewTotal = lastPrices
    ? (lastPrices.tour_price || 0) + (lastPrices.boat_price || 0) + liveAddOns + tourPriceDelta
    : odooTotal - savedAddOns + liveAddOns + tourPriceDelta;

  return renderShell(
    <>
      {/* ── Save toast ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3 shadow-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
              <span className="text-sm font-semibold text-white">Changes saved successfully</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Manager contact popup (downgrade/remove blocked) ─────────────── */}
      <AnimatePresence>
        {managerPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 sm:pb-0"
            onClick={() => setManagerPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900">Contact our manager</h3>
                <p className="mt-2 text-sm text-secondary-500 leading-relaxed">
                  To remove or downgrade a service, please contact our manager directly — they&apos;ll help with refunds and adjustments.
                </p>
                <div className="mt-6 flex w-full flex-col gap-3">
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-600 transition">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a href="mailto:info@bluuu.tours"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3.5 text-sm font-bold text-secondary-700 hover:bg-neutral-200 transition">
                    <Mail className="h-4 w-4" />
                    Email us
                  </a>
                </div>
                <button onClick={() => setManagerPopup(false)}
                  className="mt-4 text-sm text-secondary-400 hover:text-secondary-600 transition">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back ────────────────────────────────────────────────────────── */}
      <a href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-secondary-400 transition hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </a>

      {/* ── Hero (full width) ───────────────────────────────────────────── */}
      <div className="relative mb-6 overflow-hidden rounded-3xl shadow-xl">
        {local.tour_image ? (
          <img src={local.tour_image} alt={local.tour_name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />

        <div className="relative px-6 pb-10 pt-28 sm:px-8 sm:pt-36">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              My Booking
            </span>
            <span className="font-mono text-xs text-white/40">{odoo.order_number}</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {local.tour_name}
            {(local.boat_name || odoo.boat_name) && (
              <span className="font-light"> &ldquo;{local.boat_name || odoo.boat_name}&rdquo;</span>
            )}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <HeroChip icon={CalendarDays}>{fmtDate(local.travel_date)}</HeroChip>
            <HeroChip icon={Users}>{local.members} {local.members === 1 ? "guest" : "guests"}</HeroChip>
            {(local.route_name || odoo.route) && (
              <HeroChip icon={Navigation2}>{local.route_name || odoo.route}</HeroChip>
            )}
          </div>
        </div>
      </div>

      {/* ── Check-in card ────────────────────────────────────────────────── */}
      {!odoo.online_checked_in && !hasChanges && (hoursUntilTour === null || hoursUntilTour > 0) && (
        <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg"
          style={{background: "linear-gradient(135deg, #0b2d4e 0%, #1565c0 55%, #00796b 100%)"}}>
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -left-8 -top-8 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl" />

          {checkinCountdown ? (
            /* Countdown: icon+text left, days/timer right */
            <div className="relative flex items-center gap-4 px-6 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-white">Online Check-in</div>
                <div className="mt-0.5 text-xs text-white/50">Opens 24 hours before your tour</div>
              </div>
              {checkinCountdown.d > 0 ? (
                /* Many days left */
                <div className="shrink-0 text-right">
                  <div className="text-4xl font-extrabold tabular-nums text-white leading-none">{checkinCountdown.d}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mt-1">days</div>
                </div>
              ) : (
                /* Final 24 h — live hh:mm:ss tiles */
                <div className="flex shrink-0 items-center gap-1.5">
                  {[
                    { v: checkinCountdown.h, l: "hh" },
                    { v: checkinCountdown.m, l: "mm" },
                    { v: checkinCountdown.s, l: "ss" },
                  ].map(({ v, l }, i) => (
                    <div key={l} className="flex items-center gap-1.5">
                      {i > 0 && <span className="mb-4 text-base font-light text-white/30">:</span>}
                      <div className="flex flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                          <span className="text-lg font-extrabold tabular-nums text-white">{String(v).padStart(2, "0")}</span>
                        </div>
                        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/35">{l}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Check-in open: icon + description + CTA */
            <div className="relative flex items-center gap-4 px-6 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-white">Online Check-in</div>
                <div className="mt-0.5 text-xs text-white/50">Fill in passenger details to speed up boarding</div>
              </div>
              <a
                href={`/checkin/${odooId}`}
                className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0b2d4e] shadow-md transition hover:bg-white/90 active:scale-[0.98]"
              >
                Start →
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Two-column grid (lg+) ───────────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">

      {/* ── LEFT column ─────────────────────────────────────────────────── */}
      <div className="min-w-0">

      {/* ── Payment success ──────────────────────────────────────────────── */}
      {justPaid && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <div className="text-sm font-bold text-emerald-700">Payment received — thank you!</div>
            <div className="mt-0.5 text-xs text-emerald-600">Your booking has been updated.</div>
          </div>
        </div>
      )}

      {/* ── Save success ─────────────────────────────────────────────────── */}
      {justSaved && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <div className="text-sm font-bold text-emerald-700">Booking updated!</div>
            <div className="mt-0.5 text-xs text-emerald-600">Your changes have been saved.</div>
          </div>
        </div>
      )}

      {/* ── Your Booking ────────────────────────────────────────────────── */}
      <div className="mb-5 rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-neutral-100 px-6 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Map className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-bold text-secondary-900">Booking Details</span>
        </div>

        {/* Lock notice — time-based */}
        {allEditLocked && (
          <div className="mx-4 mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Changes are closed 24 hours before the tour. Please contact us if you need help.
          </div>
        )}

        {/* Lock notice — source-based (date & guests only) */}
        {!sourceIsOurs && !allEditLocked && (
          <div className="mx-4 mt-3 rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs text-secondary-500">
            Date and guest count changes are managed by our team for this booking. Contact us if you need adjustments.
          </div>
        )}

        {/* Date + Guests — single combined block */}
        <EditableRow
          icon={CalendarDays}
          label="Travel date & Guests"
          value={`${fmtDate(editDate)} · ${guestSummary}`}
          isEditing={editingField === "schedule"}
          disabled={dateEditLocked}
          onEdit={() => toggleEdit("schedule")}
          doneDisabled={dateOrGuestsChanged && (!availChecked || availResult === false)}
        >
          <div className="space-y-4">
            <DateField
              value={editDate} onChange={setEditDate}
              open={openPanel === "date"}
              onToggle={() => setOpenPanel((p) => (p === "date" ? null : "date"))}
              onClose={() => setOpenPanel(null)}
            />
            <GuestsInline adults={editAdults} kids={editKids} onAdultsChange={setEditAdults} onKidsChange={setEditKids} capacity={local.boat_capacity || null} />
            {dateOrGuestsChanged && (
              <div className="flex items-center gap-1.5">
                {availChecking ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-secondary-300 border-t-secondary-700" />
                    <span className="text-xs text-secondary-400">Checking availability…</span>
                  </>
                ) : availChecked ? (
                  availResult ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />Available — you&apos;re good to go!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" />Not available for {editMembers} guests on this date
                    </span>
                  )
                ) : null}
              </div>
            )}
          </div>
        </EditableRow>

        {/* Tour + Boat — read-only row */}
        {(local.tour_name || local.boat_name || odoo.boat_name) && (
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-secondary-500">
              <Map className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-secondary-900">
                {local.tour_name}
                {(local.boat_name || odoo.boat_name) && (
                  <span className="font-normal text-secondary-500"> &ldquo;{local.boat_name || odoo.boat_name}&rdquo;</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Route — shown for all tour types; Edit only for private */}
        {(local.route_name || odoo.route) && (
          <>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3.5",
              !showTourDetails ? "border-b border-neutral-100" : "border-b border-transparent"
            )}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-secondary-500">
                <Navigation2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-secondary-400">Route</div>
                <div className="text-sm font-semibold text-secondary-900">{local.route_name || odoo.route}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {scheduleItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTourDetails((v) => !v)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border transition",
                      showTourDetails
                        ? "border-primary-300 bg-primary-50 text-primary-600"
                        : "border-neutral-200 bg-white text-secondary-400 hover:border-primary-300 hover:text-primary-600"
                    )}
                  >
                    {showTourDetails ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </button>
                )}
                {local.is_private && !allEditLocked && (
                  <button
                    type="button"
                    onClick={() => setShowRouteContactModal(true)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-secondary-500 transition hover:border-primary-300 hover:text-primary-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Schedule panel — expands below the route row */}
            <AnimatePresence>
              {showTourDetails && scheduleItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden border-b border-neutral-100"
                >
                  <div className="px-4 py-2">
                    <div className="divide-y divide-neutral-100">
                      {scheduleItems.map((item, i) => (
                        <ScheduleItemCompact key={i} item={item} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}


        {/* Transfer */}
        <EditableRow icon={Car} label="Transfer" value={transferSummary}
          isEditing={editingField === "transfer"} onEdit={() => toggleEdit("transfer")}
          disabled={allEditLocked}>
          <TransfersCompact
            transfers={options.transfers || []}
            selectedTransferId={editTransfer}
            onSelectTransferId={handleTransferChange}
            pickupAddress={editPickup}
            setPickupAddress={setEditPickup}
            dropoffAddress={editDropoff}
            setDropoffAddress={setEditDropoff}
            totalGuests={editMembers}
            showHeader={false}
          />
        </EditableRow>

        {/* Insurance */}
        <EditableRow icon={ShieldCheck} label="Insurance" value={coverSummary}
          isEditing={editingField === "cover"} onEdit={() => toggleEdit("cover")}
          disabled={allEditLocked}>
          <CoversCompact
            covers={options.covers || []}
            selectedCoverId={editCover}
            onSelectCoverId={handleCoverChange}
            priceLabel={local.is_private ? "per group" : "per person"}
            formatPrice={(v) => `IDR ${fmt(Number(v))}`}
            showHeader={false}
            framed
          />
        </EditableRow>

        {/* Extras (private only) */}
        {local.is_private && (
          <div id="extras-section">
          <EditableRow icon={Sparkles} label="Extras" value={extrasSummary}
            isEditing={editingField === "extras"} onEdit={() => toggleEdit("extras")}
            disabled={allEditLocked}>
            {(() => {
              const cats = catalogCategories.length > 0 ? catalogCategories : [];
              const activeCatId = extrasActiveCat ?? cats[0]?.id ?? null;
              const activeItems = activeCatId
                ? (cats.find((c) => c.id === activeCatId)?.extras || [])
                : catalogExtrasFlat;
              return (
                <>
                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {cats.length > 1 && (
                      <div className="relative rounded-t-xl">
                        <button
                          type="button"
                          onClick={() => extrasCatsScrollRef.current?.scrollBy({ left: -150, behavior: "smooth" })}
                          className="pointer-events-auto absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-white to-transparent"
                        >
                          <ChevronLeft className="h-4 w-4 text-secondary-400" />
                        </button>
                        <div ref={extrasCatsScrollRef} className="flex items-center gap-x-5 overflow-x-auto border-b border-neutral-200 px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {cats.map((cat) => (
                            <button key={cat.id} type="button" onClick={() => setExtrasActiveCat(cat.id)}
                              className={cn(
                                "-mb-px shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-semibold transition",
                                activeCatId === cat.id
                                  ? "border-primary-600 text-primary-600"
                                  : "border-transparent text-secondary-500 hover:text-secondary-700"
                              )}>
                              {cat.name}
                              <span className="ml-1.5 text-xs font-normal opacity-60">{cat.extras.length}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => extrasCatsScrollRef.current?.scrollBy({ left: 150, behavior: "smooth" })}
                          className="pointer-events-auto absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-white to-transparent"
                        >
                          <ChevronRight className="h-4 w-4 text-secondary-400" />
                        </button>
                      </div>
                    )}
                    <div className="divide-y divide-neutral-100 max-h-[420px] overflow-y-auto">
                      {activeItems.map((item) => (
                        <ExtraRow key={item.id} item={item} members={editMembers}
                          isSelected={!!editExtras[item.id]} qty={editExtras[item.id]?.qty || 0}
                          onToggle={() => toggleAutoExtra(item)}
                          onChangeQty={(v) => setExtraQty(item, v)}
                          editExtras={editExtras}
                          onChildQty={(child, v) => setExtraQty(child, v)}
                          locked={allEditLocked}
                          savedQty={savedExtrasMap[item.id] || 0}
                          savedExtrasMap={savedExtrasMap}
                        />
                      ))}
                      {activeItems.length === 0 && <p className="px-4 py-6 text-center text-sm text-secondary-400">No extras in this category.</p>}
                    </div>
                  </div>
                  {lockedExtras.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-secondary-400">From your previous route selection:</p>
                      <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                        {lockedExtras.map((item) => {
                          const isAuto = item.qty_type && item.qty_type !== "manual";
                          const autoQty = isAuto ? computeAutoQty(item.qty_type, editMembers) : null;
                          const effectiveQty = isAuto ? autoQty : item.qty;
                          return (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                              {item.image && <img src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-secondary-400">{item.name}</div>
                                <div className="mt-0.5 text-xs text-secondary-300">
                                  IDR {fmt((effectiveQty || 1) * item.price)}
                                  {isAuto && autoQty && <span className="ml-1">{autoQtyLabel(item.qty_type, autoQty)}</span>}
                                </div>
                              </div>
                              <button type="button" onClick={() => setExtraQty(item, 0)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-secondary-400 transition-colors hover:border-red-300 hover:text-red-500">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </EditableRow>
          </div>
        )}

        {saveBlocked && (
          <div className="border-t border-neutral-100 px-6 py-3">
            <span className="text-xs text-secondary-400">Check availability before saving.</span>
          </div>
        )}

      </div>

      {/* ── Extras upsell banner (private only, hidden when extras editor is open) */}
      {local.is_private && editingField !== "extras" && (() => {
        const upsellItems = [];
        for (const cat of catalogCategories) {
          for (const e of (cat.extras || [])) {
            const children = e.children || [];
            if (children.length > 0) {
              for (const child of children) {
                if (!editExtras[child.id]) upsellItems.push(child);
              }
            } else if (!editExtras[e.id]) {
              upsellItems.push(e);
            }
          }
        }
        if (upsellItems.length === 0) return null;
        const thumbs = upsellItems.filter((i) => i.image).slice(0, 4);
        return (
          <button
            type="button"
            onClick={() => {
              toggleEdit("extras");
              setTimeout(() => {
                document.getElementById("extras-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 50);
            }}
            className="mb-5 w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.99]"
          >
            <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-900 via-secondary-800 to-primary-900 px-5 py-5 shadow-lg">
              {/* Background glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-500/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 left-10 h-24 w-24 rounded-full bg-primary-400/10 blur-xl" />

              {/* Icon */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              {/* Text */}
              <div className="relative min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">Optional add-ons</div>
                <div className="mt-0.5 text-base font-extrabold text-white">
                  Enhance your experience
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {thumbs.length > 0 && (
                    <div className="flex -space-x-2">
                      {thumbs.map((item) => (
                        <div key={item.id} className="h-5 w-5 overflow-hidden rounded-full border border-white/30 bg-white/10">
                          <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-white/60">
                    {upsellItems.length} item{upsellItems.length !== 1 ? "s" : ""} available
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-white" />
              </div>
            </div>
          </button>
        );
      })()}


      {/* ── Upgrade banner (shared only) ─────────────────────────────────── */}
      {!local.is_private && options.upgrade_tour && !allEditLocked && sourceIsOurs && (() => {
        const up = options.upgrade_tour;
        const tierLabels = { "Premium Shared": "Premium", "First Class Shared": "First Class" };
        const tierLabel  = tierLabels[up.odoo_type] || up.name;
        const cd = upgradeCheckData;
        return (
          <div className="mb-5 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-amber-900">Upgrade to {tierLabel}</div>
                  <div className="mt-0.5 text-xs text-amber-700">
                    {!upgradeChecked
                      ? "More comfort, better experience"
                      : cd?.available
                        ? `${(cd.available_seats > 10 ? "10+" : cd.available_seats)} seats available on your date`
                        : "Not available on your date"}
                  </div>
                  {upgradeChecked && cd?.available && cd.boat_name && (
                    <div className="mt-0.5 text-xs text-amber-700">
                      Boat: <span className="font-semibold">&ldquo;{cd.boat_name}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price difference badge */}
              {upgradeChecked && cd?.available && cd.price_diff > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3">
                  <div className="flex-1 text-xs text-amber-700">Extra to pay for upgrade</div>
                  <div className="text-base font-extrabold text-amber-900">+IDR {fmt(cd.price_diff)}</div>
                </div>
              )}

              {upgradeCheckError && <p className="mt-2 text-xs text-red-500">{upgradeCheckError}</p>}
              {!upgradeChecked ? (
                <button
                  type="button"
                  onClick={checkUpgradeLive}
                  disabled={upgradeChecking}
                  className="mt-3 w-full rounded-full border border-amber-400 bg-white py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-[0.98] disabled:opacity-60"
                >
                  {upgradeChecking ? "Checking…" : "Check availability →"}
                </button>
              ) : cd?.available ? (
                <button
                  type="button"
                  onClick={() => { setUpgradeContactTier(tierLabel); setShowUpgradeContactModal(true); }}
                  className="mt-3 w-full rounded-full bg-amber-500 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[0.98]"
                >
                  {cd.price_diff > 0
                    ? `Upgrade · +IDR ${fmt(cd.price_diff)} →`
                    : `Upgrade to ${tierLabel} →`}
                </button>
              ) : null}
            </div>
          </div>
        );
      })()}

      {/* ── What's included ─────────────────────────────────────────────── */}
      {(tourIncluded.length > 0 || tourIncludes.length > 0) && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold text-secondary-900">What&apos;s included</span>
          </div>
          <div className="space-y-4 px-5 py-5">
            {tourIncluded.length > 0 && (
              <div className={cn(
                "grid gap-3",
                tourIncluded.length <= 2 ? "grid-cols-2" :
                tourIncluded.length === 3 ? "grid-cols-3" :
                "grid-cols-2 sm:grid-cols-4"
              )}>
                {tourIncluded.map((item) => (
                  <div key={item.name} className="flex flex-col items-center rounded-2xl border border-primary-200/50 bg-primary-50/50 px-3 py-4 text-center">
                    {item.icon_svg && (
                      <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                        <span className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: item.icon_svg }} />
                      </div>
                    )}
                    <div className="text-sm font-semibold text-secondary-900">{item.name}</div>
                    {item.description && <div className="mt-0.5 text-xs leading-normal text-secondary-500">{item.description}</div>}
                  </div>
                ))}
              </div>
            )}
            {tourIncludes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tourIncludes.map((item) => (
                  <span key={item.name} className="inline-flex items-center gap-1.5 rounded-full border border-primary-200/50 bg-primary-50/50 px-3 py-1.5 text-sm font-medium text-secondary-700">
                    {item.icon_svg && (
                      <span className="h-4 w-4 shrink-0 text-primary-600 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: item.icon_svg }} />
                    )}
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      </div>{/* end LEFT column */}

      {/* ── RIGHT column (sticky on lg) ─────────────────────────────────── */}
      <div className="min-w-0 lg:sticky lg:top-24 lg:mt-0 mt-5">

      {/* ── Pricing + Pay ────────────────────────────────────────────────── */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* Breakdown */}
        <div className="px-5 py-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-secondary-500 uppercase tracking-wide">Pricing</span>
          </div>
          <div className="space-y-1.5">
            {/* Detailed breakdown when available (after save in session) */}
            {lastPrices ? (
              <>
                <PriceRow label="Tour" value={`IDR ${fmt(lastPrices.tour_price)}`} />
                {lastPrices.boat_price > 0 && <PriceRow label="Boat" value={`IDR ${fmt(lastPrices.boat_price)}`} />}
                {lastPrices.transfer_price > 0 && <PriceRow label="Transfer" value={`IDR ${fmt(lastPrices.transfer_price)}`} />}
                {lastPrices.cover_price > 0 && <PriceRow label="Insurance" value={`IDR ${fmt(lastPrices.cover_price)}`} />}
                {lastPrices.extras_total > 0 && <PriceRow label="Extras" value={`IDR ${fmt(lastPrices.extras_total)}`} />}
              </>
            ) : null}

            {/* Always show totals */}
            <div className={cn("flex items-center justify-between", lastPrices ? "border-t border-neutral-100 pt-2.5" : "")}>
              <span className="text-sm font-bold text-secondary-900">Total</span>
              <span className={cn("text-sm font-extrabold", hasChanges && priceDelta !== 0 ? "text-secondary-300 line-through" : "text-secondary-900")}>
                IDR {fmt(lastPrices ? lastPrices.full_price : odooTotal)}
              </span>
            </div>
            {depositPaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-400">Deposit paid</span>
                <span className="text-sm font-semibold text-emerald-600">− IDR {fmt(depositPaid)}</span>
              </div>
            )}
            {collect > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-primary-50 px-3 py-2.5">
                <span className="text-sm font-semibold text-primary-700">Remaining balance</span>
                <span className="text-sm font-extrabold text-primary-700">IDR {fmt(collect)}</span>
              </div>
            )}
            {collect === 0 && depositPaid > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                <span className="text-sm font-semibold text-emerald-700">Fully paid</span>
                <span className="text-sm font-extrabold text-emerald-600">✓</span>
              </div>
            )}
          </div>

          {/* Price delta — shown when unsaved changes affect price */}
          {hasChanges && priceDelta !== 0 && (
            <div className={cn(
              "mt-3 rounded-xl border px-4 py-3",
              priceDelta > 0 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
            )}>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-semibold", priceDelta > 0 ? "text-amber-600" : "text-emerald-600")}>
                  {priceDelta > 0 ? "Extra to pay" : "Price decrease"}
                </span>
                <span className={cn("text-base font-extrabold", priceDelta > 0 ? "text-amber-700" : "text-emerald-700")}>
                  {priceDelta > 0 ? "+" : "−"} IDR {fmt(Math.abs(priceDelta))}
                </span>
              </div>
              <div className={cn("mt-1 text-[11px]", priceDelta > 0 ? "text-amber-500" : "text-emerald-500")}>
                {priceDelta > 0
                  ? `New total: IDR ${fmt(estNewTotal)}`
                  : "Refund will be processed through Odoo"}
              </div>
            </div>
          )}
        </div>

        {/* Payment footer */}
        {hasChanges && !allEditLocked ? (
          <div className="border-t border-amber-200 bg-gradient-to-br from-amber-500 to-orange-500 px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-white/80">
              <span className="text-xs font-bold uppercase tracking-widest">Unsaved changes</span>
            </div>

            {/* Price delta hint */}
            {priceDelta !== 0 && (
              <div className={cn(
                "mb-3 rounded-xl px-4 py-3",
                priceDelta > 0 ? "bg-white/15" : "bg-white/10"
              )}>
                {priceDelta > 0 ? (
                  <>
                    <div className="text-xs font-semibold text-white/70">Additional payment required</div>
                    <div className="mt-0.5 text-base font-extrabold text-white">+IDR {fmt(priceDelta)}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-white/70">Price difference</div>
                    <div className="mt-0.5 text-base font-extrabold text-white">−IDR {fmt(Math.abs(priceDelta))}</div>
                    <div className="mt-1 text-[11px] text-white/60">Refund will be processed through Odoo</div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetChanges}
                disabled={saving}
                className="flex-1 rounded-full border border-white/30 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-40"
              >
                Reset
              </button>
              <button
                onClick={saveAll}
                disabled={saving || saveBlocked}
                className="btn-pay-now flex-[2] rounded-full bg-white py-3 text-sm font-bold text-amber-700 shadow-sm transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes →"}
              </button>
            </div>
            {saveBlocked && <p className="mt-2 text-center text-xs text-white/70">Check availability first</p>}
            {saveError  && <p className="mt-2 text-center text-xs text-white/70">{saveError}</p>}
          </div>
        ) : collect === 0 ? (
          <>
            <div className="flex items-center gap-3 border-t border-emerald-100 bg-emerald-50 px-5 py-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <div className="text-sm font-bold text-emerald-700">Fully paid — you&apos;re all set!</div>
                {depositPaid > 0 && <div className="mt-0.5 text-xs text-emerald-600">Paid: IDR {fmt(depositPaid)}</div>}
              </div>
            </div>
            {saved && (
              <div className="flex items-center justify-center gap-1.5 border-t border-neutral-100 px-5 py-3 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Changes saved
              </div>
            )}
          </>
        ) : (
          <div className="border-t border-neutral-100 bg-gradient-to-br from-primary-700 to-primary-500 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Remaining balance</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-white">IDR {fmt(collect)}</div>
                {depositPaid > 0 && (
                  <div className="mt-0.5 text-xs text-white/50">Deposit paid: IDR {fmt(depositPaid)}</div>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </div>
            {saved && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/70">
                <CheckCircle2 className="h-3.5 w-3.5" /> Changes saved
              </div>
            )}
            <button
              onClick={payCollect}
              disabled={paying}
              className="btn-pay-now mt-3 w-full rounded-full bg-white py-3 text-sm font-bold text-primary-700 transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
            >
              {paying ? "Redirecting…" : `Pay IDR ${fmt(collect)} →`}
            </button>
          </div>
        )}
      </div>

      </div>{/* end RIGHT column */}
      </div>{/* end grid */}

      {/* ── Shared tour edit: contact-support modal ─────────────────────────── */}
      <AnimatePresence>
        {showSharedEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSharedEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-4 bottom-0 z-[101] mx-auto max-w-sm overflow-hidden rounded-t-3xl bg-white pb-safe-bottom sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <span className="text-sm font-bold text-secondary-900">Update Booking</span>
                <button type="button" onClick={() => setShowSharedEditModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-secondary-500 hover:bg-neutral-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-secondary-900">Changes require our team</h3>
                <p className="mt-1.5 text-sm text-secondary-500">
                  Shared tour bookings are updated by our team. Send us your changes and we&apos;ll confirm them as soon as possible.
                </p>
                {/* Summary of changes */}
                <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-xs text-secondary-500 space-y-1">
                  <div className="font-semibold text-secondary-700 mb-1">Your requested changes:</div>
                  {editDate !== (local.travel_date || "") && (
                    <div>📅 Date: {fmtDate(local.travel_date)} → <span className="font-semibold text-secondary-900">{fmtDate(editDate)}</span></div>
                  )}
                  {(editAdults !== (local.adults || 0) || editKids !== (local.kids || 0)) && (
                    <div>👥 Guests: {local.adults}a{local.kids > 0 ? ` ${local.kids}k` : ""} → <span className="font-semibold text-secondary-900">{editAdults}a{editKids > 0 ? ` ${editKids}k` : ""}</span></div>
                  )}
                </div>
                <div className="mt-5 space-y-3">
                  <a
                    href={waLink}
                    target="_blank" rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp us
                  </a>
                  <a
                    href={`mailto:info@bluuu.tours?subject=Booking update ${odoo.order_number || odooId}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    <Mail className="h-4 w-4" />
                    Email us
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Upgrade: contact-support modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showUpgradeContactModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowUpgradeContactModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-4 bottom-0 z-[101] mx-auto max-w-sm overflow-hidden rounded-t-3xl bg-white pb-safe-bottom sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <span className="text-sm font-bold text-secondary-900">Upgrade to {upgradeContactTier}</span>
                <button type="button" onClick={() => setShowUpgradeContactModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-secondary-500 hover:bg-neutral-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-secondary-900">Want to upgrade your booking?</h3>
                <p className="mt-1.5 text-sm text-secondary-500">
                  Upgrades are processed by our team. Contact us and we&apos;ll take care of it for you right away.
                </p>
                <div className="mt-5 space-y-3">
                  <a
                    href={waLink}
                    target="_blank" rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp us
                  </a>
                  <a
                    href={`mailto:info@bluuu.tours?subject=Upgrade request ${odoo.order_number || odooId} to ${upgradeContactTier}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    <Mail className="h-4 w-4" />
                    Email us
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Route change: contact-support modal ─────────────────────────────── */}
      <AnimatePresence>
        {showRouteContactModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowRouteContactModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-4 bottom-0 z-[101] mx-auto max-w-sm overflow-hidden rounded-t-3xl bg-white pb-safe-bottom sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <span className="text-sm font-bold text-secondary-900">Change Route</span>
                <button type="button" onClick={() => setShowRouteContactModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-secondary-500 hover:bg-neutral-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Navigation2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-secondary-900">Want to change your route?</h3>
                <p className="mt-1.5 text-sm text-secondary-500">
                  Route changes require us to update your itinerary. Please contact our team — we&apos;ll take care of it for you.
                </p>
                <div className="mt-5 space-y-3">
                  <a
                    href={waLink}
                    target="_blank" rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white transition hover:brightness-105 active:scale-[0.98]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp us
                  </a>
                  <a
                    href={`mailto:info@bluuu.tours?subject=Route change for ${odoo.order_number || odooId}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    <Mail className="h-4 w-4" />
                    Email us
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Booking-specific sticky WhatsApp (overrides global generic button) ─ */}
      <style>{`
        .wa-sticky-btn { display: none !important; }
        .wa-cabinet-btn { position:fixed;bottom:20px;right:20px;z-index:9000;display:flex;align-items:center;gap:8px;background:#25D366;color:#fff;border-radius:999px;padding:10px 18px 10px 14px;box-shadow:0 4px 18px #25d36673;text-decoration:none;font-size:14px;font-weight:600;line-height:1; }
        .wa-cabinet-btn:hover { filter: brightness(1.07); }
        @media (max-width:639px) { .wa-cabinet-btn { padding:12px; } .wa-cabinet-label { display:none; } }
      `}</style>
      <a href={waLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="wa-cabinet-btn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="wa-cabinet-label">
          {odoo.order_number ? `Help · ${odoo.order_number}` : "Chat with us"}
        </span>
      </a>
    </>
  );
}
