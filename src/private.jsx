import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "./components/common/Modal";
import { getBoatFeatures } from "./utils/boatFeatures";
import {
  TRANSFER_DETAILS_FALLBACK_IMAGE,
  INSURANCE_DETAILS_FALLBACK_IMAGE,
  decodeBasicEntities,
  sanitizeDisplayText,
  getRestaurantDisplayName,
  getRestaurantDisplayDescription,
  getLunchDisplayData,
  getOptionDescription,
  getOptionImage,
  buildOptionDetails,
  getBoatLength,
} from "./utils/displayUtils";
import { useCurrency } from "./CurrencyContext";
import { useTours } from "./ToursContext";
import { useExtras } from "./contexts/ExtrasContext";
import { useRules } from "./contexts/RulesContext";
import { fetchRestaurant, fetchRestaurants } from "./api/extras";
import { apiUrl } from "./api/base";
import { buildTourAnalyticsItem, getGaClientId, trackAddToCart, trackPixelViewContent } from "./lib/analytics";
import { CoversCompact } from "./components/booking/TransferCoverPanels";
import InfoDetailModal from "./components/booking/InfoDetailModal";
import {
  formatIDR,
  formatIDRShort,
  formatUSD,
  formatYachtPrice,
  formatShortDate,
  formatRangeShort,
  isDateAvailableForBoat,
  getAvailableDatesForRange,
  useImagePreload,
  setGlobalFormatPrice,
  calculateBoatPrice,
  useBoatPricing,
  usePricing
} from "./components/booking/utils";


function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden flex flex-col sm:min-h-470">
      {/* Image area */}
      <div className="relative h-250 shrink-0 overflow-hidden bg-neutral-100">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.3 }}
        />
        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`rounded-full bg-white/60 transition-all ${i === 0 ? "w-4 h-1.5" : "w-1.5 h-1.5"}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
        {/* Radio dot + title */}
        <div className="flex items-center gap-2 min-h-9">
          <div className="h-4 w-4 rounded-full bg-neutral-100 shrink-0" />
          <div className="h-5 w-2/5 rounded-lg bg-neutral-100 animate-pulse" />
        </div>
        {/* Description 2 lines */}
        <div className="space-y-1.5 min-h-10">
          <div className="h-3.5 w-full rounded-lg bg-neutral-100 animate-pulse" />
          <div className="h-3.5 w-4/5 rounded-lg bg-neutral-100 animate-pulse" />
        </div>
        {/* Schedule link */}
        <div className="h-4 w-24 rounded-lg bg-neutral-100 animate-pulse" />
        {/* Chips */}
        <div className="flex min-h-3.75 flex-wrap content-start gap-x-3 gap-y-2">
          <div className="h-6 w-28 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-6 w-28 rounded-full bg-neutral-100 animate-pulse" />
        </div>
        {/* Recommendation */}
        <div className="h-3.5 w-3/5 rounded-lg bg-neutral-100 animate-pulse" />
        {/* Button */}
        <div className="mt-auto pt-2">
          <div className="h-10 w-full rounded-xl bg-neutral-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBoatCard() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-100 bg-white overflow-hidden">
      <div className="aspect-video bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/5 rounded-lg bg-neutral-100" />
        <div className="h-4 w-3/5 rounded-lg bg-neutral-100" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-xl bg-neutral-100" />
          <div className="h-5 w-20 rounded-xl bg-neutral-100" />
        </div>
        <div className="h-10 w-full rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}

const CurrencyBridge = () => {
  const { formatPrice } = useCurrency();
  setGlobalFormatPrice(formatPrice); // Synchronous update to avoid stale prices during first render
  return null;
};
import {
  Anchor,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  SlidersHorizontal,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  CreditCard,
  CloudRain,
  Coffee,
  ExternalLink,
  Fish,
  Globe,
  Info,
  Instagram,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Play,
  Plus,
  Shield,
  ShieldCheck,
  Ship,
  Search,
  Sparkles,
  Star,
  Sun,
  Ticket,
  UtensilsCrossed,
  Users,
  Wine,
  Waves,
  X,
  Maximize,
  Youtube,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Ruler,
} from "lucide-react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import PhotoCarousel from "./components/common/PhotoCarousel";

const ICON_MAP = {
  MapPin,
  Fish,
  Clock,
  LifeBuoy,
  UtensilsCrossed,
  Camera,
  Shield,
  Waves,
  Anchor,
  Sun,
  BadgeCheck,
  Ship,
  Coffee,
  Ticket,
  Users,
  Wine,
  Globe,
  Star,
  Search,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Calendar,
  ArrowRight,
  Car,
  MessageCircle,
};
import { brand as brandData, tourInfo, links as LINKS, trustIncludedShort as TRUST_INCLUDED_SHORT, infoDrawerTabs as INFO_DRAWER_TABS, sections as SECTIONS, bookingMiniFAQ as bookingMiniFAQData } from "./data/private.json";
const REVIEW_SOURCES = [];
const INFO_REVIEWS = [];
// Shared Components
import CustomDatePicker from "./components/common/CustomDatePicker";
import PhoneInput from "./components/common/PhoneInput";
import PolicyModal, { usePolicyModal } from "./components/common/PolicyModal";
import ExtraPopup from "./components/booking/ExtraPopup";
import RestaurantModal from "./components/tour/RestaurantModal";
import ScheduleModal from "./components/tour/ScheduleModal";
import RestaurantCard from "./components/tour/RestaurantCard";
import TourDetailsCard from "./components/tour/TourDetailsCard";
import ScheduleItemCompact from "./components/tour/ScheduleItemCompact";
import Button from "./components/common/Button";
import Card from "./components/common/Card";
import Section from "./components/common/Section";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import Accordion from "./components/common/Accordion";
import { cn } from "./lib/utils";
import { useSiteContacts } from "./hooks/useSiteContacts";
import { useSEO } from "./hooks/useSEO";
import Footer from "./components/common/Footer";
import {
  REVIEW_SOURCE_ICON_MAP,
  SECTION_BACKGROUNDS,
} from "./components/booking/constants";

const PRIVATE_ICON_MAP = { Star, MapPin, BadgeCheck, LifeBuoy };
const BRAND = {
  ...brandData,
  badges: brandData.badges.map((b) => ({ ...b, icon: PRIVATE_ICON_MAP[b.icon] })),
};
const GUEST_FEE_IDR = 350000;
const MAX_GUESTS = 13;
const GROUP_TRANSFER_THRESHOLD = 4;
const REVIEW_COUNT_VALUE = parseInt(String(BRAND.reviewCount).replace(/[^0-9]/g, ""), 10) || 0;
const REVIEW_COUNT_SHORT = REVIEW_COUNT_VALUE ? `${Math.floor(REVIEW_COUNT_VALUE / 500) * 500}+` : BRAND.reviewCount;
// --- Qoves-inspired Premium Components & Theme ---



const Q_THEME = {
  colors: {
    bg: "#f8fafc", // gray-50
    surface: "#FFFFFF",
    surfaceSoft: "#f8fafc", // gray-50
    text: "#0f172a", // gray-900
    textSubtle: "#64748b", // gray-500
    textLighter: "#94a3b8", // gray-400
    accent: "#045cff", // Blue Ribbon 600
    accentDark: "#0a4deb", // Blue Ribbon 700
    border: "#e2e8f0", // gray-200
    borderLight: "#f1f5f9", // gray-100
  },
  text: {
    h1: "md:text-6xl text-4xl font-bold tracking-tight text-slate-900 leading-tight md:leading-tight",
    h2: "text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl",
    h3: "text-xl font-bold tracking-tight text-secondary-900 sm:text-2xl",
    body: "mt-3 max-w-2xl mx-auto text-lg leading-relaxed text-secondary-600",
    caption: "text-sm text-slate-500 font-medium",
    label: "text-xs font-black uppercase tracking-widest text-primary-600",
  },
  container: "container", // Wider container
  section: "py-20 md:py-32", // More vertical space
  card: {
    base: "bg-white rounded-xl border border-slate-100 transition-all duration-300",
    hover: "hover:border-blue-100",
  },
};


function PremiumSection({
  id,
  className,
  backgroundClassName = "bg-transparent",
  centered = false,
  children,
  ...props
}) {
  return (
    <section
      id={id}
      className={cn("py-6 md:py-16 lg:py-24", backgroundClassName, centered && "text-center", className)}
      {...props}
    >
      {children}
    </section>
  );
}

function PremiumContainer({ className, children, ...props }) {
  return (
    <div className={cn("container", className)} {...props}>
      {children}
    </div>
  );
}

function PremiumCard({ className, children, variant = "default", ...props }) {
  const variants = {
    default: "bg-white rounded-xl border border-neutral-200 transition-all duration-300",
    hover: "bg-white rounded-xl border border-neutral-200 transition-all duration-300 hover:border-primary-100",
    glass: "bg-white/80 backdrop-blur-md border border-white/20 rounded-xl",
    premium: "bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/80 rounded-xl",
    "qoves-featured": "bg-gradient-to-br from-primary-950 to-primary-900 text-white border border-white/10 rounded-xl backdrop-blur-sm relative overflow-hidden",
    plain: "transition-all duration-300",
  };

  const baseClass = variants[variant] || variants.default;

  return (
    <div className={cn(baseClass, className)} {...props}>
      {children}
    </div>
  );
}

// Lightweight sanity checks (non-blocking)
try {
  console.assert(new Set(SECTIONS.map((s) => s.id)).size === SECTIONS.length, "SECTIONS ids must be unique");
  console.assert(!!BRAND?.name && !!BRAND?.product, "BRAND.name and BRAND.product must be set");
  console.assert(parseInt(String(BRAND.reviewCount).replace(/[^0-9]/g, ""), 10) > 0, "reviewCount should be numeric-ish");
  console.assert(
    Array.isArray(BRAND.badges) && BRAND.badges.every((b) => b && b.icon && b.label),
    "BRAND.badges must include icon + label"
  );
} catch (_) { }
const INPUT_BASE =
  "h-11 w-full rounded-full border border-neutral-200 bg-white text-base text-secondary-900 shadow-none outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

function Pill({ icon: Icon, children, className, iconClassName }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm text-secondary-600",
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 text-secondary-500", iconClassName)} />
      {children}
    </span>
  );
}
function PartnerRequestModal({ isOpen, onClose, tourId, tourName, date, adults, kids, rangeStart, rangeEnd, dateMode, programId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [pickedDate, setPickedDate] = useState("");

  const needsDatePick = dateMode === "flex" && rangeStart && rangeEnd && !date;
  const effectiveDate = date || pickedDate;

  const rangeDates = useMemo(() => {
    if (!needsDatePick) return [];
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
    const dates = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }, [needsDatePick, rangeStart, rangeEnd]);

  const totalGuests = adults + kids;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveDate) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("order/private"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId,
          travelDate: effectiveDate,
          adults,
          kids,
          children: 0,
          members: totalGuests,
          cars: 0,
          boatPrice: 0,
          tourPrice: 0,
          programPrice: 0,
          transferPrice: 0,
          coverPrice: 0,
          extrasTotal: 0,
          deposite: 0,
          discount: 0,
          totalPrice: 0,
          discountPrice: 0,
          fullPrice: 0,
          selectedTransferId: null,
          selectedCoverId: null,
          selectedProgramId: programId ?? null,
          selectedRestaurantId: null,
          selectedExtras: [],
          method: 0,
          status_id: 4,
          name,
          email,
          whatsapp: phone,
          requests: null,
          ga_client_id: getGaClientId(),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setName("");
    setEmail("");
    setPhone("");
    setPickedDate("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send request" subTitle={tourName} maxWidth="max-w-md">
      {success ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Check className="h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <div className="text-lg font-bold text-secondary-900">Request sent!</div>
            <div className="mt-1 text-sm text-secondary-500">We'll contact you within 1–2 hours to confirm.</div>
          </div>
          <Button onClick={handleClose} className="mt-2 w-full rounded-full">Close</Button>
        </div>
      ) : needsDatePick && !pickedDate ? (
        <div className="flex flex-col gap-4">
          <div className="text-sm font-semibold text-secondary-600">Pick a date</div>
          <div className="grid grid-cols-5 gap-2">
            {rangeDates.map((d) => {
              const parsed = new Date(`${d}T00:00:00`);
              const monthLabel = parsed.toLocaleString("en-US", { month: "short" });
              const dayLabel = String(parsed.getDate());
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setPickedDate(d)}
                  className="flex min-h-58 flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white px-2 py-1 text-secondary-600 transition-all duration-200 hover:border-primary-200 hover:bg-neutral-100 hover:text-primary-700"
                >
                  <span className="text-xs leading-tight font-semibold uppercase tracking-wide text-secondary-400">{monthLabel}</span>
                  <span className="mt-0.5 text-xl font-extrabold leading-none text-secondary-900">{dayLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-secondary-600">
            <div className="flex justify-between">
              <span>Tour</span>
              <span className="font-semibold text-secondary-900">{tourName}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Date</span>
              <span className="font-semibold text-secondary-900">{effectiveDate}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Guests</span>
              <span className="font-semibold text-secondary-900">
                {adults} adult{adults !== 1 ? "s" : ""}
                {kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}
              </span>
            </div>
          </div>

          {needsDatePick && pickedDate ? (
            <button
              type="button"
              onClick={() => setPickedDate("")}
              className="self-start text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
            >
              Change date
            </button>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-secondary-600">Full name</span>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={cn(INPUT_BASE, "pl-10 pr-3")}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-secondary-600">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={cn(INPUT_BASE, "pl-10 pr-3")}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-secondary-600">Phone / WhatsApp</span>
            <PhoneInput value={phone} onChange={setPhone} />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-full h-12 text-sm font-black"
          >
            {submitting ? "Sending…" : <><span>Send request</span><ArrowRight className="h-4 w-4" /></>}
          </Button>
          <div className="text-center text-sm text-secondary-500">We'll respond within 1–2 hours</div>
        </form>
      )}
    </Modal>
  );
}

function BookingCard({ compact = false, selectedYacht, cartItems, extrasTotalUSD, selectedVibe, onOpenTourInfo }) {
  const todayISO = useMemo(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }, []);
  const [date, setDate] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("date") || todayISO;
  });
  const pricing = usePricing(date);
  const remainingSeats = selectedYacht?.priceValue ? null : pricing.remainingSeats;
  const maxGuests = Math.min(MAX_GUESTS, remainingSeats ?? MAX_GUESTS);
  const isSoldOut = remainingSeats !== null && remainingSeats <= 0;
  const [adults, setAdults] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const n = parseInt(p.get("adults") || "1", 10);
    return isNaN(n) || n < 1 ? 1 : n;
  });
  const [kids, setKids] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const n = parseInt(p.get("kids") || "0", 10);
    return isNaN(n) || n < 0 ? 0 : n;
  });
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  useEffect(() => {
    if (remainingSeats === null || maxGuests <= 0) return;
    if (adults > maxGuests) {
      setAdults(maxGuests);
      return;
    }
    if (adults + kids > maxGuests) {
      setKids(Math.max(0, maxGuests - adults));
    }
  }, [remainingSeats, maxGuests, adults, kids]);
  const maxAdults = Math.max(1, maxGuests);
  const maxKids = Math.max(0, maxGuests - adults);
  const kidOptions = useMemo(() => Array.from({ length: maxKids + 1 }, (_, i) => i), [maxKids]);
  const adultOptions = useMemo(() => Array.from({ length: maxAdults }, (_, i) => i + 1), [maxAdults]);
  const price = useMemo(() => {
    if (selectedYacht?.priceValue) {
      return selectedYacht.priceValue;
    }
    const base = pricing.price ?? 35;
    const totalGuests = adults + kids;
    const mult = totalGuests >= 4 ? 0.95 : 1;
    return Math.round(base * totalGuests * mult);
  }, [adults, kids, pricing.price, selectedYacht]);
  const totalGuests = adults + kids;
  const perGuest = Math.round(price / Math.max(totalGuests, 1));
  const hasGroupTransfer = !selectedYacht?.priceValue && totalGuests >= GROUP_TRANSFER_THRESHOLD;
  const overCapacity = remainingSeats !== null && totalGuests > remainingSeats;
  const reserveDisabled = isSoldOut || overCapacity;
  const priceLabel = "/ person";
  const priceDisplay = selectedYacht?.priceValue ? formatIDR(perGuest) : formatUSD(perGuest);
  const contacts = useSiteContacts();
  const safeCartItems = cartItems ?? [];
  const extrasTotal = Math.round(extrasTotalUSD ?? 0);
  const onReserve = () => {
    if (reserveDisabled) return;
    if (selectedYacht?.isPartner) {
      setPartnerModalOpen(true);
      return;
    }
    const analyticsCurrency = selectedYacht?.priceValue ? "IDR" : "USD";
    const analyticsTotal = price + extrasTotal;
    trackAddToCart({
      value: analyticsTotal,
      currency: analyticsCurrency,
      items: [
        buildTourAnalyticsItem({
          itemId: selectedYacht?.tourId ?? selectedYacht?.id,
          itemName: selectedYacht?.name || "Private Tour",
          itemCategory: "Private Tour",
          price: analyticsTotal,
          currency: analyticsCurrency,
        }),
      ],
    });
    const params = new URLSearchParams({ date, adults: String(adults), kids: String(kids) });
    params.set("tourId", String(selectedYacht?.tourId ?? selectedYacht?.id ?? ""));
    params.set("tourName", selectedYacht?.name || "Private Tour");
    params.set("tourCategory", "Private Tour");
    params.set("analyticsCurrency", analyticsCurrency);
    params.set("analyticsTotal", String(analyticsTotal));
    if (safeCartItems.length) {
      params.set(
        "extras",
        JSON.stringify(
          safeCartItems.map((item) => ({
            id: item.id,
            title: item.title,
            priceUSD: item.priceUSD,
            selection: item.selection ?? undefined,
            quantity: item.quantity ?? 1,
          }))
        )
      );
    }
    const backParams = new URLSearchParams(window.location.search);
    backParams.set("date", date);
    backParams.set("adults", String(adults));
    backParams.set("kids", String(kids));
    if (selectedYacht?.tourId) backParams.set("tour", String(selectedYacht.tourId));
    history.replaceState(null, "", `?${backParams.toString()}`);
    window.location.href = `/new/checkout?${params.toString()}`;
  };
  return (
    <Card className={cn("relative overflow-hidden", compact ? "p-4" : "p-5")}>
      <div className="relative">
        <div className="flex items-end justify-between gap-4">
          <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Per person</div>
          <div className="text-right">
            <div className="flex items-end justify-end gap-2">
              <div className="text-lg font-semibold text-secondary-900">{priceDisplay}</div>
              <div className="pb-1 text-sm text-secondary-600">{priceLabel}</div>
            </div>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-secondary-500">
          <span>Allinclusive (taxes, tickets, lunch)</span>
          <a
            href="#social"
            className="inline-flex items-center gap-1 font-semibold text-secondary-600 hover:text-secondary-900"
          >
            <Star className="h-4 w-4 text-primary-600" fill="currentColor" />
            {BRAND.rating}  {BRAND.reviewCount} {BRAND.reviewLabel}
          </a>
        </div>
        <div className="mt-2 text-sm font-semibold text-secondary-600">
          Lounge checkin + premium boat + La Rossa lunch + pro photographer
        </div>
        {selectedYacht?.name ? (
          <div className="mt-1 text-sm text-secondary-500">Selected yacht: {selectedYacht.name}</div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-secondary-600">
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-1">
            <Users className="h-3.5 w-3.5 text-secondary-500" /> Small group (max 13)
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-1">
            {selectedYacht?.isPartner ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
            )}
            {selectedYacht?.isPartner ? "On Request" : "Instant confirmation"}
          </span>
        </div>
        <div className={cn("mt-4 grid gap-3", compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-secondary-600">Date</span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="date"
                value={date}
                min={todayISO}
                onChange={(e) => setDate(e.target.value)}
                className={cn(INPUT_BASE, "pl-10 pr-3")}
              />
            </div>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-secondary-600">Adults</span>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <select
                value={adults}
                onChange={(e) => {
                  const nextAdults = parseInt(e.target.value, 10);
                  setAdults(nextAdults);
                  setKids((prev) => Math.min(prev, Math.max(0, maxGuests - nextAdults)));
                }}
                className={cn(INPUT_BASE, "appearance-none pl-10 pr-10")}
              >
                {adultOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            </div>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-secondary-600">Kids (7+)</span>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <select
                value={kids}
                onChange={(e) => setKids(parseInt(e.target.value, 10))}
                className={cn(INPUT_BASE, "appearance-none pl-10 pr-10")}
              >
                {kidOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            </div>
          </label>
        </div>
        {!compact ? (
          <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
            <Clock className="h-3.5 w-3.5" />
            Popular date  limited seats
          </div>
        ) : null}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-100 p-3 text-sm text-secondary-600">
          <div className="flex items-center justify-between">
            <span className="normal-case">
              {selectedYacht?.priceValue
                ? "total for boat"
                : `total for ${totalGuests} guest${totalGuests > 1 ? "s" : ""}`}
            </span>
            <span className="font-semibold text-secondary-900">
              {selectedYacht?.priceValue ? formatYachtPrice(selectedYacht) : formatUSD(pricing.price ?? 35)}
            </span>
          </div>
          {selectedVibe ? (
            <div className="mt-2 text-sm text-secondary-500">
              Vibe: <span className="font-medium text-secondary-600">{selectedVibe.popupTitle ?? selectedVibe.title}</span>
            </div>
          ) : null}
          {extrasTotal > 0 ? (
            <>
              <div className="mt-2 flex items-center justify-between text-sm text-secondary-600">
                <span className="normal-case">extras total</span>
                <span className="font-semibold text-secondary-900">{formatUSD(extrasTotal)}</span>
              </div>
              <div className="mt-1 text-sm text-secondary-500">
                {safeCartItems.map((item) => item.title).join("  ")}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-secondary-600">
                <span className="normal-case">total with extras</span>
                <span className="font-semibold text-secondary-900">
                  {selectedYacht?.priceValue
                    ? `${formatYachtPrice(selectedYacht)} + ${formatUSD(extrasTotalUSD)}`
                    : formatUSD(price + (extrasTotalUSD ?? 0))}
                </span>
              </div>
            </>
          ) : null}
          <div className="mt-1 text-sm text-secondary-500">
            Adults: {adults}  Kids 7+: {kids}
          </div>
          {hasGroupTransfer ? (
            <div className="mt-1 text-sm font-semibold text-success">
              Free private transfer included for 4+ guests.
            </div>
          ) : null}
          {remainingSeats !== null ? (
            <div className="mt-1 text-sm text-secondary-500">Seats left for this date: {remainingSeats}</div>
          ) : null}
          {overCapacity ? (
            <div className="mt-1 text-sm font-semibold text-danger">
              Only {remainingSeats} seats left for this date.
            </div>
          ) : null}
          <div className="mt-1 text-sm text-secondary-500">All extras and pickup can be added at checkout.</div>
        </div>
        <div className="mt-4 grid gap-2">
          <Button
            onClick={onReserve}
            className={cn("w-full rounded-full h-12 text-sm font-black transition-all hover:scale-102 active:scale-98", reserveDisabled && "cursor-not-allowed opacity-60")}
            disabled={reserveDisabled}
          >
            Reserve now <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="text-center text-sm text-secondary-500">
            You'll see the full total before confirming.
          </div>
          <div className="relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
              <img src="https://bluuu.tours/storage/app/media/images/manager.webp" alt="Expert" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-primary-600 mb-0.5">Ask an Expert</div>
              <div className="text-xs text-secondary-500 mb-2">Our team is ready to help you plan the perfect trip.</div>
              <div className="flex flex-wrap gap-3">
                {contacts.phone?.link && (
                  <a href={contacts.phone.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-primary-500" />
                    {contacts.phone.number}
                  </a>
                )}
                {contacts.whatsapp?.link && (
                  <a href={contacts.whatsapp.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5 text-primary-500" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-full border border-neutral-200 bg-white/70 backdrop-blur-sm p-3 text-sm text-secondary-600">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-secondary-600" />
            <div>
              <span className="font-semibold text-secondary-900">Not sure about the date?</span> Reserve now and change your
              date anytime up to 24 hours before the tour.
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-secondary-600">
          <button type="button" onClick={() => onOpenTourInfo?.("cancellation")} className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors">
            <Shield className="h-3.5 w-3.5" /> Free cancellation 24h <ExternalLink className="h-3 w-3" />
          </button>
          <button type="button" onClick={() => onOpenTourInfo?.("weather")} className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors">
            <CloudRain className="h-3.5 w-3.5" /> Weather guarantee <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
      <PartnerRequestModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        tourId={selectedYacht?.tourId}
        tourName={selectedYacht?.name}
        date={date}
        adults={adults}
        kids={kids}
      />
    </Card>
  );
}
const MINI_FAQ_ICON_MAP = { BadgeCheck, Users, CloudRain, Clock, Sparkles, Waves };
function BookingMiniFAQ({ className }) {
  const items = bookingMiniFAQData.map((it) => ({ ...it, icon: MINI_FAQ_ICON_MAP[it.icon] }));
  return (
    <div className={cn("grid gap-3 sm:gap-4 sm:grid-cols-2", className)}>
      {items.map((it) => (
        <div key={it.q} className="flex items-start gap-2.5 sm:gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary-600 sm:h-8 sm:w-8 sm:rounded-full">
            <it.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-secondary-900">{it.q}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-secondary-600 sm:mt-1 sm:text-xs">
              {it.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroGallery({ images = [] }) {
  // If no images provided, render nothing or a fallback
  if (!images || images.length === 0) return null;

  // Create an array format expected by the gallery, defaulting labels
  const items = images.slice(0, 5).map((img, i) => ({
    label: `Gallery image ${i + 1}`,
    src:      typeof img === 'string' ? img : (img.thumb1 || img.original || ""),
    srcSmall: typeof img === 'string' ? null : (img.thumb1_small || null),
    srcLarge: typeof img === 'string' ? img : (img.thumb2 || img.thumb1 || img.original || ""),
    original: typeof img === 'string' ? img : (img.original || img.thumb2 || img.thumb1 || ""),
  })).filter(item => item.src);

  if (items.length === 0) return null;

  return (
    <>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:hidden">
        {items.map((it) => (
          <div
            key={it.label}
            className="relative min-w-82pct snap-start overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card"
          >
            <img
              src={it.src}
              srcSet={it.srcSmall ? `${it.srcSmall} 300w, ${it.src} 600w` : undefined}
              sizes="82vw"
              alt={it.label}
              loading="lazy"
              decoding="async"
              className="h-48 w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-secondary-900">
              {it.label}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-180">
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card sm:col-span-2 sm:row-span-2">
          <img
            src={items[0].srcLarge || items[0].src}
            srcSet={items[0].srcSmall ? `${items[0].srcSmall} 300w, ${items[0].src} 600w, ${items[0].srcLarge} 900w` : undefined}
            sizes="(max-width: 1024px) 100vw, 50vw"
            alt={items[0].label}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-secondary-900">
            {items[0].label}
          </div>
        </div>
        {items.slice(1).map((it) => (
          <div
            key={it.label}
            className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card"
          >
            <div className="h-full min-h-180 bg-neutral-50 lg:min-h-0">
              <img
                src={it.src}
                srcSet={it.srcSmall ? `${it.srcSmall} 300w, ${it.src} 600w` : undefined}
                sizes="(max-width: 1024px) 50vw, 25vw"
                alt={it.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-secondary-900">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function GalleryHeroGrid({ onOpenGallery }) {
  const trackRef = useRef(null);
  const stepRef = useRef(0);
  const measureStep = () => {
    const track = trackRef.current;
    if (!track) return 0;
    const card = track.querySelector("[data-vibe-card]");
    if (!card) return 0;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    const step = card.getBoundingClientRect().width + gap;
    stepRef.current = step;
    return step;
  };
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    // Initial measurement
    measureStep();
    const handleResize = () => measureStep();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const handlePrev = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = stepRef.current || measureStep();
    track.scrollBy({ left: -(step || 320), behavior: "smooth" });
  };
  const handleNext = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = stepRef.current || measureStep();
    track.scrollBy({ left: step || 320, behavior: "smooth" });
  };
  return (
    <div>
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
      >
        {vibes.map((vibe) => (
          <button
            key={vibe.id}
            data-vibe-card
            type="button"
            onClick={() => onOpenGallery(vibe.id)}
            className="group flex min-w-72pct snap-start flex-col overflow-hidden rounded-full border border-neutral-200 bg-white text-left shadow-none transition hover:border-neutral-300 sm:min-w-46pct lg:min-w-30pct"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <PhotoCarousel
                photos={vibe.gallery}
                alt={vibe.title}
                onOpenGallery={() => onOpenGallery(vibe.id)}
                className="aspect-4/3"
              />
              <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/70 backdrop-blur-sm px-2 py-0.5 text-sm font-semibold text-secondary-600 backdrop-blur">
                {vibe.id === "classic" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-2.5 w-2.5 text-success" />
                    Included
                  </span>
                ) : (
                  <span>{vibe.badge}</span>
                )}
              </div>
            </div>
            <div className="flex min-h-150 flex-1 flex-col p-4">
              <div className="mt-2 line-clamp-1 min-h-1.25 text-sm font-semibold text-secondary-900">
                {vibe.title}
              </div>
              <div className="mt-2 line-clamp-2 min-h-2.5 text-sm leading-5 text-secondary-600">
                {vibe.description}
              </div>
              <div className="mt-2 inline-flex min-h-1.25 items-center gap-1.5 text-sm text-secondary-500 whitespace-nowrap">
                <Sun className="h-3 w-3 text-secondary-400" />
                <span className="text-secondary-400">Afternoon stop:</span>
                <span className="font-semibold text-secondary-600">{vibe.afterLunch}</span>
              </div>
              <div className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-secondary-600 transition group-hover:text-secondary-900">
                {vibe.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 hidden items-center justify-end gap-2 sm:flex">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-transparent p-2 text-secondary-500 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-secondary-900"
          aria-label="Previous"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-transparent p-2 text-secondary-500 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-secondary-900"
          aria-label="Next"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
function GalleryBlock({ cartItems, onAddExtra, onRemoveExtra, onApplyVibe, onBackToTour, vibes = [] }) {
  const [activeVibeId, setActiveVibeId] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeExtra, setActiveExtra] = useState(null);
  const [activeExtraIndex, setActiveExtraIndex] = useState(0);
  const [activeExtraSelections, setActiveExtraSelections] = useState({});
  const [addToast, setAddToast] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const [allExtrasOpen, setAllExtrasOpen] = useState(false);
  const [extrasFilter, setExtrasFilter] = useState("all");
  const [extraQuantity, setExtraQuantity] = useState(1);
  const [extrasExpanded, setExtrasExpanded] = useState(false);
  const [extrasVisibleCount, setExtrasVisibleCount] = useState(3);
  useEffect(() => {
    // Reset "show all" when filter changes
    setExtrasShowAll(false);
  }, [extrasFilter]);
  const [returnToCatalog, setReturnToCatalog] = useState(false);
  const extrasCardRef = useRef(null);
  const activeVibe = useMemo(() => vibes.find((vibe) => vibe.id === activeVibeId), [activeVibeId, vibes]);
  const activeVibeIndex = useMemo(
    () => (activeVibeId ? vibes.findIndex((vibe) => vibe.id === activeVibeId) : -1),
    [activeVibeId, vibes]
  );
  const prevVibe =
    activeVibeIndex >= 0 ? vibes[(activeVibeIndex - 1 + vibes.length) % vibes.length] : null;
  const nextVibe = activeVibeIndex >= 0 ? vibes[(activeVibeIndex + 1) % vibes.length] : null;
  const { afternoonMain, afternoonNote } = useMemo(() => {
    if (!activeVibe?.popupAfternoon) return { afternoonMain: "", afternoonNote: "" };
    const [main, ...rest] = activeVibe.popupAfternoon.split(" (");
    return {
      afternoonMain: main.trim(),
      afternoonNote: rest.length ? `(${rest.join(" (")}`.trim() : "",
    };
  }, [activeVibe]);
  const visibleVibeExtras = useMemo(() => {
    if (!activeVibe) return [];
    return activeVibe.extras.slice(0, 3);
  }, [activeVibe]);
  const extrasCatalogInternal = useMemo(
    () =>
      vibes.flatMap((vibe) =>
        (vibe.extras || []).map((extra) => ({
          ...extra,
          category: vibe.id ?? "all",
          vibeId: vibe.id,
          vibeTitle: vibe.title,
        }))
      ),
    [vibes]
  );
  const formatCategoryLabel = useCallback((value) => {
    const raw = String(value || "").trim();
    if (!raw || raw === "all") return "All";
    return raw
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, []);
  const extrasFilterOptions = useMemo(() => {
    if (!activeVibe) return [{ id: "all", label: "All" }];
    const uniqueCategories = Array.from(
      new Set(
        extrasCatalogInternal
          .map((extra) => String(extra.category || "").trim())
          .filter(Boolean)
      )
    );
    return [
      { id: "all", label: "All" },
      ...uniqueCategories
        .filter((categoryId) => categoryId !== "all")
        .map((categoryId) => ({
          id: categoryId,
          label: formatCategoryLabel(categoryId),
        })),
    ];
  }, [activeVibe, extrasCatalogInternal, formatCategoryLabel]);
  const filteredExtras = useMemo(() => {
    if (!activeVibe) return [];
    return extrasCatalogInternal.filter((extra) => {
      if (extrasFilter !== "all" && extra.category !== extrasFilter) {
        return false;
      }
      return true;
    });
  }, [activeVibe, extrasFilter, extrasCatalogInternal]);
  useEffect(() => {
    if (!extrasFilterOptions.some((filter) => filter.id === extrasFilter)) {
      setExtrasFilter("all");
    }
  }, [extrasFilter, extrasFilterOptions]);
  const extrasCounts = useMemo(() => {
    if (!activeVibe) return {};
    return extrasFilterOptions.reduce((acc, filter) => {
      if (filter.id === "all") {
        acc[filter.id] = extrasCatalogInternal.length;
      } else {
        acc[filter.id] = extrasCatalogInternal.filter((extra) => extra.category === filter.id).length;
      }
      return acc;
    }, {});
  }, [activeVibe, extrasCatalogInternal, extrasFilterOptions]);
  const selectedExtrasTotal = useMemo(() => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((sum, item) => sum + (item.priceUSD || 0) * (item.quantity || 1), 0);
  }, [cartItems]);
  const selectedExtrasCount = useMemo(() => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);
  const getExtraQuantity = (id) => cartItems?.find((item) => item.id === id)?.quantity || 0;
  useEffect(() => {
    if (!addToast) return undefined;
    const timer = window.setTimeout(() => setAddToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [addToast]);
  useEffect(() => {
    if (!savedToast) return undefined;
    const timer = window.setTimeout(() => setSavedToast(false), 2400);
    return () => window.clearTimeout(timer);
  }, [savedToast]);
  const openVibe = (vibeId) => {
    setActiveVibeId(vibeId);
    setLightboxIndex(null);
    setAllExtrasOpen(false);
    setExtrasExpanded(false);
    setExtrasShowAll(false);
  };
  const openAllExtras = () => {
    setExtrasFilter("all");
    setAllExtrasOpen(true);
  };
  const handleContinue = () => {
    if (!activeVibe) return;
    onApplyVibe?.(activeVibe);
    setActiveVibeId(null);
    setExtrasExpanded(false);
    setLightboxIndex(null);
    window.setTimeout(() => {
      window.location.hash = "#booking";
      const target = document.getElementById("book");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };
  const handleBackToTour = () => {
    onApplyVibe?.(activeVibe);
    onBackToTour?.();
    setActiveVibeId(null);
    setExtrasExpanded(false);
    setLightboxIndex(null);
    setAllExtrasOpen(false);
    setActiveExtra(null);
    setSavedToast(true);
  };
  const handleSummaryClick = () => {
    setExtrasExpanded(true);
    window.setTimeout(() => {
      extrasCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  const handleDoneFromCatalog = () => {
    setAllExtrasOpen(false);
    handleSummaryClick();
  };
  const handleClearExtras = () => {
    if (!cartItems?.length) return;
    if (!window.confirm("Clear all extras?")) return;
    cartItems.forEach((item) => onRemoveExtra?.(item.id));
  };
  useEffect(() => {
    const handler = (event) => {
      const vibeId = event.detail?.vibeId;
      if (vibeId) {
        openVibe(vibeId);
      }
    };
    window.addEventListener("open-vibe-config", handler);
    return () => window.removeEventListener("open-vibe-config", handler);
  }, [openVibe]);
  const initExtraSelections = (extra) => {
    if (!extra?.optionGroups?.length) {
      setActiveExtraSelections({});
      return;
    }
    const defaults = extra.optionGroups.reduce((acc, group) => {
      acc[group.id] = group.options?.[0] ?? "";
      return acc;
    }, {});
    setActiveExtraSelections(defaults);
  };
  const openExtraDetails = (extra) => {
    setReturnToCatalog(allExtrasOpen);
    setActiveExtra(extra);
    setActiveExtraIndex(0);
    setExtraQuantity(1);
    initExtraSelections(extra);
    setAllExtrasOpen(false);
  };
  const getDefaultSelections = (extra) => {
    if (!extra?.optionGroups?.length) return undefined;
    return extra.optionGroups.reduce((acc, group) => {
      acc[group.id] = group.options?.[0] ?? "";
      return acc;
    }, {});
  };
  const handleCatalogAdd = (extra) => {
    const selection = getDefaultSelections(extra);
    onAddExtra?.({
      ...extra,
      selection,
      quantity: 1,
    });
    setAddToast({ title: extra.title });
  };
  const closeExtraDetails = () => {
    setActiveExtra(null);
    if (returnToCatalog) {
      setAllExtrasOpen(true);
      setReturnToCatalog(false);
    }
  };
  useEffect(() => {
    if (!extrasExpanded) {
      setExtrasShowAll(false);
    }
  }, [extrasExpanded, activeVibeId]);
  useEffect(() => {
    if (!activeVibe) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (activeExtra) {
          closeExtraDetails();
        } else if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else {
          setActiveVibeId(null);
        }
      }
      if (lightboxIndex !== null && event.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % activeVibe.photos.length);
      }
      if (lightboxIndex !== null && event.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + activeVibe.photos.length) % activeVibe.photos.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeVibe, lightboxIndex]);
  return (
    <PremiumSection id="step-5" className="bg-transparent">
      <div className="container">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-sm font-semibold uppercase tracking-wide-4xl text-secondary-600">Tour vibes</div>
                <div className="mt-3 text-2xl font-semibold text-secondary-900 sm:text-3xl">
                  See your day in different vibes
                </div>
                <div className="mt-2 text-sm leading-6 text-secondary-600 sm:text-base">
                  Same private tour - only the after-lunch plan changes.
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOpen(true)}
                  title="Boat, crew, snorkel stops, lunch  same day plan."
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-500 shadow-card transition hover:border-neutral-300 hover:text-secondary-600"
                >
                  What stays the same?
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3" />
            </div>
            <GalleryHeroGrid vibes={vibes} onOpenGallery={openVibe} />
            <div className="text-sm text-secondary-500">Book first  choose later via WhatsApp.</div>
          </div>
        </div>
      </div>
      <Modal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="What stays the same"
        subtitle="Boat, crew, snorkel stops, and lunch stay identical across vibes."
        maxWidth="max-w-3xl"
      >
        <ul className="space-y-2 text-base leading-7 text-secondary-600">
          <li>Boat stays the same.</li>
          <li>Crew stays the same.</li>
          <li>Snorkel stops stay the same.</li>
          <li>Lunch stays the same.</li>
        </ul>
        <div className="mt-3 text-base leading-7 text-secondary-600">Only the after-lunch plan changes.</div>
      </Modal>
      <Modal
        open={!!activeVibe}
        onClose={() => setActiveVibeId(null)}
        title={activeVibe?.popupTitle ?? "Tour vibe"}
        subtitle="Highlights, photos, and optional add-ons for this vibe."
        maxWidth="max-w-5xl"
        actions={
          prevVibe && nextVibe ? (
            <div className="hidden items-center gap-3 text-sm font-semibold text-secondary-400 sm:flex">
              <button
                type="button"
                onClick={() => openVibe(prevVibe.id)}
                className="inline-flex items-center gap-2 transition hover:text-secondary-900"
              >
                <ChevronLeft className="h-4 w-4 text-secondary-400" />
                {prevVibe.title}
              </button>
              <span className="h-1.5 w-1.5 rounded-full bg-secondary-300" />
              <button
                type="button"
                onClick={() => openVibe(nextVibe.id)}
                className="inline-flex items-center gap-2 transition hover:text-secondary-900"
              >
                {nextVibe.title}
                <ChevronRight className="h-4 w-4 text-secondary-400" />
              </button>
            </div>
          ) : null
        }
      >
        {activeVibe ? (
          <div>
            <div className="no-scrollbar max-h-70vh overflow-y-auto pr-1">
              <div className="px-4 py-3 pb-6 sm:px-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium leading-5 text-secondary-900 sm:text-base">
                      {activeVibe.popupSubtitle}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600">
                        <Sun className="h-3.5 w-3.5 text-secondary-600" />
                        <span>Afternoon plan: {afternoonMain}</span>
                        {afternoonNote ? <span className="text-secondary-400">{afternoonNote}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="h-px w-full bg-neutral-50" />
                  {!extrasExpanded ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold uppercase tracking-wide-xl text-secondary-500">
                          Real moments
                        </div>
                      </div>
                      <div className="relative mt-3">
                        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth [-webkit-overflow-scrolling:touch]">
                          {activeVibe.photos.map((photo, idx) => (
                            <button
                              key={photo?.thumb || photo?.path || photo}
                              type="button"
                              onClick={() => setLightboxIndex(idx)}
                              className="group relative aspect-4/3 w-70 shrink-0 snap-start overflow-hidden rounded-full bg-neutral-50 shadow-none ring-1 ring-neutral-200 transition duration-200 hover:ring-border-strong md:w-80 lg:w-90"
                            >
                              <img
                                src={photo?.thumb || photo?.path || photo}
                                srcSet={photo?.thumb_small ? `${photo.thumb_small} 200w, ${photo.thumb || photo?.path} 400w` : undefined}
                                sizes="280px"
                                alt={`${activeVibe.title} gallery ${idx + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-secondary-500 sm:text-sm">
                        <span className="sm:hidden">Swipe to explore.</span>
                        <span className="hidden sm:inline">Tap any photo to view larger.</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExtrasExpanded(false)}
                      className="flex w-full items-center justify-between rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-secondary-600 transition duration-200 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-border-strong"
                    >
                      <span>See gallery</span>
                      <ChevronUp className="h-4 w-4 text-secondary-400 transition duration-200" />
                    </button>
                  )}
                  <div className="rounded-xl bg-white" ref={extrasCardRef}>
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
                      <div className={cn("rounded-xl", extrasExpanded ? "bg-white" : "bg-transparent")}>
                        <button
                          type="button"
                          onClick={() => setExtrasExpanded((prev) => !prev)}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-secondary-900 outline-none transition-all duration-200 ease-out",
                            extrasExpanded
                              ? "rounded-full bg-white"
                              : "rounded-full bg-white/70 backdrop-blur-sm hover:bg-neutral-100 hover:border-neutral-300 border border-transparent focus-visible:ring-2 focus-visible:ring-border-strong"
                          )}
                          aria-expanded={extrasExpanded}
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-secondary-600" />
                            <span>Customize this vibe</span>
                            <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-sm font-semibold text-secondary-600">
                              Optional
                            </span>
                          </span>
                          <ChevronDown
                            className={cn("h-4 w-4 text-secondary-600 transition duration-200", extrasExpanded && "rotate-180")}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {extrasExpanded ? (
                            <motion.div
                              key="extras-panel"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4">
                                <div className="mt-2 text-sm text-secondary-500">
                                  Your tour is complete as-is. Extras can be added now or later via WhatsApp.
                                </div>
                              </div>
                              <div className="px-4 pb-4 pt-3">
                                <div className="mb-2 text-sm font-semibold uppercase tracking-wide-xl text-secondary-400">
                                  Top picks for this vibe
                                </div>
                                <div className="no-scrollbar max-h-520 overflow-y-auto rounded-xl bg-white shadow-card">
                                  <div className="divide-y divide-border-soft">
                                    {(extrasShowAll ? activeVibe.extras : visibleVibeExtras).map((extra) => (
                                      <div
                                        key={extra.id}
                                        className="grid grid-cols-body-layout items-center gap-4 px-4 py-3"
                                      >
                                        <div className="flex shrink-0">
                                          <img
                                            src={extra.image}
                                            srcSet={extra.image_small ? `${extra.image_small} 200w, ${extra.image} 400w` : undefined}
                                            sizes="72px"
                                            alt={extra.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-16 w-16 rounded-xl object-cover ring-1 ring-black/[0.05] md:h-18 md:w-18"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-base font-black leading-tight text-secondary-900 tracking-tight">
                                            {extra.title}
                                          </div>
                                          <div className="mt-0.5 line-clamp-1 text-sm font-medium text-secondary-500">
                                            {extra.description?.replace(/<[^>]*>/g, "")}
                                          </div>
                                          <div className="mt-1 text-sm font-black text-secondary-900">
                                            {formatPrice(extra)}
                                          </div>
                                        </div>
                                        <div className="flex shrink-0 items-center justify-end">
                                          {getExtraQuantity(extra.id) ? (
                                            <div className="flex flex-col items-end gap-1.5">
                                              <div className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
                                                {getExtraQuantity(extra.id) > 1 ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => onRemoveExtra?.(extra.id, { decrement: true })}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-50 text-primary-600 transition-all hover:bg-primary-50 active:scale-90"
                                                    aria-label="Decrease quantity"
                                                  >
                                                    <Minus className="h-3.5 w-3.5" />
                                                  </button>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => onRemoveExtra?.(extra.id)}
                                                    className="px-2.5 text-xs font-black uppercase tracking-wider text-secondary-500 transition hover:text-red-500"
                                                  >
                                                    Remove
                                                  </button>
                                                )}
                                                <span className="min-h-180 text-center text-sm font-black text-secondary-900 tabular-nums">
                                                  {getExtraQuantity(extra.id)}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => onAddExtra?.({ ...extra, quantity: 1 })}
                                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-50 text-primary-600 transition-all hover:bg-primary-50 active:scale-90"
                                                  aria-label="Increase quantity"
                                                >
                                                  <Plus className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => openExtraDetails(extra)}
                                              className="inline-flex h-9 w-110 items-center justify-center rounded-full bg-blue-50/80 px-4 text-xs font-black text-blue-600 transition-all hover:bg-blue-100 hover:scale-102 active:scale-95"
                                            >
                                              {extra.hasChildren ? `${extra.children.length} Options` : "Add"}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 px-4 pb-2 pt-1">
                                {activeVibe.extras.length > 3 ? (
                                  <button
                                    type="button"
                                    onClick={() => setExtrasShowAll((prev) => !prev)}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 transition duration-200 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
                                  >
                                    {extrasShowAll ? "See fewer extras" : "See more extras"}
                                    <ChevronDown
                                      className={`h-4 w-4 transition duration-200 ${extrasShowAll ? "rotate-180" : ""}`}
                                    />
                                  </button>
                                ) : null}
                                {activeVibe.extras.length > 3 && extrasShowAll ? (
                                  <button
                                    type="button"
                                    onClick={openAllExtras}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 transition duration-200 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
                                  >
                                    View all extras
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                ) : null}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                    {!extrasExpanded ? (
                      <div className="px-4">
                        <div className="mt-2 text-sm text-secondary-500">
                          Your tour is complete as-is. Extras can be added now or later via WhatsApp.
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white/90 backdrop-blur-md">
              <div className="flex flex-col gap-3 px-4 pb-3 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-secondary-600">
                    {selectedExtrasCount ? (
                      extrasExpanded ? (
                        <span>
                          {`Extras selected: ${selectedExtrasCount}  +${formatUSD(selectedExtrasTotal)}`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSummaryClick}
                          className="text-left transition hover:text-secondary-900"
                        >
                          {`Extras selected: ${selectedExtrasCount}  +${formatUSD(selectedExtrasTotal)}`}
                        </button>
                      )
                    ) : (
                      <span>No extras selected</span>
                    )}
                    <span className="text-secondary-300"></span>
                    <button
                      type="button"
                      onClick={handleBackToTour}
                      className="inline-flex items-center gap-1 text-secondary-500 transition hover:text-secondary-600"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back to tour
                    </button>
                  </div>
                  <div className="text-sm text-secondary-500">Extras stay saved.</div>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <Button type="button" onClick={handleContinue} size="sm" className="rounded-full">
                    {selectedExtrasCount ? "Continue to booking" : "Continue (extras optional)"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal
        open={!!activeVibe && allExtrasOpen}
        onClose={() => setAllExtrasOpen(false)}
        title="Add extras"
        subtitle="Customize the vibe with optional additions. Selections save automatically."
        maxWidth="max-w-5xl"
      >
        <div className="no-scrollbar max-h-70vh overflow-y-auto px-1">
          <div className="space-y-4">
            <div className="border-b border-neutral-200 pb-4">
              <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full bg-neutral-100 p-1 text-sm text-secondary-500">
                {extrasFilterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setExtrasFilter(filter.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-semibold transition duration-200 ease-out",
                      extrasFilter === filter.id
                        ? "bg-white text-primary-700"
                        : "text-secondary-500 hover:text-secondary-700"
                    )}
                  >
                    {filter.label}
                    <span className="text-sm text-secondary-500">{extrasCounts[filter.id] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
            {filteredExtras.length ? (
              <div className="mx-auto w-full rounded-xl border border-neutral-200 bg-white">
                <div className="divide-y divide-border">
                  {(extrasFilter === "all" && !extrasShowAll ? filteredExtras.slice(0, 5) : filteredExtras).map((extra) => (
                    <div key={extra.id} className="grid grid-cols-body-layout items-center gap-4 px-4 py-4">
                      <img
                        src={extra.image}
                        srcSet={extra.image_small ? `${extra.image_small} 200w, ${extra.image} 400w` : undefined}
                        sizes="56px"
                        alt={extra.title}
                        loading="lazy"
                        decoding="async"
                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-neutral-200"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium leading-tight text-secondary-900">
                          {extra.title}
                        </div>
                        <div className="mt-1 truncate text-sm text-secondary-500">{extra.description}</div>
                        <button
                          type="button"
                          onClick={() => openExtraDetails(extra)}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-secondary-500 transition hover:text-secondary-900"
                        >
                          Details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex min-w-32 flex-col items-end gap-2">
                        <div className="text-sm font-semibold text-secondary-900">{formatUSD(extra.priceUSD)}</div>
                        {getExtraQuantity(extra.id) ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2 py-1 text-sm font-semibold text-secondary-600">
                            <span className="rounded-full bg-neutral-50 px-2 py-0.5 text-secondary-600">
                              Added
                            </span>
                            <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-1 py-0.5">
                              {getExtraQuantity(extra.id) > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => onRemoveExtra?.(extra.id, { decrement: true })}
                                  className="grid h-5 w-5 place-items-center rounded-full text-secondary-600 transition hover:bg-neutral-50"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onRemoveExtra?.(extra.id)}
                                  className="px-2 text-sm font-semibold text-secondary-500 transition hover:text-secondary-600"
                                >
                                  Remove
                                </button>
                              )}
                              <span className="min-w-4 text-center text-secondary-900">
                                {getExtraQuantity(extra.id)}
                              </span>
                              <button
                                type="button"
                                onClick={() => onAddExtra?.({ ...extra, quantity: 1 })}
                                className="grid h-5 w-5 place-items-center rounded-full text-secondary-600 transition hover:bg-neutral-50"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={extra.hasChildren ? () => openExtraDetails(extra) : () => handleCatalogAdd(extra)}
                            className="inline-flex h-9 w-110 items-center justify-center rounded-full bg-blue-50/80 px-4 text-xs font-black text-blue-600 transition-all hover:bg-blue-100 hover:scale-102 active:scale-95"
                          >
                            {extra.hasChildren ? `${extra.children.length} Options` : "Add"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {extrasFilter === "all" && !extrasShowAll && filteredExtras.length > 5 && (
                  <div className="border-t border-neutral-100 p-4">
                    <button
                      type="button"
                      onClick={() => setExtrasShowAll(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-50 py-3 text-sm font-bold text-secondary-600 transition-all hover:bg-neutral-100 hover:text-secondary-900 active:scale-98"
                    >
                      Show all {filteredExtras.length} extras
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-6 text-sm text-secondary-600">
                <Search className="h-5 w-5 text-secondary-400" />
                <div>No extras found. Try another filter.</div>
              </div>
            )}
          </div>
        </div>
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white/90 backdrop-blur-md px-6 py-3 shadow-card backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-secondary-600">
              <div className="flex flex-col gap-1">
                <div>
                  {selectedExtrasCount
                    ? `${selectedExtrasCount} add-on${selectedExtrasCount === 1 ? "" : "s"}  +${formatUSD(selectedExtrasTotal)}`
                    : "No extras selected"}
                </div>
                <div className="text-sm text-secondary-500">Selections are saved automatically.</div>
              </div>
              <button
                type="button"
                onClick={handleClearExtras}
                className="ml-6 text-sm font-semibold text-secondary-400 transition hover:text-secondary-600"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <Button type="button" onClick={handleDoneFromCatalog} size="sm" className="rounded-full">
                Done
              </Button>
              <button
                type="button"
                onClick={handleContinue}
                className="text-sm font-semibold text-secondary-500 transition hover:text-secondary-600"
              >
                Continue to booking
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={!!activeVibe && lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        title={`${activeVibe?.title ?? "Vibe"} photo`}
        subtitle="Swipe or use arrows to browse the gallery."
        maxWidth="max-w-5xl"
      >
        {activeVibe && lightboxIndex !== null ? (
          <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-secondary-900">
            <PhotoCarousel
              images={activeVibe.photos}
              alt={activeVibe.title}
              className="w-full"
              onOpenGallery={() => { }}
              isLocked={false}
              startIndex={lightboxIndex}
            />
          </div>
        ) : null}
      </Modal>
      <Modal
        open={!!activeVibe && !!activeExtra}
        onClose={closeExtraDetails}
        title={activeExtra?.title ?? "Extra"}
        subtitle={activeExtra?.description ?? "Optional add-on for this vibe."}
        maxWidth="max-w-3xl"
      >
        {activeExtra ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Image left */}
            <div className="w-full shrink-0 sm:w-2/5">
              <PhotoCarousel
                images={activeExtra.gallery?.length ? activeExtra.gallery : [activeExtra.image]}
                alt={activeExtra.title}
                className="aspect-4/3"
                onOpenGallery={(idx) => {
                  const slides = activeExtra.gallery?.length ? activeExtra.gallery : [activeExtra.image];
                  Fancybox.show(slides.map(src => ({ src, type: "image" })), {
                    startIndex: idx || 0,
                  });
                }}
              />
            </div>

            {/* Content right */}
            <div className="flex flex-1 flex-col gap-4">
              {activeExtra.optionGroups?.length ? (
                <div className="space-y-3">
                  {activeExtra.optionGroups.map((group) => (
                    <div key={group.id}>
                      <div className="text-xs font-semibold text-secondary-400">{group.label}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.options.map((option) => {
                          const isActive = activeExtraSelections[group.id] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setActiveExtraSelections((prev) => ({
                                  ...prev,
                                  [group.id]: option,
                                }))
                              }
                              className={cn(
                                "rounded-full border px-3 py-1 text-sm font-semibold transition",
                                isActive
                                  ? "border-secondary-900 bg-secondary-900 text-white"
                                  : "border-neutral-200 bg-white text-secondary-600 hover:bg-neutral-100"
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeExtra.details?.length ? (
                <div className="flex flex-wrap gap-2 text-sm text-secondary-500">
                  {activeExtra.details.map((detail) => (
                    <div key={detail} className="rounded-full border border-neutral-200 bg-white px-3 py-1">
                      {detail}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="text-sm text-secondary-400">
                Extras are optional. Add now or later at checkout or via WhatsApp.
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                <div className="text-lg font-bold text-secondary-900">{formatUSD(activeExtra.priceUSD)}</div>
                <div className="inline-flex h-11 min-w-160 items-center justify-between gap-3 rounded-full border border-primary-200 bg-primary-50/80 px-2.5">
                  <button
                    type="button"
                    onClick={() => setExtraQuantity((prev) => Math.max(1, prev - 1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={extraQuantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-8 text-center text-xl font-semibold leading-none tabular-nums text-primary-600">
                    {extraQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraQuantity((prev) => prev + 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 transition hover:bg-primary-50"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {cartItems?.some((item) => item.id === activeExtra.id) ? (
                  <Button variant="secondary" onClick={() => onRemoveExtra?.(activeExtra.id)} size="sm" className="rounded-full">
                    Remove
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      onAddExtra?.({
                        ...activeExtra,
                        selection: activeExtra.optionGroups?.length ? activeExtraSelections : undefined,
                        quantity: extraQuantity,
                      });
                      setAddToast({ title: activeExtra.title });
                      closeExtraDetails();
                    }}
                    size="sm"
                    className="rounded-full"
                  >
                    Add to booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
      {addToast ? (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-80 w-92pct max-w-sm -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0">
          <div className="rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-success shadow-card">
            Added to cart  {addToast.title}
          </div>
        </div>
      ) : null}
      {savedToast ? (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-80 w-92pct max-w-sm -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0">
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-secondary-600 shadow-card">
            Saved. You can edit extras anytime.
          </div>
        </div>
      ) : null}
    </PremiumSection>
  );
}
function getVideoSrc() {
  const isMobile = window.innerWidth < 768;
  const base = "https://bluuu.tours/storage/app/media/" + (isMobile ? "video-md" : "video-xl");
  const supportsWebm = document.createElement("video").canPlayType("video/webm") !== "";
  return base + (supportsWebm ? ".webm" : ".mp4");
}

function Hero() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ctaPulse, setCtaPulse] = useState(false);
  useEffect(() => {
    if (!ctaPulse) return undefined;
    const timer = setTimeout(() => setCtaPulse(false), 2600);
    return () => clearTimeout(timer);
  }, [ctaPulse]);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.src = getVideoSrc();
    el.load();
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        if (el.paused) { el.play().catch(() => { }); }
        setPlaying(true);
      } else {
        if (!el.paused) { el.pause(); }
        setPlaying(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
    };
  }, []);
  const handlePlay = () => {
    videoRef.current?.play().catch(() => { });
    setPlaying(true);
  };
  return (
    <section className={cn("relative overflow-hidden pt-12 sm:pt-20", SECTION_BACKGROUNDS.white)}>
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div style={{ height: 40, overflow: 'hidden' }}><div className="elfsight-app-59bf9aa3-92ce-4654-aa87-9f5050b2af3a" /></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary-600 sm:text-sm">
              Full day tour · Your boat · Your schedule · Pure comfort
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-secondary-900 sm:text-6xl lg:text-7xl">
              Private tour to <br className="sm:hidden" /><span className="text-primary-600">Nusa Penida</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm text-secondary-600 sm:text-xl">
              Choose your boat and your pace. Enjoy a more comfortable Nusa Penida day with a private crew and safety-first routing.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#step-1"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("step-1")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-secondary-900 px-8 text-base font-bold text-white shadow-xl transition hover:bg-secondary-800 hover:scale-105 active:scale-95 sm:h-14"
              >
                Pick date & group size <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm font-medium text-secondary-500">
              From $750 / boat &middot; Free cancellation 24h
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-12 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 shadow-2xl sm:mt-16 md:rounded-4xl"
        >
          <div className="aspect-video sm:aspect-video-wide">
            <video
              ref={videoRef}
              poster="https://bluuu.tours/storage/app/media/poster.webp"
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button
                  type="button"
                  onClick={handlePlay}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-secondary-900 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white sm:h-24 sm:w-24"
                >
                  <Play className="ml-1 h-6 w-6 fill-current sm:h-10 sm:w-10" />
                  <span className="sr-only">Play video</span>
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
function MobileHeroBookingBar() {
  const { formatPrice } = useCurrency();
  const basePrice = 4500000;
  return (
    <div className="sm:hidden">
      <div className="container">
        <div className="relative overflow-hidden rounded-none border-none bg-gradient-to-br from-white to-neutral-50 p-6 shadow-none sm:rounded-xl sm:border sm:border-neutral-200">
          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-accent-soft to-transparent opacity-40 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-accent-soft to-transparent opacity-30 blur-xl" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-sm font-bold uppercase tracking-wide-2xl text-primary-600">Starting from</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold tracking-tight text-secondary-900">
                    {formatPrice(basePrice)}
                  </div>
                  <div className="text-sm font-semibold text-secondary-500">/ boat</div>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 shadow-md">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-secondary-900">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary-600 shadow-sm" />
                Allinclusive
              </div>
              <div className="h-1 w-1 rounded-full bg-neutral-200" />
              <span>Up to {MAX_GUESTS} guests</span>
              <div className="h-1 w-1 rounded-full bg-neutral-200" />
              <span>Free cancellation 24h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function HowItWorks() {
  const steps = [
    {
      title: "Pick your date & group size",
      text: "We'll show boats that fit your group on that day.",
      icon: Calendar,
      number: "01",
    },
    {
      title: "Choose your route",
      text: "Select one route to continue. You can still customize extras next.",
      icon: MapPin,
      number: "02",
    },
    {
      title: "Choose your boat",
      text: "Your boat sets the base price for the Classic route.",
      icon: Ship,
      number: "03",
    },
    {
      title: "Add extras",
      text: "Personalize the day - add only what you want. Optional.",
      icon: Sparkles,
      number: "04",
    },
  ];

  return (
    <PremiumSection
      id="how-it-works"
      className="py-16 sm:min-h-screen sm:py-0 sm:flex sm:items-center md:py-24 md:min-h-0 md:block"
      backgroundClassName="bg-transparent"
    >
      <PremiumContainer>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
          {/* Master "How It Works" Intro Card */}
          <div className="relative flex flex-col items-start overflow-hidden rounded-xl bg-gradient-to-br from-primary-700 via-primary-600 to-[#0b79e5] p-6 pt-7 sm:col-span-2 sm:p-6 sm:pt-7 md:p-10 md:pt-12 transition-all duration-300 lg:col-span-4 lg:row-span-2">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 z-0">
              <img
                src="https://bluuu.tours/themes/bluuu/assets/icons/bluu-icon.svg"
                alt=""
                className="absolute bottom-4 right-4 h-72pct w-72pct object-contain opacity-50 [filter:brightness(0)_invert(1)]"
              />
            </div>
            <div className="relative z-10 flex h-full w-full flex-col text-white">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px w-6 bg-white/40" />
                <span className="text-xs font-black uppercase tracking-wide-xl text-white/60">
                  THE PROCESS
                </span>
              </div>
              <div className="mt-8 max-w-sm pb-2 sm:mt-9 sm:pb-3 md:mt-14 md:pb-4 lg:mt-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  How it works
                </h2>
                <p className="mt-6 text-base leading-relaxed text-white/80">
                  Simple steps to your perfect day at sea. We've streamlined everything for you.
                </p>
              </div>
            </div>
          </div>

          {/* Individual Steps */}
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-row items-center gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-all duration-300 hover:shadow-xl sm:flex-col sm:items-center sm:justify-center sm:p-5 sm:text-center md:p-6 lg:col-span-4"
              >
                <div className="absolute right-4 top-4 text-xs font-black uppercase tracking-wide-xl text-secondary-300">
                  STEP {step.number}
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center sm:mb-4">
                  <Icon className="h-7 w-7 text-secondary-400" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-base font-bold text-secondary-900 sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-secondary-500 sm:mx-auto sm:max-w-50">
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}

function StepOne({
  dateMode,
  onDateModeChange,
  exactDate,
  onExactDateChange,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  adults,
  kids,
  onAdultsChange,
  onKidsChange,
  guestFeeTotal,
  totalGuests,
  canContinue,
  onContinue,
  globalAvailabilityMap,
}) {
  const today = new Date();
  const todayISO = useMemo(() => {
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }, [today]);
  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);
  const hasRange = dateMode === "flex" && rangeStart && rangeEnd;
  const contacts = useSiteContacts();
  return (
    <PremiumSection
      id="step-1"
      backgroundClassName={SECTION_BACKGROUNDS.ocean}
    >
      <PremiumContainer>
        <div className="mb-5 sm:mb-8 flex flex-col items-center text-center">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">STEP 1 OF 4</div>
          <h2 className={Q_THEME.text.h2}>Pick your date & group size</h2>
          <p className={Q_THEME.text.body}>We'll show boats that fit your group on that day.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white shadow-none">
          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
            {/* Dates Section */}
            <div className="flex flex-col gap-3 sm:gap-4 p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900">Dates</h3>
                  <p className="text-sm font-medium text-secondary-500">
                    {dateMode === "exact" ? "Select your specific travel date" : "Choose a flexible window for your trip"}
                  </p>
                </div>
                <div className="inline-flex w-full sm:w-auto rounded-full bg-neutral-100 p-1.5 shadow-inner">
                  {[
                    { id: "flex", label: "Flexible dates" },
                    { id: "exact", label: "Exact date" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onDateModeChange(item.id)}
                      className={cn(
                        "relative flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300",
                        dateMode === item.id
                          ? "bg-white text-primary-600 shadow-sm"
                          : "text-secondary-300 hover:text-secondary-500"
                      )}
                    >
                      {item.id === "exact" ? <Calendar className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      <span className="sm:inline">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px w-full bg-neutral-100" />
              {dateMode === "exact" ? (
                <div className="space-y-3">
                  <label className="group flex flex-col gap-1.5">
                    <span className="text-xs font-black uppercase tracking-widest text-secondary-300 group-focus-within:text-primary-600 transition-colors">Exact day</span>
                    <div className="relative" id="step1-exact-date">
                      <CustomDatePicker
                        mode="single"
                        selected={exactDate ? new Date(exactDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                            onExactDateChange(iso);
                          }
                        }}
                        className="w-full rounded-xl border border-neutral-200 bg-white shadow-none"
                      />
                    </div>
                  </label>
                  {exactDate && globalAvailabilityMap && globalAvailabilityMap[exactDate] === false && (
                    <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-red-50/50 p-4 text-red-800">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100/50">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="text-sm">
                        <p className="font-black">Sold out for this date</p>
                        <p className="font-semibold opacity-70">Try flexible dates or chat with our team on WhatsApp.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[7, 10, 14].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            const base = rangeStart || todayISO;
                            onRangeStartChange(base);
                            const start = new Date(base);
                            const end = new Date(start);
                            end.setDate(end.getDate() + days - 1);
                            onRangeEndChange(end.toISOString().slice(0, 10));
                          }}
                          className={cn(
                            "flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200",
                            rangeDays === days
                              ? "bg-primary-600 text-white shadow-lg scale-102"
                              : "bg-neutral-100 text-secondary-500 hover:bg-neutral-100"
                          )}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2" id="step1-range-start">
                    <CustomDatePicker
                      mode="range"
                      selected={{
                        from: rangeStart ? new Date(rangeStart) : undefined,
                        to: rangeEnd ? new Date(rangeEnd) : undefined,
                      }}
                      onSelect={(range) => {
                        if (range?.from) {
                          const fromIso = new Date(range.from.getTime() - range.from.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                          onRangeStartChange(fromIso);
                        } else {
                          onRangeStartChange("");
                        }
                        if (range?.to) {
                          const toIso = new Date(range.to.getTime() - range.to.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                          onRangeEndChange(toIso);
                        } else {
                          onRangeEndChange("");
                        }
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-white shadow-none"
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Separator - Horizontal on mobile only */}
            <div className="lg:hidden h-px w-full bg-neutral-100" />

            {/* Guests Section */}
            <div className="flex flex-col gap-3 sm:gap-4 p-5 sm:p-8 justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-secondary-900">Guests</h3>
                <p className="text-sm font-medium text-secondary-500">Group size helps us show the right boats.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-secondary-900">Adults</span>
                        <span className="text-xs font-semibold text-secondary-500">Ages 12+</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white p-1.5 shadow-none">
                      <button
                        type="button"
                        onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-secondary-900 transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-90"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-7 text-center text-lg font-black text-secondary-900 tabular-nums">{adults}</span>
                      <button
                        type="button"
                        onClick={() => onAdultsChange(adults + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-secondary-900 transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-secondary-900">Kids</span>
                        <span className="text-xs font-semibold text-secondary-500">Ages 3-11</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white p-1.5 shadow-none">
                      <button
                        type="button"
                        onClick={() => onKidsChange(Math.max(0, kids - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-secondary-900 transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-90"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-7 text-center text-lg font-black text-secondary-900 tabular-nums">{kids}</span>
                      <button
                        type="button"
                        onClick={() => onKidsChange(kids + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-secondary-900 transition-all hover:bg-primary-50 hover:text-primary-600 active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-100/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/50 text-secondary-500">
                    <Info className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-secondary-500">
                    Pick your dates and group size — boat options with prices appear below. Toddlers under 3 go free.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col gap-4 p-5 sm:p-8">
              <div className="hidden sm:flex flex-1 flex-col items-start justify-center gap-4">
                <div className="flex items-center gap-3 text-sm font-medium text-secondary-700">
                  <ShieldCheck className="h-5 w-5 text-primary-600 shrink-0" />
                  <span>Free Cancellation</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-secondary-700">
                  <Calendar className="h-5 w-5 text-primary-600 shrink-0" />
                  <span>Flexible booking</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-secondary-700">
                  <Sparkles className="h-5 w-5 text-primary-600 shrink-0" />
                  <span>Best price guaranteed</span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}
const TOUR_PICKUP_ITEMS = [
  { icon: Car, label: "Private vehicle", helper: "Dedicated car for your group." },
  { icon: Clock, label: "Timed pickup", helper: "Aligned with your boat schedule." },
  { icon: MessageCircle, label: "Meeting point", helper: "Confirmed on WhatsApp." },
  { icon: MapPin, label: "Across Bali", helper: "We confirm feasibility after booking." },
  { icon: Shield, label: "Traffic buffer", helper: "We plan extra time for boarding." },
  { icon: ArrowRight, label: "Round trip", helper: "Pickup + drop-off available." },
  { icon: Users, label: "Large groups", helper: "Minivan can be arranged." },
];
const TOUR_SAFETY_ITEMS = [
  { icon: Shield, label: "Route safety", helper: "Safety-first routing policy. Route may change based on sea and weather conditions on the day." },
  { icon: BadgeCheck, label: "Certified guides", helper: "All guides are licensed and trained. A full safety briefing is given before every departure." },
  { icon: CheckCircle2, label: "Free cancellation 24h", helper: "Cancel up to 24 hours before departure and receive a full refund. No questions asked." },
  { icon: AlertTriangle, label: "Port Authority", helper: "Final go/no-go decisions are made on the morning of the tour based on Port Authority guidance and captain safety checks." },
];
function TourTabContent({ activeTab, includedSections, cancellationSummaryCards, weatherGuaranteeCards }) {
  const row = "flex items-center gap-4 border-b border-neutral-100 py-3 sm:py-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0";
  const iconBlue = "flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600";
  const grid = "grid grid-cols-1 sm:grid-cols-2 gap-x-6";
  if (activeTab === "included") return (
    <div className={grid}>
      {includedSections.flatMap((s) => s.items).map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={row}>
            <div className={iconBlue}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-secondary-900">{item.label}</div>
              {item.helper ? <div className="text-xs leading-normal text-secondary-500">{item.helper}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "pickup") return (
    <div className={grid}>
      {TOUR_PICKUP_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={row}>
            <div className={iconBlue}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-secondary-900">{item.label}</div>
              <div className="text-xs leading-normal text-secondary-500">{item.helper}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "safety") return (
    <div className={grid}>
      {TOUR_SAFETY_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={row}>
            <div className={iconBlue}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-secondary-900">{item.label}</div>
              <div className="text-xs leading-normal text-secondary-500">{item.helper}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "cancellation") return (
    <div className={grid}>
      {cancellationSummaryCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className={row}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100">
              <Icon className={cn("h-6 w-6 text-primary-600", card.iconClassName)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-secondary-900">{card.title}</div>
              <div className="text-xs leading-normal text-secondary-500">{card.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "faq") return (
    <div className={grid}>
      {bookingMiniFAQData.map((it) => {
        const Icon = MINI_FAQ_ICON_MAP[it.icon];
        return (
          <div key={it.q} className={row}>
            <div className={iconBlue}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-secondary-900">{it.q}</div>
              <div className="text-xs leading-normal text-secondary-500">{it.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "weather") return (
    <div className={grid}>
      {[...weatherGuaranteeCards, { icon: AlertTriangle, title: "Port Authority", text: "Final go/no-go decision is based on Port Authority guidance and captain safety checks on the tour morning." }].map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className={row}>
            <div className={iconBlue}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-secondary-900">{card.title}</div>
              <div className="text-xs leading-normal text-secondary-500">{card.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  return null;
}
function TourInfoModal({ activeTab = "included", onTabChange, onClose }) {
  const cancellationSummaryCards = (tourInfo.cancellationCards ?? []).map(card => ({
    ...card,
    icon: ICON_MAP[card.icon],
    accentClassName: card.accent,
    iconClassName: card.iconColor,
    iconWrapClassName: card.bg
  }));
  const weatherGuaranteeCards = (tourInfo.weatherGuarantee ?? []).map(card => ({
    ...card,
    icon: ICON_MAP[card.icon]
  }));
  const includedSections = tourInfo.includedSections.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      icon: ICON_MAP[item.icon]
    }))
  }));
  const [internalTab, setInternalTab] = useState(activeTab);
  useEffect(() => {
    setInternalTab(activeTab);
  }, [activeTab]);
  const handleTabChange = (id) => {
    setInternalTab(id);
    onTabChange?.(id);
  };
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white p-0 md:h-80vh">
      <div className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-5">
        <div>
          <div className="text-base sm:text-xl font-semibold text-secondary-900">Tour info</div>
          <div className="mt-1 truncate text-sm text-secondary-500">
            Whats included, pickup, and safety all in one place.
          </div>
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-secondary-600" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-neutral-200 px-6">
          <div className="hide-scrollbar flex flex-nowrap items-center gap-x-5 gap-y-2 overflow-x-auto py-3 text-sm text-secondary-500 sm:flex-wrap sm:overflow-visible">
            {INFO_DRAWER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-semibold transition duration-200 ease-out -mb-px",
                  internalTab === tab.id
                    ? "border-primary-600 text-primary-600 hover:text-primary-700"
                    : "text-secondary-500 hover:text-secondary-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 text-sm text-secondary-600">
          <TourTabContent
            activeTab={internalTab}
            includedSections={includedSections}
            cancellationSummaryCards={cancellationSummaryCards}
            weatherGuaranteeCards={weatherGuaranteeCards}
          />
        </div>
      </div>
    </div >
  );
}
function TourInfoInline() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("included");
  const [includedRestaurantPopup, setIncludedRestaurantPopup] = useState(null);
  const cancellationSummaryCards = (tourInfo.cancellationCards ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon], iconClassName: card.iconColor, iconWrapClassName: card.bg }));
  const weatherGuaranteeCards = (tourInfo.weatherGuarantee ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon] }));
  const includedSections = tourInfo.includedSections.map(section => ({ ...section, items: section.items.map(item => ({ ...item, icon: ICON_MAP[item.icon] })) }));
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50"
          aria-expanded={isOpen}
          aria-controls="tour-program-inline-panel"
        >
          <div>
            <div className="text-base sm:text-xl font-semibold text-secondary-900">Tour info</div>
            <div className="text-sm text-secondary-500">Whats included, pickup, and safety all in one place.</div>
          </div>
          <span className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-700">
            {isOpen ? <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id="tour-program-inline-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="border-b border-neutral-200 px-5 pt-3 pb-3">
                <div className="no-scrollbar flex items-center gap-x-5 gap-y-2 overflow-x-auto text-sm text-secondary-500 sm:flex-wrap sm:overflow-visible">
                  {INFO_DRAWER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-semibold transition duration-200 ease-out -mb-px",
                        activeTab === tab.id
                          ? "border-primary-600 text-primary-600 hover:text-primary-700"
                          : "text-secondary-500 hover:text-secondary-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4 text-sm text-secondary-600">
                <TourTabContent
                  activeTab={activeTab}
                  includedSections={includedSections}
                  cancellationSummaryCards={cancellationSummaryCards}
                  weatherGuaranteeCards={weatherGuaranteeCards}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {includedRestaurantPopup && (
        <Modal open={!!includedRestaurantPopup} onClose={() => setIncludedRestaurantPopup(null)} title={includedRestaurantPopup.name || "Restaurant"} subtitle="Included lunch" maxWidth="max-w-xl">
          <div className="pb-4">
            {includedRestaurantPopup.image && <div className="mb-4 aspect-4/3 overflow-hidden rounded-xl border border-neutral-200"><img src={includedRestaurantPopup.image} alt={includedRestaurantPopup.name} className="h-full w-full object-cover" /></div>}
            {includedRestaurantPopup.description ? <div className="text-sm leading-relaxed text-secondary-600" dangerouslySetInnerHTML={{ __html: includedRestaurantPopup.description }} /> : <p className="text-sm text-secondary-500">Lunch is included and served at {includedRestaurantPopup.name}.</p>}
            {includedRestaurantPopup.menu && <div className="mt-4 text-sm leading-relaxed text-secondary-600" dangerouslySetInnerHTML={{ __html: includedRestaurantPopup.menu }} />}
          </div>
        </Modal>
      )}
    </>
  );
}
function InfoLinksRow({ onOpenTourInfo, className, tone = "default", variant = "full" }) {
  const isQuiet = tone === "quiet";
  const pillClassName = cn(
    "inline-flex items-center justify-center transition-all duration-200",
    "bg-transparent p-0 text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4"
  );
  const openFancybox = (tab) => {
    onOpenTourInfo?.(tab);
  };
  if (variant === "single") {
    return (
      <div className={cn("mt-4 flex flex-wrap items-center gap-3", className)}>
        <button
          type="button"
          onClick={() => openFancybox("included")}
          className={cn(pillClassName, "gap-2")}
        >
          Tour info
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  return (
    <div className={cn("mt-4 flex justify-center sm:justify-start items-center gap-2.5 overflow-x-auto no-scrollbar flex-nowrap pb-1", className)}>
      <button type="button" onClick={() => openFancybox("included")} className={cn(pillClassName, "gap-1.5")}>
        Included
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => openFancybox("pickup")} className={cn(pillClassName, "gap-1.5")}>
        Pickup
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => openFancybox("cancellation")} className={cn(pillClassName, "gap-1.5")}>
        Cancellation
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => openFancybox("weather")} className={cn(pillClassName, "gap-1.5")}>
        Weather
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
function StepTwo({
  dateMode,
  exactDate,
  rangeStart,
  rangeEnd,
  groupSize,
  adults,
  kids,
  selectedBoatId,
  onSelectBoatId,
  availabilityByBoat,
  hasDateCriteria,
  dateSelectionPreference,
  onDateSelectionPreference,
  selectedFlexDate,
  onSelectFlexDate,
  onSwitchToFlex,
  onOpenTourInfo,
  onOpenDateModal,
  boats,
  privateTours,
  selectedStyleTitle,
  selectedStyleId,
}) {
  const [fitsOnly, setFitsOnly] = useState(true);
  const [showSoldOut, setShowSoldOut] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [partnerBoat, setPartnerBoat] = useState(null);
  const carouselRef = useRef(null);
  const boatSelectGuardRef = useRef(0);
  const hasAutoOpenedPickDayRef = useRef(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const hasSwipedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inlineDatesFor, setInlineDatesFor] = useState(null);
  const [showAllBoats, setShowAllBoats] = useState(false);
  const [visibleBoatsCount, setVisibleBoatsCount] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draftFlexDate, setDraftFlexDate] = useState("");
  const [confirmModalData, setConfirmModalData] = useState(null);
  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);
  const hasRange = dateMode === "flex" && rangeStart && rangeEnd;
  const rangeDates = useMemo(() => {
    if (!hasRange) return [];
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
    const dates = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }, [hasRange, rangeStart, rangeEnd]);
  const closePickDayMode = useCallback(() => {
    setInlineDatesFor(null);
    setDraftFlexDate("");
  }, []);
  const openPickDayMode = useCallback(
    (boatId) => {
      setInlineDatesFor(boatId);
      setDraftFlexDate(selectedBoatId === boatId ? selectedFlexDate : "");
    },
    [selectedBoatId, selectedFlexDate]
  );
  const confirmPickDay = useCallback(
    (date) => {
      if (!date) return;
      const rawBoat = (boats || []).find((b) => b.id === inlineDatesFor);
      const price = rawBoat ? calculateBoatPrice(rawBoat.tourId, date, groupSize, privateTours) : null;
      const boat = rawBoat ? { ...rawBoat, priceValue: price ?? rawBoat.priceValue } : null;
      onSelectFlexDate(date);
      onDateSelectionPreference("pickNow");
      closePickDayMode();
      if (boat?.isPartner) {
        setPartnerBoat(boat);
      } else {
        onSelectBoatId(inlineDatesFor);
        if (boat) setConfirmModalData({ boat, date, adults, kids, routeTitle: selectedStyleTitle });
      }
    },
    [inlineDatesFor, closePickDayMode, onDateSelectionPreference, onSelectFlexDate, onSelectBoatId, boats, groupSize, privateTours]
  );
  useEffect(() => {
    setSort("recommended");
  }, [dateMode]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const focusStepOne = () => {
    const target = document.getElementById("step-1");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.remove("step-1-pulse");
      void target.offsetWidth;
      target.classList.add("step-1-pulse");
      window.setTimeout(() => target.classList.remove("step-1-pulse"), 1600);
    }
    const targetId =
      dateMode === "exact" ? "step1-exact-date" : "step1-range-start";
    const input = document.getElementById(targetId);
    if (input) {
      requestAnimationFrame(() => input.focus());
    }
  };
  useEffect(() => {
    if (!inlineDatesFor) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePickDayMode();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [inlineDatesFor, closePickDayMode]);
  const inlineDatesForRef = useRef(inlineDatesFor);
  useEffect(() => { inlineDatesForRef.current = inlineDatesFor; }, [inlineDatesFor]);
  useEffect(() => {
    // Close pick-day panel only when selectedBoatId changes to a DIFFERENT boat externally
    // (don't react to inlineDatesFor changes - that would close the panel we just opened)
    if (!inlineDatesForRef.current) return;
    if (selectedBoatId && selectedBoatId !== inlineDatesForRef.current) {
      closePickDayMode();
    }
  }, [selectedBoatId, closePickDayMode]);
  const list = useMemo(() => {
    const source = boats || [];
    const baseList = source.filter((y) => y.status !== "disabled");
    // "All boats" shows everything; "Show available boats" filters by capacity
    const base = fitsOnly ? baseList.filter((y) => groupSize <= y.people) : baseList;

    // Add dynamic pricing to each boat in the list
    const listWithPrices = base.map(y => {
      const dateForPricing = dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart);
      const price = calculateBoatPrice(y.tourId, dateForPricing, groupSize, privateTours);
      return {
        ...y,
        priceValue: price ?? y.priceValue
      };
    });

    const afterAvailability = (!hasDateCriteria || !fitsOnly)
      ? listWithPrices
      : listWithPrices.filter((y) => availabilityByBoat?.[y.id]?.available);

    if (!selectedCategory) return afterAvailability;
    return afterAvailability.filter((y) =>
      y.categories?.some((c) => c.id === selectedCategory)
    );
  }, [fitsOnly, dateMode, groupSize, availabilityByBoat, hasDateCriteria, exactDate, selectedFlexDate, rangeStart, privateTours, boats, selectedCategory]);
  const allCategories = useMemo(() => {
    const map = new Map();
    (boats || []).forEach((b) => {
      (b.categories || []).forEach((c) => {
        if (!map.has(c.id)) map.set(c.id, c);
      });
    });
    return Array.from(map.values());
  }, [boats]);
  const sorted = useMemo(() => {
    const items = [...list];
    if (sort === "price") {
      return items.sort((a, b) => a.priceValue - b.priceValue);
    }
    if (sort === "comfort") {
      return items.sort((a, b) => Number(b.lengthMeters) - Number(a.lengthMeters));
    }
    if (sort === "soonest") {
      return items.sort((a, b) => {
        const aDate = availabilityByBoat?.[a.id]?.nextAvailable;
        const bDate = availabilityByBoat?.[b.id]?.nextAvailable;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.localeCompare(bDate);
      });
    }
    return items;
  }, [list, sort, availabilityByBoat]);
  const displayedBoats = useMemo(
    () => (isMobile && !showAllBoats ? sorted : sorted.slice(0, visibleBoatsCount)),
    [sorted, visibleBoatsCount, isMobile, showAllBoats]
  );
  const totalCount = displayedBoats.length;
  const allBoatsCount = sorted.length;
  const soldOutList = useMemo(() => {
    if (!hasDateCriteria) return [];
    const baseList = [...(boats || [])];
    const base = fitsOnly ? baseList.filter((y) => groupSize <= y.people) : baseList;
    return base.filter((y) => {
      const availability = availabilityByBoat?.[y.id];
      if (dateMode === "exact") {
        return availability && !availability.available;
      }
      return availability && !availability.available;
    });
  }, [availabilityByBoat, dateMode, fitsOnly, groupSize, hasDateCriteria]);
  const dateSummary = !hasDateCriteria
    ? ""
    : dateMode === "exact" && exactDate
      ? `Showing boats available on ${formatShortDate(exactDate)} for ${groupSize} guests.`
      : dateMode === "flex" && rangeStart && rangeEnd
        ? `Flexible dates: ${formatRangeShort(rangeStart, rangeEnd)}  ${groupSize} guests`
        : "";
  const openBoat = (boat) => {
    const now = Date.now();
    if (now - boatSelectGuardRef.current < 250) return;
    boatSelectGuardRef.current = now;
    if (dateMode === "flex" && hasRange) {
      // Reset confirmed date when switching to a different boat
      if (boat.id !== selectedBoatId) {
        onSelectFlexDate("");
      }
      openPickDayMode(boat.id);
    } else if (boat.isPartner) {
      setPartnerBoat(boat);
    } else {
      // Exact date selected - select immediately and show confirm modal
      onSelectBoatId(boat.id);
      const rawBoat = (boats || []).find((b) => b.id === boat.id);
      const price = rawBoat ? calculateBoatPrice(rawBoat.tourId, exactDate, groupSize, privateTours) : null;
      const boatWithPrice = rawBoat ? { ...rawBoat, priceValue: price ?? rawBoat.priceValue } : null;
      if (boatWithPrice) setConfirmModalData({ boat: boatWithPrice, date: exactDate, adults, kids, routeTitle: selectedStyleTitle });
    }
  };
  const selectedBoat = useMemo(
    () => (boats || []).find((boat) => boat.id === selectedBoatId) || null,
    [selectedBoatId, boats]
  );
  useEffect(() => {
    if (!carouselRef.current) return;
    const track = carouselRef.current;
    const handleScroll = () => {
      const card = track.querySelector("[data-card]");
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      if (!cardWidth) return;
      const nextIndex = Math.round(track.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), totalCount - 1));
      if (!hasSwipedRef.current && track.scrollLeft > 4) {
        hasSwipedRef.current = true;
        setHasSwiped(true);
      }
    };
    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [totalCount]);
  useEffect(() => {
    hasSwipedRef.current = hasSwiped;
  }, [hasSwiped]);
  useEffect(() => {
    setVisibleBoatsCount(6);
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "instant" });
    }
  }, [sorted]);
  useEffect(() => {
    setSelectedCategory(null);
    setVisibleBoatsCount(6);
  }, [boats]);
  const renderBoatCard = (boat, { isSoldOut = false, isLocked = false } = {}) => {
    const availability = availabilityByBoat?.[boat.id];
    const fitsGroup = groupSize <= boat.people;
    const soldOut = dateMode === "exact" && exactDate && !availability?.available;
    const isDisabled = !fitsGroup || soldOut || isSoldOut || isLocked;
    const needsExactDateSelection = dateMode === "exact" && !exactDate;
    const availableDates = availability?.availableDates ?? [];
    const selectedDateForBoat = selectedBoatId === boat.id ? selectedFlexDate : "";
    const showFrom = !((dateMode === "exact" && !!exactDate) || !!selectedDateForBoat);
    const rawPerks = Array.isArray(boat.list) && boat.list.length
      ? boat.list
      : Array.isArray(boat.listItems)
        ? boat.listItems
        : [];
    const perks = rawPerks
      .map((item) => sanitizeDisplayText(item, { stripTrailingOne: true }))
      .filter(Boolean);
    const displayPerks = perks;
    const nextAvailable = availability?.nextAvailable || availableDates[0];
    const isSelected = selectedBoatId === boat.id && !isLocked;
    const isPickDayMode = inlineDatesFor === boat.id;
    const draftDate = availableDates.includes(draftFlexDate) ? draftFlexDate : "";
    const showPickDayOption = !isLocked && dateMode === "flex" && hasRange && isSelected;
    const isTwoRowGrid = rangeDays >= 6 && rangeDays <= 14;
    const boatDescriptionText = sanitizeDisplayText(boat.description, { stripTrailingOne: true });
    const hasBoatDescription = Boolean(boatDescriptionText);

    let draftPriceValue = boat.priceValue;
    if (draftDate && typeof calculateBoatPrice === 'function' && privateTours) {
      const p = calculateBoatPrice(boat.tourId, draftDate, groupSize, privateTours);
      if (p !== null) draftPriceValue = p;
    }

    const isSoon = boat.status === "soon";
    return (
      <div
        className={cn(
          "group relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-none transition-all duration-300",
          isSelected && "border-neutral-200 shadow-2xl z-10",
          isSoldOut && "opacity-70",
          isLocked && "cursor-pointer",
          isSoon && "pointer-events-none select-none"
        )}
        onClick={() => {
          if (!isLocked) return;
          focusStepOne();
        }}
        role={isLocked ? "button" : undefined}
      >
        {isSoon && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/40 backdrop-blur-xs">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-secondary-900 shadow">Coming soon</span>
          </div>
        )}
        {(() => {
          const bf = boat.boatFeatures || {};
          const boatFeatures = getBoatFeatures(boat.boatFeatures);
          const boatTypeLabel = [
            bf.boat_type || null,
            boat.lengthMeters ? `${boat.lengthMeters}M` : null,
          ].filter(Boolean).join(" · ").toUpperCase();

          return (
            <div
              className={cn("flex h-full flex-col")}
              aria-hidden={false}
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden">
                <PhotoCarousel
                  className="aspect-video cursor-pointer"
                  images={boat.images?.length ? boat.images : [boat.cover]}
                  alt={boat.name}
                  onOpenGallery={(startIndex) => {
                    const slides = boat.images?.length ? boat.images : [boat.cover];
                    Fancybox.show(slides.map(src => ({ src, type: "image" })), { startIndex: startIndex || 0 });
                  }}
                />
                {isSelected && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-primary-600/30" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                        <Check className="h-5 w-5 text-primary-600" strokeWidth={3} />
                      </div>
                      <span className="rounded-full bg-white px-4 py-1 text-sm font-bold text-primary-600 shadow-md">Selected</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5 pt-4">
                {/* Type label */}
                {boatTypeLabel && (
                  <div className="mb-1 text-xs leading-tight font-bold uppercase tracking-widest text-primary-500">{boatTypeLabel}</div>
                )}

                {/* Title */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-xl font-bold text-secondary-900 leading-tight line-clamp-1">
                    {boat.id === "angels" ? "Two boats (14+ guests)" : boat.name}
                  </div>
                  {boat.isPartner && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs leading-tight font-semibold text-amber-600 border border-amber-200">By request</span>
                  )}
                </div>

                {/* Description */}
                <div className="mt-1.5 min-h-[4.5rem] text-sm leading-relaxed text-secondary-500 line-clamp-3">
                  {boatDescriptionText}
                </div>

                {/* Fleet size info */}
                {boat.fleetSize >= 1 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-600">
                    <Ship className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                    {boat.fleetSize} identical {boat.fleetSize === 1 ? "boat" : "boats"} — we assign the best available for your date
                  </div>
                )}

                {/* Best for badge — always reserve space */}
                <div className="mt-2.5 h-7">
                  {bf.best_for && (
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                      Best for: {bf.best_for}
                    </span>
                  )}
                </div>

                {/* Features grid */}
                <div className="mt-3 border-t border-neutral-100 pt-3 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-900">
                      <Users className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                      Up to {boat.people}
                    </div>
                    {boatFeatures.map(({ label, present, Icon }) => (
                      <div key={label} className={cn("flex items-center gap-2 text-sm", present ? "font-medium text-secondary-900" : "text-secondary-300")}>
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", present ? "text-secondary-400" : "text-neutral-300")} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price + button */}
                <div className="mt-auto border-t border-neutral-100 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className={cn("flex min-w-0 flex-col", (isSoldOut || isLocked) && "opacity-60")}>
                      {showFrom && <span className="text-xs leading-tight font-semibold uppercase tracking-wide text-secondary-400 leading-none mb-0.5">From</span>}
                      <div className="flex items-baseline gap-x-1">
                        <span className="text-xl font-black text-secondary-900 tracking-tight">
                          {boat.id === "angels" ? formatIDR(33000000) : formatIDR(isLocked ? (boat.gross_price || boat.priceValue) : draftPriceValue)}
                        </span>
                        <span className="text-xs font-semibold text-secondary-400">
                          {boat.id === "angels" ? "/ 2 boats" : "/ boat"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLocked ? (
                        <button type="button" onClick={focusStepOne} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-secondary-700 transition hover:bg-neutral-50">
                          <Calendar className="h-4 w-4" />
                          Select dates
                        </button>
                      ) : isSoldOut ? (
                        <div className="flex flex-wrap gap-2 text-sm font-semibold">
                          {dateMode === "exact" ? (
                            <>
                              <button type="button" onClick={onSwitchToFlex} className="text-primary-600 transition hover:text-primary-700">Try flexible dates</button>
                              <button type="button" onClick={onOpenDateModal} className="text-primary-600 transition hover:text-primary-700">Change range</button>
                            </>
                          ) : (
                            <span className="text-secondary-400">Not available in range</span>
                          )}
                        </div>
                      ) : dateMode === "exact" && needsExactDateSelection ? (
                        <Button variant="secondary" className="h-10 rounded-full px-5" onClick={focusStepOne} disabled={isDisabled}>Select date</Button>
                      ) : isSelected ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openPickDayMode(boat.id); }}
                          className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-xs font-semibold text-primary-600 transition hover:border-primary-200 hover:bg-primary-50"
                        >
                          {selectedDateForBoat ? "Change date" : "Pick a day"}
                        </button>
                      ) : (
                        <Button
                          type="button"
                          variant="primary"
                          className="h-10 rounded-full px-5"
                          onClick={() => {
                            if (!hasDateCriteria) {
                              document.getElementById("step-1")?.scrollIntoView({ behavior: "smooth", block: "start" });
                              return;
                            }
                            openBoat(boat);
                          }}
                          disabled={isDisabled}
                        >
                          {!hasDateCriteria ? "Pick a date first" : "Select"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        <AnimatePresence>
          {isPickDayMode && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40"
                onClick={closePickDayMode}
              />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl rounded-b-none bg-white p-5 shadow-2xl sm:inset-0 sm:m-auto sm:h-fit sm:w-[420px] sm:rounded-2xl sm:p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-0.5">
                  <div className="text-lg font-bold tracking-tight text-secondary-900">Pick a day</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-secondary-400">Optional step</div>
                </div>
                <button
                  type="button"
                  onClick={closePickDayMode}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-secondary-500 transition hover:bg-white hover:text-secondary-900"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex-1 overflow-y-auto">
                {hasRange ? (
                  <div className="grid grid-cols-5 gap-2 pr-1">
                    {rangeDates.map((date) => {
                      const isAvailable = availableDates.includes(date);
                      const isPicked = draftFlexDate === date;
                      const parsed = new Date(`${date}T00:00:00`);
                      const monthLabel = parsed.toLocaleString("en-US", { month: "short" });
                      const dayLabel = Number.isNaN(parsed.getTime()) ? "" : String(parsed.getDate());
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => {
                            if (!isAvailable) return;
                            setDraftFlexDate(date);
                          }}
                          className={cn(
                            "flex min-h-58 flex-col items-center justify-center rounded-xl border px-2 py-1 transition-all duration-200",
                            isPicked
                              ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm scale-102"
                              : isAvailable
                                ? "border-neutral-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-neutral-100 hover:text-primary-700"
                                : "border-neutral-200 bg-neutral-50 text-secondary-500 opacity-40 cursor-not-allowed"
                          )}
                          disabled={!isAvailable}
                        >
                          <span
                            className={cn(
                              "text-xs leading-tight font-semibold uppercase tracking-wide",
                              isPicked ? "text-primary-600" : isAvailable ? "text-secondary-400" : "text-secondary-300"
                            )}
                          >
                            {monthLabel}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 text-xl font-extrabold leading-none",
                              isPicked ? "text-primary-700" : isAvailable ? "text-secondary-900" : "text-secondary-400"
                            )}
                          >
                            {dayLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-4 text-center">
                    <Calendar className="mb-2 h-6 w-6 text-secondary-300" />
                    <div className="text-sm font-semibold text-secondary-500">Select a date range first</div>
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {draftDate ? (
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-semibold text-secondary-500">
                      {new Date(`${draftDate}T00:00:00`).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-secondary-900 tracking-tight">
                        {boat.id === "angels" ? formatIDR(33000000) : formatIDR(draftPriceValue)}
                      </span>
                      <span className="text-2xs font-bold uppercase tracking-widest text-secondary-300">
                        {boat.id === "angels" ? "/ 2 boats" : "/ boat"}
                      </span>
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                    draftDate
                      ? "bg-primary-600 text-white shadow-card hover:scale-101 hover:bg-primary-600-strong active:scale-98"
                      : "bg-neutral-100 text-secondary-300 cursor-not-allowed"
                  )}
                  onClick={() => confirmPickDay(draftDate)}
                  disabled={!draftDate}
                >
                  Confirm date
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    );
  };
  return (
    <>
      <PremiumSection
        id="step-3"
        className="bg-transparent"
        centered
      >
        <PremiumContainer>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">
              STEP 3 OF 4
            </div>
            <h2 className={Q_THEME.text.h2}>Choose your boat</h2>
            <p className={cn(Q_THEME.text.body, "mx-auto max-w-200")}>
              Your boat sets the base price for the Classic route.
            </p>
          </div>

          {/* Filter + sort bar */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Row 1 (mobile) / left part (desktop): toggle + categories + mobile sort */}
            {/* Wrapper keeps sort button outside overflow-x-auto so dropdown isn't clipped */}
            <div className="flex flex-1 items-center gap-2 sm:contents">
              <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto pb-0.5">
                {/* All + category filter pills */}
                <button
                  type="button"
                  onClick={() => { setSelectedCategory(null); setFitsOnly(false); }}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
                    !selectedCategory
                      ? "border-secondary-900 bg-secondary-900 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                  )}
                >
                  All boats
                </button>

                {allCategories.length > 0 && (
                  <>
                    {allCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={cn(
                          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
                          selectedCategory === cat.id
                            ? "border-secondary-900 bg-secondary-900 text-white shadow-sm"
                            : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Sort — mobile only, outside overflow-x-auto so dropdown isn't clipped */}
              <div className="relative shrink-0 sm:hidden">
                <button
                  type="button"
                  onClick={() => setShowSortMenu(v => !v)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all select-none",
                    sort !== "recommended"
                      ? "border-secondary-900 bg-secondary-900 text-white"
                      : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {sort === "price" ? "By price" : sort === "comfort" ? "Largest" : sort === "soonest" ? "Soonest" : "Sort"}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showSortMenu && "rotate-180")} />
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                      {[
                        { value: "recommended", label: "Recommended" },
                        { value: "price", label: "Lowest price" },
                        { value: "comfort", label: "Largest boat" },
                        { value: "soonest", label: "Soonest available" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                          className={cn(
                            "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50",
                            sort === opt.value ? "font-semibold text-primary-600" : "text-secondary-700"
                          )}
                        >
                          {sort === opt.value && <Check className="h-3.5 w-3.5 text-primary-500" />}
                          <span className={sort !== opt.value ? "pl-5" : ""}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Row 2 (mobile) / right part (desktop): categories (mobile) + Sort (desktop) */}
            {allCategories.length > 0 && (
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5 sm:hidden">
                {allCategories.map((cat) => (
                  <button
                    key={`m-${cat.id}`}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
                      selectedCategory === cat.id
                        ? "border-secondary-900 bg-secondary-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Sort dropdown — desktop only, outside overflow container so dropdown isn't clipped */}
            <div className="relative hidden shrink-0 sm:block">
                <button
                  type="button"
                  onClick={() => setShowSortMenu(v => !v)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all select-none",
                    sort !== "recommended"
                      ? "border-secondary-900 bg-secondary-900 text-white"
                      : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {sort === "price" ? "By price" : sort === "comfort" ? "Largest" : sort === "soonest" ? "Soonest" : "Sort"}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showSortMenu && "rotate-180")} />
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                      {[
                        { value: "recommended", label: "Recommended" },
                        { value: "price", label: "Lowest price" },
                        { value: "comfort", label: "Largest boat" },
                        { value: "soonest", label: "Soonest available" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                          className={cn(
                            "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50",
                            sort === opt.value ? "font-semibold text-primary-600" : "text-secondary-700"
                          )}
                        >
                          {sort === opt.value && <Check className="h-3.5 w-3.5 text-primary-500" />}
                          <span className={sort !== opt.value ? "pl-5" : ""}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

          <div
            ref={carouselRef}
            className={cn(
              "no-scrollbar flex gap-0 overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:gap-4 sm:overflow-visible sm:pb-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              !showAllBoats ? "snap-x snap-mandatory" : "flex-col overflow-visible"
            )}
          >
            {displayedBoats.map((boat) => (
              <div
                key={boat.id}
                data-card
                className={cn(
                  "relative flex w-full shrink-0 sm:h-full",
                  !showAllBoats && "snap-center snap-always min-h-70vh sm:min-h-0",
                  showAllBoats && "mb-4 sm:mb-0"
                )}
              >
                {renderBoatCard(boat, { isLocked: false })}
              </div>
            ))}
          </div>
          {isMobile && totalCount > 1 && !showAllBoats ? (
            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(7, totalCount) }, (_, i) => {
                const maxDots = Math.min(7, totalCount);
                const start = Math.max(0, Math.min(activeIndex - Math.floor(maxDots / 2), totalCount - maxDots));
                const dotIndex = start + i;
                const isActive = dotIndex === activeIndex;
                return (
                  <button
                    key={`boat-dot-${dotIndex}`}
                    type="button"
                    onClick={() => {
                      const track = carouselRef.current;
                      const card = track?.querySelector("[data-card]");
                      if (!track || !card) return;
                      const cardWidth = card.getBoundingClientRect().width;
                      track.scrollTo({ left: dotIndex * cardWidth, behavior: "smooth" });
                      setHasSwiped(true);
                    }}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition",
                      isActive ? "bg-secondary-900" : "bg-secondary-300"
                    )}
                    aria-label={`Go to boat ${dotIndex + 1}`}
                  />
                );
              })}
            </div>
          ) : null}
          {isMobile && !hasSwiped && totalCount > 1 && !showAllBoats ? (
            <div className="mt-2 flex items-center justify-center gap-1 text-sm text-secondary-300">
              <ChevronLeft className="h-3 w-3" />
              <span>Swipe</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          ) : null}
          {(!isMobile || showAllBoats) && allBoatsCount > visibleBoatsCount && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleBoatsCount(v => v + 6)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-secondary-600 transition-colors hover:border-neutral-300 hover:text-secondary-800"
              >
                Show more
                <span className="text-secondary-400">({allBoatsCount - visibleBoatsCount})</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
          {isMobile && !showAllBoats && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllBoats(true)}
                className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                View all boats
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
          {isMobile && showAllBoats && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => { setShowAllBoats(false); setHasSwiped(false); }}
                className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                <ChevronUp className="h-4 w-4" />
                Back to slider
              </button>
            </div>
          )}
        </PremiumContainer>
      </PremiumSection>
      <Modal
        open={!!confirmModalData}
        onClose={() => setConfirmModalData(null)}
        maxWidth="max-w-lg"
        showClose={false}
        closeOnBackdrop={true}
        bodyClassName="p-0"
      >
        {confirmModalData ? (
          <div className="relative flex flex-col">
            {(confirmModalData.boat.cover || confirmModalData.boat.images?.[0]) && (
              <div className="hidden sm:block">
                <img
                  src={confirmModalData.boat.cover || confirmModalData.boat.images?.[0]?.thumb || confirmModalData.boat.images?.[0]?.path}
                  srcSet={confirmModalData.boat.cover_small ? `${confirmModalData.boat.cover_small} 300w, ${confirmModalData.boat.cover} 600w` : undefined}
                  sizes="(max-width: 640px) 100vw, 480px"
                  alt={confirmModalData.boat.name}
                  className="h-52 w-full object-cover rounded-t-xl"
                />
              </div>
            )}
            <div className="px-5 pb-3 pt-4 text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary-600" />
                </div>
              </div>
              <div className="text-2xs font-bold uppercase tracking-widest text-primary-500">Your selection</div>
              <div className="mt-1 text-base font-bold tracking-tight text-secondary-900 leading-snug">
                {confirmModalData.boat.name}
              </div>

              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {confirmModalData.routeTitle && (
                  <div className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
                    <Sparkles className="h-3 w-3 text-secondary-400" />
                    {confirmModalData.routeTitle}
                  </div>
                )}
                <div className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
                  <Calendar className="h-3 w-3 text-secondary-400" />
                  {formatShortDate(confirmModalData.date)}
                </div>
                <div className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
                  <Users className="h-3 w-3 text-secondary-400" />
                  {confirmModalData.adults} adult{confirmModalData.adults !== 1 ? "s" : ""}
                  {confirmModalData.kids > 0 ? `, ${confirmModalData.kids} kid${confirmModalData.kids !== 1 ? "s" : ""}` : ""}
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-xl font-black tracking-tight text-secondary-900">
                  {formatIDR(confirmModalData.boat.priceValue)}
                </span>
                <span className="text-xs font-semibold text-secondary-400">/ boat</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 px-4 pb-3 pt-3 flex items-center gap-3">
              <button
                type="button"
                className="flex-1 h-11 rounded-full border border-neutral-200 bg-neutral-50 text-sm font-semibold text-secondary-500 transition hover:bg-white hover:text-secondary-700"
                onClick={() => setConfirmModalData(null)}
              >
                Another boat
              </button>
              <Button
                className="flex-1 rounded-full h-11 text-sm font-black normal-case tracking-normal transition-all hover:scale-101 active:scale-98"
                onClick={() => {
                  setConfirmModalData(null);
                  setTimeout(() => {
                    document.getElementById("step-6")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 80);
                }}
              >
                Go to extras <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <PartnerRequestModal
        isOpen={!!partnerBoat}
        onClose={() => setPartnerBoat(null)}
        tourId={partnerBoat?.tourId}
        tourName={partnerBoat?.name}
        date={exactDate || selectedFlexDate || ""}
        adults={adults}
        kids={kids}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        dateMode={dateMode}
        programId={selectedStyleId}
      />
    </>
  );
}
function DayStyleCarousel({ images, activeIndex, onChange, onOpenGallery }) {
  const total = images.length;
  const scrollRef = useRef(null);
  const lastIdx = useRef(activeIndex);
  const scrollTimer = useRef(null);
  const pointerDown = useRef(null);
  const hasDragged = useRef(false);

  // Sync scroll when parent changes activeIndex externally
  useEffect(() => {
    if (activeIndex === lastIdx.current) return;
    const el = scrollRef.current;
    if (!el) return;
    lastIdx.current = activeIndex;
    el.scrollTo({ left: activeIndex * el.offsetWidth, behavior: "smooth" });
  }, [activeIndex]);

  const go = (delta) => {
    const el = scrollRef.current;
    if (!el || !total) return;
    const target = Math.max(0, Math.min(total - 1, activeIndex + delta));
    if (target === activeIndex) return;
    lastIdx.current = target;
    el.scrollTo({ left: target * el.offsetWidth, behavior: "smooth" });
    onChange(target);
  };

  // Debounced scroll handler to avoid firing during smooth animation
  const handleScroll = () => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const newIdx = Math.round(el.scrollLeft / el.offsetWidth);
      if (newIdx !== lastIdx.current && newIdx >= 0 && newIdx < total) {
        lastIdx.current = newIdx;
        onChange(newIdx);
      }
    }, 50);
  };

  if (!total) {
    return (
      <div className="flex h-250 w-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400">
        <Camera className="h-8 w-8 opacity-40" />
        <span className="text-sm font-medium">No photos yet</span>
      </div>
    );
  }

  const indicator = total <= 1 ? null : total > 12 ? (
    <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/30">
      <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
    </div>
  ) : (
    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
      {images.map((_, i) => (
        <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40")} />
      ))}
    </div>
  );

  return (
    <div
      className="group relative w-full rounded-xl cursor-pointer"
      onPointerDown={(e) => { pointerDown.current = { x: e.clientX }; hasDragged.current = false; }}
      onPointerMove={(e) => { if (!pointerDown.current) return; if (Math.abs(e.clientX - pointerDown.current.x) > 8) hasDragged.current = true; }}
      onClick={(e) => { e.stopPropagation(); if (!hasDragged.current) onOpenGallery?.(); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      }}
      tabIndex={0}
      role="button"
      aria-label="Open gallery"
    >
      <div
        ref={scrollRef}
        className="flex h-250 snap-x snap-mandatory rounded-xl"
        style={{ overflowX: "scroll", scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={handleScroll}
      >
        {images.map((img, i) => {
          const src = typeof img === "string" ? img : (img?.thumb || img?.path);
          const srcSmall = typeof img === "string" ? null : (img?.thumb_small || null);
          return (
            <div key={i} className="flex-none w-full snap-center relative shrink-0 h-250 overflow-hidden">
              <img
                src={src}
                srcSet={srcSmall ? `${srcSmall} 300w, ${src} 600w` : undefined}
                sizes="(max-width: 640px) 100vw, 50vw"
                alt={i === activeIndex ? "Day style preview" : ""}
                loading={Math.abs(i - activeIndex) <= 1 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-soft via-transparent to-transparent rounded-xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/5 to-transparent rounded-xl" />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpenGallery?.(); }}
        className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60 opacity-0 group-hover:opacity-100"
        aria-label="Expand gallery"
      >
        <Maximize className="h-4 w-4" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
      {indicator}
    </div>
  );
}
function StepThree({ selectedStyleId, onSelectStyleId, onContinue, onSkip, onHighlightExtra, onOpenTourInfo, vibes = [], styles = [], extrasCatalog = [] }) {
  const { categories, loading: extrasLoading } = useExtras();
  const [ctaPulse, setCtaPulse] = useState(false);
  // ... (rest of state)
  const [selectionError, setSelectionError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const stepRef = useRef(null);
  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const hasSwipedRef = useRef(false);
  const [showSticky, setShowSticky] = useState(false);
  const [activeSlideByStyleId, setActiveSlideByStyleId] = useState(
    () => styles.reduce((acc, style) => ({ ...acc, [style.id]: 0 }), {})
  );
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [activeRestaurantData, setActiveRestaurantData] = useState(null);
  const [selectedRestaurantData, setSelectedRestaurantData] = useState(null);
  const [restaurantDataPopup, setRestaurantDataPopup] = useState(null);
  const [restaurantModalStyle, setRestaurantModalStyle] = useState(null);
  const styleKeyById = {
    "classic-route": "classic",
    "family-first": "family_easygoing",
    "celebration-day": "celebration",
    "dive-highlights": "manta_first",
    "watersport-day": "snorkel_focused",
    "chill-relax": "relaxed_scenic",
  };
  const styleImages = useMemo(() => {
    return styles.reduce((acc, style) => {
      const images = (style.photos || []).map(p => p);
      if (!images.length) {
        // Fallback to vibes if no photos
        const pool = vibes.flatMap((vibe) => [vibe.hero, ...(vibe.photos || []).map(p => p?.thumb || p?.path || p)]).filter(Boolean);
        if (pool.length) {
          const start = (styles.indexOf(style) * 3) % pool.length;
          for (let i = 0; i < Math.min(6, pool.length); i += 1) {
            images.push(pool[(start + i) % pool.length]);
          }
        }
      }
      acc[style.id || style.slug] = images;
      return acc;
    }, {});
  }, [vibes, styles]);

  const heroUrls = useMemo(() => styles.map((s) => { const img = (styleImages[s.id || s.slug] || [])[0]; return typeof img === "string" ? img : (img?.thumb || img?.path); }).filter(Boolean), [styles, styleImages]);
  const imagesReady = useImagePreload(heroUrls);
  const routeSkeletonCount = Math.max(3, Math.min(styles.length || 3, 6));
  const showRoutesSkeleton = extrasLoading;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!selectedStyleId) return;
    setCtaPulse(true);
    const timer = window.setTimeout(() => setCtaPulse(false), 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedStyleId]);
  useEffect(() => {
    if (!stepRef.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(stepRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return undefined;
    const track = carouselRef.current;
    const handleScroll = () => {
      const card = track.querySelector("[data-route-card]");
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      if (!cardWidth) return;
      const nextIndex = Math.round(track.scrollLeft / cardWidth);
      setCarouselIndex(Math.min(Math.max(nextIndex, 0), styles.length - 1));
      if (!hasSwipedRef.current && track.scrollLeft > 4) {
        hasSwipedRef.current = true;
        setHasSwiped(true);
      }
    };
    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("change", handleScroll);
  }, [isMobile, styles.length]);
  useEffect(() => {
    hasSwipedRef.current = hasSwiped;
  }, [hasSwiped]);
  const addOnNoteByStyleId = styles.reduce((acc, s) => {
    if (s.add_on_note) acc[s.id || s.slug] = s.add_on_note;
    return acc;
  }, {
    "dive-highlights": "Diving is an add-on (not included). Choose options in Extras.",
    "watersport-day": "Watersport is an add-on (not included). Choose options in Extras.",
  });
  const scheduleByStyleId = styles.reduce((acc, s) => {
    acc[String(s.id)] = acc[s.slug || String(s.id)] = {
      title: s.title,
      popupTitle: s.popup_title,
      beforeLunch: s.schedule_before_lunch || [],
      afterLunch: s.schedule_after_lunch || [],
      footerNotes: s.popup_afternoon ? [s.popup_afternoon] : [],
    };
    return acc;
  }, {});
  const activeItineraryStyle = useMemo(() => {
    if (!activeItineraryId) return null;
    return styles.find((s) => String(s.id) === String(activeItineraryId) || s.slug === activeItineraryId) || null;
  }, [activeItineraryId, styles]);
  const activeItinerarySchedule = useMemo(() => {
    if (!activeItineraryStyle) return null;
    return scheduleByStyleId[activeItineraryStyle.id] || scheduleByStyleId[activeItineraryStyle.slug] || null;
  }, [activeItineraryStyle, scheduleByStyleId]);
  const activeItineraryNote = activeItineraryStyle
    ? addOnNoteByStyleId[activeItineraryStyle.id] || addOnNoteByStyleId[activeItineraryStyle.slug]
    : null;
  const fetchRestaurantForStyle = useCallback((style, setter) => {
    if (!style) { setter(null); return () => { }; }
    let cancelled = false;
    if (style.restaurant) {
      setter(style.restaurant);
      return () => { cancelled = true; };
    }
    const restaurantId = style.restaurant_id;
    if (restaurantId) {
      fetchRestaurant(restaurantId).then((data) => {
        if (!cancelled) setter(data);
      });
    } else if (style.id) {
      fetch(apiUrl(`route/${style.id}`))
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (data?.restaurant) { setter(data.restaurant); return; }
          setter(null);
        })
        .catch(() => { if (!cancelled) setter(null); });
    } else {
      setter(null);
    }
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const cancel = fetchRestaurantForStyle(activeItineraryStyle, setActiveRestaurantData);
    return cancel;
  }, [activeItineraryStyle, fetchRestaurantForStyle]);
  useEffect(() => {
    const selectedStyle = styles.find((s) => String(s.id) === String(selectedStyleId) || s.slug === selectedStyleId) || null;
    const cancel = fetchRestaurantForStyle(selectedStyle, setSelectedRestaurantData);
    return cancel;
  }, [selectedStyleId, styles, fetchRestaurantForStyle]);
  const normalizeRouteText = useCallback((value) => {
    if (typeof value !== "string") return "";
    return value
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;|&#38;/gi, "&")
      .replace(/&quot;|&#34;/gi, "\"")
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }, []);
  const getRouteRestaurantDetails = useCallback((style) => {
    if (!style || typeof style !== "object") return null;
    const restaurant = style.restaurant && typeof style.restaurant === "object" ? style.restaurant : null;
    const explicitName = normalizeRouteText(
      restaurant?.name ||
      restaurant?.title ||
      restaurant?.restaurant_name ||
      restaurant?.restaurantName ||
      ""
    );
    const explicitDescription = normalizeRouteText(
      restaurant?.description ||
      restaurant?.short_description ||
      restaurant?.shortDescription ||
      restaurant?.details ||
      restaurant?.menu ||
      ""
    );
    const scheduleItems = [...(style.schedule_before_lunch || []), ...(style.schedule_after_lunch || [])];
    const lunchEntry = scheduleItems.find((item) => {
      const title = String(item?.title || "");
      const details = String(item?.details || "");
      return /lunch|restaurant/i.test(title) || /restaurant/i.test(details);
    });
    const lunchDetails = normalizeRouteText(lunchEntry?.details || "");
    const inferredName = lunchDetails
      ? (lunchDetails.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim() || lunchDetails.split("(")[0].trim())
      : "";
    const name = explicitName || inferredName;
    const description = explicitDescription || lunchDetails;
    if (!name && !description) return null;
    return { name, description };
  }, [normalizeRouteText]);
  return (
    <Section
      id="step-2"
      title="Choose your route"
      subtitle="Select one route to continue. You can still customize extras next."
      backgroundClassName={SECTION_BACKGROUNDS.lagoon}
      kicker="STEP 2 OF 4"
      centered={true}
    >
      <div ref={stepRef} className="pb-28 sm:pb-24">
        {showRoutesSkeleton ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: routeSkeletonCount }, (_, i) => (
              <SkeletonCard key={`route-skel-${i}`} />
            ))}
          </div>
        ) : styles.length ? (
          <>
            <div
              ref={carouselRef}
              className={cn(
                "no-scrollbar flex gap-0 overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:gap-4 sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-3",
                !showAllStyles ? "snap-x snap-mandatory" : "flex-col overflow-visible"
              )}
            >
              {styles.map((style) => {
                const isSelected = String(style.id) === String(selectedStyleId) || style.slug === selectedStyleId;
                const images = styleImages[style.id] || styleImages[style.slug] || [];
                const activeIndex = activeSlideByStyleId[style.id] ?? activeSlideByStyleId[style.slug] ?? 0;
                const styleId = style.slug || String(style.id);
                const routeRestaurant = getRouteRestaurantDetails(style);
                const addOnBadge = style.badge || styleId === "dive-highlights" || styleId === "watersport-day";
                const chips = style.highlights?.length >= 2
                  ? style.highlights
                  : [
                    { label: "Comfort pace", icon: Clock },
                    { label: "Photo moments", icon: Camera },
                  ];
                return (
                  <div
                    key={style.id}
                    data-route-card
                    className={cn(
                      "group relative flex min-h-70vh w-full shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition-all duration-300 sm:min-h-470 sm:w-auto sm:snap-start",
                      !showAllStyles && "snap-center snap-always",
                      showAllStyles && "mb-4 sm:mb-0",
                      "hover:border-primary-300 hover:shadow-md",
                      isSelected && "border-primary-500 ring-1 ring-primary-500 bg-white shadow-2xl z-10"
                    )}
                  >
                    <div onClick={(event) => event.stopPropagation()} role="presentation" className="relative">
                      <PhotoCarousel
                        className="aspect-video cursor-pointer"
                        images={images}
                        alt={style.title}
                        onOpenGallery={(startIndex) => {
                          const fullPaths = (style.photos || []).map(p => p.path || p.thumb).filter(Boolean);
                          Fancybox.show((fullPaths.length ? fullPaths : images).map(src => ({ src, type: "image" })), {
                            startIndex: startIndex || 0,
                            hideScrollbar: false,
                          });
                        }}
                      />
                      {isSelected && (
                        <>
                          <div className="pointer-events-none absolute inset-0 bg-primary-600/30 rounded-xl" />
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                              <Check className="h-5 w-5 text-primary-600" strokeWidth={3} />
                            </div>
                            <span className="rounded-full bg-white px-4 py-1 text-sm font-bold text-primary-600 shadow-md">Selected</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4 pt-4">
                      {/* Title row */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-base sm:text-xl font-semibold text-secondary-900 leading-tight line-clamp-1">{style.title}</div>
                        {addOnBadge ? (
                          <div className="group/tooltip relative ml-auto flex shrink-0 items-center">
                            <span className="inline-flex cursor-help items-center rounded-full border border-primary-200 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                              {typeof addOnBadge === 'string' ? addOnBadge : "Add-on"}
                            </span>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100 z-50">
                              <div className="rounded-xl bg-secondary-900 px-3 py-2.5 text-xs font-medium leading-relaxed text-white shadow-xl">
                                This route is built around add-ons — we'll suggest extras in the next steps.
                                <div className="absolute -bottom-1 right-4 h-3 w-3 rotate-45 rounded-sm bg-secondary-900"></div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Description */}
                      <div className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-secondary-500">
                        {style.description}
                      </div>

                      {/* Divider + highlights + best_for */}
                      <div className="mt-4 border-t border-neutral-100 pt-4 flex flex-col gap-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {chips.map((item) => {
                            const Icon = typeof item.icon === 'string' ? ICON_MAP[item.icon] || MapPin : item.icon;
                            return (
                              <div key={item.label} className="flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                                <Icon className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                        {style.best_for || style.bestFor ? (
                          <div className="flex items-start gap-2 text-sm font-semibold leading-5 text-secondary-600">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{style.best_for || style.bestFor}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Divider + button */}
                      <div className="mt-auto border-t border-neutral-100 pt-4">
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <Button className="h-9 text-sm px-4" disabled>
                              <Check className="h-3.5 w-3.5" />
                              Selected
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="primary"
                              className="h-9 text-sm px-4"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectionError(false);
                                onSelectStyleId(style.id || style.slug);
                              }}
                            >
                              Select
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveItineraryId(style.id || style.slug);
                            }}
                            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-4"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            See itinerary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {isMobile && styles.length > 1 && !showAllStyles ? (
              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(7, styles.length) }, (_, i) => {
                  const maxDots = Math.min(7, styles.length);
                  const start = Math.max(0, Math.min(carouselIndex - Math.floor(maxDots / 2), styles.length - maxDots));
                  const dotIndex = start + i;
                  const isActive = dotIndex === carouselIndex;
                  return (
                    <button
                      key={`route-dot-${dotIndex}`}
                      type="button"
                      onClick={() => {
                        const track = carouselRef.current;
                        const card = track?.querySelector("[data-route-card]");
                        if (!track || !card) return;
                        const cardWidth = card.getBoundingClientRect().width;
                        track.scrollTo({ left: dotIndex * cardWidth, behavior: "smooth" });
                        setHasSwiped(true);
                      }}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition",
                        isActive ? "bg-secondary-900" : "bg-secondary-300"
                      )}
                      aria-label={`Go to route ${dotIndex + 1}`}
                    />
                  );
                })}
              </div>
            ) : null}
            {isMobile && !hasSwiped && styles.length > 1 && !showAllStyles ? (
              <div className="mt-2 flex items-center justify-center gap-1 text-sm text-secondary-300">
                <ChevronLeft className="h-3 w-3" />
                <span>Swipe</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            ) : null}
            {isMobile && !showAllStyles && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllStyles(true)}
                  className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  View all routes
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
            {isMobile && showAllStyles && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => { setShowAllStyles(false); setHasSwiped(false); }}
                  className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  <ChevronUp className="h-4 w-4" />
                  Back to slider
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-secondary-500">
            Routes are temporarily unavailable for the selected filters. Try another date or check again soon.
          </div>
        )}
      </div>
      {selectedStyleId && scheduleByStyleId[selectedStyleId] ? (
        <div className="mt-16" id="tour-details-section">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Tour details</h2>
            <p className="mt-2 text-base text-secondary-500">
              Review schedule, whats included, pickup, and safety then reserve.
            </p>
          </div>
          {(() => {
            const schedule = scheduleByStyleId[selectedStyleId];
            const style = styles.find(s => String(s.id) === String(selectedStyleId) || s.slug === selectedStyleId);
            const note = addOnNoteByStyleId[selectedStyleId];
            return (
              <TourDetailsCard
                style={style}
                schedule={schedule}
                note={note}
                restaurant={selectedRestaurantData || style?.restaurant}
                onAnotherRoute={() => document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                onContinue={onContinue}
                continueLabel="Choose your boat"
              />
            );
          })()}
        </div>
      ) : null}
      <ScheduleModal
        isOpen={!!activeItinerarySchedule}
        onClose={() => setActiveItineraryId(null)}
        title={activeItinerarySchedule?.popupTitle || activeItinerarySchedule?.title}
        note={activeItineraryNote}
        schedule={activeItinerarySchedule}
        restaurantData={activeRestaurantData || activeItineraryStyle?.restaurant}
        routeRestaurant={getRouteRestaurantDetails(activeItineraryStyle)}
        onRestaurantClick={(r) => setRestaurantDataPopup(r)}
        sectionLabels={{ beforeLunch: "Morning", afterLunch: "Midday & Afternoon" }}
      />
      <RestaurantModal
        restaurantData={restaurantDataPopup}
        onClose={() => setRestaurantDataPopup(null)}
      />
      <RestaurantModal
        restaurantData={restaurantModalStyle?.restaurant}
        onClose={() => setRestaurantModalStyle(null)}
      />
    </Section >
  );
}


function StepTransfers({
  transfers,
  selectedTransferId,
  onSelectTransferId,
  covers,
  selectedCoverId,
  onSelectCoverId,
  totalGuests,
  onContinue,
  embedded = false,
  showContinue = true,
  showCovers = true,
  showHeader = true,
  framed = true,
  pickupAddress = "",
  onSetPickupAddress,
  dropoffAddress = "",
  onSetDropoffAddress,
}) {
  const [sameAddress, setSameAddress] = useState(false);
  const [skipAddress, setSkipAddress] = useState(false);

  const handleSkipAddressChange = (checked) => {
    setSkipAddress(checked);
    if (checked && onSetPickupAddress) onSetPickupAddress("");
  };

  const handleSameAddressChange = (checked) => {
    setSameAddress(checked);
    if (checked && onSetDropoffAddress) onSetDropoffAddress(pickupAddress);
  };

  const handlePickupChange = (val) => {
    if (val) setSkipAddress(false);
    if (onSetPickupAddress) onSetPickupAddress(val);
    if (sameAddress && onSetDropoffAddress) onSetDropoffAddress(val);
  };
  const selectedTransfer = transfers?.find((t) => String(t.id) === String(selectedTransferId));
  const [activeTransferDetails, setActiveTransferDetails] = useState(null);
  const transferOptions = (
    <div className="flex flex-col divide-y divide-neutral-100">
      {/* Option: No thanks */}
      <label className={cn(
        "group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all",
        !selectedTransferId ? "bg-primary-50/30" : "hover:bg-neutral-50"
      )}>
        <input
          type="radio"
          name="transfer-selection-step"
          className="hidden"
          checked={!selectedTransferId}
          onChange={() => onSelectTransferId(null)}
        />
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center">
            <MapPin className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-colors", !selectedTransferId ? "text-primary-600" : "text-secondary-400")} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-secondary-900 sm:text-base">No, thanks. We'll meet you there.</div>
            <div className="mt-1 text-sm font-medium text-secondary-500">Self-arrival at the meeting point</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center">
          <div className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
            !selectedTransferId
              ? "border-primary-600 bg-primary-600"
              : "border-neutral-200 bg-white"
          )}>
            {!selectedTransferId && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
      </label>
      {/* Transfer Options */}
      {transfers && transfers.map((transfer) => {
        const unitPrice = Number(transfer.price || 0);
        const cars = unitPrice > 0 ? Math.ceil(totalGuests / 5) : 0;
        const totalTransferPrice = unitPrice * (cars || 1);
        const isSelected = String(selectedTransferId) === String(transfer.id);
        const finalName = transfer.name;
        const transferName = String(transfer.name || "").toLowerCase();
        const isPickupDropoffTransfer = /pick[\s-]?up|drop[\s-]?off/.test(transferName);
        const transferCapacityHint = isPickupDropoffTransfer && cars > 1
          ? `${cars} cars for ${totalGuests} guests`
          : "";
        const transferDetails = buildOptionDetails(transfer, {
          extraDescription: transferCapacityHint,
          fallbackDescription: "Transfer details will be confirmed after booking.",
          fallbackImage: TRANSFER_DETAILS_FALLBACK_IMAGE,
        });
        const hasTransferDetails = Boolean(transferDetails.description || transferDetails.image);
        const needsPickup = isSelected && (String(transfer.id) === "1" || String(transfer.id) === "2");
        const needsDropoff = isSelected && String(transfer.id) === "2";
        return (
          <div key={transfer.id}>
            <label className={cn(
              "group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all",
              isSelected ? "bg-primary-50/30" : "hover:bg-neutral-50"
            )}>
              <input
                type="radio"
                name="transfer-selection-step"
                className="hidden"
                checked={isSelected}
                onChange={() => onSelectTransferId(transfer.id)}
              />
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center">
                  <Car className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-colors", isSelected ? "text-primary-600" : "text-secondary-400")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-secondary-900 sm:text-base">{finalName}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-secondary-900 tabular-nums sm:text-base">
                      {formatIDR(totalTransferPrice)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary-600">group price</span>
                  </div>
                  {hasTransferDetails && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveTransferDetails({
                          title: finalName,
                          description: transfer.description || transfer.short_description || transferDetails.description,
                          image: transferDetails.image,
                        });
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                      aria-label={`See transfer details for ${finalName}`}
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>See full description</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-center">
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "border-primary-600 bg-primary-600"
                    : "border-neutral-200 bg-white"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
            </label>
            {needsPickup && (
              <div className="border-t border-neutral-100 px-5 pb-4 pt-3 space-y-3 sm:pl-22 sm:pr-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Pickup address</label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    placeholder="Enter your hotel or villa address"
                    className={cn("mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none", skipAddress && "hidden")}
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={skipAddress}
                      onChange={(e) => handleSkipAddressChange(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600"
                    />
                    <span className="text-xs text-secondary-400">Skip for now — add address in your account later</span>
                  </label>
                </div>
                {needsDropoff && !skipAddress && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Dropoff address</label>
                    {!sameAddress && (
                      <input
                        type="text"
                        value={dropoffAddress}
                        onChange={(e) => onSetDropoffAddress && onSetDropoffAddress(e.target.value)}
                        placeholder="Enter your dropoff address"
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none"
                      />
                    )}
                    <label className="mt-2 flex cursor-pointer items-center gap-2">
                      <input
                        id="private-transfer-same-address"
                        type="checkbox"
                        checked={sameAddress}
                        onChange={(e) => handleSameAddressChange(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600"
                      />
                      <span className="text-xs text-secondary-400">Same address for pickup and dropoff</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  const content = (
    <div className="flex flex-col gap-4">
      <div className={cn(framed && "overflow-hidden rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md")}>
        {showHeader && (
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <div className="text-base sm:text-xl font-semibold text-secondary-900">Transfer</div>
              <div className="text-sm text-secondary-500">
                {selectedTransfer ? selectedTransfer.name : "Optional add pickup"}
              </div>
            </div>
          </div>
        )}
        <div className={cn(showHeader && framed && "border-t border-neutral-200")}>
          {transferOptions}
        </div>
      </div>
      <InfoDetailModal
        data={activeTransferDetails ? { ...activeTransferDetails, subtitle: "Pickup and route information" } : null}
        onClose={() => setActiveTransferDetails(null)}
      />
      {showCovers && (
        <CoversCompact
          covers={covers}
          selectedCoverId={selectedCoverId}
          onSelectCoverId={onSelectCoverId}
          priceLabel="per boat"
          formatPrice={formatIDR}
          showHeader={showHeader}
          framed={framed}
        />
      )}
      {
        showContinue && (
          <div className="flex justify-end">
            <button
              onClick={onContinue}
              className="btn-primary inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg"
            >
              Continue to Extras
            </button>
          </div>
        )
      }
    </div >
  );

  if (embedded) return content;

  return (
    <Section
      id="step-4"
      title="How will you get there?"
      subtitle="We can arrange a private car or minivan to pick you up."
      kicker="STEP 4 OF 5"
      backgroundClassName={SECTION_BACKGROUNDS.mist}
    >
      {content}
    </Section>
  );
}
function StepExtras({
  selectedStyleId,
  selectedStyleTitle,
  transfers,
  selectedTransferId,
  onSelectTransferId,
  covers,
  selectedCoverId,
  onSelectCoverId,
  totalGuests,
  extrasCatalog,
  selectedExtras,
  isSelectionModalOpen,
  setIsSelectionModalOpen,
  isManageExtrasOpen,
  setIsManageExtrasOpen,
  onChangeExtraQty,
  adults,
  onOpenTourInfo,
  highlightExtraId,
  styleRecommendations = {},
  onReview,
  onSkip,
  sectionId = "step-6",
  pickupAddress = "",
  onSetPickupAddress,
  dropoffAddress = "",
  onSetDropoffAddress,
}) {
  const { categories, privateRoutes } = useExtras();
  const contacts = useSiteContacts();
  const styleKeyById = {
    "classic-route": "classic",
    "family-first": "family_easygoing",
    "celebration-day": "celebration",
    "dive-highlights": "manta_first",
    "watersport-day": "snorkel_focused",
    "chill-relax": "relaxed_scenic",
  };
  const getExtraByName = (name) => {
    const exact = extrasCatalog.find((extra) => extra.name === name);
    if (exact) return exact;
    return extrasCatalog.find((extra) => extra.name.toLowerCase() === name.toLowerCase()) || null;
  };
  const recommendedExtras = useMemo(() => {
    const key = selectedStyleId ? (styleKeyById[selectedStyleId] || "classic") : "classic";
    const list = styleRecommendations[key] || styleRecommendations.classic || ["Photographer", "GoPro rental", "Private transfer"];
    const result = [];
    const used = new Set();
    list.forEach((name) => {
      let matchName = name;
      if (key === "celebration" && name === "Photographer") {
        const pro = getExtraByName("Pro photographer");
        if (pro) matchName = "Pro photographer";
      }
      const extra = getExtraByName(matchName);
      if (!extra || used.has(extra.id)) return;
      used.add(extra.id);
      result.push(extra);
    });
    const preferredExtraByStyleId = {
      "dive-highlights": "Wetsuit",
      "watersport-day": "GoPro rental",
    };
    const preferredName = selectedStyleId ? preferredExtraByStyleId[selectedStyleId] : null;
    if (preferredName) {
      const preferredExtra = getExtraByName(preferredName);
      if (preferredExtra) {
        const filtered = result.filter((extra) => extra.id !== preferredExtra.id);
        filtered.unshift(preferredExtra);
        return filtered.slice(0, 6);
      }
    }
    return result.slice(0, 6);
  }, [selectedStyleId, extrasCatalog]);
  const recommendedIds = useMemo(() => new Set(recommendedExtras.map((extra) => extra.id)), [recommendedExtras]);
  const allExtras = useMemo(
    () => extrasCatalog.filter((extra) => !recommendedIds.has(extra.id)),
    [extrasCatalog, recommendedIds]
  );
  const [extrasFilter, setExtrasFilter] = useState("all");
  const [extrasVisibleCount, setExtrasVisibleCount] = useState(3);
  const [activeExtraId, setActiveExtraId] = useState(null);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const closeManageExtras = useCallback(() => {
    setIsManageExtrasOpen?.(false);
  }, [setIsManageExtrasOpen]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const extraCategories = useMemo(() => {
    // Route-grouped categories (from Route model)
    if (privateRoutes && privateRoutes.length > 0) {
      const cats = [{ id: "all", label: "All", show_name: "All" }];
      privateRoutes.forEach(route => {
        if (route.ecategories && route.ecategories.length > 0) {
          route.ecategories.forEach(cat => {
            const globalCat = categories?.find((c) => c.id == cat.id);
            const name = globalCat?.show_name || cat.show_name || globalCat?.name || cat.name;
            const label = privateRoutes.length > 1 ? `${name} (${route.title})` : name;
            cats.push({ id: String(cat.id), label: label, routeTitle: route.title, show_name: name });
          });
        }
      });
      const uniqueCats = Array.from(new Map(cats.map(cat => [cat.id, cat])).values());
      return uniqueCats;
    }
    // 3. Global categories from ExtrasContext (legacy fallback)
    if (categories && categories.length > 0) {
      const cats = [{ id: "all", label: "All", show_name: "All" }];
      categories.forEach(cat => {
        cats.push({ id: String(cat.id), label: cat.show_name || cat.name, show_name: cat.show_name || cat.name });
      });
      const uniqueCats = Array.from(new Map(cats.map(cat => [cat.id, cat])).values());
      return uniqueCats;
    }
    // 4. Hardcoded fallback
    return [
      { id: "all", label: "All" },
      { id: "comfort", label: "Comfort" },
      { id: "photo", label: "Photo & video" },
      { id: "celebration", label: "Celebration" },
      { id: "snorkel", label: "Snorkel" },
      { id: "transfer", label: "Transfer" },
    ];
  }, [categories, privateRoutes]);
  const extraCategoryById = useMemo(
    () => ({
      photographer: "photo",
      "pro-photographer": "photo",
      "gopro-rental": "photo",
      "underwater-photo": "photo",
      drone: "photo",
      "champagne-setup": "celebration",
      decorations: "celebration",
      wetsuit: "snorkel",
      "extra-snorkel-guide": "snorkel",
      "private-transfer": "comfort",
      "extra-towels": "comfort",
      "snack-box": "comfort",
      "floating-breakfast": "comfort",
      "towel-kit": "comfort",
    }),
    []
  );
  const combinedExtras = useMemo(() => [...recommendedExtras, ...allExtras], [recommendedExtras, allExtras]);
  const filteredExtras = useMemo(() => {
    let base = combinedExtras;
    if (extrasFilter !== "all") {
      base = combinedExtras.filter((extra) => (extra.category || extraCategoryById[extra.id] || "comfort") === extrasFilter);
    }
    return base;
  }, [combinedExtras, extrasFilter, extraCategoryById]);
  const extrasPreviewLimit = 3;
  const extrasIncrementCount = 5;
  const extrasExpandedVisibleLimit = 8;
  useEffect(() => {
    setExtrasVisibleCount(extrasPreviewLimit);
  }, [extrasFilter]);
  const visibleExtras = useMemo(
    () => filteredExtras.slice(0, extrasVisibleCount),
    [extrasVisibleCount, filteredExtras]
  );
  const hasMoreExtras = visibleExtras.length < filteredExtras.length;
  const nextExtrasChunkCount = Math.min(extrasIncrementCount, filteredExtras.length - visibleExtras.length);
  const extrasFilterCounts = useMemo(() => {
    return extraCategories.reduce((acc, filter) => {
      if (filter.id === "all") {
        acc[filter.id] = combinedExtras.length;
        return acc;
      }
      acc[filter.id] = combinedExtras.filter(
        (extra) => (extra.category || extraCategoryById[extra.id] || "comfort") === filter.id
      ).length;
      return acc;
    }, {});
  }, [combinedExtras, extraCategories, extraCategoryById]);
  const formatPrice = (extra) => formatIDR(extra.price);
  const getUnitLabel = (extra) => (extra.pricingType === "per_person" ? "per guest" : "per group");
  const getDefaultQty = (extra) => {
    if (extra.pricingType === "per_person") {
      return Math.max(1, adults || 0);
    }
    return 1;
  };
  const getWhyRecommended = (extra) => {
    const reasons = {
      photographer: "Why recommended: capture the day with zero effort.",
      "pro-photographer": "Why recommended: premium shots for your highlights.",
      "gopro-rental": "Why recommended: hands-free footage in the water.",
      "underwater-photo": "Why recommended: clean underwater moments.",
      drone: "Why recommended: cinematic aerial angles.",
      "private-transfer": "Why recommended: smoothest start and finish.",
      "extra-towels": "Why recommended: extra comfort on the ride back.",
      "snack-box": "Why recommended: light fuel between stops.",
      "floating-breakfast": "Why recommended: photo-ready start to the day.",
      decorations: "Why recommended: instant celebration feel.",
      "champagne-setup": "Why recommended: polished celebration moment.",
      wetsuit: "Why recommended: warmer, longer water time.",
      "extra-snorkel-guide": "Why recommended: calmer, guided snorkeling.",
      "towel-kit": "Why recommended: fresh towels for the group.",
    };
    return reasons[extra.id] || "Why recommended: complements your day style.";
  };
  const getWhyRecommendedShort = (extra) => getWhyRecommended(extra).replace(/^Why recommended:\s*/i, "").trim();
  const splitDescription = (description) => {
    if (!description) return [];
    const cleaned = description.replace(/\.$/, "").trim();
    const patterns = [
      { key: " delivered in ", prefix: "Delivered in " },
      { key: " for ", prefix: "For " },
      { key: " with ", prefix: "With " },
      { key: " + ", prefix: "" },
      { key: "  ", prefix: "" },
    ];
    for (const pattern of patterns) {
      if (!cleaned.includes(pattern.key)) continue;
      const [first, second] = cleaned.split(pattern.key);
      const firstTrim = first.trim();
      const secondTrim = second.trim();
      if (firstTrim && secondTrim) {
        const secondLine = pattern.prefix ? `${pattern.prefix}${secondTrim}` : secondTrim;
        return [firstTrim, secondLine];
      }
    }
    return [cleaned];
  };
  const getExtraBullets = (extra) => {
    const parts = splitDescription(extra?.description || "");
    const bullets = parts.length > 1 ? [parts[1]] : [];
    const why = getWhyRecommendedShort(extra);
    if (why) bullets.push(why);
    return bullets.filter(Boolean).slice(0, 3);
  };
  const extraImageById = {
    photographer: "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg",
    "pro-photographer": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg",
    "gopro-rental": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bfa/68f9edbfa78c6752273466.jpg",
    "private-transfer": "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
    "underwater-photo": "https://bluuu.tours/storage/app/uploads/public/689/1c7/443/6891c7443ce71322934836.webp",
    "extra-towels": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
    "snack-box": "https://bluuu.tours/storage/app/uploads/public/688/ba4/a84/thumb_194_400_400_0_0_crop.webp",
    "floating-breakfast": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
    decorations: "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
    wetsuit: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
    "extra-snorkel-guide": "https://bluuu.tours/storage/app/uploads/public/689/1c7/443/6891c7443ce71322934836.webp",
    "towel-kit": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
    "champagne-setup": "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
    drone: "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
  };
  const extraFallbackImage = "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";
  const extrasLookupById = useMemo(() => {
    return extrasCatalog.reduce((acc, extra) => {
      acc[extra.id] = extra;
      if (extra.children?.length) {
        extra.children.forEach((child) => {
          acc[child.id] = {
            ...child,
            pricingType: extra.pricingType || "per_booking",
            category: extra.category,
            categoryIds: extra.categoryIds,
            categoryName: extra.categoryName,
            parentId: extra.id,
            parentName: extra.name,
            hasChildren: false,
          };
        });
      }
      return acc;
    }, {});
  }, [extrasCatalog]);
  const extrasSummaryList = useMemo(() => {
    return Object.entries(selectedExtras)
      .map(([id, qty]) => {
        const quantity = Number(qty) || 0;
        if (quantity <= 0) return null;
        const extra = extrasLookupById[id];
        if (!extra) return null;
        return { ...extra, quantity };
      })
      .filter(Boolean);
  }, [selectedExtras, extrasLookupById]);
  const selectedTransferItem = useMemo(() => {
    if (!selectedTransferId) return null;
    const transfer = transfers?.find((t) => String(t.id) === String(selectedTransferId));
    if (!transfer) return null;
    const price = Number(transfer.price || 0);
    const quantity = price > 0 ? Math.ceil(totalGuests / 5) : 1;
    return {
      id: `transfer-${transfer.id}`,
      kind: "transfer",
      name: transfer.name,
      price,
      pricingType: "per_booking",
      quantity,
    };
  }, [selectedTransferId, transfers, totalGuests]);
  const selectedCoverItem = useMemo(() => {
    if (!selectedCoverId) return null;
    const cover = covers?.find((c) => String(c.id) === String(selectedCoverId));
    if (!cover) return null;
    return {
      id: `cover-${cover.id}`,
      kind: "cover",
      name: cover.name,
      price: Number(cover.price || 0),
      pricingType: "per_booking",
      quantity: 1,
    };
  }, [selectedCoverId, covers, totalGuests]);
  const selectedAddonsList = useMemo(() => {
    const list = extrasSummaryList.map((extra) => ({ ...extra, kind: "extra" }));
    if (selectedTransferItem) list.push(selectedTransferItem);
    if (selectedCoverItem) list.push(selectedCoverItem);
    return list;
  }, [extrasSummaryList, selectedTransferItem, selectedCoverItem]);
  const transferSummary = selectedTransferItem?.name || "Not selected";
  const insuranceSummary = selectedCoverItem?.name || "Not selected";
  const transferCoverSummary = [
    selectedTransferItem ? `Transfer: ${selectedTransferItem.name}` : "Transfer: not selected",
    selectedCoverItem ? `Insurance: ${selectedCoverItem.name}` : "Insurance: not selected",
  ].join(" · ");
  const selectedAddonsSubtotal = useMemo(() => {
    return selectedAddonsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [selectedAddonsList]);
  const extrasSummaryLine = extrasSummaryList.length
    ? `${extrasSummaryList
      .slice(0, 2)
      .map((extra) => `${extra.name} ${extra.quantity}`)
      .join(", ")}${extrasSummaryList.length > 2 ? ` +${extrasSummaryList.length - 2} more` : ""}`
    : "No extras selected";
  const extrasSubtotal = useMemo(() => {
    return extrasSummaryList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [extrasSummaryList]);
  const handleRemoveItem = (id) => {
    onChangeExtraQty(id, 0);
  };
  const handleRemoveSelectedItem = (item) => {
    if (item.kind === "transfer") {
      onSelectTransferId(null);
      return;
    }
    if (item.kind === "cover") {
      onSelectCoverId(null);
      return;
    }
    handleRemoveItem(item.id);
  };
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const renderExtraRow = (extra, isChild = false) => {
    const qty = selectedExtras[extra.id] || 0;
    const isHighlighted = extra.id === highlightExtraId;
    const defaultQty = getDefaultQty(extra);
    return (
      <div
        key={extra.id}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 transition duration-200 ease-out sm:px-5 sm:py-3",
          isHighlighted ? "bg-neutral-100" : "hover:bg-neutral-50"
        )}
      >
        <div
          onClick={(e) => {
            e.preventDefault();
            setActiveExtraId(extra.id);
          }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-50 sm:h-14 sm:w-14">
            <img
              src={
                extra.images_with_thumbs?.[0]?.thumb ||
                extraImageById[extra.id] ||
                extraImageById[extra.name?.toLowerCase().replace(/\s+/g, "-")] ||
                extraFallbackImage
              }
              srcSet={extra.images_with_thumbs?.[0]?.thumb_small ? `${extra.images_with_thumbs[0].thumb_small} 200w, ${extra.images_with_thumbs[0].thumb} 400w` : undefined}
              sizes="56px"
              alt={extra.name}
              className="h-full w-full object-cover transition duration-200 ease-out group-hover:saturate-110"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="line-clamp-1 text-xs leading-tight font-bold leading-tight text-secondary-900 sm:line-clamp-2 sm:text-base sm:leading-tight">
              {extra.name}
            </div>
            {/* <div
              className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-secondary-500 sm:mt-1 sm:line-clamp-2 sm:text-sm sm:leading-normal"
              dangerouslySetInnerHTML={{ __html: extra.description }}
            /> */}
            <div className="mt-0.5 flex items-center gap-2">
              <div className="text-sm font-medium text-secondary-500 tabular-nums">
                {extra.hasChildren ? `from ${formatPrice(extra)}` : formatPrice(extra)}
              </div>
              {/* {extra.hasChildren && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-primary-50 px-1.5 py-0.5 text-xs font-bold text-primary-700">
                  {extra.children.length} options 
                </span>
              )} */}
            </div>
          </div>
        </div>
        <div className="flex w-90px shrink-0 flex-col items-end justify-center gap-1 sm:w-104px">
          {extra.hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveExtraId(extra.id);
              }}
              className="inline-flex h-9 w-full items-center justify-center rounded-full border border-primary-50 bg-neutral-100 px-2.5 text-xs font-bold text-blue-600 transition duration-200 ease-out hover:bg-white active:scale-95 sm:h-10 sm:px-3 sm:text-sm"
            >
              {extra.children.length} options
            </button>
          ) : qty > 0 ? (
            <div className="flex items-center gap-2 sm:w-full sm:justify-end">
              <div className="inline-flex h-9 w-full items-center justify-between rounded-full border border-neutral-200 bg-white px-2 text-secondary-900 shadow-sm sm:h-10 sm:px-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeExtraQty(extra.id, qty - 1);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition-colors hover:text-primary-600 active:scale-90 sm:h-8 sm:w-8"
                  aria-label={`Decrease ${extra.name}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-6 text-center text-base font-bold leading-none text-secondary-900 sm:min-w-7 sm:text-lg">
                  {qty}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeExtraQty(extra.id, qty + 1);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition-colors hover:text-primary-600 active:scale-90 sm:h-8 sm:w-8"
                  aria-label={`Increase ${extra.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeExtraQty(extra.id, defaultQty);
              }}
              className="inline-flex h-9 w-full items-center justify-center rounded-full border border-primary-50 bg-neutral-100 px-2.5 text-sm font-bold text-primary-600 transition duration-200 ease-out hover:bg-white active:scale-95 sm:h-10 sm:px-3"
            >
              Add
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <PremiumSection
        id={sectionId}
        className="bg-transparent"
      >
        <PremiumContainer>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">STEP 4 OF 4</div>
            <h2 className={Q_THEME.text.h2}>Extras, transfer & insurance</h2>
            <p className={Q_THEME.text.body}>You can add this anytime after booking.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div
                id={`${sectionId}-extras-anchor`}
                className={cn(
                  "sticky top-0 z-10 overflow-hidden bg-white/90 backdrop-blur-md",
                  isExtrasOpen
                    ? "rounded-t-xl border-x border-t border-neutral-200"
                    : "rounded-xl border border-neutral-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => setIsExtrasOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50"
                  aria-expanded={isExtrasOpen}
                  aria-controls={`${sectionId}-extras-panel`}
                >
                  <div className="min-w-0">
                    <div className="text-base sm:text-xl font-semibold text-secondary-900">
                      {selectedStyleId ? `Recommended for ${selectedStyleTitle}` : "Popular extras"}
                    </div>
                    <div className="mt-1 text-sm text-secondary-500">
                      {selectedStyleId ? "You can still add any extras you want." : "Optional  add only what you want."}
                    </div>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-700">
                    {isExtrasOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
              </div>
              <div className={cn("flex flex-col gap-4", !isExtrasOpen && "mt-4")}>
                <AnimatePresence initial={false}>
                  {isExtrasOpen && (
                    <motion.div
                      id={`${sectionId}-extras-panel`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden rounded-b-xl border border-t-0 border-neutral-200 bg-white"
                    >
                      <div className="border-b border-neutral-200 px-6 py-3">
                        <div className="flex items-center gap-x-5 gap-y-2 overflow-x-auto text-sm text-secondary-500 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                          {extraCategories.map((filter) => (
                            <button
                              key={filter.id}
                              type="button"
                              onClick={() => setExtrasFilter(filter.id)}
                              className={cn(
                                "inline-flex items-center gap-1 whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-semibold transition duration-200 ease-out -mb-px",
                                extrasFilter === filter.id
                                  ? "border-primary-600 text-primary-600 hover:text-primary-700"
                                  : "text-secondary-500 hover:text-secondary-700"
                              )}
                            >
                              {filter.show_name || filter.label}
                              <span className={cn("text-sm", extrasFilter === filter.id ? "text-primary-600" : "text-secondary-500")}>
                                {extrasFilterCounts[filter.id] ?? 0}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "divide-y divide-neutral-200",
                          extrasVisibleCount > extrasExpandedVisibleLimit && filteredExtras.length > extrasExpandedVisibleLimit && "max-h-[40rem] overflow-y-auto"
                        )}
                      >
                        {visibleExtras.map((extra) => renderExtraRow(extra))}
                      </div>
                      {hasMoreExtras && (
                        <div className="flex justify-center border-t border-neutral-200 py-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExtrasVisibleCount((prev) => Math.min(prev + extrasIncrementCount, filteredExtras.length))
                            }
                            className="inline-flex items-center justify-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                          >
                            Show more ({nextExtrasChunkCount})
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsTransferOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50"
                    aria-expanded={isTransferOpen}
                    aria-controls={`${sectionId}-transfer-panel`}
                  >
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl font-semibold text-secondary-900">Transfer</div>
                      <div className="mt-1 text-sm text-secondary-500">{transferSummary}</div>
                    </div>
                    <span className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-700">
                      {isTransferOpen ? <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isTransferOpen && (
                      <motion.div
                        id={`${sectionId}-transfer-panel`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden border-t border-neutral-200"
                      >
                        <StepTransfers
                          embedded
                          showContinue={false}
                          showCovers={false}
                          showHeader={false}
                          framed={false}
                          transfers={transfers}
                          selectedTransferId={selectedTransferId}
                          onSelectTransferId={onSelectTransferId}
                          covers={covers}
                          selectedCoverId={selectedCoverId}
                          onSelectCoverId={onSelectCoverId}
                          totalGuests={totalGuests}
                          pickupAddress={pickupAddress}
                          onSetPickupAddress={onSetPickupAddress}
                          dropoffAddress={dropoffAddress}
                          onSetDropoffAddress={onSetDropoffAddress}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsInsuranceOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50"
                    aria-expanded={isInsuranceOpen}
                    aria-controls={`${sectionId}-insurance-panel`}
                  >
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl font-semibold text-secondary-900">Insurance</div>
                      <div className="mt-1 text-sm text-secondary-500">{insuranceSummary}</div>
                    </div>
                    <span className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-700">
                      {isInsuranceOpen ? <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isInsuranceOpen && (
                      <motion.div
                        id={`${sectionId}-insurance-panel`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden border-t border-neutral-200"
                      >
                        <CoversCompact
                          covers={covers}
                          selectedCoverId={selectedCoverId}
                          onSelectCoverId={onSelectCoverId}
                          priceLabel="per boat"
                          formatPrice={formatIDR}
                          showHeader={false}
                          framed={false}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <TourInfoInline />
                {onReview && (
                  <div className="mt-3 flex justify-center sm:justify-end">
                    <button
                      type="button"
                      onClick={onReview}
                      className="btn-primary w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg"
                    >
                      Review your booking <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PremiumContainer>
      </PremiumSection>
      <Modal
        isOpen={!!isManageExtrasOpen}
        onClose={closeManageExtras}
        maxWidth="max-w-3xl"
        bodyClassName="p-0"
        showClose={false}
      >
        <div className="flex h-full w-full flex-col overflow-hidden bg-white p-0">
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3 sm:px-5 sm:py-4">
            <div>
              <div className="text-base font-semibold text-secondary-900">Manage selected add-ons</div>
              <div className="mt-1 text-sm text-secondary-500">{selectedAddonsList.length} items selected</div>
            </div>
            <button
              type="button"
              onClick={closeManageExtras}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-secondary-600" />
            </button>
          </div>
          {/* Content */}
          <div
            className={cn(
              "overflow-y-auto px-4 py-2 sm:px-5 sm:py-3 custom-scrollbar",
              selectedAddonsList.length > 0 ? "flex-1" : ""
            )}
          >
            {selectedAddonsList.length > 0 ? (
              selectedAddonsList.map((extra) => (
                <div key={`manage-${extra.id}`} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-sm font-bold text-secondary-900">{extra.name}</div>
                    <div className="text-xs text-secondary-500 mt-0.5">
                      {extra.quantity}  {formatPrice(extra)} ({getUnitLabel(extra)})
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-secondary-900 tabular-nums">
                      {formatIDR(extra.price * extra.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedItem(extra)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-secondary-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-secondary-600 sm:py-8">
                No extras, transfer, or insurance selected.
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="shrink-0 border-t border-neutral-200 p-4 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-secondary-900">Selected add-ons subtotal</span>
                <span className="text-lg font-bold text-primary-600">{formatIDR(selectedAddonsSubtotal)}</span>
              </div>
              <button
                onClick={closeManageExtras}
                className="btn-primary inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <ExtraPopup
        activeExtraId={activeExtraId}
        setActiveExtraId={setActiveExtraId}
        extrasCatalog={extrasCatalog}
        selectedExtras={selectedExtras}
        onChangeExtraQty={onChangeExtraQty}
        formatIDR={formatIDR}
      />
    </>
  );
}
function WhyBookNow() {
  const trustItems = [
    {
      icon: Ticket,
      title: "Lock today's rate",
      description: "Prices can rise — secure the current rate.",
    },
    {
      icon: Calendar,
      title: "Stay flexible",
      description: "Cancel anytime or reschedule with ease.",
    },
    {
      icon: Clock,
      title: "Smart decision",
      description: "Reserve now and keep full flexibility.",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="px-5 py-4">
        <div className="text-base font-semibold text-secondary-900">Why book now</div>
      </div>
      <div className="grid border-t border-neutral-200 sm:grid-cols-3">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-4 p-5",
                idx !== trustItems.length - 1 && "border-b border-neutral-200 sm:border-b-0 sm:border-r sm:border-neutral-200"
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-secondary-900">{item.title}</div>
                <div className="mt-1 text-sm leading-relaxed text-secondary-500">{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepFive({
  dateLabel,
  dateMode,
  exactDate,
  rangeStart,
  rangeEnd,
  adults,
  kids,
  onDateModeChange,
  onExactDateChange,
  onRangeStartChange,
  onRangeEndChange,
  onAdultsChange,
  onKidsChange,
  groupSize,
  selectedBoat,
  selectedStyleTitle,
  selectedStyleId,
  selectedExtrasSummary,
  basePrice,
  guestFeeTotal,
  extrasSubtotalIDR,
  onReserve,
  onOpenTourInfo,
  onHighlightExtra,
  onOpenManageExtras,
  onChangeExtraQty,
  availabilityMap,
  calendarAvailMap,
  onCalendarMonthChange,
  selectedBoatId,
}) {
  const [activeEditor, setActiveEditor] = useState(null);
  const contacts = useSiteContacts();
  const isDateSelected = dateLabel && dateLabel !== "Date not selected";
  const isBoatSelected = Boolean(selectedBoat);
  const extrasCount = selectedExtrasSummary?.reduce((sum, extra) => sum + (extra.quantity || 0), 0) || 0;
  const extrasPreview = selectedExtrasSummary?.slice(0, 3) ?? [];
  const hasMoreExtras = (selectedExtrasSummary?.length ?? 0) > extrasPreview.length;
  const todayISO = useMemo(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }, []);
  const [draftDateMode, setDraftDateMode] = useState(dateMode);
  const [draftExactDate, setDraftExactDate] = useState(exactDate);
  const [draftRangeStart, setDraftRangeStart] = useState(rangeStart);
  const [draftRangeEnd, setDraftRangeEnd] = useState(rangeEnd);
  const [draftAdults, setDraftAdults] = useState(adults);
  const [draftKids, setDraftKids] = useState(kids);
  const draftRangeDays = useMemo(() => {
    if (!draftRangeStart || !draftRangeEnd) return 0;
    const start = new Date(draftRangeStart);
    const end = new Date(draftRangeEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [draftRangeStart, draftRangeEnd]);
  const isEditingDate = activeEditor === "date";
  const isEditingGuests = activeEditor === "guests";
  const openEditor = (target) => {
    if (target === "date") {
      setDraftDateMode("exact");
      setDraftExactDate(exactDate);
      setDraftRangeStart(rangeStart);
      setDraftRangeEnd(rangeEnd);
    }
    if (target === "guests") {
      setDraftAdults(adults);
      setDraftKids(kids);
    }
    setActiveEditor(target);
  };
  const closeEditor = () => {
    setActiveEditor(null);
  };
  const applyDateEdit = () => {
    onDateModeChange(draftDateMode);
    if (draftDateMode === "exact") {
      onExactDateChange(draftExactDate);
      onRangeStartChange("");
      onRangeEndChange("");
    } else {
      onRangeStartChange(draftRangeStart);
      onRangeEndChange(draftRangeEnd);
      onExactDateChange("");
    }
    closeEditor();
  };
  const applyGuestEdit = () => {
    onAdultsChange(draftAdults);
    onKidsChange(draftKids);
    closeEditor();
  };
  const isReserveEnabled = isDateSelected && isBoatSelected;
  const reserveLabel = !isDateSelected
    ? "Select date to continue"
    : !isBoatSelected
      ? "Select tour to continue"
      : "Reserve Now";
  const guestLabel = `${groupSize} guest${groupSize === 1 ? "" : "s"}`;
  const summaryRows = [
    {
      id: "date",
      label: "Date",
      icon: Calendar,
      value: isDateSelected ? dateLabel : "Not selected",
      action: isDateSelected ? "Edit" : "Select",
      onClick: () => openEditor("date"),
    },
    {
      id: "guests",
      label: "Guests",
      icon: Users,
      value: guestLabel,
      action: "Edit",
      onClick: () => openEditor("guests"),
    },
    {
      id: "boat",
      label: "Boat",
      icon: Ship,
      value: selectedBoat?.name ?? "Not selected",
      action: isBoatSelected ? "Change" : "Select",
      onClick: () => {
        const target = document.getElementById("step-3");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
    {
      id: "style",
      label: "Day style",
      icon: Sparkles,
      value: selectedStyleTitle || "Classic route",
      action: selectedStyleId ? "Change" : "Select",
      onClick: () => {
        const target = document.getElementById("step-2");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: Car,
      value: selectedExtrasSummary?.find(e => e.id.toString().startsWith('transfer-'))?.name || "Not selected",
      action: "Change",
      onClick: () => {
        const target = document.getElementById("step-6");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
    {
      id: "insurance",
      label: "Insurance",
      icon: ShieldCheck,
      value: selectedExtrasSummary?.find(e => e.id.toString().startsWith('cover-'))?.name || "Not selected",
      action: "Change",
      onClick: () => {
        const target = document.getElementById("step-6");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
  ];
  const handleRowClick = (row) => {
    if (row.id === "date" || row.id === "guests") {
      openEditor(row.id);
      return;
    }
    closeEditor();
    row.onClick?.();
  };
  const handleReserve = () => {
    if (!isReserveEnabled) return;
    onReserve?.();
  };
  return (
    <PremiumSection
      id="step-review"
      backgroundClassName={SECTION_BACKGROUNDS.mist}
    >
      <PremiumContainer>
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className={Q_THEME.text.h2}>Review your tour</h2>
          <p className={Q_THEME.text.body}>Confirm details before reserving.</p>
        </div>
        <InfoLinksRow onOpenTourInfo={onOpenTourInfo} className="mb-6" />
        <div className="mt-6 grid gap-8 lg:grid-cols-asymmetric-base">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-secondary-900">Your tour</div>
                    <div className="mt-1 text-sm text-secondary-500">A quick summary of your selections.</div>
                  </div>
                </div>
                <div className="mt-4 divide-y divide-neutral-200">
                  {summaryRows.map((row) => {
                    const isMuted = activeEditor && !((row.id === "date" && isEditingDate) || (row.id === "guests" && isEditingGuests));
                    const valueTone = row.value === "Not selected" ? "text-secondary-500" : "text-secondary-600";
                    const Icon = row.icon;
                    return (
                      <div key={row.id}>
                        <button
                          type="button"
                          onClick={() => handleRowClick(row)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 py-4 text-left transition",
                            isMuted && "opacity-55"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-50">
                              <Icon className="h-4 w-4 text-secondary-500" />
                            </span>
                            <span className="text-sm font-semibold text-secondary-900">{row.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn("text-sm", valueTone)}>{row.value}</span>
                            <span className="text-sm font-semibold text-primary-600">{row.action}</span>
                          </div>
                        </button>
                        {row.id === "date" && isEditingDate && (
                          <div className="mb-2 rounded-xl bg-neutral-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-secondary-900">Dates</div>
                                <div className="mt-1 text-sm text-secondary-500">Pick an exact day.</div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="space-y-2">
                                <span className="text-xs font-black uppercase tracking-widest text-secondary-300">Exact date</span>
                                <CustomDatePicker
                                  mode="single"
                                  selected={draftExactDate ? new Date(draftExactDate) : undefined}
                                  onSelect={(date) => {
                                    if (date) {
                                      const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                                      setDraftExactDate(iso);
                                    } else {
                                      setDraftExactDate("");
                                    }
                                  }}
                                  filterDate={(() => {
                                    const boatMap = selectedBoatId && calendarAvailMap ? calendarAvailMap[selectedBoatId] : null;
                                    if (!boatMap || Object.keys(boatMap).length === 0) return undefined;
                                    return (date) => {
                                      const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                                      const val = boatMap[iso];
                                      return val === undefined || Number(val) > 0;
                                    };
                                  })()}
                                  renderDayContents={(() => {
                                    const boatMap = selectedBoatId && calendarAvailMap ? calendarAvailMap[selectedBoatId] : null;
                                    if (!boatMap || Object.keys(boatMap).length === 0) return undefined;
                                    return (dayOfMonth, date) => {
                                      const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                                      const val = boatMap[iso];
                                      return (
                                        <>
                                          <span className="day-number">{dayOfMonth}</span>
                                          {val !== undefined && (
                                            <span className="day-sub">{Number(val) > 0 ? "open" : "full"}</span>
                                          )}
                                        </>
                                      );
                                    };
                                  })()}
                                  onMonthChange={onCalendarMonthChange}
                                  className="w-full rounded-xl border-2 border-neutral-200 bg-white shadow-sm overflow-hidden"
                                />
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" onClick={applyDateEdit} size="sm">
                                Apply
                              </Button>
                              <Button type="button" variant="secondary" onClick={closeEditor} size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {row.id === "guests" && isEditingGuests && (
                          <div className="mb-2 rounded-xl bg-neutral-50 p-4">
                            <div className="text-sm font-semibold text-secondary-900">Guests</div>
                            <div className="mt-1 text-sm text-secondary-500">Group size helps us show the right boats.</div>
                            <div className="mt-3 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                                    <Users className="h-5 w-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-secondary-900">Adults</span>
                                    <span className="text-xs font-semibold text-secondary-300">Ages 12+</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 rounded-full bg-neutral-100 p-1">
                                  <button
                                    type="button"
                                    onClick={() => setDraftAdults(Math.max(1, draftAdults - 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-secondary-900 hover:text-primary-600 transition-colors active:scale-95"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-5 text-center text-lg font-black text-secondary-900">{draftAdults}</span>
                                  <button
                                    type="button"
                                    onClick={() => setDraftAdults(draftAdults + 1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-secondary-900 hover:text-primary-600 transition-colors active:scale-95"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                                    <Users className="h-5 w-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-secondary-900">Kids</span>
                                    <span className="text-xs font-semibold text-secondary-300">Ages 3-11</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 rounded-full bg-neutral-100 p-1">
                                  <button
                                    type="button"
                                    onClick={() => setDraftKids(Math.max(0, draftKids - 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-secondary-900 hover:text-primary-600 transition-colors active:scale-95"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-5 text-center text-lg font-black text-secondary-900">{draftKids}</span>
                                  <button
                                    type="button"
                                    onClick={() => setDraftKids(draftKids + 1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-secondary-900 hover:text-primary-600 transition-colors active:scale-95"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button type="button" onClick={applyGuestEdit} size="sm">
                                Apply
                              </Button>
                              <Button type="button" variant="secondary" onClick={closeEditor} size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-neutral-200 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-secondary-900">Extras ({extrasCount})</div>
                    <div className="mt-1 text-sm text-secondary-500">Optional add-ons for your day.</div>
                  </div>

                </div>
                <div className="mt-4 text-sm text-secondary-600">
                  {selectedExtrasSummary?.length ? (
                    <div className="space-y-1">
                      {selectedExtrasSummary.map((extra) => (
                        <div key={extra.id} className="flex items-center gap-2 rounded-lg py-1.5 hover:bg-neutral-50 group">
                          <span className="flex-1 min-w-0 text-secondary-500 font-medium truncate">{extra.name} <span className="text-secondary-900">×{extra.quantity}</span></span>
                          <span className="font-bold text-secondary-900 shrink-0">{formatIDR(extra.price * extra.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => onChangeExtraQty(extra.id, 0)}
                            className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-300 hover:border-red-200 hover:text-red-400 transition"
                            aria-label={`Remove ${extra.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-secondary-500">Add extras to personalize your day.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="sticky top-6 self-start space-y-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-lg font-semibold text-secondary-900">Price summary</div>
            <div className="mt-4 space-y-3 text-sm text-secondary-600">
              <div className="flex items-center justify-between">
                <span>Boat base price</span>
                <span className="font-semibold text-secondary-900">{formatIDR(basePrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Extras</span>
                <span className="font-semibold text-secondary-900">{formatIDR(extrasSubtotalIDR)}</span>
              </div>
              {guestFeeTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span>Guest fee ({groupSize} guests)</span>
                  <span className="font-semibold text-secondary-900">{formatIDR(guestFeeTotal)}</span>
                </div>
              )}
              <div className="h-px w-full bg-neutral-50" />
              <div className="flex items-center justify-between text-base font-semibold text-secondary-900">
                <span>Total</span>
                <span>{formatIDR(basePrice + guestFeeTotal + extrasSubtotalIDR)}</span>
              </div>
              <div className="text-sm text-secondary-500">
                Secure checkout - {selectedBoat?.isPartner ? "On Request" : "Instant confirmation"}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Button type="button" onClick={handleReserve} size="md" className="w-full" disabled={!isReserveEnabled}>
                {reserveLabel} {isReserveEnabled ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
              <div className="text-center text-sm text-secondary-500">
                You'll see the full total before confirming.
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
                  <img src="https://bluuu.tours/storage/app/media/images/manager.webp" alt="Expert" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black uppercase tracking-widest text-primary-600 mb-0.5">Ask an Expert</div>
                  <div className="text-xs text-secondary-500 mb-2">Our team is ready to help you plan the perfect trip.</div>
                  <div className="flex flex-wrap gap-3">
                    {contacts.phone?.link && (
                      <a href={contacts.phone.link} className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                        <Phone className="h-3.5 w-3.5 text-primary-500" />
                        {contacts.phone.number}
                      </a>
                    )}
                    {contacts.whatsapp?.link && (
                      <a href={contacts.whatsapp.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5 text-primary-500" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-secondary-500">
                <button type="button" onClick={() => onOpenTourInfo?.("cancellation", "review")} className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors">
                  <Shield className="h-3.5 w-3.5" /> Free cancellation 24h <ExternalLink className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => onOpenTourInfo?.("weather", "review")} className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors">
                  <CloudRain className="h-3.5 w-3.5" /> Weather guarantee <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col gap-2.5">
            {[
              { icon: Ticket, title: "Lock today's rate", desc: "Prices can rise — secure the current rate." },
              { icon: Calendar, title: "Stay flexible", desc: "Cancel anytime or reschedule with ease." },
              { icon: Clock, title: "Smart decision", desc: "Reserve now and keep full flexibility." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <Icon className="h-3 w-3 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-secondary-700">{title}</span>
                  <span className="text-xs text-secondary-400"> — {desc}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}
function HeroDetails({
  selectedYacht,
  cartItems,
  extrasTotalUSD,
  onAddExtra,
  onRemoveExtra,
  selectedVibe,
  showConfigBadge,
  onEditConfig,
}) {
  const lead = "All-inclusive day with zero logistics  everything essential is covered.";
  return (
    <section className="py-6 sm:py-10">
      <div className="container">
        <div className="flex flex-col gap-8">
          <div>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-12">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <p className="text-sm font-semibold uppercase tracking-wide-3xl text-secondary-400">Value proof</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-secondary-900 sm:text-4xl">
                    Why Premium Private
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-secondary-600 sm:text-base">{lead}</p>
                  <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card sm:p-7">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        {
                          title: "Max 13 guests",
                          sub: "Smaller group, more space.",
                        },
                        {
                          title: "Seamless day",
                          sub: "Boat + land tour coordinated.",
                        },
                        {
                          title: "No surprise fees",
                          sub: "Tickets + lunch covered.",
                        },
                      ].map((item) => (
                        <div key={item.title} className="space-y-1">
                          <div className="text-sm font-semibold text-secondary-900">{item.title}</div>
                          <div className="text-sm text-secondary-500">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 border-t border-neutral-200 pt-5">
                      <div className="text-sm font-semibold text-secondary-900">Included at a glance</div>
                      <div className="mt-3 grid gap-x-6 gap-y-2 text-sm text-secondary-600 sm:grid-cols-2">
                        {[
                          "Comfort boat (up to 13)",
                          "Lunch at Amarta",
                          "Land tour to Kelingking",
                          "All entrance tickets",
                          "Underwater GoPro clips",
                          "Essentials (water, guides, gear, towels)",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <Check className="mt-1 h-4 w-4 text-secondary-400" />
                            <span className="leading-6">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                      <a href="#booking" className="font-semibold text-secondary-900 transition hover:text-secondary-600">
                        See available dates
                      </a>
                      <a href="#included" className="font-medium text-secondary-500 transition hover:text-secondary-600">
                        See full inclusions
                      </a>
                      <button
                        type="button"
                        onClick={() => alert("WhatsApp demo action")}
                        className="font-medium text-secondary-500 transition hover:text-secondary-600"
                      >
                        WhatsApp questions
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function GallerySection() {
  return (
    <PremiumSection
      id="step-route"
      backgroundClassName={SECTION_BACKGROUNDS.ocean}
    >
      <PremiumContainer>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">STEP 3 OF 4</div>
          <h2 className={Q_THEME.text.h2}>Customize your route</h2>
          <p className={Q_THEME.text.body}>Choose your vibe. We'll maximize your time.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-secondary-500">Curated highlights from real Bluuu tours</div>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#booking" className="text-sm font-semibold text-secondary-600 hover:text-secondary-900">
              Check availability
            </a>
            <PrimaryLink href="#booking" className="px-5 py-2.5">
              Check availability
            </PrimaryLink>
          </div>
        </div>
        <div className="mt-5">
          <HeroGallery images={(privateTours || []).flatMap(t => t.images_with_thumbs || [])} />
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}
function SocialProof() {
  const reviewSources = useMemo(
    () =>
      REVIEW_SOURCES.map((source) => ({
        ...source,
        iconSrc: REVIEW_SOURCE_ICON_MAP[source.id] || "",
      })),
    []
  );
  const guestPhotos = [
    "https://bluuu.tours/resize/3dbd5b63d137007364cbd61f35a12728-1",
    "https://bluuu.tours/resize/ce66ae66894677d7792f666bf1905677-1",
    "https://bluuu.tours/resize/5098ca3cb0fbe4a9e7e852c6131232c3-1",
    "https://bluuu.tours/resize/bc8368588432315c0fb1e60152383c32-1",
    "https://bluuu.tours/resize/dfa4a954daf9bcf683e36f60fd8a6819-1",
    "https://bluuu.tours/resize/a37ac9163a82140ac7af190b6d417ee5-1",
    "https://bluuu.tours/resize/c9f603b7a80c83bbd25db9551c41bf72-1",
    "https://bluuu.tours/resize/eded3fe3ad3d3feb79caeff2bbc2b255-1",
    "https://bluuu.tours/resize/d11e1c9884a10ab723cae4ab29bb2589-1",
  ];
  const featuredReviews = useMemo(
    () =>
      INFO_REVIEWS.map((review, index) => ({
        id: review.id || `review-${index + 1}`,
        platformId: reviewSources[index % Math.max(reviewSources.length, 1)]?.id || "tripadvisor",
        name: review.name || "",
        date: review.meta || "",
        rating: 5,
        title: review.title || "",
        text: review.quote || "",
        screenshotSrc: "",
      })),
    [reviewSources]
  );
  const StarsRow = ({ size = 4, rating = 5 }) => (
    <div className="flex items-center gap-1.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < rating;
        return (
          <Star
            key={idx}
            className={cn(filled ? "text-orange-500" : "text-orange-200", size === 5 ? "h-6 w-6" : "h-5 w-5")}
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
  const PlatformIcon = ({ source, sizeClassName = "h-6 w-6", iconClassName = "h-4 w-4" }) => (
    <span className={cn("flex items-center justify-center rounded-xl bg-white ring-1 ring-neutral-200", sizeClassName)}>
      {source.iconSrc ? (
        <img src={source.iconSrc} alt="" className={iconClassName} loading="lazy" decoding="async" />
      ) : (
        <span className="text-sm font-extrabold text-secondary-600">*</span>
      )}
    </span>
  );
  const PlatformChipLink = ({ source, className }) => (
    <a
      href={source.href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xl border border-transparent bg-neutral-100 px-3 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-200 hover:text-secondary-900 group",
        className
      )}
      aria-label={`Open ${source.label} reviews`}
    >
      <img src={source.iconSrc} alt="" className="h-4 w-4 opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0" loading="lazy" decoding="async" />
      <span className="whitespace-nowrap">{source.label}</span>
      <ExternalLink className="ml-1 h-3 w-3 text-secondary-400 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
  const PlatformBadge = ({ source }) => (
    <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-sm font-semibold text-secondary-600">
      <PlatformIcon source={source} sizeClassName="h-5 w-5" iconClassName="h-3.5 w-3.5" />
      <span className="whitespace-nowrap">{source.label}</span>
    </span>
  );
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const mixedCards = useMemo(() => {
    const items = [];
    const maxLen = Math.max(featuredReviews.length, guestPhotos.length);
    for (let i = 0; i < maxLen; i += 1) {
      if (featuredReviews[i]) items.push({ type: "review", data: featuredReviews[i] });
      if (guestPhotos[i]) items.push({ type: "photo", data: guestPhotos[i], idx: i });
    }
    return items;
  }, [featuredReviews, guestPhotos]);
  return (
    <PremiumSection
      id="social"
      backgroundClassName={SECTION_BACKGROUNDS.lagoon}
    >
      <PremiumContainer>
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">Guest reviews</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xl font-bold text-secondary-900">4.9 | 8500+ reviews</div>
              <div className="flex flex-wrap gap-2">
                {reviewSources.map((source) => (
                  <PlatformChipLink key={source.id} source={source} />
                ))}
              </div>
            </div>
          </div>
          <a href={LINKS.reviews[0].href} className="hidden items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 sm:flex">
            Read more <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3">
                <div>
                  <div className="hidden flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="inline-flex items-center gap-2">
                      <div className="text-lg font-semibold text-secondary-900">{BRAND.rating}</div>
                      <StarsRow size={5} rating={5} />
                      <div className="text-sm font-semibold uppercase tracking-wide text-secondary-500">{BRAND.ratingLabel}</div>
                    </div>
                    <span className="hidden text-sm text-secondary-300 sm:inline">|</span>
                    <div className="text-sm text-secondary-600">
                      {BRAND.reviewCount} {BRAND.reviewLabel}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-secondary-600">
                    {["Well organized", "Felt safe snorkeling", "Amazing guides", "Mantas & turtles"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-xl border border-neutral-200 bg-white px-3 py-1 font-semibold shadow-card"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
              {mixedCards.map((item) => {
                if (item.type === "photo") {
                  const src = item.data;
                  return (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative min-w-72pct snap-start overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card sm:min-w-65"
                      aria-label="Open guest photo"
                    >
                      <img
                        src={src}
                        alt={`Guest photo ${item.idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="h-52 w-full object-cover transition duration-700 group-hover:scale-103 sm:h-44"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-md px-3 py-2 text-sm font-semibold text-secondary-600">
                        Guest photo
                      </div>
                    </a>
                  );
                }
                const r = item.data;
                const platform = reviewSources.find((s) => s.id === r.platformId);
                const isExpanded = expandedReviewId === r.id;
                const canExpand = String(r.text ?? "").length > 190;
                return (
                  <div
                    key={r.id}
                    className="min-w-82pct snap-start rounded-xl border border-neutral-200 bg-white p-4 shadow-card sm:min-w-80 lg:min-w-340"
                  >
                    <div className="flex items-start gap-3">
                      <PlatformIcon source={platform ?? {}} sizeClassName="h-10 w-10 shrink-0" iconClassName="h-5 w-5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-secondary-900">{r.name}</div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-secondary-500">
                              <span className="whitespace-nowrap">{r.date}</span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <StarsRow size={4} rating={r.rating} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {r.title ? (
                      <div
                        className="mt-2 text-sm font-semibold leading-5 text-secondary-900"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                        }}
                      >
                        {r.title}
                      </div>
                    ) : null}
                    <div className={cn("text-sm leading-5 text-secondary-600", r.title ? "mt-1.5" : "mt-2")}>
                      <div
                        style={
                          canExpand && !isExpanded
                            ? {
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 4,
                              overflow: "hidden",
                            }
                            : undefined
                        }
                      >
                        {r.text}
                      </div>
                      {canExpand ? (
                        <button
                          type="button"
                          onClick={() => setExpandedReviewId((prev) => (prev === r.id ? null : r.id))}
                          className="mt-2 inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600 shadow-card transition hover:bg-neutral-100 active:scale-99"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      ) : null}
                    </div>
                    {r.screenshotSrc ? (
                      <a
                        href={r.screenshotSrc}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block overflow-hidden rounded-xl border border-neutral-200 bg-white"
                        aria-label="Open review screenshot"
                      >
                        <img
                          src={r.screenshotSrc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-28 w-full object-cover"
                        />
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4 text-sm text-secondary-600">
              <div className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Check all reviews on</div>
              <div className="flex flex-wrap items-center gap-2">
                {reviewSources.map((s) => (
                  <PlatformChipLink key={s.id} source={s} />
                ))}
              </div>
              <div className="text-sm text-secondary-500 sm:ml-auto">Opens in a new tab.</div>
            </div>
          </div>
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}
function QuickFAQSection() {
  return (
    <section className="py-8 sm:py-12">
      <div className="container">
        <BookingMiniFAQ className="p-4" />
      </div>
    </section>
  );
}
function WhyBluuu() {
  const cards = [
    {
      iconUrl: "https://bluuu.tours/storage/app/media/icons%20from%20upwork/l1.svg",
      title: "Premium Boat",
      text: "Premium seating, smoother ride, and attentive service all day.",
    },
    {
      iconUrl:
        "https://bluuu.tours/storage/app/media/icons%20from%20upwork/icons%20ready_All%20Nusa%20Penida%20in%20one%20day.svg",
      title: "Do it all in one day",
      text: "Cruise on a comfort yacht, snorkel, visit Kelingking Cliff, and swim with manta rays.",
    },
    {
      iconUrl: "https://bluuu.tours/storage/app/media/icons%20from%20upwork/l5.svg",
      title: "Smooth boarding",
      text: "No low-tide ocean walking, no waiting, no dinghy transfer. Arrive, check in, and board smoothly.",
    },
    {
      iconUrl:
        "https://bluuu.tours/storage/app/media/icons%20from%20upwork/icons%20ready_safety%20first%20always.svg",
      title: "Free cancellation",
      text: "Free cancellation up to 24 hours before your tour. Bad weather? Well reschedule or refund. Support is available anytime.",
    },
  ];
  return (
    <PremiumSection
      id="why"
      backgroundClassName={SECTION_BACKGROUNDS.ocean}
    >
      <PremiumContainer>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">Why book this tour</div>
          <h2 className={Q_THEME.text.h2}>The premium way to do Nusa Penida in one day</h2>
          <p className={Q_THEME.text.body}>Elevated comfort, upgraded service, and a longer, more curated day - all with smooth premium logistics.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Card key={i} className="h-full">
              <div className="flex items-center justify-center">
                <img src={c.iconUrl} alt="" className="h-24 w-24" />
              </div>
              <div className="mt-4 text-sm font-semibold text-secondary-900">{c.title}</div>
              <div className="mt-2 hidden text-sm leading-6 text-secondary-600 sm:block">{c.text}</div>
            </Card>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="text-sm font-semibold text-secondary-900">
                Designed to feel smooth, safe, and premium  even on a shared tour.
              </div>
              <div className="mt-2 text-sm leading-6 text-secondary-600">
                Clear schedule, small-group vibe, and a team that runs the day end-to-end with our own fleet.
              </div>
            </div>
            <div className="lg:col-span-4">
              <PrimaryLink href="#booking" className="w-full">
                Check availability
              </PrimaryLink>
            </div>
          </div>
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}
function LunchHighlight() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <section className="pb-12 sm:pb-16">
      <div className="container">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white sm:w-80">
              <img
                src="https://bluuu.tours/storage/app/uploads/public/688/e37/924/thumb_504_400_400_0_0_crop.webp"
                alt="La Rossa restaurant"
                loading="lazy"
                decoding="async"
                className="h-52 w-full object-cover sm:h-48"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold uppercase tracking-wide-xl text-secondary-600">Lunch</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="text-lg font-semibold text-secondary-900">La Rossa lunch break</div>
                <button
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-100"
                >
                  <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-600" />
                  Show menu
                </button>
              </div>
              <div className="mt-3 text-base leading-7 text-secondary-600">
                Included lunch with a calm pool setting to recharge before the land tour.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Included lunch", icon: UtensilsCrossed },
                  { label: "Pool access", icon: Waves },
                  { label: "Daybeds", icon: Sun },
                ].map((tag) => {
                  const Icon = tag.icon;
                  return (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                    >
                      <Icon className="h-3.5 w-3.5 text-secondary-500" />
                      {tag.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="La Rossa menu"
        subtitle="A quick look at the included lunch options."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-base leading-7 text-secondary-600">
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
              <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-500" />
              Starter
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Chicken Taco</div>
              <div className="mt-1 text-secondary-600">
                Slice of taco, salad, fried chicken in Spanish flour, spicy mix, avocado
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
              or
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Calamari Taco</div>
              <div className="mt-1 text-secondary-600">
                Slice of taco, salad, fried calamari in Spanish flour, spicy mix, avocado
              </div>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
              <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-600" />
              Maincourse
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Korean Fried Chicken Burger</div>
              <div className="mt-1 text-secondary-600">
                Spicy mix, cilantro, cucumber pickle, French fries
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
              or
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Autentic Padthai</div>
              <div className="mt-1 text-secondary-600">
                Vegetarian style Pad Thai, tofu, local peanut and tamarind glaze
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
              or
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Stir Fried Spaghetti</div>
              <div className="mt-1 text-secondary-600">
                Cabbage, carrot, leek, garlic, seafood of the day, soy glazed oyster sauce
              </div>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
              <Coffee className="h-3.5 w-3.5 text-secondary-600" />
              Free flow
            </div>
            <div className="mt-2 text-secondary-600">Mineral water or ice tea</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600">
            Should you desire cocktails, wine, sweets, or other selections, please ask for the restaurants general
            menu, as these items are available at an additional charge and are not included in the yacht charter menu.
          </div>
        </div>
      </Modal>
    </section>
  );
}
function ChooseBoatSection({
  selectedBoatId,
  onSelectYacht,
  availableYachts,
  availabilityByBoat,
  dateMode,
  exactDate,
  rangeStart,
  rangeEnd,
  dateSelectionPreference,
  onDateSelectionPreference,
  selectedFlexDate,
  onSelectFlexDate,
  hasDateCriteria,
}) {
  const [activeYacht, setActiveYacht] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const selectedYacht = useMemo(
    () => (availableYachts || []).find((yacht) => yacht.id === selectedBoatId) || null,
    [selectedBoatId]
  );
  const selectedAvailability = selectedBoatId ? availabilityByBoat?.[selectedBoatId] : null;
  const onOpen = (yacht) => {
    onSelectYacht(yacht.id);
    setActiveYacht(yacht);
    setActivePhoto(0);
    setAboutOpen(false);
  };
  const onClose = () => {
    setActiveYacht(null);
    setAboutOpen(false);
  };
  const renderCard = (yacht) => {
    const isSelected = selectedBoatId === yacht.id;
    const priceText = formatIDR(yacht.priceValue);
    const availability = availabilityByBoat?.[yacht.id];
    const hasRange = dateMode === "flex" && rangeStart && rangeEnd;
    const rangeDates = availability?.availableDates ?? [];
    const nextDates = rangeDates.slice(0, 3);
    return (
      <button
        key={yacht.id}
        type="button"
        onClick={() => onOpen(yacht)}
        className={cn(
          "group flex h-full w-75 min-w-75 snap-center flex-col rounded-xl border bg-white p-5 text-left shadow-card transition-transform sm:snap-start",
          "sm:w-65 sm:min-w-65 sm:p-4",
          "hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card",
          isSelected ? "border-neutral-300 ring-1 ring-border-soft" : "border-neutral-200"
        )}
        aria-pressed={isSelected}
      >
        <div className="relative overflow-hidden rounded-xl border border-neutral-200">
          <img
            src={yacht.cover}
            srcSet={yacht.cover_small ? `${yacht.cover_small} 300w, ${yacht.cover} 600w` : undefined}
            sizes="(max-width: 640px) 100vw, 260px"
            alt={`${yacht.name} yacht`}
            loading="lazy"
            decoding="async"
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-103 sm:h-48"
          />
          {yacht.tag ? (
            <div className="absolute right-3 top-3 rounded-xl bg-white/90 backdrop-blur-md px-3 py-1 text-sm font-semibold text-secondary-600 shadow-card">
              {yacht.tag}
            </div>
          ) : null}
          <span
            role="button"
            tabIndex={0}
            aria-label={`Select ${yacht.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectYacht(yacht.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onSelectYacht(yacht.id);
              }
            }}
            className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-xl bg-white shadow-card"
          >
            <span
              className={cn(
                "h-3.5 w-3.5 rounded-xl border-2",
                isSelected ? "border-secondary-900 bg-secondary-900" : "border-neutral-300 bg-transparent"
              )}
            />
          </span>
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <div className="mt-2 text-lg font-semibold leading-snug text-secondary-900">{yacht.name}</div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold leading-none text-secondary-900">{priceText}</div>
              <div className="mt-1 text-sm font-medium text-secondary-500">per boat</div>
            </div>
            <div />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-secondary-600">
            <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-secondary-600" />
              {yacht.people} people
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-1 whitespace-nowrap">
              <Ship className="h-3.5 w-3.5 text-secondary-600" />
              {yacht.lengthMeters} meters
            </span>
          </div>
          {hasRange && rangeDates.length ? (
            <div className="mt-3 text-sm text-secondary-500">
              {rangeDates.length === 1
                ? `Next available: ${formatShortDate(rangeDates[0])}`
                : `Best days: ${nextDates.map((date) => formatShortDate(date)).join(", ")}`}
            </div>
          ) : null}
          {!hasRange && dateMode === "exact" && exactDate ? (
            <div className="mt-3 text-sm text-secondary-500">
              Available on {formatShortDate(exactDate)}
            </div>
          ) : null}
          {hasRange && !rangeDates.length && hasDateCriteria ? (
            <div className="mt-3 text-sm text-secondary-400">No dates in this range.</div>
          ) : null}
          <div className="mt-auto pt-4 text-sm text-secondary-500">Tap to view photos + details</div>
        </div>
      </button>
    );
  };
  return (
    <Section
      id="yachts"
      kicker="Choose your boat"
      title="Pick a boat for your tour"
      subtitle="Each yacht is fully private for your group. Choose the model, set the pace, and add extras on request."
      backgroundClassName={SECTION_BACKGROUNDS.ocean}
      containerClassName="container"
    >
      {!hasDateCriteria ? (
        <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600 shadow-card">
          Select your dates in Step 1 to unlock availability.
        </div>
      ) : null}
      {hasDateCriteria && !availableYachts.length ? (
        <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600 shadow-card">
          No boats available for this group size and date selection.
        </div>
      ) : null}
      <div className="-mx-4 overflow-hidden sm:mx-0">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-carousel-center pb-4 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4"
        >
          {availableYachts.map((yacht) => renderCard(yacht))}
        </div>
      </div>
      {selectedYacht ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600 shadow-card">
          Selected yacht: <span className="font-semibold text-secondary-900">{selectedYacht.name}</span>
          <div className="mt-2 text-sm text-secondary-500">
            {dateMode === "exact" && exactDate ? `Date: ${formatShortDate(exactDate)}` : null}
            {dateMode === "flex" && rangeStart && rangeEnd ? (
              <>
                Date:{" "}
                {dateSelectionPreference === "pickLater"
                  ? `Flexible: ${formatRangeShort(rangeStart, rangeEnd)}`
                  : selectedFlexDate
                    ? formatShortDate(selectedFlexDate)
                    : "Pick a day to continue"}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
      <Modal
        open={!!activeYacht}
        onClose={onClose}
        title={activeYacht?.name ?? "Yacht details"}
        subtitle={
          activeYacht
            ? `${activeYacht.people} people  ${activeYacht.lengthMeters} meters  ${formatYachtPrice(activeYacht)} / boat`
            : ""
        }
        maxWidth="max-w-3xl"
      >
        {activeYacht ? (
          <>
            <div className="text-sm font-semibold uppercase tracking-wide-xl text-secondary-400">
              Private yacht option
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-asymmetric-wide">
              <div>
                <PhotoCarousel
                  images={activeYacht.images}
                  alt={activeYacht.name}
                  className="h-200 sm:h-65"
                  onOpenGallery={(idx) => {
                    Fancybox.show(activeYacht.images.map(img => ({ src: img?.path || img, type: "image" })), { startIndex: idx || 0 });
                  }}
                />
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:hidden">
                <button
                  type="button"
                  onClick={() => setAboutOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between text-sm font-semibold text-secondary-900"
                >
                  About this yacht
                  <span className="text-sm text-secondary-500">{aboutOpen ? "Hide" : "Show"}</span>
                </button>
                {aboutOpen ? (
                  <div className="mt-3">
                    <p className="text-sm leading-6 text-secondary-600">
                      You are selecting a private premium boat. We will assign one of our premium boats shown in the
                      photos, depending on availability. Layouts and features stay the same.
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-secondary-600">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-secondary-600" />
                        Private yacht reserved only for your guests
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-secondary-600" />
                        Choose your own stops and timing
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-secondary-600" />
                        Add extras like Champagne, sunset stops, or extra time
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <PrimaryLink
                    href="#booking"
                    className="w-full px-5 py-2.5"
                    onClick={() => {
                      onSelectYacht(activeYacht.id);
                      onClose();
                    }}
                  >
                    Choose this yacht
                  </PrimaryLink>
                  <SecondaryButton onClick={onClose} className="w-full px-5 py-2.5">
                    Back to list
                  </SecondaryButton>
                </div>
              </div>
              <div className="hidden rounded-xl border border-neutral-200 bg-white p-4 sm:block">
                <div className="text-sm font-semibold text-secondary-900">About this yacht</div>
                <p className="mt-2 text-sm leading-6 text-secondary-600">
                  You are selecting a private premium boat. We will assign one of our premium boats shown in the photos,
                  depending on availability. Layouts and features stay the same.
                </p>
                <div className="mt-3 grid gap-2 text-sm text-secondary-600">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-secondary-600" />
                    Private yacht reserved only for your guests
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary-600" />
                    Choose your own stops and timing
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-secondary-600" />
                    Add extras like Champagne, sunset stops, or extra time
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PrimaryLink
                    href="#booking"
                    className="w-full px-5 py-2.5"
                    onClick={() => {
                      onSelectYacht(activeYacht.id);
                      onClose();
                    }}
                  >
                    Choose this yacht
                  </PrimaryLink>
                  <SecondaryButton onClick={onClose} className="w-full px-5 py-2.5">
                    Back to list
                  </SecondaryButton>
                </div>
              </div>
            </div>
            {dateMode === "flex" && rangeStart && rangeEnd ? (
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                <div className="text-sm font-semibold text-secondary-900">Choose a day</div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold">
                  {[
                    { id: "pickNow", label: "Pick a day now" },
                    { id: "pickLater", label: "Pick a day later" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onDateSelectionPreference(option.id)}
                      className={cn(
                        "rounded-xl border px-3 py-1 transition",
                        dateSelectionPreference === option.id
                          ? "border-primary-200 bg-primary-50 text-primary-600"
                          : "border-neutral-200 text-secondary-500"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {dateSelectionPreference === "pickNow" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(availabilityByBoat?.[activeYacht.id]?.availableDates ?? []).length ? (
                      (availabilityByBoat?.[activeYacht.id]?.availableDates ?? []).slice(0, 8).map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => onSelectFlexDate(date)}
                          className={cn(
                            "rounded-xl border px-3 py-1 text-sm font-semibold transition",
                            selectedFlexDate === date
                              ? "border-primary-200 bg-primary-50 text-primary-600"
                              : "border-neutral-200 text-secondary-500"
                          )}
                        >
                          {formatShortDate(date)}
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-secondary-500">No available dates in this range.</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-secondary-500">You can pick a day later. We'll hold the range.</div>
                )}
              </div>
            ) : null}
          </>
        ) : null}
      </Modal>
    </Section>
  );
}
function DayPlan() {
  const OrDivider = ({ className }) => (
    <div className={cn("flex items-center gap-2 text-sm font-semibold uppercase tracking-wide-xl text-secondary-400", className)}>
      <div className="h-px flex-1 bg-neutral-100" />
      or
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
  const [infoItem, setInfoItem] = useState(null);
  const [infoPhoto, setInfoPhoto] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const compactIcons = {
    Morning: [Coffee],
    Midday: [UtensilsCrossed],
    Afternoon: [Car],
    "Manta Point": [Fish],
    Sunset: [Sparkles],
  };
  const slotMicrocopy = {
    Morning: "Fast departure, first snorkel while the bay is calm.",
    Afternoon: "Choose your afternoon highlight.",
    "Manta Point": "A magical moment  gentle giant mantas.",
    Sunset: "Golden hour on the way back.",
  };
  const groups = [
    {
      label: "Morning",
      range: "08:0011:00",
      items: [
        {
          time: "08:00",
          duration: "30m",
          title: "Meeting point",
          icon: Coffee,
          text: "Meeting, briefing and welcome drinks",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
        {
          time: "08:30",
          duration: "30m",
          title: "Departure",
          icon: Ship,
          text: "Serangan, Bali",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
        {
          time: "09:0011:00",
          duration: "3h",
          title: "Snorkeling stops",
          icon: Waves,
          text: "Bali Hai Lagoon  SD Point  Wall Point",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
      ],
    },
    {
      label: "Midday",
      range: "12:00",
      items: [
        {
          time: "12:00",
          duration: "1h 30m",
          title: "La Rossa Restaurant",
          icon: UtensilsCrossed,
          text: "Lunch",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
      ],
    },
    {
      label: "Afternoon",
      range: "13:3016:00",
      items: [
        {
          time: "13:30",
          duration: "2h 30m",
          title: "Kelingking Cliff",
          icon: Car,
          text: "Land tour by car",
          info:
            "The Kelingking land tour can be added at checkout for an extra fee. The drive on Nusa Penida is bumpy and can be slow with traffic, but the iconic views are worth it.",
          badges: ["50 min from port", "Bumpy road", "Amazing views"],
          images: [
            "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
            "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
            "https://bluuu.tours/storage/app/uploads/public/68e/df4/0f6/68edf40f6dfb8633368667.jpg",
            "https://bluuu.tours/storage/app/uploads/public/68f/9b8/dcb/68f9b8dcb528d582569893.jpg",
          ],
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
          isAddon: true,
        },
        { type: "or-chip" },
        {
          time: "13:30",
          duration: "2h 30m",
          title: "Lagoo Pantoon Bar",
          icon: Wine,
          text: "Unique floating bar.",
          info:
            "The Pontoon at Lago is a floating oasis for ocean lovers, with crafted cocktails, sun loungers, and views of the Indian Ocean.",
          badges: ["Draught beers", "Not included in price", "Jumping point", "Close to surf spot"],
          images: [
            "https://www.thelembongantraveller.com/wp-content/uploads/2022/08/Pontoon-at-lago-scaled.jpg",
            "https://www.thelembongantraveller.com/wp-content/uploads/2022/08/FULLRES-EONCOPYRIGHT-R5E_5578-scaled.jpg",
            "https://www.thelembongantraveller.com/wp-content/uploads/2022/08/FULLRES-EONCOPYRIGHT-R5C_6929-scaled.jpg",
            "https://www.thelembongantraveller.com/wp-content/uploads/2022/08/FULLRES-EONCOPYRIGHT-R5C_6678-scaled.jpg",
          ],
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
        { type: "or-chip" },
        {
          time: "13:30",
          duration: "2h 30m",
          title: "Watersport activities",
          icon: Waves,
          text: "Jetski  diving  efoil",
          info: "Add on-water activities for your group. Availability depends on conditions and timing.",
          images: [
            "https://bluuu.tours/storage/app/uploads/public/689/1c7/443/6891c7443ce71322934836.webp",
            "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
            "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
            "https://bluuu.tours/storage/app/uploads/public/68e/df4/0f6/68edf40f6dfb8633368667.jpg",
          ],
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
      ],
    },
    {
      label: "Manta Point",
      range: "16:0017:00",
      items: [
        {
          time: "16:00",
          duration: "1h",
          title: "Manta Point",
          icon: Star,
          text: "Swimming with Manta Rays",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
      ],
    },
    {
      label: "Sunset",
      range: "17:0018:00",
      items: [
        {
          time: "17:00",
          duration: "1h",
          title: "Secret Spot",
          icon: Sparkles,
          text: "Chilling and enjoying Prosecco",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
        {
          time: "18:00",
          duration: "30m",
          title: "Arrival",
          icon: Ship,
          text: "Serangan, Bali",
          tint: "from-neutral-100 to-white",
          iconTone: "text-secondary-600 bg-neutral-50",
        },
      ],
    },
  ];
  return (
    <Section
      id="plan"
      kicker="What to expect"
      title="Your private day plan"
      subtitle="A private premium day with flexible stops, curated snorkeling, and time reserved for each highlight."
      backgroundClassName={SECTION_BACKGROUNDS.mist}
      containerClassName="container"
    >
      <div className="mt-6 grid gap-8 lg:grid-cols-asymmetric-wide">
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait" initial={false}>
            {!showAll ? (
              <motion.div
                key="dayplan-compact"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-3"
              >
                {groups.map((g) => (
                  <div
                    key={g.label}
                    className="relative w-full rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-card"
                  >
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-secondary-900">{g.label}</div>
                        <div className="hidden items-center gap-1.5 sm:flex">
                          {(compactIcons[g.label] ?? []).map((Icon, idx) => (
                            <span
                              key={`${g.label}-icon-${idx}`}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm text-secondary-500"
                            >
                              <Icon className="h-3 w-3" />
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-sm font-semibold text-secondary-600">
                        {g.range}
                      </div>
                    </div>
                    {slotMicrocopy[g.label] ? (
                      <div
                        className={cn(
                          "mt-1.5 text-sm font-semibold",
                          g.label === "Sunset" ? "text-primary-600" : "text-secondary-500"
                        )}
                      >
                        {slotMicrocopy[g.label]}
                      </div>
                    ) : null}
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {g.items
                        .filter((s) => s.type !== "or-chip")
                        .map((s) => (
                          <span
                            key={`${g.label}-${s.title}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-sm font-semibold text-secondary-600"
                          >
                            {s.icon ? <s.icon className="h-3 w-3 text-secondary-400" /> : null}
                            {s.title}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setShowAll(true)} className="w-full">
                  See full itinerary
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="dayplan-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-5"
              >
                {groups.map((g) => (
                  <div key={g.label} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-semibold text-secondary-900">{g.label}</div>
                      <div className="rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-sm font-semibold text-secondary-600">
                        {g.range}
                      </div>
                    </div>
                    {g.label === "Afternoon" ? (
                      <div className="text-sm font-semibold text-secondary-500">
                        You can decide and update the schedule anytime after booking.
                      </div>
                    ) : null}
                    <div className="space-y-3">
                      {g.items.map((s, idx) =>
                        s.type === "or-chip" ? (
                          <OrDivider key={`${g.label}-or-${idx}`} className="my-2" />
                        ) : (
                          <div
                            key={`${g.label}-${s.time}-${s.title}`}
                            className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-4 shadow-card"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 text-secondary-600">
                              <s.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="text-sm font-semibold text-secondary-900">{s.title}</div>
                                <div className="text-sm font-semibold text-secondary-500">
                                  {s.time} ({s.duration})
                                </div>
                                {s.isAddon ? (
                                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-sm font-semibold text-primary-600">
                                    Add-on
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1 text-sm leading-6 text-secondary-600">{s.text}</div>
                            </div>
                            {s.images ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setInfoItem(s);
                                  setInfoPhoto(0);
                                  setDetailsOpen(false);
                                }}
                                className="shrink-0 rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-secondary-600 transition hover:border-neutral-300"
                              >
                                More info
                              </button>
                            ) : null}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setShowAll(false)} className="w-full">
                  Hide details
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden bg-white p-0">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-secondary-500">Route overview</div>
                    <div className="text-lg font-semibold text-secondary-900">Bali  Nusa Penida</div>
                  </div>
                </div>
              </div>
              <div className="bg-transparent">
                <img
                  src="https://bluuu.tours/themes/bluuu/assets/images/map.webp"
                  alt="Route overview map"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Modal
        open={!!infoItem}
        onClose={() => setInfoItem(null)}
        title={infoItem?.title ?? "Afternoon option"}
        subtitle="A quick preview of this afternoon plan."
        maxWidth="max-w-3xl"
      >
        {infoItem ? (
          <div className="grid gap-4 lg:grid-cols-asymmetric-wide">
            <div>
              <PhotoCarousel
                images={infoItem.images}
                alt={infoItem.title}
                className="h-200 sm:h-60"
                onOpenGallery={(idx) => {
                  Fancybox.show(infoItem.images.map(img => ({ src: img?.path || img, type: "image" })), { startIndex: idx || 0 });
                }}
              />
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:hidden">
              <button
                type="button"
                onClick={() => setDetailsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-sm font-semibold text-secondary-900"
              >
                Details
                <span className="text-sm text-secondary-500">{detailsOpen ? "Hide" : "Show"}</span>
              </button>
              {detailsOpen ? (
                <div className="mt-3">
                  {infoItem.info ? <p className="text-sm leading-6 text-secondary-600">{infoItem.info}</p> : null}
                  {infoItem.badges ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {infoItem.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="hidden rounded-xl border border-neutral-200 bg-white p-4 sm:block">
              <div className="text-sm font-semibold text-secondary-900">Details</div>
              {infoItem.info ? <p className="mt-2 text-sm leading-6 text-secondary-600">{infoItem.info}</p> : null}
              {infoItem.badges ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {infoItem.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </Section>
  );
}
function Included() {
  const [showAll, setShowAll] = useState(false);
  const highlights = [
    {
      title: "Premium boat",
      text: "Bigger boat for a smoother ride and a private feel.",
      icon: Ship,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    },
    {
      title: "Lunch",
      text: "La Rossa restaurant lunch  a premium midday reset.",
      icon: UtensilsCrossed,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    },
    {
      title: "Extended +1h",
      text: "Extra time on the water for more stops or a slower, relaxed pace.",
      icon: Clock,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    },
    {
      title: "Pro photographer",
      text: "Allday coverage  you stay in the moment.",
      icon: Camera,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    },
    {
      title: "Bottle of Prosecco",
      text: "Secret spot toast  the signature premium moment.",
      icon: Sparkles,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    },
    {
      title: "All entrance tickets",
      text: "All tickets included  no queues, no surprise fees.",
      icon: Ticket,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    },
  ];
  const extras = [
    "Underwater GoPro footage",
    "Welcome drinks",
    "Drinking water",
    "Extended +1h tour",
    "Certified guides",
    "Snorkeling equipment",
    "Basic insurance",
    "Hoodie towels",
  ];
  const compactItems = [...highlights.map((h) => h.title), ...extras].slice(0, 8);
  return (
    <Section
      id="included"
      kicker="Included"
      title="Everything you want is already covered"
      subtitle="Simple, transparent inclusions  so you can focus on the day, not the fine print"
      backgroundClassName={SECTION_BACKGROUNDS.sunset}
    >
      <Card className="rounded-xl p-6 sm:p-8">
        <div className={showAll ? "hidden" : "block"}>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-secondary-900">Inclusions at a glance</div>
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-600">
                {compactItems.length} key items
              </div>
            </div>
            <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {compactItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-secondary-600">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-secondary-600 ring-1 ring-border-soft">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold text-secondary-900">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-secondary-500">
              Tap See all inclusions for the complete list and details.
            </div>
          </div>
        </div>
        <div className={showAll ? "block" : "hidden"}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-border-soft/80",
                      h.iconTone
                    )}
                  >
                    <h.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-secondary-900">{h.title}</div>
                    <div className="mt-1 text-sm text-secondary-600">{h.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Plus</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {extras.map((x) => (
                <span
                  key={x}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                >
                  <Check className="h-3.5 w-3.5 text-secondary-600" />
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:mt-6 sm:grid-cols-2">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">No surprise fees</div>
              <div className="mt-2 text-sm text-secondary-600">
                Tickets, lunch, and core tour logistics are included  your total is shown upfront.
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Not included</div>
              <ul className="mt-2 space-y-1 text-sm text-secondary-600">
                <li> Cocktails, wine, and sweets at the restaurant</li>
                <li> Optional private transfer upgrade</li>
                <li> Personal purchases and tips</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary-600 shadow-card transition hover:border-neutral-300 hover:bg-white active:scale-[0.99]"
          >
            {showAll ? "Hide inclusions" : "See all inclusions"}
            <ChevronDown className={cn("h-4 w-4 transition", showAll ? "rotate-180" : "rotate-0")} />
          </button>
        </div>
      </Card>
    </Section>
  );
}
function TransferShowcase() {
  const perks = [
    {
      icon: Car,
      title: "Door-to-pier pickup",
      text: "Private car takes your group directly to the harbor with no shared stops.",
    },
    {
      icon: Clock,
      title: "Timed to your boat",
      text: "Pickup time is aligned with your yacht schedule for a smooth boarding.",
    },
    {
      icon: Shield,
      title: "Private, secure ride",
      text: "Licensed drivers and a dedicated vehicle for your group only.",
    },
    {
      icon: MapPin,
      title: "Flexible locations",
      text: "Multiple pickup areas across Bali. We confirm coverage after booking.",
    },
  ];
  const options = [
    {
      title: "Pickup + Drop-off",
      tag: "Round trip",
      text: "Door-to-door service before and after your tour day.",
    },
    {
      title: "Private minivan",
      tag: "Large groups",
      text: "For large groups, we arrange minivans for the whole party.",
    },
  ];
  return (
    <Section
      id="transfer"
      kicker="Private transfer"
      title="Arrive relaxed, board fast"
      subtitle="Private transfer is an optional add-on available at checkout."
      backgroundClassName={SECTION_BACKGROUNDS.sunset}
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <div className="h-full rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-secondary-900">Transfer options</div>
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Add at checkout</div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {options.map((option) => (
                <div
                  key={option.title}
                  className="rounded-xl"
                >
                  <div className="h-full rounded-xl border border-neutral-200 bg-neutral-100 p-5 shadow-card">
                    {option.tag ? (
                      <span className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold text-secondary-600">
                        {option.tag}
                      </span>
                    ) : null}
                    <div className="mt-3 text-base font-semibold text-secondary-900">{option.title}</div>
                    <div className="mt-2 text-sm text-secondary-600">{option.text}</div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary-500">
                      <BadgeCheck className="h-4 w-4 text-secondary-600" />
                      Add at checkout
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-neutral-200 p-4 text-sm text-secondary-600">
              Add transfer on the next step after choosing your date and yacht. We will confirm route and timing by WhatsApp.
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="h-full rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
            <div className="text-sm font-semibold text-secondary-900">Why travelers choose private transfer</div>
            <div className="mt-3 grid gap-2">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-2"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200">
                    <perk.icon className="h-3.5 w-3.5 text-secondary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-secondary-900">{perk.title}</div>
                    <div className="mt-0.5 text-sm leading-5 text-secondary-600">{perk.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
function SafetySegment() {
  const [activeModal, setActiveModal] = useState(null);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [proofExpanded, setProofExpanded] = useState(false);
  const policyItems = [
    "It is possible to cancel a reservation and receive a full refund, provided that the cancellation occurs at least 24 hours prior to the scheduled start time of the experience. This policy applies to all reservations.",
    "The Cars Transportation service is non-refundable if guests have already utilized it and the tour is canceled due to inclement weather conditions.",
    "In order to receive a full refund, cancellation of a reservation must be made at least 24 hours prior to the scheduled start time of the experience.",
    "If a cancellation occurs less than 24 hours prior to the scheduled start time of the experience, no refund or rescheduling will be granted, regardless of the reason for the cancellation, including but not limited to health conditions, incorrect booking date, or the inability of one member of the group to participate in the tour.",
    "Requests for changes to a reservation made less than 24 hours prior to the scheduled start time of the experience will not be accommodated.",
    "Cut-off times are based on the experiences local time.",
    "This experience is weather dependent and if it's canceled due to unfavorable conditions, alternative dates or a full refund will be provided.",
    "This experience requires a minimum number of travelers. If its canceled because the minimum isnt met, youll be offered a different date/experience or a full refund.",
    "Individuals under the age of 18 cannot join the tour without being accompanied by a parent or another adult aged 18 or older who is also included in the same booking. If you are under 18 and planning to join the tour on your own, we wont be able to confirm your booking or check you in before the trip.",
    "For private tour bookings, if guests do not show up before 12:00, we reserve the right to cancel the trip.",
    "The occurrence of this experience is contingent upon the approval of the Port Authority regarding the weather conditions. In the event that the Port Authority denies permission to commence the tour due to unfavorable weather conditions, such as significant waves or strong winds, alternative dates or a full refund shall be offered to the affected parties.",
    "Tours booked with DAY TRIP BALI PT may be subject to cancellation for various reasons, such as inclement weather, operational issues, or low enrollment. In such cases, DAY TRIP BALI PT reserves the right to cancel the tour and will make every effort to provide alternative arrangements or offer a full refund to affected guests.",
  ];
  const visiblePolicyItems = policyExpanded ? policyItems : policyItems.slice(0, 4);
  const closeModal = () => {
    setActiveModal(null);
    setPolicyExpanded(false);
  };
  const coreItems = [
    {
      title: "Passenger insurance coverage",
      text: "Up to IDR 200 million per passenger  ages 875 covered automatically.",
    },
    {
      title: "Certified guides + quarterly training",
      text: "First aid, water rescue, equipment checks, emergency communication.",
    },
    {
      title: "Small groups, strong supervision",
      text: "Max 14 guests  minimum two certified guides (1 per 7 guests).",
    },
  ];
  const proofItems = [
    { icon: Shield, title: "Zero incidents  8+ years of safe tours" },
    { icon: BadgeCheck, title: "Licensed operator  Port Authority compliant" },
    { icon: Anchor, title: "Full safety equipment onboard" },
    { icon: Waves, title: "Inwater safety protocols" },
    { icon: Sparkles, title: "Hygiene & environmental care" },
    { icon: Users, title: "40,000+ guests annually  8+ years operating" },
  ];
  const visibleProofItems = proofExpanded ? proofItems : proofItems.slice(0, 3);
  return (
    <Section
      id="safety"
      kicker="Health & safety"
      title="Safety standards & guest protections"
      subtitle="Clear, measurable safety practices and transparent policies so you can book with confidence."
      backgroundClassName={SECTION_BACKGROUNDS.mist}
    >
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="text-sm font-semibold text-secondary-900">Core protections</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {coreItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-600 shadow-card">
                      {item.title === "Passenger insurance coverage" ? (
                        <Shield className="h-4 w-4" />
                      ) : item.title === "Certified guides + quarterly training" ? (
                        <BadgeCheck className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </span>
                    <div className="text-sm font-semibold text-secondary-900">{item.title}</div>
                  </div>
                  <div className="mt-2 text-sm text-secondary-600">{item.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Policy links</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { id: "standards", label: "Safety standards" },
                  { id: "insurance", label: "Insurance coverage" },
                  { id: "equipment", label: "Onboard equipment" },
                  { id: "diving", label: "Diving & snorkeling safety" },
                  { id: "cancellation", label: "Cancelation policy" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setActiveModal(btn.id)}
                    className="inline-flex items-center justify-between gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-semibold text-secondary-600 transition hover:border-neutral-300 hover:text-secondary-900"
                  >
                    <span>{btn.label}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="text-sm font-semibold text-secondary-900">Proof points</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {visibleProofItems.map((item) => (
                <div key={item.title} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm text-secondary-600">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
                      <item.icon className="h-4 w-4 text-secondary-500" />
                    </span>
                    <span className="pt-1">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
            {proofItems.length > 3 ? (
              <button
                type="button"
                onClick={() => setProofExpanded((prev) => !prev)}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-secondary-600 shadow-card transition hover:border-neutral-300 hover:text-secondary-900 sm:hidden"
              >
                {proofExpanded ? "See less" : "See all"}
                <ChevronDown className={`h-4 w-4 transition ${proofExpanded ? "rotate-180" : ""}`} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <Modal
        open={activeModal === "standards"}
        onClose={closeModal}
        title="Safety standards"
        subtitle="How we keep the day smooth and safe."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 text-base leading-7 text-secondary-600">
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            Safety-first operations with continuous SOP updates and mandatory quarterly guide training.
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            Emergency procedures include pre-departure briefings, evacuation protocols, and incident reporting.
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            Compliance with Indonesian maritime regulations and applicable international standards.
          </div>
        </div>
      </Modal>
      <Modal
        open={activeModal === "insurance"}
        onClose={closeModal}
        title="Passenger insurance coverage"
        subtitle="Coverage details for every guest."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 text-base leading-7 text-secondary-600">
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            Insurance Provider: PT Jasa Raharja Putera insurance company.
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            Coverage: Up to IDR 200 million per passenger.
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            Eligibility: All passengers aged 8 to 75 years old are automatically covered.
          </div>
        </div>
      </Modal>
      <Modal
        open={activeModal === "equipment"}
        onClose={closeModal}
        title="Onboard safety equipment"
        subtitle="Key safety items available on every trip."
        maxWidth="max-w-3xl"
      >
        <div className="grid gap-3 text-base leading-7 text-secondary-600 sm:grid-cols-2">
          {[
            "Life jackets (all sizes)",
            "First aid kits",
            "Oxygen tanks",
            "Marine radios / communication devices",
            "Fire extinguishers",
            "Emergency flares / signals",
            "Navigation systems",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-neutral-200 bg-white p-3">
              {item}
            </div>
          ))}
        </div>
      </Modal>
      <Modal
        open={activeModal === "diving"}
        onClose={closeModal}
        title="Diving & snorkeling safety"
        subtitle="Protocols for in-water activities."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 text-base leading-7 text-secondary-600">
          {[
            "Certified dive professionals lead and supervise all diving activities (PADI/SSI or equivalent).",
            "Pre-dive briefings cover signals, equipment use, and marine life interaction.",
            "Equipment is inspected before each use; buddy system enforced for divers.",
            "Extra supervision for beginners and emergency protocols for DCS and evacuation.",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-neutral-200 bg-white p-3">
              {item}
            </div>
          ))}
        </div>
      </Modal>
      <Modal
        open={activeModal === "cancellation"}
        onClose={closeModal}
        title="Cancellation policy"
        subtitle="Clear terms, no surprises."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 text-base leading-7 text-secondary-600">
          {visiblePolicyItems.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-neutral-200 bg-white p-3">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-secondary-500">Compact view</div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPolicyExpanded((v) => !v)}
            size="sm"
          >
            {policyExpanded ? "See less" : "See more"}
            <ChevronDown className={cn("h-4 w-4 transition", policyExpanded ? "rotate-180" : "rotate-0")} />
          </Button>
        </div>
      </Modal>
    </Section>
  );
}
function Compare() {
  const tiers = [
    {
      name: "Premium Private",
      variant: "shared",
      badge: "Best value",
      price: `from $35`,
      highlights: [
        "Upgraded premium yacht",
        "La Rossa beachclub lunch",
        "Land Tour to Kelingking Cliff",
        "1 extra sunset secret spot + Champagne",
        "Showers, towels, drinks & ice cream",
      ],
      cta: "Choose Premium Private",
      primary: false,
      toBook: true,
      href: "#booking",
    },
    {
      name: "Premium Private",
      variant: "premiumPrivate",
      badge: "Ultimate Choice",
      price: "$1200+",
      highlights: [
        "Everything in Premium Private included",
        "Private boat  only your group onboard",
        "You choose the route and pace",
        "Add extras on request (diving, photographer, jet ski)",
      ],
      cta: "Get more info",
      primary: true,
      toBook: true,
      href: "/prepiumprivate",
    },
    {
      name: "Private",
      variant: "private",
      badge: "For families & groups",
      price: "from $799",
      highlights: [
        "Choose your yacht model",
        "Private boat  only your group onboard",
        "Flexible pace and timing (within route)",
        "Add extras: diving, pro photographer, jet ski & more (optional)",
      ],
      cta: "See private options",
      primary: false,
      toBook: true,
      href: "/prepiumprivate",
    },
  ];
  const cardBase = "p-6 rounded-xl";
  return (
    <Section
      id="compare"
      kicker="Choose your option"
      title="Compare tours"
      subtitle="Want a more elevated experience? Upgrade anytime and enjoy extra comfort and premium touches on the same iconic route."
      backgroundClassName={SECTION_BACKGROUNDS.ocean}
      containerClassName="container"
    >
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] lg:grid lg:grid-cols-3">
        {tiers.map((t, i) => {
          const isFeatured = t.variant === "premiumPrivate";
          // If featured, use the new dark/glass style. Otherwise default.
          const cardVariant = isFeatured ? "qoves-featured" : "default";

          // Text colors need to adapt if it's the dark card
          const titleColor = isFeatured ? "text-white" : "text-secondary-900";
          const badgeColor = isFeatured ? "text-blue-200" : "text-primary-600";
          const mutedColor = isFeatured ? "text-slate-300" : "text-secondary-600";
          const borderColor = isFeatured ? "border-white/20" : "border-neutral-200";
          const checkColor = isFeatured ? "text-blue-300" : "text-primary-600";
          const pillColor = isFeatured ? "bg-white/10 text-white backdrop-blur-md" : "bg-neutral-100 text-secondary-500";

          return (
            <PremiumCard
              key={i}
              variant={cardVariant}
              className={cn(
                "min-w-85pct snap-start lg:min-w-0 flex flex-col p-6",
                // Remove the old cardTone logic which might conflict
              )}
            >
              {isFeatured ? (
                <>
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-xl bg-primary-50 blur-3xl" />
                  <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-xl bg-primary-50 blur-3xl" />
                </>
              ) : null}
              {isPrivate ? (
                <>
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-xl bg-primary-50 blur-3xl" />
                  <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-xl bg-primary-50 blur-3xl" />
                </>
              ) : null}
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className={cn("text-lg font-bold", titleColor)}>{t.name}</div>
                  <div className={cn("mt-1 text-xs font-bold uppercase tracking-widest", badgeColor)}>{t.badge}</div>
                </div>
                <div className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-semibold", pillColor)}>{t.price}</div>
              </div>

              {/* Divider/List container - making it transparent or subtle for the dark card */}
              <div className={cn("relative mt-6 pt-6 border-t", borderColor)}>
                <div className="space-y-3">
                  {t.highlights.map((h, idx) => (
                    <div key={idx} className={cn("flex items-start gap-3 text-sm", mutedColor)}>
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", checkColor)} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isFeatured ? (
                <div className="mt-8">
                  <div className="text-3xl font-bold text-white">$1200+</div>
                  <div className="text-sm text-slate-400">/group</div>
                </div>
              ) : null}
              <div className="relative mt-6 pt-4">
                {t.toBook ? (
                  <Button
                    href={t.href}
                    variant={isFeatured ? "primary" : "outline"}
                    className={cn("w-full rounded-full", isFeatured ? "bg-white text-slate-900 hover:bg-slate-100 border-none" : "")}
                  >
                    {t.cta} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => alert("Demo: route to selected product")} className="w-full rounded-full">
                    {t.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </PremiumCard>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="text-sm font-semibold text-secondary-900">Premium Private vs Standard Private (another operator)</div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2">
          <div className="min-w-80pct snap-start rounded-xl border border-neutral-200 bg-white p-4 sm:min-w-0">
            <div className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Bluuu Premium Private</div>
            <ul className="mt-3 space-y-2 text-sm text-secondary-600">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" /> Upgraded boat + premium onboard service
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" /> Longer day with extra time built in
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" /> Curated stops + crew that manages the full day
              </li>
            </ul>
          </div>
          <div className="min-w-80pct snap-start rounded-xl border border-neutral-200 bg-white p-4 sm:min-w-0">
            <div className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Typical standard private</div>
            <ul className="mt-3 space-y-2 text-sm text-secondary-600">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-secondary-300" /> Basic boat and minimal onboard service
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-secondary-300" /> Shorter day with tighter timing
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-secondary-300" /> Stops depend on availability and crew experience
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <div className="text-sm font-semibold text-secondary-900">Secure your seats in 60 seconds</div>
            <div className="mt-2 text-base leading-7 text-secondary-600">
              Pick a date and see your allinclusive total instantly  free cancellation up to 24 hours and a weather safety guarantee mean you can book early without risk.
            </div>
          </div>
          <div className="lg:col-span-4">
            <Button href="#booking" variant="secondary" className="w-full">
              Check availability <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
function FAQItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="pr-6 text-base font-semibold text-secondary-900">{q}</span>
        <span className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          isOpen
            ? "rotate-45 border-primary-200 bg-primary-50 text-primary-500"
            : "border-neutral-200 bg-neutral-50 text-secondary-400"
        )}>
          <Plus className="h-3.5 w-3.5" />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="px-6 pb-5 pr-16 text-sm leading-relaxed text-secondary-500 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-secondary-700 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:text-primary-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: a }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const { faqs: dynamicFaqs } = useTours();
  const contacts = useSiteContacts();
  const [showAll, setShowAll] = useState(false);

  const displayFaqs = dynamicFaqs && dynamicFaqs.length > 0
    ? dynamicFaqs.map(f => ({ q: f.question, a: f.answer }))
    : [];

  const primaryFaqs = displayFaqs.slice(0, 5);

  return (
    <Section
      id="faq"
      backgroundClassName="bg-gradient-to-b from-[#f0f6ff] via-white to-[#f5f9ff]"
    >
      <div className="mx-auto w-full max-w-screen-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">FAQ</div>
          <h2 className={Q_THEME.text.h2}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {(showAll ? displayFaqs : primaryFaqs).map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          {!showAll && displayFaqs.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              See all questions
            </button>
          )}

          <div className="relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
              <img src="https://bluuu.tours/storage/app/media/images/manager.webp" alt="Expert" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-widest text-primary-600 mb-1">Ask an Expert</div>
              <div className="text-sm text-secondary-500 mb-3">Our team is ready to help you plan the perfect trip.</div>
              <div className="flex flex-wrap gap-4">
                {contacts.phone?.link && (
                  <a href={contacts.phone.link} className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-primary-500" />
                    {contacts.phone.number}
                  </a>
                )}
                {contacts.email && (
                  <a href={`mailto:${contacts.email}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-primary-500" />
                    {contacts.email}
                  </a>
                )}
                {contacts.whatsapp?.link && (
                  <a href={contacts.whatsapp.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5 text-primary-500" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
function BookingMini() {
  const [adults, setAdults] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  const { privateTours } = useTours();
  const initialPrice = privateTours?.[0]?.show_price || privateTours?.[0]?.gross_price || 0;
  const pricing = usePricing(date, initialPrice);
  const remainingSeats = pricing.remainingSeats;
  const maxGuests = Math.min(MAX_GUESTS, remainingSeats ?? MAX_GUESTS);
  const maxAdults = Math.max(1, maxGuests);
  const adultOptions = useMemo(() => Array.from({ length: maxAdults }, (_, i) => i + 1), [maxAdults]);
  const [pickupArea, setPickupArea] = useState(PICKUP_AREAS[0]);
  const [contact, setContact] = useState("");
  useEffect(() => {
    if (remainingSeats === null || maxGuests <= 0) return;
    if (adults > maxGuests) {
      setAdults(maxGuests);
    }
  }, [remainingSeats, maxGuests, adults]);
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Book now</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-secondary-600">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(INPUT_BASE, "px-3")}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-secondary-600">Adults</span>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              className={cn(INPUT_BASE, "appearance-none pl-10 pr-10")}
            >
              {adultOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
          </div>
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-secondary-600">Pickup area</span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            <select
              value={pickupArea}
              onChange={(e) => setPickupArea(e.target.value)}
              className={cn(INPUT_BASE, "appearance-none pl-10 pr-10")}
            >
              {PICKUP_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-secondary-600">WhatsApp</span>
          <PhoneInput value={contact} onChange={setContact} />
        </label>
      </div>
      <div className="mt-4 grid gap-2">
        <Button
          onClick={() => {
            window.location.hash = "#booking";
          }}
          className="w-full"
        >
          Reserve now <ArrowRight className="h-4 w-4" />
        </Button>
        <SecondaryButton onClick={() => alert("WhatsApp demo action")}>
          <MessageCircle className="h-4 w-4" />
          Questions? WhatsApp us
        </SecondaryButton>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge icon={Shield}>Free cancellation 24h</Badge>
        <Badge icon={Sun}>Weather guarantee</Badge>
      </div>
      {remainingSeats !== null ? (
        <div className="mt-3 text-sm text-secondary-500">Seats left for this date: {remainingSeats}</div>
      ) : null}
    </Card>
  );
}
function FinalCTA({
  selectedYacht,
  cartItems,
  extrasTotalUSD,
  selectedVibe,
  selectedStyleTitle,
  selectedExtrasSummary,
  reviewDateLabel,
  totalGuests,
  basePrice,
  extrasSubtotalIDR,
}) {
  const extrasSummaryLine = selectedExtrasSummary?.length
    ? selectedExtrasSummary
      .map((extra) => `${extra.name} ${extra.quantity} (${formatIDR(extra.price)})`)
      .join("  ")
    : "No extras selected";
  return (
    <section className="py-14 sm:py-16" id="booking">
      <div className="container">
        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-r from-primary-50 via-white to-primary-100 p-8 shadow-card animate-gradient-flow">
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-600">Ready to book</div>
              <h3 className="mt-2 text-2xl font-semibold text-secondary-900 sm:text-3xl">
                Reserve your Premium Private day  and let us run the logistics
              </h3>
              <p className="mt-3 text-sm leading-6 text-secondary-600 sm:text-base">
                Allinclusive pricing, instant confirmation, free 24h cancellation, and a weather safety guarantee.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button href="#booking" className="w-full">
                  Check availability <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => alert("WhatsApp demo action")} className="w-full">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp questions
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {BRAND.badges.slice(1).map((b, i) => (
                  <Badge key={i} icon={b.icon}>
                    {b.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="hidden sm:block lg:col-span-5">
              <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-secondary-600">
                <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Final review</div>
                <div className="mt-2 space-y-1">
                  <div>Boat: {selectedYacht?.name ?? "Premium boat"}</div>
                  <div>Date: {reviewDateLabel}</div>
                  <div>Guests: {totalGuests}</div>
                  <div>Day style: {selectedStyleTitle || "Classic route"}</div>
                  <div>Extras: {extrasSummaryLine}</div>
                </div>
                <div className="mt-2 text-sm text-secondary-500">
                  Base: {formatIDR(basePrice)}  Extras: {formatIDR(extrasSubtotalIDR)}  Total: {formatIDR(basePrice + extrasSubtotalIDR)}
                </div>
              </div>
              <BookingCard
                compact
                selectedYacht={selectedYacht}
                cartItems={cartItems}
                extrasTotalUSD={extrasTotalUSD}
                selectedVibe={selectedVibe}
                onOpenTourInfo={openTourInfo}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 sm:hidden">
          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-secondary-600">
            <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Final review</div>
            <div className="mt-2 space-y-1">
              <div>Boat: {selectedYacht?.name ?? "Premium boat"}</div>
              <div>Date: {reviewDateLabel}</div>
              <div>Guests: {totalGuests}</div>
              <div>Day style: {selectedStyleTitle || "Classic route"}</div>
              <div>Extras: {extrasSummaryLine}</div>
            </div>
            <div className="mt-2 text-sm text-secondary-500">
              Base: {formatIDR(basePrice)}  Extras: {formatIDR(extrasSubtotalIDR)}  Total: {formatIDR(basePrice + extrasSubtotalIDR)}
            </div>
          </div>
          <BookingCard
            compact
            selectedYacht={selectedYacht}
            cartItems={cartItems}
            extrasTotalUSD={extrasTotalUSD}
            selectedVibe={selectedVibe}
          />
        </div>
        <div className="mt-10 grid gap-6 border-t border-neutral-200 pt-8 text-sm text-secondary-500 sm:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-secondary-600">Instant confirmation</div>
            <ul className="mt-2 space-y-2">
              <li>Secure card checkout in under a minute.</li>
              <li>Confirmation + pickup details sent automatically.</li>
              <li>No need to message unless you have a special request.</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-secondary-600">No surprises</div>
            <ul className="mt-2 space-y-2">
              <li>All taxes, tickets, and lunch included.</li>
              <li>Small group vibe (13 guests max).</li>
              <li>Free cancellation up to 24h + weather guarantee.</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-secondary-600">Bring this</div>
            <ul className="mt-2 space-y-2">
              <li>Swimwear, sunscreen, and a dry change.</li>
              <li>Phone/camera for photos.</li>
              <li>Cash for optional extras if you want them.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
export default function Premium_Private_With_Vibe() {
  useSEO({
    title: "Private Yacht Tour to Nusa Penida | Bluuu Tours",
    description: "Exclusive private yacht charter from Bali to Nusa Penida. Manta rays, snorkeling, cliff views & gourmet lunch — up to 13 guests, fully crewed.",
  });
  const { selectedCurrency } = useCurrency();
  const { privateTours, privateTransfers: transfers, privateCovers: allCovers } = useTours();
  const { extras, privateRoutes } = useExtras();
  const covers = allCovers || [];
  // State Declarations
  const [selectedBoatId, setSelectedBoatId] = useState(null);
  const [dateMode, setDateMode] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("date") ? "exact" : "flex";
  });
  const [exactDate, setExactDate] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("date") || "";
  });
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [adults, setAdults] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const n = parseInt(p.get("adults") || "1", 10);
    return isNaN(n) || n < 1 ? 1 : n;
  });
  const [kids, setKids] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const n = parseInt(p.get("kids") || "0", 10);
    return isNaN(n) || n < 0 ? 0 : n;
  });
  const [dateSelectionPreference, setDateSelectionPreference] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("date") ? "pickNow" : "pickLater";
  });
  const [selectedFlexDate, setSelectedFlexDate] = useState("");
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const selectionModalGuardRef = useRef(0);
  const openSelectionModal = useCallback(() => {
    const now = Date.now();
    if (now - selectionModalGuardRef.current < 250) return;
    selectionModalGuardRef.current = now;
    setIsSelectionModalOpen(true);
  }, []);
  const closeSelectionModal = useCallback(() => {
    setIsSelectionModalOpen(false);
  }, []);
  const [selectedStyleId, setSelectedStyleId] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedTransferId, setSelectedTransferId] = useState(() => {
    const v = new URLSearchParams(window.location.search).get("transfer");
    return v ? parseInt(v, 10) || v : null;
  });
  const [selectedCoverId, setSelectedCoverId] = useState(null);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [calendarAvailMap, setCalendarAvailMap] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const dateParam = p.get("date");
    const d = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [tourDetails, setTourDetails] = useState(null);
  const [loadingTourDetails, setLoadingTourDetails] = useState(false);
  const [datePricing, setDatePricing] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [payMode, setPayMode] = useState("full");
  const [payMethod, setPayMethod] = useState("card");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedLiability, setAgreedLiability] = useState(false);
  const { fetchTourDetail } = useTours();

  useEffect(() => {
    trackPixelViewContent({ contentName: "Private Charter", value: 0, currency: "IDR" });
  }, []);

  const yachtOptions = useMemo(() => {
    // Backend already filters by classes_id=8
    const validTours = privateTours || [];
    if (!validTours.length) return [];
    // Map the filtered tours to yacht options.
    const options = validTours.map((tour) => {
      // Default price from packages.pricelist (first entry or entry for 1 person)
      let defaultPrice = 0;
      const pricelist = tour.packages?.pricelist || [];
      const rawList = Array.isArray(tour.list)
        ? tour.list
        : Array.isArray(tour?.json?.list)
          ? tour.json.list
          : [];
      const listItems = Array.from(
        new Set(
          rawList
            .map((item) => {
              if (typeof item === "string") return item.trim();
              if (item && typeof item === "object") {
                return String(item.text || item.test || item.title || "").trim();
              }
              return "";
            })
            .filter(Boolean)
        )
      );
      if (pricelist.length) {
        const entry = pricelist.find(p => Number(p.members_count) === 1) || pricelist[0];
        defaultPrice = Number(entry?.price) || 0;
      }
      return {
        id: String(tour.id),
        tourId: tour.id,
        name: tour.name || "Private Boat",
        slug: tour.slug || "",
        priceValue: defaultPrice,
        boat_price: Number(tour.boat_price) || 0,
        isPartner: !!tour.partner,
        people: tour.capacity || 1,
        lengthMeters: getBoatLength(tour),
        cover: tour.images_with_thumbs?.[0]?.thumb1 || tour.images_with_thumbs?.[0]?.original || "",
        cover_small: tour.images_with_thumbs?.[0]?.thumb1_small || "",
        images: tour.images_with_thumbs?.map(img => ({ path: img.original || img.thumb1 || "", thumb: img.thumb1 || img.original || "", thumb_small: img.thumb1_small || "" })) || [],
        description: tour.description || "",
        listItems,
        packages: tour.packages,
        status: tour.status || "ready",
        fleetSize: Number(tour.fleet_size) || 0,
        categories: Array.isArray(tour.categories) ? tour.categories : [],
        boatFeatures: tour.boatFeatures || null,
      };
    });
    // Final uniqueness sweep to prevent React duplicate key errors
    return Array.from(new Map(options.map(opt => [opt.id, opt])).values());
  }, [privateTours]);
  // Pre-select boat from URL ?tour= param once data is loaded
  const urlTourIdRef = useRef((() => {
    const n = parseInt(new URLSearchParams(window.location.search).get("tour") || "", 10);
    return isNaN(n) ? null : n;
  })());
  const urlTourAppliedRef = useRef(false);
  useEffect(() => {
    if (urlTourAppliedRef.current || !urlTourIdRef.current || !yachtOptions.length) return;
    const match = yachtOptions.find((y) => Number(y.tourId) === urlTourIdRef.current);
    if (match) {
      setSelectedBoatId(match.id);
      urlTourAppliedRef.current = true;
    }
  }, [yachtOptions]);
  const urlRouteIdRef = useRef((() => {
    const v = new URLSearchParams(window.location.search).get("route");
    return v || null;
  })());
  const urlRouteAppliedRef = useRef(false);
  useEffect(() => {
    if (urlRouteAppliedRef.current || !urlRouteIdRef.current || !(privateRoutes || []).length) return;
    const match = (privateRoutes || []).find(
      (s) => String(s.id) === String(urlRouteIdRef.current) || s.slug === urlRouteIdRef.current
    );
    if (match) {
      setSelectedStyleId(match.id || match.slug);
      urlRouteAppliedRef.current = true;
    }
  }, [privateRoutes]);
  const urlCoverIdRef = useRef((() => {
    const v = new URLSearchParams(window.location.search).get("cover");
    return v || null;
  })());
  const urlCoverAppliedRef = useRef(false);
  useEffect(() => {
    if (urlCoverAppliedRef.current || !urlCoverIdRef.current || !(covers || []).length) return;
    const match = (covers || []).find((c) => String(c.id) === String(urlCoverIdRef.current));
    if (match) {
      setSelectedCoverId(match.id);
      urlCoverAppliedRef.current = true;
    }
  }, [covers]);
  // Keep URL in sync with selections so browser back restores state
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (exactDate) p.set("date", exactDate); else p.delete("date");
    p.set("adults", String(adults));
    p.set("kids", String(kids));
    if (selectedBoatId) p.set("tour", selectedBoatId); else p.delete("tour");
    if (selectedStyleId) p.set("route", String(selectedStyleId)); else p.delete("route");
    if (selectedTransferId) p.set("transfer", String(selectedTransferId)); else p.delete("transfer");
    if (selectedCoverId) p.set("cover", String(selectedCoverId)); else p.delete("cover");
    history.replaceState(null, "", `?${p.toString()}`);
  }, [exactDate, adults, kids, selectedBoatId, selectedStyleId, selectedTransferId, selectedCoverId]);
  // Fetch availability from backend when user selects a date or date range
  useEffect(() => {
    if (!yachtOptions.some((y) => y.tourId)) return;
    const hasExact = dateMode === "exact" && exactDate;
    const hasRange = dateMode !== "exact" && rangeStart && rangeEnd;
    if (!hasExact && !hasRange) {
      setAvailabilityMap({});
      return;
    }
    const fetchAvailability = async () => {
      const results = {};
      const queryParams = hasExact
        ? `?date=${exactDate}`
        : `?start=${rangeStart}&end=${rangeEnd}`;
      try {
        await Promise.all(
          yachtOptions.map(async (yacht) => {
            if (!yacht.tourId) return;
            try {
              const res = await fetch(
                apiUrl(`availability/private/${yacht.tourId}${queryParams}`)
              );
              if (res.ok) {
                const data = await res.json();
                results[yacht.id] = data;
              }
            } catch (err) {
              console.error(`Failed to fetch availability for ${yacht.name}:`, err);
            }
          })
        );
        setAvailabilityMap(results);
      } catch (err) {
        console.error("Global fetch availability error:", err);
      }
    };
    fetchAvailability();
  }, [yachtOptions, dateMode, exactDate, rangeStart, rangeEnd]);

  // Preload availability for calendar month when boat is selected or month changes
  useEffect(() => {
    if (!selectedBoatId) return;
    const yacht = yachtOptions.find((y) => y.id === selectedBoatId);
    if (!yacht?.tourId) return;
    const [year, month] = calendarMonth.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    fetch(apiUrl(`availability/private/${yacht.tourId}?start=${start}&end=${end}`))
      .then((r) => r.json())
      .then((data) => {
        setCalendarAvailMap((prev) => ({
          ...prev,
          [selectedBoatId]: { ...(prev[selectedBoatId] || {}), ...data },
        }));
      })
      .catch(console.error);
  }, [selectedBoatId, calendarMonth, yachtOptions]);

  const isDateAvailable = useCallback((boatId, dateStr) => {
    if (!dateStr) return false;
    const boatAvailability = availabilityMap[boatId];
    // If we haven't fetched yet or no data, assume available
    if (!boatAvailability || Object.keys(boatAvailability).length === 0) return true;
    // API returns { "2026-02-15": 1, "2026-02-16": 0 }
    if (boatAvailability[dateStr] !== undefined) {
      return Number(boatAvailability[dateStr]) > 0;
    }
    // Date not in response  assume available
    return true;
  }, [availabilityMap]);
  const selectedYacht = useMemo(
    () => yachtOptions.find((yacht) => yacht.id === selectedBoatId) || null,
    [selectedBoatId, yachtOptions]
  );
  useEffect(() => {
    if (!selectedBoatId || !selectedYacht) {
      setTourDetails(null);
      return;
    }
    const loadTourDetail = async () => {
      setLoadingTourDetails(true);
      try {
        // We know it's a private tour  backend has classes_id=8.
        const tour = (privateTours || []).find(t => String(t.id) === String(selectedBoatId));
        if (tour && tour.slug) {
          const detail = await fetchTourDetail(tour.slug);
          if (detail) {
            setTourDetails(detail);
            // pricesbydates already included in tour detail response
            setDatePricing(detail.pricesbydates || null);
          }
        }
      } catch (err) {
        console.error("Error loading tour detail:", err);
      } finally {
        setLoadingTourDetails(false);
      }
    };
    loadTourDetail();
  }, [selectedBoatId, selectedYacht, privateTours, fetchTourDetail]);
  // Explicitly reset selected boat on mount as per user request
  useEffect(() => {
    setSelectedBoatId(null);
  }, []);
  const totalGuests = adults + kids;
  // Build a virtual tour object with date-based pricing for the hook
  const pricingTourData = useMemo(() => {
    if (!selectedYacht) return privateTours;
    if (!datePricing) return privateTours;
    // Merge date pricing into the tour object for the hook
    return (privateTours || []).map(t => {
      if (Number(t.id) !== Number(selectedYacht.tourId)) return t;
      return { ...t, pricesbydates: datePricing };
    });
  }, [privateTours, selectedYacht, datePricing]);
  const dynamicBoatPrice = useBoatPricing(
    selectedYacht?.tourId,
    dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart),
    totalGuests,
    pricingTourData
  );
  const mainBasePrice = dynamicBoatPrice ?? (selectedYacht?.priceValue || 0);
  // If we are using dynamic pricing from the pricelist, guest fee is usually built-in.
  // Otherwise, fallback to the manual guest fee calculation.
  const guestFeeTotal = dynamicBoatPrice !== null ? 0 : totalGuests * GUEST_FEE_IDR;
  const globalAvailabilityMap = useMemo(() => {
    // All dates available by default  availability is checked on-demand after selection
    const map = {};
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      map[iso] = true;
    }
    return map;
  }, []);
  const getAvailableDates = useCallback((boatId, start, end) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];
    if (endDate < startDate) return [];
    const dates = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate && dates.length < 31) {
      const iso = cursor.toISOString().slice(0, 10);
      if (isDateAvailable(boatId, iso)) {
        dates.push(iso);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }, [isDateAvailable]);
  const selectedStyle = useMemo(
    () => (privateRoutes || []).find((style) => String(style.id) === String(selectedStyleId) || style.slug === selectedStyleId) || null,
    [selectedStyleId, privateRoutes]
  );
  const selectedStyleTitle = selectedStyle
    ? selectedStyle.title
    : "Classic route";
  const rawExtrasCatalog = useMemo(() => {
    const mapExtra = (e, cat) => ({
      id: String(e.id),
      name: e.name || e.title || "Extra",
      price: Number(e.show_price || e.price || 0),
      pricingType: e.pricing_type || "per_booking",
      description: e.description || "",
      details: Array.isArray(e.details) ? e.details : (e.details ? [e.details] : []),
      available: e.available != null ? Number(e.available) : null,
      category: cat ? String(cat.id) : (e.ecategories?.[0]?.id ? String(e.ecategories[0].id) : "other"),
      categoryIds: cat ? [String(cat.id)] : (
        e.ecategories?.length
          ? e.ecategories.map(c => String(c.id || c))
          : ["other"]
      ),
      categoryName: cat?.name || e.ecategories?.[0]?.name || "",
      image: e.images_with_thumbs?.[0]?.thumb || e.images_with_thumbs?.[0]?.thumb1 || e.images_with_thumbs?.[0]?.original || "",
      image_small: e.images_with_thumbs?.[0]?.thumb_small || "",
      images_with_thumbs: e.images_with_thumbs,
      // Parent/child extras nesting
      children: (e.children || []).map(child => ({
        id: String(child.id),
        name: child.name || child.title || "Extra",
        price: Number(child.show_price || child.price || 0),
        available: child.available != null ? Number(child.available) : null,
        image: child.images_with_thumbs?.[0]?.thumb || child.images_with_thumbs?.[0]?.thumb1 || child.images_with_thumbs?.[0]?.original || "",
        image_small: child.images_with_thumbs?.[0]?.thumb_small || "",
        images_with_thumbs: child.images_with_thumbs,
        description: child.description || "",
      })),
      hasChildren: (e.children || []).length > 0,
    });
    // Use global extras
    return (extras || []).map(e => mapExtra(e, null));
  }, [extras]);
  const extrasCatalog = useMemo(() => {
    if (!selectedStyle || !selectedStyle.ecategories) return rawExtrasCatalog;
    const allowedIds = new Set(selectedStyle.ecategories.map(cat => String(cat.id || cat)));
    return rawExtrasCatalog.filter(extra => {
      // Show extra if ANY of its categories match the route's allowed categories
      return extra.categoryIds.some(catId => allowedIds.has(catId));
    });
  }, [rawExtrasCatalog, selectedStyle]);
  const extraLookupById = useMemo(() => {
    return extrasCatalog.reduce((acc, extra) => {
      acc[extra.id] = extra;
      if (extra.children?.length) {
        extra.children.forEach((child) => {
          acc[child.id] = {
            ...child,
            pricingType: extra.pricingType || "per_booking",
            category: extra.category,
            categoryIds: extra.categoryIds,
            categoryName: extra.categoryName,
            parentId: extra.id,
            parentName: extra.name,
            hasChildren: false,
          };
        });
      }
      return acc;
    }, {});
  }, [extrasCatalog]);
  const vibes = useMemo(() => {
    return yachtOptions.map(y => ({
      id: y.id,
      title: y.name,
      hero: y.cover,
      photos: y.images,
      description: y.description,
    }));
  }, [yachtOptions]);
  const [showConfigBadge, setShowConfigBadge] = useState(false);
  const [extrasCart, setExtrasCart] = useState([]);
  const reviewDateLabel =
    dateMode === "exact" && exactDate
      ? formatShortDate(exactDate)
      : dateMode === "flex" && selectedFlexDate
        ? formatShortDate(selectedFlexDate)
        : "Date not selected";
  const extrasSubtotalIDR = useMemo(() => {
    let sum = Object.entries(selectedExtras).reduce((acc, [id, qty]) => {
      const quantity = Number(qty) || 0;
      if (quantity <= 0) return acc;
      const extra = extraLookupById[id];
      if (!extra) return acc;
      return acc + quantity * Number(extra.price || 0);
    }, 0);
    // Add selected transfer
    if (selectedTransferId) {
      const transfer = transfers?.find(t => String(t.id) === String(selectedTransferId));
      if (transfer) {
        const price = Number(transfer.price || 0);
        const cars = price > 0 ? Math.ceil(totalGuests / 5) : 1;
        sum += price * cars;
      }
    }
    // Add selected cover
    if (selectedCoverId) {
      const cover = covers?.find(c => String(c.id) === String(selectedCoverId));
      if (cover) {
        sum += Number(cover.price || 0);
      }
    }
    return sum;
  }, [selectedExtras, extraLookupById, selectedTransferId, selectedCoverId, transfers, covers, totalGuests]);
  const selectedExtrasSummary = useMemo(() => {
    const summary = Object.entries(selectedExtras)
      .map(([id, qty]) => {
        const quantity = Number(qty) || 0;
        if (quantity <= 0) return null;
        const extra = extraLookupById[id];
        if (!extra) return null;
        return { ...extra, quantity };
      })
      .filter(Boolean);
    // Add transfer to summary
    if (selectedTransferId) {
      const transfer = transfers?.find(t => String(t.id) === String(selectedTransferId));
      if (transfer) {
        const price = Number(transfer.price || 0);
        const quantity = price > 0 ? Math.ceil(totalGuests / 5) : 1;
        summary.push({
          id: `transfer-${transfer.id}`,
          name: transfer.name,
          price,
          pricingType: "per_booking",
          quantity,
        });
      }
    }
    // Add cover to summary
    if (selectedCoverId) {
      const cover = covers?.find(c => String(c.id) === String(selectedCoverId));
      if (cover) {
        summary.push({
          id: `cover-${cover.id}`,
          name: cover.name,
          price: Number(cover.price || 0),
          pricingType: "per_boat",
          quantity: 1
        });
      }
    }
    return summary;
  }, [selectedExtras, extraLookupById, selectedTransferId, selectedCoverId, transfers, covers, totalGuests]);
  const hasDateCriteria = dateMode === "exact" ? !!exactDate : !!(rangeStart && rangeEnd);
  const canProceedFromStepOne = hasDateCriteria && totalGuests > 0;
  const boatAvailability = useMemo(() => {
    return yachtOptions.reduce((acc, yacht) => {
      const capacityOk = totalGuests <= yacht.people;
      let availableDates = [];
      // available = date availability only (not capacity)
      let dateAvailable = true;
      if (dateMode === "exact") {
        if (exactDate) {
          dateAvailable = isDateAvailable(yacht.id, exactDate);
        }
      } else if (rangeStart && rangeEnd) {
        availableDates = getAvailableDates(yacht.id, rangeStart, rangeEnd);
        dateAvailable = availableDates.length > 0;
      }
      acc[yacht.id] = {
        available: dateAvailable,
        capacityOk,
        availableDates,
        nextAvailable: availableDates[0] ?? null,
      };
      return acc;
    }, {});
  }, [dateMode, exactDate, rangeStart, rangeEnd, totalGuests, yachtOptions, isDateAvailable, getAvailableDates]);

  const totalPrice = mainBasePrice + guestFeeTotal + extrasSubtotalIDR;
  const partPrice = Math.round(totalPrice * 0.5);
  const handleOpenCheckout = () => {
    trackAddToCart({
      value: totalPrice,
      currency: "IDR",
      items: [
        buildTourAnalyticsItem({
          itemId: selectedYacht?.tourId ?? selectedYacht?.id,
          itemName: selectedYacht?.name || "Private Tour",
          itemCategory: "Private Tour",
          price: totalPrice,
        }),
      ],
    });
    setIsCheckoutOpen(true);
    setTimeout(() => document.getElementById("step-checkout")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleApplyCheckout = () => {
    console.log('[checkout] selectedStyleId:', selectedStyleId, '| selectedStyle:', selectedStyle);
    const params = new URLSearchParams({
      date: dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart || ""),
      adults: String(adults),
      kids: String(kids),
      boat: String(selectedYacht?.tourId ?? selectedYacht?.id ?? ""),
      tourId: String(selectedYacht?.tourId ?? selectedYacht?.id ?? ""),
      tourName: selectedYacht?.name ?? "Private Tour",
      tourCategory: "Private Tour",
      style: String(selectedStyle?.id ?? ""),
      programId: String(selectedStyle?.program_id ?? ""),
      restaurantId: String(selectedStyle?.restaurant_id ?? ""),
      payMode,
      payMethod,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      requests: specialRequests,
      pickup_address: pickupAddress,
      dropoff_address: dropoffAddress,
      boatPrice: String(selectedYacht?.boat_price ?? 0),
      totalBoatPrice: String(mainBasePrice ?? 0),
      guestFeeTotal: String(guestFeeTotal ?? 0),
      extrasTotal: String(extrasSubtotalIDR ?? 0),
      analyticsCurrency: "IDR",
      analyticsTotal: String(totalPrice),
    });
    if (selectedExtrasSummary.length) {
      params.set("extras", JSON.stringify(selectedExtrasSummary.map(i => ({
        id: i.id,
        quantity: i.quantity,
        price: i.price ?? 0,
        name: i.name ?? "",
      }))));
    }
    window.location.href = `/new/payment?${params.toString()}`;
  };
  const availableYachts = useMemo(() => {
    const baseList = yachtOptions.filter((yacht) => totalGuests <= yacht.people);
    if (!hasDateCriteria) return baseList;
    return baseList.filter((yacht) => boatAvailability[yacht.id]?.available);
  }, [boatAvailability, hasDateCriteria, totalGuests]);
  const [tourInfoTab, setTourInfoTab] = useState("included");
  const [tourInfoContext, setTourInfoContext] = useState(null);
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);
  const [isManageExtrasOpen, setIsManageExtrasOpen] = useState(false);
  const handleAddExtra = (pick) => {
    const quantity = pick.quantity || 1;
    setExtrasCart((prev) => {
      const existing = prev.find((item) => item.id === pick.id);
      if (!existing) {
        return [
          ...prev,
          {
            id: pick.id,
            title: pick.title,
            priceUSD: pick.priceUSD,
            selection: pick.selection,
            quantity,
          },
        ];
      }
      return prev.map((item) =>
        item.id === pick.id
          ? {
            ...item,
            quantity: (item.quantity || 1) + quantity,
            selection: pick.selection ?? item.selection,
          }
          : item
      );
    });
  };
  const handleRemoveExtra = (id, options = {}) => {
    setExtrasCart((prev) => {
      if (!options.decrement) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.flatMap((item) => {
        if (item.id !== id) return item;
        const nextQuantity = (item.quantity || 1) - 1;
        if (nextQuantity <= 0) return [];
        return { ...item, quantity: nextQuantity };
      });
    });
  };
  const handleExtraQtyChange = (id, qty) => {
    setSelectedExtras((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
        return next;
      }
      // Respect `available` limit from extras
      const extra = extraLookupById[id];
      const maxQty = extra?.available != null ? extra.available : Infinity;
      next[id] = Math.min(qty, maxQty);
      return next;
    });
  };
  useEffect(() => {
    if (!hasDateCriteria) {
      if (selectedBoatId) setSelectedBoatId(null);
      return;
    }
    if (!availableYachts.length) {
      setSelectedBoatId(null);
      return;
    }
    if (selectedBoatId && !availableYachts.some((yacht) => yacht.id === selectedBoatId)) {
      setSelectedBoatId(null);
    }
  }, [availableYachts, selectedBoatId, hasDateCriteria]);
  useEffect(() => {
    if (dateMode === "exact") {
      setRangeStart("");
      setRangeEnd("");
      setDateSelectionPreference("pickLater");
      setSelectedFlexDate("");
      return;
    }
    setExactDate("");
  }, [dateMode]);
  useEffect(() => {
    if (dateSelectionPreference === "pickLater") {
      setSelectedFlexDate("");
    }
  }, [dateSelectionPreference]);
  useEffect(() => {
    if (!selectedFlexDate) return;
    if (!rangeStart || !rangeEnd) {
      setSelectedFlexDate("");
      return;
    }
    if (selectedFlexDate < rangeStart || selectedFlexDate > rangeEnd) {
      setSelectedFlexDate("");
    }
  }, [selectedFlexDate, rangeStart, rangeEnd]);
  useEffect(() => {
    if (!selectedCoverId) return;
    if (!covers.some((cover) => String(cover.id) === String(selectedCoverId))) {
      setSelectedCoverId(null);
    }
  }, [selectedCoverId, covers]);
  useEffect(() => {
    if (!selectedStyleId) return;
    if (!(privateRoutes || []).some((style) => String(style.id) === String(selectedStyleId) || style.slug === selectedStyleId)) {
      setSelectedStyleId(null);
    }
  }, [selectedStyleId, privateRoutes]);
  const openTourInfo = useCallback((tabId, nextContext = null) => {
    if (tabId) setTourInfoTab(tabId);
    setTourInfoContext(nextContext);
    setIsTourInfoOpen(true);
  }, [setTourInfoTab, setTourInfoContext, setIsTourInfoOpen]);
  const [highlightExtraId, setHighlightExtraId] = useState(null);
  const highlightTimerRef = useRef(null);
  const triggerExtraHighlight = useCallback((extraId) => {
    if (!extraId) return;
    setHighlightExtraId(extraId);
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightExtraId(null);
      highlightTimerRef.current = null;
    }, 2200);
  }, []);
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);
  const stepThreeLocked = !canProceedFromStepOne;
  const stepTwoLocked = !canProceedFromStepOne || !selectedStyleId;
  const stepExtrasLocked = !canProceedFromStepOne || !selectedStyleId || !selectedBoatId;
  const stepFiveLocked = stepExtrasLocked;
  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  const inlineHintMessage = "Select the options above to activate this section.";
  const stepOneInlineHint = { message: inlineHintMessage, actionLabel: "Go to Step 1", targetId: "step-1" };
  const routeInlineHint = { message: inlineHintMessage, actionLabel: "Go to Step 2", targetId: "step-2" };
  const boatInlineHint = { message: inlineHintMessage, actionLabel: "Go to Step 3", targetId: "step-3" };
  const stepThreeInlineHint = stepThreeLocked ? stepOneInlineHint : null;
  const stepTwoInlineHint = stepTwoLocked
    ? !canProceedFromStepOne
      ? stepOneInlineHint
      : routeInlineHint
    : null;
  const stepExtrasInlineHint = stepExtrasLocked
    ? !canProceedFromStepOne
      ? stepOneInlineHint
      : !selectedStyleId
        ? routeInlineHint
        : boatInlineHint
    : null;
  const stepFiveInlineHint = stepFiveLocked
    ? !canProceedFromStepOne
      ? stepOneInlineHint
      : !selectedStyleId
        ? routeInlineHint
        : boatInlineHint
    : null;
  const renderInlineDateHint = (hint) => {
    if (!hint) return null;
    return (
      <div className="pointer-events-none absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 justify-center">
        <Button
          type="button"
          variant="secondary"
          className="pointer-events-auto h-9 shrink-0 whitespace-nowrap rounded-full border border-primary-200 bg-white/95 px-5 text-sm font-semibold text-primary-700 shadow-sm hover:bg-primary-50"
          onClick={() => scrollToSection(hint.targetId)}
        >
          {hint.actionLabel}
        </Button>
      </div>
    );
  };
  const { activePolicyKey: globalPolicyKey, activePolicy: globalPolicy, closePolicy: closeGlobalPolicy } = usePolicyModal();
  return (
    <>
      <CurrencyBridge />
      <div
        className="min-h-screen text-secondary-900 bg-neutral-100"
      >
        <Navbar
          variant="fullbar"
          links={SITE_NAV_LINKS}
          cta={{ label: "Check availability", href: "#booking" }}
        />
        <Hero />
        <HowItWorks />
        <StepOne
          dateMode={dateMode}
          onDateModeChange={setDateMode}
          exactDate={exactDate}
          onExactDateChange={setExactDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeStartChange={setRangeStart}
          onRangeEndChange={setRangeEnd}
          adults={adults}
          kids={kids}
          onAdultsChange={setAdults}
          onKidsChange={setKids}
          guestFeeTotal={guestFeeTotal}
          totalGuests={totalGuests}
          canContinue={canProceedFromStepOne}
          onContinue={() => {
            const target = document.getElementById("step-2");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          globalAvailabilityMap={globalAvailabilityMap}
        />
        <div className="relative">
          <div className={cn(stepThreeLocked && "pointer-events-none select-none opacity-45")}>
            <StepThree
              selectedStyleId={selectedStyleId}
              onSelectStyleId={(id) => {
                setSelectedStyleId(id);
                setTimeout(() => {
                  const target = document.getElementById("tour-details-section");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              vibes={vibes}
              styles={privateRoutes}
              extrasCatalog={extrasCatalog}
              onContinue={() => {
                const target = document.getElementById("step-3");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onSkip={() => {
                const target = document.getElementById("step-3");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onHighlightExtra={triggerExtraHighlight}
              onOpenTourInfo={openTourInfo}
            />
          </div>
          {renderInlineDateHint(stepThreeInlineHint)}
        </div>
        <div className="relative">
          <div className={cn(stepTwoLocked && "pointer-events-none select-none opacity-45")}>
            <StepTwo
              dateMode={dateMode}
              exactDate={exactDate}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              groupSize={totalGuests}
              adults={adults}
              kids={kids}
              selectedBoatId={selectedBoatId}
              onSelectBoatId={(id) => {
                if (!hasDateCriteria) return;
                setSelectedBoatId(id);
                // Only scroll if NOT in flexible mode
                if (dateMode !== "flex") {
                  const target = document.getElementById(selectedStyleId ? "step-6" : "step-2");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              availabilityByBoat={boatAvailability}
              hasDateCriteria={hasDateCriteria}
              dateSelectionPreference={dateSelectionPreference}
              onDateSelectionPreference={setDateSelectionPreference}
              selectedFlexDate={selectedFlexDate}
              onSelectFlexDate={(date) => {
                setSelectedFlexDate(date);
              }}
              onSwitchToFlex={() => {
                setDateMode("flex");
                // Check if we have range, if not scroll Step 1.
                // Logic for modal open will be handled by StepTwo invoking onOpenDateModal from logic inside
                openSelectionModal();
              }}
              onOpenTourInfo={openTourInfo}
              onOpenDateModal={openSelectionModal}
              boats={yachtOptions}
              privateTours={privateTours}
              selectedStyleTitle={selectedStyleTitle}
              selectedStyleId={selectedStyleId}
            />
          </div>
          {renderInlineDateHint(stepTwoInlineHint)}
        </div>

        {/* Date Selection Modal */}
        <AnimatePresence>
          {isSelectionModalOpen && (
            <Modal
              isOpen={isSelectionModalOpen}
              onClose={closeSelectionModal}
              title="Select Dates"
            >
              <div className="p-1">
                {dateMode === "exact" ? (
                  <CustomDatePicker
                    mode="single"
                    selected={exactDate ? new Date(exactDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                        setExactDate(iso);
                        closeSelectionModal();
                      }
                    }}
                    inline
                  />
                ) : (
                  <CustomDatePicker
                    mode="range"
                    selected={{
                      from: rangeStart ? new Date(rangeStart) : undefined,
                      to: rangeEnd ? new Date(rangeEnd) : undefined,
                    }}
                    onSelect={(range) => {
                      if (range?.from) {
                        const fromIso = new Date(range.from.getTime() - range.from.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                        setRangeStart(fromIso);
                      } else {
                        setRangeStart("");
                      }
                      if (range?.to) {
                        const toIso = new Date(range.to.getTime() - range.to.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                        setRangeEnd(toIso);
                      } else {
                        setRangeEnd("");
                      }
                    }}
                    inline
                  />
                )}
                <div className="mt-4 flex justify-end">
                  <Button onClick={closeSelectionModal}>Done</Button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
        <Modal
          isOpen={isTourInfoOpen}
          onClose={() => setIsTourInfoOpen(false)}
          maxWidth="max-w-4xl"
          bodyClassName="p-0"
          showClose={false}
        >
          <TourInfoModal
            activeTab={tourInfoTab}
            onTabChange={setTourInfoTab}
            onClose={() => setIsTourInfoOpen(false)}
          />
        </Modal>
        <div className="relative">
          <div className={cn(stepExtrasLocked && "pointer-events-none select-none opacity-45")}>
            <StepExtras
              selectedStyleId={selectedStyleId}
              selectedStyleTitle={selectedStyleTitle}
              transfers={transfers}
              selectedTransferId={selectedTransferId}
              onSelectTransferId={setSelectedTransferId}
              covers={covers}
              selectedCoverId={selectedCoverId}
              onSelectCoverId={setSelectedCoverId}
              totalGuests={totalGuests}
              extrasCatalog={extrasCatalog}
              selectedExtras={selectedExtras}
              isSelectionModalOpen={isSelectionModalOpen}
              setIsSelectionModalOpen={setIsSelectionModalOpen}
              isManageExtrasOpen={isManageExtrasOpen}
              setIsManageExtrasOpen={setIsManageExtrasOpen}
              onChangeExtraQty={handleExtraQtyChange}
              adults={adults}
              onOpenTourInfo={openTourInfo}
              highlightExtraId={highlightExtraId}
              pickupAddress={pickupAddress}
              onSetPickupAddress={setPickupAddress}
              dropoffAddress={dropoffAddress}
              onSetDropoffAddress={setDropoffAddress}
              onReview={() => {
                const target = document.getElementById("step-review");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onSkip={() => {
                setSelectedExtras({});
                const target = document.getElementById("step-review");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            />
          </div>
          {renderInlineDateHint(stepExtrasInlineHint)}
        </div>
        <PremiumSection backgroundClassName={SECTION_BACKGROUNDS.white}>
          <PremiumContainer>
            <div className="rounded-xl border border-neutral-200 bg-white px-6 pt-6 pb-10">
              <h2 className="mb-4 text-xl font-semibold text-secondary-900">
                What our customers say
              </h2>
              <div className="relative overflow-visible">
                <div className="elfsight-app-1f614ea8-8602-4273-83b3-ab40c213a3d7" data-elfsight-app-lazy></div>
              </div>
            </div>
          </PremiumContainer>
        </PremiumSection>
        <div className="relative">
          <div className={cn(stepFiveLocked && "pointer-events-none select-none opacity-45")}>
            <StepFive
              dateLabel={reviewDateLabel}
              dateMode={dateMode}
              exactDate={exactDate}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              adults={adults}
              kids={kids}
              onDateModeChange={setDateMode}
              onExactDateChange={setExactDate}
              onRangeStartChange={setRangeStart}
              onRangeEndChange={setRangeEnd}
              onAdultsChange={setAdults}
              onKidsChange={setKids}
              groupSize={totalGuests}
              selectedBoat={selectedYacht}
              selectedStyleTitle={selectedStyleTitle}
              selectedStyleId={selectedStyleId}
              selectedExtrasSummary={selectedExtrasSummary}
              basePrice={mainBasePrice}
              guestFeeTotal={guestFeeTotal}
              extrasSubtotalIDR={extrasSubtotalIDR}
              onOpenTourInfo={openTourInfo}
              onHighlightExtra={triggerExtraHighlight}
              availabilityMap={availabilityMap}
              calendarAvailMap={calendarAvailMap}
              onCalendarMonthChange={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                setCalendarMonth(`${y}-${m}`);
              }}
              selectedBoatId={selectedBoatId}
              onOpenManageExtras={() => setIsManageExtrasOpen(true)}
              onChangeExtraQty={handleExtraQtyChange}
              onReserve={handleOpenCheckout}
            />
            <AnimatePresence>
              {isCheckoutOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <StepCheckout
                    // id="step-checkout" is inside the component
                    step={checkoutStep}
                    onSetStep={setCheckoutStep}
                    totalPrice={totalPrice}
                    partPrice={partPrice}
                    payMode={payMode}
                    onSetPayMode={setPayMode}
                    payMethod={payMethod}
                    onSetPayMethod={setPayMethod}
                    contactName={contactName}
                    onSetName={setContactName}
                    contactEmail={contactEmail}
                    onSetEmail={setContactEmail}
                    contactPhone={contactPhone}
                    onSetPhone={setContactPhone}
                    specialRequests={specialRequests}
                    onSetSpecialRequests={setSpecialRequests}
                    agreedTerms={agreedTerms}
                    onSetAgreedTerms={setAgreedTerms}
                    agreedLiability={agreedLiability}
                    onSetAgreedLiability={setAgreedLiability}
                    onFinalize={handleApplyCheckout}
                    onCancel={() => {
                      setIsCheckoutOpen(false);
                      setTimeout(() => document.getElementById("step-review")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {renderInlineDateHint(stepFiveInlineHint)}
        </div>
        <FAQ />
        <Footer />

        <div className="h-24 sm:hidden" />
      </div>
      <PolicyModal activePolicyKey={globalPolicyKey} activePolicy={globalPolicy} onClose={closeGlobalPolicy} />
    </>
  );
}

function StepCheckout({
  step,
  onSetStep,
  totalPrice,
  partPrice,
  payMode,
  onSetPayMode,
  payMethod,
  onSetPayMethod,
  contactName,
  onSetName,
  contactEmail,
  onSetEmail,
  contactPhone,
  onSetPhone,
  specialRequests,
  onSetSpecialRequests,
  agreedTerms,
  onSetAgreedTerms,
  agreedLiability,
  onSetAgreedLiability,
  onFinalize,
  onCancel,
}) {
  const isLastStep = step === 3;
  const canContinue = isLastStep ? (contactName && contactEmail && agreedTerms && agreedLiability) : true;
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePhone = (phone) => {
    return String(phone).match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
  };

  const handleFinalize = () => {
    const newErrors = {};
    if (!contactName?.trim()) newErrors.contactName = "Name is required";
    if (!contactEmail?.trim()) {
      newErrors.contactEmail = "Email is required";
    } else if (!validateEmail(contactEmail)) {
      newErrors.contactEmail = "Invalid email format";
    }
    if (contactPhone?.trim() && !validatePhone(contactPhone)) {
      newErrors.contactPhone = "Invalid phone format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onFinalize();
  };

  const handleChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const steps = [
    { num: 1, label: "Payment option" },
    { num: 2, label: "Payment method" },
    { num: 3, label: "Your details" },
  ];
  const { activePolicyKey, activePolicy, openPolicy: openPolicyModal, closePolicy: closePolicyModal } = usePolicyModal();

  return (
    <>
      <Section id="step-checkout" className="py-8 sm:py-10" containerClassName="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Complete your booking</h2>
            <p className="mt-1 text-sm text-secondary-500 sm:text-base">Secure your spot in just a few steps.</p>
          </div>

          <div className="relative mb-7">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-neutral-100" />
            <div className="relative flex justify-between">
              {steps.map((s) => {
                const isActive = s.num === step;
                const isCompleted = s.num < step;
                return (
                  <div key={s.num} className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => isCompleted ? onSetStep(s.num) : null}
                      disabled={!isCompleted}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                        isActive ? "border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-110" :
                          isCompleted ? "border-primary-600 bg-white text-primary-600 hover:bg-primary-50 cursor-pointer" :
                            "border-neutral-200 bg-white text-neutral-300"
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold">{s.num}</span>}
                    </button>
                    <span
                      onClick={() => isCompleted ? onSetStep(s.num) : null}
                      className={cn(
                        "absolute -bottom-5 text-xs leading-tight font-bold uppercase tracking-wider whitespace-nowrap transition-colors",
                        isActive ? "text-primary-700" : isCompleted ? "text-primary-600 cursor-pointer" : "text-neutral-300"
                      )}
                      style={{ left: s.num === 1 ? '0' : s.num === 3 ? 'auto' : '50%', right: s.num === 3 ? '0' : 'auto', transform: s.num === 2 ? 'translateX(-50%)' : 'none' }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-3 h-2" />

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg shadow-neutral-100/40 sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-secondary-900 sm:mb-5 sm:text-xl">
              {step === 1 ? "How would you like to pay?" : step === 2 ? "Select payment method" : "Contact details"}
            </h3>

            {step === 1 && (
              <div className="space-y-2.5">
                <button
                  onClick={() => onSetPayMode("full")}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                    payMode === "full"
                      ? "border-primary-600 bg-primary-50/50 ring-1 ring-primary-600/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                  )}
                >
                  <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all", payMode === "full" ? "border-primary-600 bg-primary-600" : "border-neutral-300 bg-transparent")}>
                    {payMode === "full" && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <span className="font-bold text-secondary-900">Pay in full</span>
                      <span className="font-bold text-secondary-900">{formatIDR(totalPrice)}</span>
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                      Secure your boat immediately with a single seamless payment.
                    </div>
                    {payMode === "full" && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-bold text-primary-700">
                        <Check className="h-3.5 w-3.5" />
                        <span>Most popular choice</span>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => onSetPayMode("part")}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                    payMode === "part"
                      ? "border-primary-600 bg-primary-50/50 ring-1 ring-primary-600/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                  )}
                >
                  <div className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all", payMode === "part" ? "border-primary-600 bg-primary-600" : "border-neutral-300 bg-transparent")}>
                    {payMode === "part" && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-secondary-900">Pay 50% deposit</span>
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary-500">Flexible</span>
                      </div>
                      <span className="font-bold text-secondary-900">{formatIDR(partPrice)}</span>
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                      Pay {formatIDR(partPrice)} now, and the rest ({formatIDR(totalPrice - partPrice)}) on the day.
                    </div>
                  </div>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <button
                  onClick={() => onSetPayMethod("card")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border-2 p-3.5 transition",
                    payMethod === "card" ? "border-primary-600 bg-primary-50/30" : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <img src="https://bluuu.tours/themes/bluuu/assets/icons/card_icon.svg" alt="Card" className="h-7 w-auto" />
                    <div className="text-left">
                      <div className="font-bold text-secondary-900">Card payment</div>
                      <div className="text-xs text-secondary-500">Payment in IDR, 3% merchant fee apply.</div>
                    </div>
                  </div>
                  <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", payMethod === "card" ? "border-primary-600" : "border-neutral-300")}>
                    {payMethod === "card" && <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
                  </div>
                </button>
                <button
                  onClick={() => onSetPayMethod("paypal")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border-2 p-3.5 transition",
                    payMethod === "paypal" ? "border-primary-600 bg-primary-50/30" : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <img src="https://bluuu.tours/themes/bluuu/assets/icons/paypal_icon.svg" alt="PayPal" className="h-7 w-auto" />
                    <div className="text-left">
                      <div className="font-bold text-secondary-900">Paypal</div>
                      <div className="text-xs text-secondary-500">Fast checkout, 5% fee apply.</div>
                    </div>
                  </div>
                  <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", payMethod === "paypal" ? "border-primary-600" : "border-neutral-300")}>
                    {payMethod === "paypal" && <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
                  </div>
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3.5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Name*</label>
                    <input
                      type="text"
                      
                      value={contactName}
                      onChange={(e) => handleChange("contactName", e.target.value, onSetName)}
                      placeholder="Enter your full name"
                      className={cn(
                        "mt-1 w-full rounded-lg border bg-neutral-50 px-3 py-2.5 text-sm focus:ring-1",
                        errors.contactName
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-neutral-200 focus:border-primary-600 focus:ring-primary-600"
                      )}
                    />
                    {errors.contactName && <p className="mt-1 text-xs text-red-500">{errors.contactName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Email*</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value, onSetEmail)}
                      placeholder="Enter your email address"
                      className={cn(
                        "mt-1 w-full rounded-lg border bg-neutral-50 px-3 py-2.5 text-sm focus:ring-1",
                        errors.contactEmail
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-neutral-200 focus:border-primary-600 focus:ring-primary-600"
                      )}
                    />
                    {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">WhatsApp Number</label>
                    <div className="mt-1">
                      <PhoneInput
                        value={contactPhone}
                        onChange={(val) => handleChange("contactPhone", val, onSetPhone)}
                      />
                    </div>
                    {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Any special requests?</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => onSetSpecialRequests(e.target.value)}
                    placeholder="Write your comments here"
                    type="text"
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="checkout-agreed-terms"
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => onSetAgreedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-primary-600 focus:ring-primary-600"
                    />
                    <div className="text-sm leading-5 text-secondary-600">
                      I agree with terms of{" "}
                      <button
                        type="button"
                        onClick={() => openPolicyModal("privacy")}
                        className="font-semibold text-primary-600 underline underline-offset-2"
                      >
                        Privacy Policy
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => openPolicyModal("cancellation")}
                        className="font-semibold text-primary-600 underline underline-offset-2"
                      >
                        Cancelation Policy
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <input
                      id="checkout-agreed-liability"
                      type="checkbox"
                      checked={agreedLiability}
                      onChange={(e) => onSetAgreedLiability(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-primary-600 focus:ring-primary-600"
                    />
                    <div className="text-sm leading-5 text-secondary-600">
                      I consent to the{" "}
                      <button
                        type="button"
                        onClick={() => openPolicyModal("liability")}
                        className="font-semibold text-primary-600 underline underline-offset-2"
                      >
                        Release from liability
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPolicyModal("health")}
                  className="pt-1 text-xs font-bold text-primary-600 underline underline-offset-2"
                >
                  Health & Safety Procedures, and Sustainability Policy
                </button>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
              {step > 1 ? (
                <Button variant="secondary" onClick={() => onSetStep(step - 1)} className="h-10 px-5">Back</Button>
              ) : (
                <Button variant="ghost" onClick={onCancel} className="h-10 px-4 text-secondary-400 hover:bg-red-50 hover:text-red-500">Cancel</Button>
              )}
              <Button
                onClick={() => step < 3 ? onSetStep(step + 1) : handleFinalize()}
                disabled={step === 3 && (!agreedTerms || !agreedLiability)}
                className="h-10 min-w-32 px-5 shadow-md shadow-primary-600/20"
              >
                {step < 3 ? "Continue" : "Complete booking"}
              </Button>
            </div>
          </div>
        </div>
      </Section>
      <PolicyModal activePolicyKey={activePolicyKey} activePolicy={activePolicy} onClose={closePolicyModal} />
    </>
  );
}

function CheckoutModal({
  isOpen,
  onClose,
  step,
  onSetStep,
  totalPrice,
  partPrice,
  payMode,
  onSetPayMode,
  payMethod,
  onSetPayMethod,
  contactName,
  onSetName,
  contactEmail,
  onSetEmail,
  contactPhone,
  onSetPhone,
  specialRequests,
  onSetSpecialRequests,
  agreedTerms,
  onSetAgreedTerms,
  agreedLiability,
  onSetAgreedLiability,
  onFinalize
}) {
  const isLastStep = step === 3;
  const canContinue = isLastStep ? (contactName && contactEmail && agreedTerms && agreedLiability) : true;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "1. Choose to pay" : step === 2 ? "2. Select payment method" : "3. Contact details"}
      subtitle={step === 1 ? "Pay now or pay 50% later" : step === 2 ? "We accept Visa, MasterCard, AmEx, PayPal, and PayLater." : "Enter your contact details"}
      maxWidth="max-w-3xl"
    >
      <div className="p-1">
        {step === 1 && (
          <div className="space-y-3">
            <button
              onClick={() => onSetPayMode("full")}
              className={cn(
                "relative flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200",
                payMode === "full"
                  ? "border-primary-600 bg-primary-50/50 ring-1 ring-primary-600/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all", payMode === "full" ? "border-primary-600 bg-primary-600" : "border-neutral-300 bg-transparent")}>
                {payMode === "full" && <div className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span className="font-bold text-secondary-900">Pay in full</span>
                  <span className="font-bold text-secondary-900">{formatIDR(totalPrice)}</span>
                </div>
                <div className="mt-1 text-sm leading-relaxed text-secondary-500">
                  Secure your boat immediately with a single seamless payment.
                </div>
                {payMode === "full" && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Most popular choice</span>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => onSetPayMode("part")}
              className={cn(
                "relative flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200",
                payMode === "part"
                  ? "border-primary-600 bg-primary-50/50 ring-1 ring-primary-600/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all", payMode === "part" ? "border-primary-600 bg-primary-600" : "border-neutral-300 bg-transparent")}>
                {payMode === "part" && <div className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-secondary-900">Pay 50% deposit</span>
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary-500">Flexible</span>
                  </div>
                  <span className="font-bold text-secondary-900">{formatIDR(partPrice)}</span>
                </div>
                <div className="mt-1 text-sm leading-relaxed text-secondary-500">
                  Pay {formatIDR(partPrice)} now, and the rest ({formatIDR(totalPrice - partPrice)}) on the day.
                </div>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => onSetPayMethod("card")}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 p-4 transition",
                payMethod === "card" ? "border-primary-600 bg-primary-50/30" : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary-600" />
                <div className="text-left">
                  <div className="font-bold text-secondary-900">Card payment</div>
                  <div className="text-xs text-secondary-500">Payment in IDR, 3% merchant fee apply.</div>
                </div>
              </div>
              <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", payMethod === "card" ? "border-primary-600" : "border-neutral-300")}>
                {payMethod === "card" && <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
              </div>
            </button>
            <button
              onClick={() => onSetPayMethod("paypal")}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 p-4 transition",
                payMethod === "paypal" ? "border-primary-600 bg-primary-50/30" : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 font-black text-blue-600 italic">P</div>
                <div className="text-left">
                  <div className="font-bold text-secondary-900">Paypal</div>
                  <div className="text-xs text-secondary-500">Fast checkout, 5% fee apply.</div>
                </div>
              </div>
              <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", payMethod === "paypal" ? "border-primary-600" : "border-neutral-300")}>
                {payMethod === "paypal" && <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
              </div>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-secondary-900">Name*</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => handleChange('contactName', e.target.value, onSetName)}
                placeholder="Enter your full name"
                className={cn(
                  "mt-1.5 w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:ring-1",
                  errors.contactName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "focus:border-primary-600 focus:ring-primary-600"
                )}
              />
              {errors.contactName && <p className="mt-1 text-xs text-red-500">{errors.contactName}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-900">Email*</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value, onSetEmail)}
                placeholder="Enter your email address"
                className={cn(
                  "mt-1.5 w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:ring-1",
                  errors.contactEmail
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "focus:border-primary-600 focus:ring-primary-600"
                )}
              />
              {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-900">WhatsApp Number</label>
              <div className="mt-1.5">
                <PhoneInput
                  value={contactPhone}
                  onChange={(val) => handleChange('contactPhone', val, onSetPhone)}
                />
              </div>
              {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-900">Any special requests?</label>
              <textarea
                value={specialRequests}
                onChange={(e) => onSetSpecialRequests(e.target.value)}
                placeholder="Write your comments here"
                rows={3}
                className="mt-1.5 w-full rounded-xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => onSetAgreedTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded-md border-neutral-300 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm text-secondary-600">I agree with terms of Privacy Policy and Cancelation Policy</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedLiability}
                  onChange={(e) => onSetAgreedLiability(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded-md border-neutral-300 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm text-secondary-600">I consent to the Release from liability</span>
              </label>
            </div>
            <div className="text-xs text-primary-600 font-bold underline cursor-pointer">
              Health & Safety Procedures, and Sustainability Policy
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => onSetStep(step - 1)}>Back</Button>
          ) : (
            <div />
          )}
          <Button
            onClick={() => step < 3 ? onSetStep(step + 1) : onFinalize()}
            disabled={!canContinue}
            className="min-w-32"
          >
            {step < 3 ? "Continue" : "Complete booking"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
