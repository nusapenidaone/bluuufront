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
function StepperRow({ value, onChange, min = 0 }) {
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
        className="flex h-9 w-9 items-center justify-center rounded-r-full text-secondary-500 transition hover:bg-neutral-50"
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
function ExtraRow({ item, members, isSelected, qty, onToggle, onChangeQty, editExtras, onChildQty }) {
  const isAuto = item.qty_type && item.qty_type !== "manual";
  const autoQty = isAuto ? computeAutoQty(item.qty_type, members) : null;
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
          {hasChildren ? (
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
                <button type="button" onClick={onToggle}
                  className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition hover:text-primary-600">
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
              <button type="button" onClick={() => onChangeQty(qty - 1)}
                className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition hover:text-primary-600">
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
                  {childIsAuto ? (
                    childQty > 0 ? (
                      <div className="inline-flex h-8 items-center rounded-full border border-neutral-200 bg-white px-2 shadow-sm">
                        <button type="button" onClick={() => onChildQty(child, 0)}
                          className="grid h-6 w-6 place-items-center rounded-full text-secondary-700 transition hover:text-primary-600">
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
                      <button type="button" onClick={() => onChildQty(child, childQty - 1)}
                        className="grid h-6 w-6 place-items-center rounded-full text-secondary-700 transition hover:text-primary-600">
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
function EditableRow({ icon: Icon, label, value, isEditing, onEdit, doneDisabled, children }) {
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
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-secondary-600 transition hover:border-secondary-400 hover:text-secondary-900"
          >
            Edit
          </button>
        )}
      </div>
      {isEditing && (
        <div className="border-t border-neutral-50 px-4 pb-5 pt-4">
          {children}
          <button
            type="button"
            onClick={onEdit}
            disabled={doneDisabled}
            className="mt-4 rounded-full bg-secondary-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-secondary-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// ─── GuestsInline: inline stepper (no popup) ─────────────────────────────────
function GuestsInline({ adults, kids, onAdultsChange, onKidsChange }) {
  return (
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

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lastPrices, setLastPrices] = useState(null);
  const [paying, setPaying] = useState(false);

  // Active category tab in the extras panel
  const [extrasActiveCat, setExtrasActiveCat] = useState(null);
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
      setEditTransfer(json.local.transfer_id ? Number(json.local.transfer_id) : null);
      setEditCover(json.local.cover_id ? Number(json.local.cover_id) : null);
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
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [odooId, uniqueKey]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Reset availability check whenever date or guest count changes
  useEffect(() => {
    setAvailChecked(false);
    setAvailResult(null);
  }, [editDate, editAdults, editKids]);

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
    setEditExtras((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = { id: item.id, name: item.name, price: item.price, qty, qty_type: item.qty_type || "manual", image: item.image || null };
      }
      return next;
    });
  };

  const toggleAutoExtra = (item) => {
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

  const editMembers = editAdults + editKids;

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
        await fetchOrder();
      } else {
        setSaveError(json.error || "Could not update the order");
      }
    } catch {
      setSaveError("Could not update the order");
    } finally {
      setSaving(false);
    }
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
      <main className="container max-w-2xl flex-1 py-8 sm:py-12">{content}</main>
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
  const waNumber = contacts?.whatsapp?.number || WA.google;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi Bluuu! I have a question about my booking ${odoo.order_number || odooId}.`)}`;
  const depositPaid = odoo.deposit_paid || 0;

  // Display summaries for each editable field
  const transferOpt = (options.transfers || []).find((t) => Number(t.id) === Number(editTransfer));
  const coverOpt    = (options.covers || []).find((c) => Number(c.id) === Number(editCover));
  const extrasCount = Object.keys(editExtras).length;

  const guestSummary = `${editAdults} adult${editAdults !== 1 ? "s" : ""}${editKids > 0 ? `, ${editKids} kid${editKids !== 1 ? "s" : ""}` : ""}`;
  const transferSummary = editTransfer
    ? [(transferOpt?.name || "Transfer"), editPickup && `from ${editPickup}`].filter(Boolean).join(" • ")
    : "No transfer";
  const coverSummary = editCover ? (coverOpt?.name || "Insurance") : "None";
  const extrasSummary = extrasCount > 0 ? `${extrasCount} item${extrasCount !== 1 ? "s" : ""} selected` : "None";
  const routeSummary = selectedRoute?.title || local.route_name || "—";

  const hasChanges =
    editDate          !== (local.travel_date || "") ||
    editAdults        !== (local.adults || 0) ||
    editKids          !== (local.kids || 0) ||
    editTransfer      !== (local.transfer_id ? Number(local.transfer_id) : null) ||
    editCover         !== (local.cover_id ? Number(local.cover_id) : null) ||
    editPickup        !== (local.pickup_address || "") ||
    editDropoff       !== (local.dropoff_address || "") ||
    extrasCount       !== (local.extras || []).length;

  return renderShell(
    <>
      {/* ── Back ────────────────────────────────────────────────────────── */}
      <a href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-secondary-400 transition hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </a>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
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
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{local.tour_name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <HeroChip icon={CalendarDays}>{fmtDate(local.travel_date)}</HeroChip>
            {(local.boat_name || odoo.boat_name) && (
              <HeroChip icon={Anchor}>{local.boat_name || odoo.boat_name}</HeroChip>
            )}
            <HeroChip icon={Users}>{local.members} {local.members === 1 ? "guest" : "guests"}</HeroChip>
            {(local.route_name || odoo.route) && (
              <HeroChip icon={Navigation2}>{local.route_name || odoo.route}</HeroChip>
            )}
          </div>
        </div>
      </div>

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
        <div className="border-b border-neutral-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-secondary-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Map className="h-3.5 w-3.5" />
            </span>
            Your Booking
          </h2>
          <p className="mt-0.5 text-xs text-secondary-400">Tap "Edit" to change a field. All changes save together.</p>
        </div>

        {/* Date + Guests — single combined block */}
        <EditableRow
          icon={CalendarDays}
          label="Travel date & Guests"
          value={`${fmtDate(editDate)} · ${guestSummary}`}
          isEditing={editingField === "schedule"}
          onEdit={() => toggleEdit("schedule")}
          doneDisabled={dateOrGuestsChanged && (!availChecked || availResult === false)}
        >
          <div className="space-y-5">
            <div>
              <div className={fieldLabel}>Travel date</div>
              <DateField
                value={editDate} onChange={setEditDate}
                open={openPanel === "date"}
                onToggle={() => setOpenPanel((p) => (p === "date" ? null : "date"))}
                onClose={() => setOpenPanel(null)}
              />
            </div>
            <div>
              <div className={fieldLabel}>Guests</div>
              <GuestsInline adults={editAdults} kids={editKids} onAdultsChange={setEditAdults} onKidsChange={setEditKids} />
            </div>
            {/* Availability check — inside the block, appears when date or guests changed */}
            {dateOrGuestsChanged && (
              <div>
                {!availChecked ? (
                  <button type="button" onClick={checkAvailability}
                    disabled={!editDate || editMembers <= 0 || availChecking}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary-700 disabled:opacity-50">
                    {availChecking
                      ? <><div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />Checking…</>
                      : <><CalendarDays className="h-3 w-3" />Check availability</>}
                  </button>
                ) : availResult ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />Available — you&apos;re good to go!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />Not available for {editMembers} guests on this date
                  </span>
                )}
              </div>
            )}
          </div>
        </EditableRow>

        {/* Boat (read-only — not changeable in cabinet) */}
        {(local.boat_name || odoo.boat_name) && (
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-secondary-500">
              <Anchor className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-secondary-400">Boat</div>
              <div className="mt-0.5 text-sm font-semibold text-secondary-900">{local.boat_name || odoo.boat_name}</div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary-300">Fixed</span>
          </div>
        )}


        {/* Transfer */}
        <EditableRow icon={Car} label="Transfer" value={transferSummary}
          isEditing={editingField === "transfer"} onEdit={() => toggleEdit("transfer")}>
          <TransfersCompact
            transfers={options.transfers || []}
            selectedTransferId={editTransfer}
            onSelectTransferId={(v) => setEditTransfer(v ? Number(v) : null)}
            pickupAddress={editPickup}
            setPickupAddress={setEditPickup}
            dropoffAddress={editDropoff}
            setDropoffAddress={setEditDropoff}
            totalGuests={editMembers}
            defaultExpanded
          />
        </EditableRow>

        {/* Insurance */}
        <EditableRow icon={ShieldCheck} label="Insurance" value={coverSummary}
          isEditing={editingField === "cover"} onEdit={() => toggleEdit("cover")}>
          <CoversCompact
            covers={options.covers || []}
            selectedCoverId={editCover}
            onSelectCoverId={(v) => setEditCover(v ? Number(v) : null)}
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
            isEditing={editingField === "extras"} onEdit={() => toggleEdit("extras")}>
            {(() => {
              const cats = catalogCategories.length > 0 ? catalogCategories : [];
              const activeCatId = extrasActiveCat ?? cats[0]?.id ?? null;
              const activeItems = activeCatId
                ? (cats.find((c) => c.id === activeCatId)?.extras || [])
                : catalogExtrasFlat;
              return (
                <>
                  <div className="rounded-xl border border-neutral-200 bg-white">
                    {cats.length > 1 && (
                      <div className="relative overflow-hidden rounded-t-xl">
                      <div className="flex items-center gap-x-5 overflow-x-auto border-b border-neutral-200 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />
                      </div>
                    )}
                    <div className="divide-y divide-neutral-100">
                      {activeItems.map((item) => (
                        <ExtraRow key={item.id} item={item} members={editMembers}
                          isSelected={!!editExtras[item.id]} qty={editExtras[item.id]?.qty || 0}
                          onToggle={() => toggleAutoExtra(item)}
                          onChangeQty={(v) => setExtraQty(item, v)}
                          editExtras={editExtras}
                          onChildQty={(child, v) => setExtraQty(child, v)}
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

        {/* Save footer — visible only when something changed */}
        {hasChanges && (() => {
          const savedAddOns = (lastPrices?.transfer_price || 0) + (lastPrices?.cover_price || 0) + (lastPrices?.extras_total || 0);
          const liveAddOns  = livePrices?.total || 0;
          const delta       = liveAddOns - savedAddOns;
          const newTotal    = (lastPrices?.tour_price || 0) + (lastPrices?.boat_price || 0) + liveAddOns;
          const isUp        = delta > 0;
          const isDown      = delta < 0;
          return (
          <div className="border-t border-neutral-100 px-6 py-4">
            {/* Price delta */}
            {lastPrices && delta !== 0 && (
              <div className={cn(
                "mb-4 rounded-xl p-4",
                isUp ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-[11px] font-bold uppercase tracking-wider", isUp ? "text-amber-500" : "text-emerald-500")}>
                      Price change
                    </p>
                    <p className={cn("mt-0.5 text-2xl font-extrabold tracking-tight", isUp ? "text-amber-700" : "text-emerald-700")}>
                      {isUp ? "+" : "−"} IDR {fmt(Math.abs(delta))}
                    </p>
                  </div>
                  <div className={cn("rounded-xl px-3 py-2 text-right", isUp ? "bg-amber-100" : "bg-emerald-100")}>
                    <p className={cn("text-[10px] font-semibold uppercase tracking-wide", isUp ? "text-amber-500" : "text-emerald-500")}>New total</p>
                    <p className={cn("text-sm font-extrabold", isUp ? "text-amber-800" : "text-emerald-800")}>IDR {fmt(newTotal)}</p>
                  </div>
                </div>
                {/* Breakdown */}
                <div className="mt-3 space-y-1 border-t border-black/5 pt-3">
                  {livePrices.transferPrice > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-secondary-500">Transfer</span><span className="font-semibold text-secondary-700">IDR {fmt(livePrices.transferPrice)}</span></div>
                  )}
                  {livePrices.coverPrice > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-secondary-500">Insurance</span><span className="font-semibold text-secondary-700">IDR {fmt(livePrices.coverPrice)}</span></div>
                  )}
                  {livePrices.extrasTotal > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-secondary-500">Extras</span><span className="font-semibold text-secondary-700">IDR {fmt(livePrices.extrasTotal)}</span></div>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Button onClick={saveAll} disabled={saving || saveBlocked}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />Updated!
                </span>
              )}
              {saveError && <span className="text-sm font-semibold text-red-500">{saveError}</span>}
            </div>
            {saveBlocked && (
              <p className="mt-2 text-xs text-secondary-400">Please check availability before saving.</p>
            )}
          </div>
          );
        })()}
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
          {lastPrices ? (
            <div className="space-y-1.5">
              <PriceRow label="Tour" value={`IDR ${fmt(lastPrices.tour_price)}`} />
              {lastPrices.boat_price > 0 && <PriceRow label="Boat" value={`IDR ${fmt(lastPrices.boat_price)}`} />}
              {lastPrices.transfer_price > 0 && <PriceRow label="Transfer" value={`IDR ${fmt(lastPrices.transfer_price)}`} />}
              {lastPrices.cover_price > 0 && <PriceRow label="Insurance" value={`IDR ${fmt(lastPrices.cover_price)}`} />}
              {lastPrices.extras_total > 0 && <PriceRow label="Extras" value={`IDR ${fmt(lastPrices.extras_total)}`} />}
              {depositPaid > 0 && <PriceRow label="Deposit paid" value={`IDR ${fmt(depositPaid)}`} />}
              <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5">
                <span className="text-base font-bold text-secondary-900">Total</span>
                <span className="text-base font-extrabold text-secondary-900">IDR {fmt(lastPrices.full_price)}</span>
              </div>
            </div>
          ) : depositPaid > 0 && (
            <PriceRow label="Deposit paid" value={`IDR ${fmt(depositPaid)}`} />
          )}
        </div>

        {/* Payment footer */}
        {collect === 0 ? (
          <div className="flex items-center gap-3 border-t border-emerald-100 bg-emerald-50 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <div className="text-sm font-bold text-emerald-700">Fully paid — you&apos;re all set!</div>
              {depositPaid > 0 && <div className="mt-0.5 text-xs text-emerald-600">Paid: IDR {fmt(depositPaid)}</div>}
            </div>
          </div>
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
            {hasChanges ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
                <Info className="h-4 w-4 shrink-0 text-white/70" />
                <p className="text-sm font-semibold text-white/80">Save your changes above before paying.</p>
              </div>
            ) : (
              <button
                onClick={payCollect}
                disabled={paying}
                className="mt-4 w-full rounded-full bg-white py-3 text-sm font-bold text-primary-700 transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
              >
                {paying ? "Redirecting…" : "Pay now →"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
        <p className="mb-4 text-sm font-semibold text-secondary-700">Need help with your booking?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white transition hover:brightness-105 active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 py-3 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-100 active:scale-[0.98]"
          >
            <Mail className="h-4 w-4" />
            Send email
          </a>
        </div>
      </div>
    </>
  );
}
