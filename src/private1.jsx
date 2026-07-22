import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Discover.nika.css";
import ReviewsSection from "./components/common/ReviewsSection";
import AddressAutocomplete from "./components/common/AddressAutocomplete";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "./components/common/Modal";
import RatingPill from "./components/common/RatingPill";
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
import { resolveScheduleIcon } from "./utils/tourScheduleUtils";
import { CARD, TEXT } from "./lib/tokens";
import { useCurrency } from "./CurrencyContext";
import { useTours } from "./ToursContext";
import { useExtras } from "./contexts/ExtrasContext";
import { useRules } from "./contexts/RulesContext";
import { fetchRestaurant, fetchRestaurants } from "./api/extras";
import { apiUrl } from "./api/base";
import { buildTourAnalyticsItem, getGaClientId, getUtmParams, getUtmQueryString, trackAddToCart, trackBeginCheckout, trackAddPaymentInfo, trackViewItem, trackPixelViewContent, trackPixelAddToCart, trackPixelInitiateCheckout, trackPixelAddPaymentInfo } from "./lib/analytics";
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
  usePricing,
  getFlashSaleForDate
} from "./components/booking/utils";


function SkeletonCard() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-neutral-100 bg-white overflow-hidden flex flex-col sm:min-h-470">
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
          <div className="h-10 w-full rounded-2xl bg-neutral-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBoatCard() {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white overflow-hidden">
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-neutral-200">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.3 }}
        />
      </div>
      <div className="p-4 sm:p-5 sm:pt-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="h-5 w-2/5 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="h-4 w-14 rounded-full bg-neutral-200 animate-pulse" />
        </div>
        <div className="h-3.5 w-3/5 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-12 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="h-6 w-20 rounded-lg bg-neutral-200 animate-pulse" />
        </div>
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
  CreditCard,
  CloudRain,
  Coffee,
  ExternalLink,
  Fish,
  Globe,
  Info,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
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
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Compass,
  ShoppingBag,
  PartyPopper,
  Heart,
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
  Sparkles,
};

function transformTourCards(tourInfoData, iconMap) {
  const cancellationSummaryCards = (tourInfoData.cancellationCards ?? []).map(card => ({
    ...card,
    icon: iconMap[card.icon],
    accentClassName: card.accent,
    iconClassName: card.iconColor,
    iconWrapClassName: card.bg,
  }));
  const weatherGuaranteeCards = (tourInfoData.weatherGuarantee ?? []).map(card => ({
    ...card,
    icon: iconMap[card.icon],
  }));
  return { cancellationSummaryCards, weatherGuaranteeCards };
}
import { brand as brandData, tourInfo, links as LINKS, trustIncludedShort as TRUST_INCLUDED_SHORT, infoDrawerTabs as INFO_DRAWER_TABS, sections as SECTIONS, bookingMiniFAQ as bookingMiniFAQData } from "./data/private.json";
// Shared Components
import CustomDatePicker from "./components/common/CustomDatePicker";
import DatePickerBody from "./components/common/DatePickerBody";
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
import SEO from "./components/SEO";
import Footer from "./components/common/Footer";
import {
  SECTION_BACKGROUNDS,
} from "./components/booking/constants";

const BRAND = {
  ...brandData,
  badges: brandData.badges.map((b) => ({ ...b, icon: ICON_MAP[b.icon] })),
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
    base: "bg-white rounded-2xl border border-slate-100 transition-all duration-300",
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
    default: "bg-white rounded-2xl border border-neutral-200 transition-all duration-300",
    hover: "bg-white rounded-2xl border border-neutral-200 transition-all duration-300 hover:border-primary-100",
    glass: "bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl",
    premium: "bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/80 rounded-2xl",
    "qoves-featured": "bg-gradient-to-br from-primary-950 to-primary-900 text-white border border-white/10 rounded-2xl backdrop-blur-sm relative overflow-hidden",
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Send request" subTitle={tourName} maxWidth="max-w-md" hideDragHandle>
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
                  className="flex min-h-58 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-2 py-1 text-secondary-600 transition-all duration-200 hover:border-primary-200 hover:bg-neutral-100 hover:text-primary-700"
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
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-secondary-600">
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
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
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
  const [date, setDate] = useState(todayISO);
  const pricing = usePricing(date);
  const remainingSeats = selectedYacht?.priceValue ? null : pricing.remainingSeats;
  const maxGuests = Math.min(MAX_GUESTS, remainingSeats ?? MAX_GUESTS);
  const isSoldOut = remainingSeats !== null && remainingSeats <= 0;
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
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
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-100 p-3 text-sm text-secondary-600">
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
function BookingMiniFAQ({ className }) {
  const items = bookingMiniFAQData.map((it) => ({ ...it, icon: ICON_MAP[it.icon] }));
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
            className="relative min-w-82pct snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card"
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
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card sm:col-span-2 sm:row-span-2">
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
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card"
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
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card sm:p-8">
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
                    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-card">
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
                  <div className="rounded-2xl bg-white" ref={extrasCardRef}>
                    <div className="rounded-2xl border border-neutral-200 bg-white shadow-card">
                      <div className={cn("rounded-2xl", extrasExpanded ? "bg-white" : "bg-transparent")}>
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
                                <div className="no-scrollbar max-h-520 overflow-y-auto rounded-2xl bg-white shadow-card">
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
                                            className="h-16 w-16 rounded-2xl object-cover ring-1 ring-black/[0.05] md:h-18 md:w-18"
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
                                              <div className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
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
                      "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-1.5 text-sm font-semibold transition duration-200 ease-out",
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
              <div className="mx-auto w-full rounded-2xl border border-neutral-200 bg-white">
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
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-neutral-200"
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
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-secondary-600">
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
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-secondary-900">
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
          <div className="rounded-2xl border border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-success shadow-card">
            Added to cart  {addToast.title}
          </div>
        </div>
      ) : null}
      {savedToast ? (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-80 w-92pct max-w-sm -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0">
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-secondary-600 shadow-card">
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

function Hero({ children }) {
  return (
    <section id="hero-section" className="relative z-20 min-h-[60vh]">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://bluuu.tours/storage/app/media/private.webp"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,30,55,0.25) 0%, rgba(0,30,55,0.55) 50%, rgba(0,20,42,0.88) 100%)'
        }} />
      </div>
      <div className="relative z-10 flex flex-col min-h-[60vh]">
        <div className="container flex flex-1 flex-col items-center justify-center text-center py-12 sm:py-16">
          <h2 id="hero-title" className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Private tour to <span className="italic" style={{ color: 'var(--primary-300)' }}>Nusa Penida</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm font-normal text-white/70 sm:text-base">
            Choose your boat and your pace. Private crew,<br className="sm:hidden" /> safety-first routing, pure comfort.
          </p>
          <p className="mt-3 text-xs font-normal text-white/60 sm:text-sm">
            From <span className="font-bold text-white">$750</span> / boat
            <span className="mx-1.5 text-white/30">·</span>
            Free cancellation <span className="font-bold text-white">24h</span>
          </p>
          {children}
        </div>
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
        <div className="relative overflow-hidden rounded-none border-none bg-gradient-to-br from-white to-neutral-50 p-6 shadow-none sm:rounded-2xl sm:border sm:border-neutral-200">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-md">
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
          <div className="relative flex flex-col items-start overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-[#0b79e5] p-6 pt-7 sm:col-span-2 sm:p-6 sm:pt-7 md:p-10 md:pt-12 transition-all duration-300 lg:col-span-4 lg:row-span-2">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 z-0">
              <img
                src="https://bluuu.tours/themes/bluuu/assets/icons/bluu-icon.svg"
                alt=""
                className="absolute bottom-4 right-4 h-72pct w-72pct object-contain opacity-50 [filter:brightness(0)_invert(1)]"
                loading="lazy"
                decoding="async"
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
                className="relative flex flex-row items-center gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition-all duration-300 hover:shadow-xl sm:flex-col sm:items-center sm:justify-center sm:p-5 sm:text-center md:p-6 lg:col-span-4"
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

function scrollToBookingBar() {
  const bar = document.getElementById("step1-bar");
  if (bar) {
    bar.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function BoatMiniCarousel({
  boats, selectedBoatId, hasDateCriteria, onSelect, onFocusDate, formatPrice, groupSize = 1,
  dateMode, hasRange, rangeDates = [], availabilityByBoat, privateTours, selectedFlexDate, onConfirmDate,
}) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [detailBoat, setDetailBoat] = useState(null);
  const [activeDot, setActiveDot] = useState(0);
  const [pickingDate, setPickingDate] = useState(false);
  const [draftDate, setDraftDate] = useState("");

  useEffect(() => {
    setPickingDate(false);
    setDraftDate("");
  }, [detailBoat]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    const card = el.querySelector("[data-boat-card]");
    if (card) {
      const cardW = card.offsetWidth + 12;
      setActiveDot(Math.floor(el.scrollLeft / (cardW * 2)));
    }
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  useEffect(() => { updateScrollState(); }, [boats, updateScrollState]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-boat-card]");
    const step = card ? (card.offsetWidth + 12) * 2 : 400;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const [navSlot, setNavSlot] = useState(null);
  useEffect(() => {
    const el = document.getElementById("mini-boats-nav");
    if (el) setNavSlot(el);
    else requestAnimationFrame(() => setNavSlot(document.getElementById("mini-boats-nav")));
    updateScrollState();
  }, [updateScrollState]);

  const navButtons = (
    <>
      <button type="button" disabled={!canScrollLeft} onClick={() => scrollBy(-1)}
        className={cn("inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition",
          canScrollLeft ? "text-secondary-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-secondary-900" : "text-neutral-300 cursor-not-allowed opacity-50"
        )} aria-label="Previous"><ChevronLeft className="h-3.5 w-3.5" /></button>
      <button type="button" disabled={!canScrollRight} onClick={() => scrollBy(1)}
        className={cn("inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition",
          canScrollRight ? "text-secondary-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-secondary-900" : "text-neutral-300 cursor-not-allowed opacity-50"
        )} aria-label="Next"><ChevronRight className="h-3.5 w-3.5" /></button>
    </>
  );

  return (
    <>
      {navSlot && createPortal(navButtons, navSlot)}
      <div ref={trackRef} className="no-scrollbar -mx-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scroll-pl-4 sm:scroll-pl-0 sm:mx-0">
        <div className="shrink-0 w-4 min-w-[16px] sm:hidden" aria-hidden="true" />
        {boats.map((boat, boatIdx) => {
          const isSelected = selectedBoatId === boat.id;
          const photo = boat.cover || boat.images?.[0]?.thumb || boat.images?.[0]?.path || "";
          return (
            <motion.div
              key={boat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: boatIdx * 0.05 }}
              data-boat-card
              onTouchStart={(e) => { const t = e.touches[0]; e.currentTarget._tapStart = { x: t.clientX, y: t.clientY }; e.currentTarget._tapped = false; }}
              onTouchEnd={(e) => {
                const start = e.currentTarget._tapStart;
                if (!start) return;
                const t = e.changedTouches[0];
                const dx = Math.abs(t.clientX - start.x);
                const dy = Math.abs(t.clientY - start.y);
                if (dx < 10 && dy < 10) {
                  // Don't open modal if tap landed on a button inside the card
                  if (e.target.closest("button")) { e.currentTarget._tapStart = null; return; }
                  e.preventDefault();
                  e.currentTarget._tapped = true;
                  setDetailBoat(boat);
                }
                e.currentTarget._tapStart = null;
              }}
              onClick={(e) => {
                if (e.currentTarget._tapped) { e.currentTarget._tapped = false; return; }
                setDetailBoat(boat);
              }}
              className={cn(
                "group flex flex-col shrink-0 w-[calc((100vw-60px)/2)] sm:w-[calc((100%-36px)/4)] cursor-pointer last:mr-4 sm:last:mr-0 overflow-hidden rounded-2xl sm:rounded-3xl border bg-white transition-all duration-200",
                boatIdx % 2 === 0 ? "snap-start" : "",
                isSelected
                  ? "border-primary-500 border-2 shadow-md"
                  : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-b-xl sm:aspect-[6/5]">
                {photo ? (
                  <img src={photo} alt={boat.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-300"><Ship className="h-6 w-6" /></div>
                )}
                {boat.isPartner && (
                  <span className="absolute right-2 top-2 rounded-full bg-amber-50/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200 sm:hidden">By request</span>
                )}
                {isSelected && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-black text-white tracking-wide">Your pick</span>
                        <span className="text-xs text-white/60">Tap to change date</span>
                      </div>
                    </div>
                  </>
                )}
                {!isSelected && (boat._soldOut || boat._overCapacity || groupSize > boat.people) && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="rounded-full backdrop-blur-md bg-white/20 border border-white/30 px-3 py-1 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                        {(boat._overCapacity || groupSize > boat.people) ? `Max ${boat.people} guests` : "Sold out"}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-secondary-900 truncate">{boat.name}</h4>
                  {!isSelected && boat.isPartner && (
                    <span className="hidden sm:inline-block shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200">By request</span>
                  )}
                </div>
                {isSelected ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setTimeout(() => onFocusDate?.(), 800);
                    }}
                    className="mt-auto flex w-full h-11 items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-xs sm:text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Change date
                  </button>
                ) : (boat._soldOut || boat._overCapacity || groupSize > boat.people) ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onFocusDate?.(); }}
                    className="mt-auto flex w-full h-11 items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-xs sm:text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30"
                  >
                    {(boat._overCapacity || groupSize > boat.people) ? <><Users className="h-3 w-3 sm:h-4 sm:w-4" />Change parameters</> : <><Calendar className="h-3 w-3 sm:h-4 sm:w-4" />Change date</>}
                  </button>
                ) : (
                  <>
                    {boat.boatFeatures?.best_for && (
                      <p className="mt-0.5 text-xs sm:text-sm text-secondary-400 truncate text-left capitalize">{boat.boatFeatures.best_for}</p>
                    )}
                    <div className={cn("mt-1 sm:mt-0.5 flex sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-0", formatPrice(boat.priceValue).replace(/\D/g, "").length >= 7 ? "flex-col" : "flex-row items-center justify-between")}>
                      <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-secondary-500"><Users className="h-3 w-3 sm:h-4 sm:w-4" />{boat.people}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-sm sm:text-lg font-black text-secondary-900 tracking-tight">{formatPrice(boat.priceValue)}</span>
                        <span className="text-[10px] sm:text-xs text-secondary-400">/ boat</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {boats.length > 2 && (
        <div className="mt-2 mb-4 flex items-center justify-center gap-1.5 sm:hidden">
          {Array.from({ length: Math.ceil(boats.length / 2) }, (_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all", activeDot === i ? "bg-secondary-900 w-3" : "bg-secondary-300 w-1.5")} />
          ))}
        </div>
      )}

      {/* Detail popup */}
      <Modal
        isOpen={!!detailBoat}
        onClose={() => setDetailBoat(null)}
        maxWidth="max-w-xl"
        bodyClassName="p-0 overflow-hidden flex-1 min-h-0 flex flex-col"
        showClose={false}
        hideDragHandle
      >
        {detailBoat && (() => {
            const boat = detailBoat;
            const bf = boat.boatFeatures || {};
            const boatFeatures = getBoatFeatures(boat.boatFeatures);
            const boatTypeLabel = [bf.boat_type || null, boat.lengthMeters ? `${boat.lengthMeters}M` : null].filter(Boolean).join(" · ").toUpperCase();
            const boatDescriptionText = sanitizeDisplayText(boat.description, { stripTrailingOne: true });
            const isBoatSelected = selectedBoatId === boat.id;
            const canPickDayInline = dateMode === "flex" && hasRange && !boat.isPartner;
            const boatAvailableDates = availabilityByBoat?.[boat.id]?.availableDates ?? [];
            const draftPrice = draftDate ? calculateBoatPrice(boat.tourId, draftDate, groupSize, privateTours) : null;
            const startPickingDate = () => {
              setDraftDate(isBoatSelected ? (selectedFlexDate || "") : "");
              setPickingDate(true);
            };
            return (
              <>
                  {/* Photo — sticky top */}
                  <div className="relative w-full shrink-0 overflow-hidden">
                    <PhotoCarousel
                      className="aspect-video cursor-pointer"
                      images={boat.images?.length ? boat.images : [boat.cover]}
                      alt={boat.name}
                      maximizeLeft
                      onOpenGallery={(startIndex) => {
                        const slides = (boat.images?.length ? boat.images : [boat.cover]).map(s => typeof s === "string" ? s : s?.path || s?.thumb || "").filter(Boolean);
                        Fancybox.show(slides.map(src => ({ src, type: "image" })), { startIndex: startIndex || 0 });
                      }}
                    />
                    {isBoatSelected && (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                            <Check className="h-6 w-6 text-white" strokeWidth={3} />
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-black text-white tracking-wide">Your pick</span>
                            <span className="text-xs text-white/60">Tap to change date</span>
                          </div>
                        </div>
                      </>
                    )}
                    <button type="button" onClick={() => setDetailBoat(null)}
                      className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition hover:bg-white/40"
                      aria-label="Close">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Scrollable content */}
                  <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-4">
                    {pickingDate ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-lg font-bold tracking-tight text-secondary-900">Pick a day</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-secondary-400">Optional step</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPickingDate(false)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-secondary-500 transition hover:bg-white hover:text-secondary-900"
                            aria-label="Back to details"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4">
                          {rangeDates.length ? (
                            <div className="grid grid-cols-5 gap-2 pr-1">
                              {rangeDates.map((date) => {
                                const isAvailable = boatAvailableDates.includes(date);
                                const isPicked = draftDate === date;
                                const parsed = new Date(`${date}T00:00:00`);
                                const monthLabel = parsed.toLocaleString("en-US", { month: "short" });
                                const dayLabel = Number.isNaN(parsed.getTime()) ? "" : String(parsed.getDate());
                                return (
                                  <button
                                    key={date}
                                    type="button"
                                    onClick={() => { if (isAvailable) setDraftDate(date); }}
                                    className={cn(
                                      "flex min-h-58 flex-col items-center justify-center rounded-2xl border px-2 py-1 transition-all duration-200",
                                      isPicked
                                        ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm scale-102"
                                        : isAvailable
                                          ? "border-neutral-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-neutral-100 hover:text-primary-700"
                                          : "border-neutral-200 bg-neutral-50 text-secondary-500 opacity-40 cursor-not-allowed"
                                    )}
                                    disabled={!isAvailable}
                                  >
                                    <span className={cn("text-xs leading-tight font-semibold uppercase tracking-wide", isPicked ? "text-primary-600" : isAvailable ? "text-secondary-400" : "text-secondary-300")}>
                                      {monthLabel}
                                    </span>
                                    <span className={cn("mt-0.5 text-xl font-extrabold leading-none", isPicked ? "text-primary-700" : isAvailable ? "text-secondary-900" : "text-secondary-400")}>
                                      {dayLabel}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-4 text-center">
                              <Calendar className="mb-2 h-6 w-6 text-secondary-300" />
                              <div className="text-sm font-semibold text-secondary-500">Select a date range first</div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {boatTypeLabel && (
                          <div className="mb-2 text-xs leading-tight font-normal uppercase tracking-widest text-primary-500">{boatTypeLabel}</div>
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="text-xl font-bold text-secondary-900 leading-tight line-clamp-1">
                            {boat.id === "angels" ? "Two boats (14+ guests)" : boat.name}
                          </div>
                          {boat.isPartner && (
                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 border border-amber-200">By request</span>
                          )}
                        </div>
                        {boatDescriptionText && <p className="mt-1.5 text-sm leading-relaxed text-secondary-500">{boatDescriptionText}</p>}
                        {boat.fleetSize >= 1 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-secondary-500">
                            <Ship className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                            {boat.fleetSize} identical {boat.fleetSize === 1 ? "boat" : "boats"} — we assign the best available for your date
                          </div>
                        )}
                        <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            <div className="flex items-center gap-2.5 text-sm font-bold text-secondary-700"><Users className="h-4 w-4 shrink-0 text-primary-500" />Up to {boat.people}</div>
                            {boatFeatures.map(({ label, present, Icon }) => (
                              <div key={label} className={cn("flex items-center gap-2.5 text-sm", present ? "font-bold text-secondary-700" : "text-secondary-300")}>
                                <Icon className={cn("h-4 w-4 shrink-0", present ? "text-primary-500" : "text-neutral-300")} />{label}
                              </div>
                            ))}
                          </div>
                        </div>
                        {bf.best_for && (
                          <div className="mt-2.5">
                            <div className="flex min-h-[2.25rem] items-center rounded-xl border border-primary-100 bg-primary-50 px-4 py-1">
                              <p className="text-xs font-semibold text-primary-700">Best for: {bf.best_for}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Sticky footer — price + button */}
                  <div className="shrink-0 border-t border-neutral-100 bg-white px-5 py-3">
                    {pickingDate ? (
                      <div className="flex flex-col gap-3">
                        {draftDate ? (
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-semibold text-secondary-500">
                              {new Date(`${draftDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-secondary-900 tracking-tight">{formatPrice(draftPrice ?? boat.priceValue)}</span>
                              <span className="text-2xs font-bold uppercase tracking-widest text-secondary-300">/ boat</span>
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
                          onClick={() => { onConfirmDate?.(boat, draftDate); setDetailBoat(null); }}
                          disabled={!draftDate}
                        >
                          Confirm date
                        </button>
                      </div>
                    ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-x-1 flex-wrap">
                        <span className="text-sm font-medium text-secondary-400">from</span>
                        <span className="text-lg sm:text-2xl font-black text-secondary-900 tracking-tight">{formatPrice(boat.priceValue)}</span>
                        <span className="text-xs sm:text-sm font-medium text-secondary-400">/ boat</span>
                      </div>
                      {hasDateCriteria && isBoatSelected ? (
                        <button type="button" onClick={() => {
                            if (canPickDayInline) { startPickingDate(); return; }
                            setDetailBoat(null); setTimeout(() => onFocusDate?.(), 100);
                          }}
                          className="shrink-0 h-11 px-6 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />Change date
                        </button>
                      ) : hasDateCriteria && (boat._soldOut || boat._overCapacity || groupSize > boat.people) ? (
                        <button type="button" onClick={() => { setDetailBoat(null); onFocusDate?.(); }}
                          className="shrink-0 h-11 px-6 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30 flex items-center gap-1.5">
                          {(boat._overCapacity || groupSize > boat.people) ? <><Users className="h-4 w-4" />Change parameters</> : <><Calendar className="h-4 w-4" />Change date</>}
                        </button>
                      ) : hasDateCriteria ? (
                        <button type="button" onClick={() => {
                            if (canPickDayInline) { startPickingDate(); return; }
                            onSelect(boat); setDetailBoat(null);
                          }}
                          className="shrink-0 h-11 px-6 rounded-full bg-[#2563eb] text-sm font-bold text-white transition hover:bg-[#1d4ed8]">
                          Select
                        </button>
                      ) : (
                        <button type="button" onClick={() => {
                            setDetailBoat(null);
                            setTimeout(() => {
                              scrollToBookingBar();
                              setTimeout(() => onFocusDate?.(), 700);
                            }, 420);
                          }}
                          className="shrink-0 h-11 px-6 rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-400 transition hover:bg-neutral-200">
                          Select date first
                        </button>
                      )}
                    </div>
                    )}
                  </div>
              </>
            );
          })()}
      </Modal>
    </>
  );
}

function StickyBookingBar(props) {
  const {
    dateMode, rangeStart, rangeEnd, exactDate,
    adults, kids, totalGuests, canContinue, onContinue,
  } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [topOffset, setTopOffset] = useState(24);
  useEffect(() => {
    const updateTop = () => {
      const nav = document.querySelector("nav");
      if (nav) {
        const rect = nav.getBoundingClientRect();
        setTopOffset(rect.bottom > 0 ? rect.bottom + 24 : 24);
      } else {
        setTopOffset(24);
      }
    };
    updateTop();
    window.addEventListener("scroll", updateTop, { passive: true });
    return () => window.removeEventListener("scroll", updateTop);
  }, []);
  useEffect(() => {
    const target = document.getElementById("hero-section");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const gone = !entry.isIntersecting;
        setIsVisible(gone);
        if (!gone) setIsExpanded(false);
      },
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isExpanded) return;
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 600);
    const handler = () => {
      if (!armed) return;
      // Don't collapse if a dropdown panel is open inside the sticky bar
      const openDropdown = document.querySelector(".step1-date-dropdown");
      if (openDropdown) return;
      setIsExpanded(false);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => { clearTimeout(armTimer); window.removeEventListener("scroll", handler); };
  }, [isExpanded]);
  const [isPulsing, setIsPulsing] = useState(false);
  useEffect(() => {
    const handler = () => {
      setIsVisible(true);
      setIsExpanded(true);
      setIsPulsing(true);
    };
    window.addEventListener("expand-sticky-bar", handler);
    return () => window.removeEventListener("expand-sticky-bar", handler);
  }, []);
  useEffect(() => {
    const handler = () => setIsExpanded(false);
    window.addEventListener("collapse-sticky-bar", handler);
    return () => window.removeEventListener("collapse-sticky-bar", handler);
  }, []);
  return (
    <AnimatePresence>
      {isVisible && isExpanded && (
        <motion.div
          key="sticky-bar"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed left-0 right-0 z-40 py-0 flex justify-center"
          style={{ top: topOffset }}
        >
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-3xl px-6"
          >
            <div
              className="rounded-full transition-all duration-100"
              style={isPulsing ? { animation: "sticky-bar-impulse 2s ease-out infinite" } : undefined}
              onClick={() => setIsPulsing(false)}
            >
              <style>{`
                @keyframes sticky-bar-impulse {
                  0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
                  60%  { box-shadow: 0 0 0 12px rgba(59,130,246,0.1); }
                  100% { box-shadow: 0 0 0 20px rgba(59,130,246,0); }
                }
              `}</style>
              <StepOne embedded omitId {...props} onContinue={() => { setIsExpanded(false); setIsPulsing(false); onContinue(); }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepOne({
  embedded = false,
  omitId = false,
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
  onConfirmSearch,
  hasPendingChanges,
  globalAvailabilityMap,
  filterDate,
  onMonthChange,
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

  const [openPanel, setOpenPanel] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const sheetMotion = isMobile
    ? {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
      }
    : {
        initial: { opacity: 0, y: -4, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.98 },
        transition: { duration: 0.15, ease: "easeOut" },
      };
  useEffect(() => {
    if (!openPanel || typeof document === "undefined") return;
    const orig = document.body.style.overflow;
    // Only lock background scroll for the mobile full-screen sheet — desktop's small
    // dropdown should never disable the page scrollbar.
    if (isMobile) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("wa-hidden");
    }
    if (openPanel === "dates" && !omitId) {
      document.body.style.overflow = orig;
      setTimeout(() => {
        const bar = barRef.current;
        if (bar) {
          const rect = bar.getBoundingClientRect();
          if (rect.top > 80) {
            bar.style.scrollMarginTop = "120px";
            bar.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 50);
    }
    return () => { document.body.style.overflow = orig; document.body.classList.remove("wa-hidden"); };
  }, [openPanel, isMobile, omitId]);
  const barRef = useRef(null);
  const panelRef = useRef(null);
  const hoveringRef = useRef(false);
  const autoCloseTimerRef = useRef(null);

  const scheduleAutoClose = useCallback((delay = 1500) => {
    clearTimeout(autoCloseTimerRef.current);
    const tryClose = () => {
      if (hoveringRef.current) {
        autoCloseTimerRef.current = setTimeout(tryClose, 800);
      } else {
        setOpenPanel(null);
      }
    };
    autoCloseTimerRef.current = setTimeout(tryClose, delay);
  }, []);

  useEffect(() => {
    if (!openPanel) clearTimeout(autoCloseTimerRef.current);
    return () => clearTimeout(autoCloseTimerRef.current);
  }, [openPanel]);

  useEffect(() => {
    if (!openPanel) return undefined;
    const handler = (e) => {
      if (barRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpenPanel(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPanel]);

  useEffect(() => {
    if (!openPanel) return undefined;
    const handler = (e) => { if (e.key === "Escape") setOpenPanel(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openPanel]);

  useEffect(() => {
    if (openPanel !== "guests") return undefined;
    scheduleAutoClose(1500);
    return () => clearTimeout(autoCloseTimerRef.current);
  }, [openPanel, adults, kids, scheduleAutoClose]);


  const hasDateSelection = dateMode === "exact" ? !!exactDate : !!(rangeStart && rangeEnd);
  const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateSummary = dateMode === "exact"
    ? (exactDate ? fmtDate(exactDate) : "Choose dates")
    : (hasRange ? `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}` : "Choose dates");
  const guestSummary = totalGuests > 0
    ? `${adults} adult${adults !== 1 ? "s" : ""}${kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}`
    : "Add guests";

  return (
    <>
      {openPanel && !embedded && !omitId && createPortal(
        <div
          className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpenPanel(null)}
          aria-hidden="true"
        />,
        document.body
      )}
    <div id={omitId ? undefined : embedded ? undefined : "step-1"} className={omitId ? "w-full" : embedded ? "w-full mt-8 mb-2" : "sticky top-[52px] z-[60] py-3 bg-neutral-100/95 backdrop-blur-md"}>
      <div className={omitId ? "mx-auto max-w-3xl" : embedded ? "mx-auto max-w-3xl" : "mx-auto sm:max-w-3xl px-2 sm:px-6"}>
        <div id="step1-bar" ref={barRef} className="relative flex items-center rounded-full border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <AnimatePresence>
            {openPanel && (
              <motion.div
                key="mobile-sheet-backdrop"
                className="sm:hidden fixed inset-0 z-[10000] bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpenPanel(null)}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <div id="step1-dates-pill" className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                document.getElementById("step1-bar")?.classList.remove("bar-pulse");
                setOpenPanel(openPanel === "dates" ? null : "dates");
              }}
              className={cn(
                "flex w-full flex-col pl-6 sm:pl-6 pr-4 sm:pr-6 py-2.5 sm:py-3.5 text-left rounded-l-full transition-colors",
                openPanel === "dates" ? "bg-neutral-50" : "hover:bg-neutral-50"
              )}
            >
              <span className="text-sm font-bold text-secondary-900">Dates</span>
              <span className="text-[13px] text-secondary-400 truncate">{dateSummary}</span>
            </button>

            <AnimatePresence>
              {openPanel === "dates" && (
                <motion.div
                  ref={panelRef}
                  {...sheetMotion}
                  className="absolute left-0 top-full z-50 mt-2 w-max max-sm:fixed max-sm:inset-0 max-sm:mt-0 max-sm:w-full max-sm:h-full max-sm:flex max-sm:items-end max-sm:justify-center max-sm:pointer-events-none max-sm:z-[10001]"
                  onMouseEnter={() => { hoveringRef.current = true; }}
                  onMouseLeave={() => { hoveringRef.current = false; }}
                >
                  <div className="step1-date-dropdown pointer-events-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/8 max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:w-full max-sm:max-h-[92dvh] max-sm:overflow-y-auto max-sm:p-4">
                    <div className="sm:hidden flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-secondary-900">Select dates</span>
                      <button type="button" onClick={() => setOpenPanel(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3 max-sm:space-y-2.5 sm:text-center">
                      <div className="inline-flex max-sm:flex max-sm:w-full rounded-full bg-neutral-100 p-1">
                        {[
                          { id: "exact", label: "Exact date", icon: Calendar },
                          { id: "flex", label: "Flexible dates", icon: Clock },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => onDateModeChange(item.id)}
                              className={cn(
                                "flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap",
                                dateMode === item.id
                                  ? "bg-white text-primary-600 shadow-sm"
                                  : "text-secondary-400 hover:text-secondary-600"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="h-px w-full bg-neutral-200 my-2" />
                      <DatePickerBody
                        dateMode={dateMode}
                        exactDate={exactDate}
                        onExactDateChange={onExactDateChange}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onRangeStartChange={onRangeStartChange}
                        onRangeEndChange={onRangeEndChange}
                        filterDate={filterDate}
                        onMonthChange={onMonthChange}
                        globalAvailabilityMap={globalAvailabilityMap}
                        inline
                        todayISO={todayISO}
                        maxRangeDays={14}
                      />
                      <button type="button" onClick={() => setOpenPanel("guests")}
                        disabled={!(exactDate || (rangeStart && rangeEnd))}
                        className={cn("sm:hidden mt-3 w-full h-11 rounded-full text-sm font-semibold transition",
                          (exactDate || (rangeStart && rangeEnd))
                            ? "bg-primary-600 text-white hover:bg-primary-700"
                            : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                        )}>
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-9 w-px bg-neutral-200 shrink-0" />

          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => { document.getElementById("step1-bar")?.classList.remove("bar-pulse"); setOpenPanel(openPanel === "guests" ? null : "guests"); }}
              className={cn(
                "flex w-full flex-col px-4 sm:px-6 py-2.5 sm:py-3.5 text-left transition-colors",
                openPanel === "guests" ? "bg-neutral-50" : "hover:bg-neutral-50"
              )}
            >
              <span className="text-sm font-bold text-secondary-900">Guests</span>
              <span className="text-[13px] text-secondary-400 truncate">{guestSummary}</span>
            </button>

            <AnimatePresence>
              {openPanel === "guests" && (
                <motion.div
                  {...sheetMotion}
                  className="absolute left-0 top-full z-50 mt-2 w-max max-w-xs max-sm:fixed max-sm:inset-0 max-sm:mt-0 max-sm:w-full max-sm:max-w-none max-sm:h-full max-sm:flex max-sm:items-end max-sm:justify-center max-sm:pointer-events-none max-sm:z-[10001]"
                  onMouseEnter={() => { hoveringRef.current = true; }}
                  onMouseLeave={() => { hoveringRef.current = false; }}
                >
                  <div className="pointer-events-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/8 text-left max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:w-full">
                    <div className="sm:hidden flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-secondary-900">Guests</span>
                      <button type="button" onClick={() => setOpenPanel(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-secondary-900">Adults</div>
                            <div className="text-xs text-secondary-400">Ages 12+</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => onAdultsChange(Math.max(1, adults - 1))} disabled={adults <= 1}
                            className={cn("flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                              adults <= 1 ? "border-neutral-100 text-neutral-200 cursor-not-allowed" : "border-neutral-300 text-secondary-600 hover:border-secondary-900 hover:text-secondary-900"
                            )}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[24px] text-center text-base font-semibold text-secondary-900 tabular-nums">{adults}</span>
                          <button type="button" onClick={() => onAdultsChange(adults + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-secondary-600 transition-colors hover:border-secondary-900 hover:text-secondary-900">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="h-px bg-neutral-100" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-secondary-900">Kids</div>
                            <div className="text-xs text-secondary-400">Ages 3-11</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => onKidsChange(Math.max(0, kids - 1))} disabled={kids <= 0}
                            className={cn("flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                              kids <= 0 ? "border-neutral-100 text-neutral-200 cursor-not-allowed" : "border-neutral-300 text-secondary-600 hover:border-secondary-900 hover:text-secondary-900"
                            )}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[24px] text-center text-base font-semibold text-secondary-900 tabular-nums">{kids}</span>
                          <button type="button" onClick={() => onKidsChange(kids + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-secondary-600 transition-colors hover:border-secondary-900 hover:text-secondary-900">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                          <p className="text-xs leading-relaxed text-secondary-500 text-left">
                            Pick your dates and group size — boat options with prices appear below. Toddlers under 3 go free.
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { onConfirmSearch?.(); setOpenPanel(null); onContinue(); }}
                        disabled={adults < 1}
                        className={cn("sm:hidden mt-3 w-full h-11 rounded-full text-sm font-semibold transition",
                          adults >= 1
                            ? "bg-primary-600 text-white hover:bg-primary-700"
                            : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                        )}>
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pr-2 sm:pr-3.5 shrink-0">
            <button
              type="button"
              onClick={() => { onConfirmSearch?.(); setOpenPanel(null); onContinue(); }}
              disabled={!canContinue}
              style={hasPendingChanges ? { animation: "search-btn-pulse 1.6s ease-out infinite" } : undefined}
              className={cn(
                "flex items-center justify-center rounded-full transition-all",
                "h-10 w-10 sm:h-auto sm:w-auto sm:gap-2 sm:px-6 sm:py-3 text-sm font-semibold",
                canContinue
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 active:scale-95"
                  : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
              )}
            >
              <span className="hidden sm:inline">Search</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <style>{`
      @keyframes search-btn-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(37,99,235,0.5); }
        60%  { box-shadow: 0 0 0 10px rgba(37,99,235,0.12); }
        100% { box-shadow: 0 0 0 16px rgba(37,99,235,0); }
      }
    `}</style>
    </>
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
  const row = "flex items-start gap-3 py-3";
  const iconBlue = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600";
  const gridFor = (count) => cn("grid gap-x-6", count === 4 ? "grid-cols-1 sm:grid-cols-2" : count <= 3 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3");
  if (activeTab === "included") {
    const items = includedSections.flatMap((s) => s.items);
    return (
      <div className={gridFor(items.length)}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={row}>
              <div className={iconBlue}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white/90">{item.label}</div>
                {item.helper ? <div className="text-xs leading-normal text-white/40">{item.helper}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  if (activeTab === "pickup") return (
    <div className={gridFor(TOUR_PICKUP_ITEMS.length)}>
      {TOUR_PICKUP_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={row}>
            <div className={iconBlue}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-white/90">{item.label}</div>
              <div className="text-xs leading-normal text-white/40">{item.helper}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "safety") return (
    <div className={gridFor(TOUR_SAFETY_ITEMS.length)}>
      {TOUR_SAFETY_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={row}>
            <div className={iconBlue}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-white/90">{item.label}</div>
              <div className="text-xs leading-normal text-white/40">{item.helper}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "cancellation") return (
    <div className={gridFor(cancellationSummaryCards.length)}>
      {cancellationSummaryCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className={row}>
            <div className={cn(iconBlue, card.accentClassName)}>
              <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", card.iconClassName)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-white/90">{card.title}</div>
              <div className="text-xs leading-normal text-white/40">{card.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "faq") return (
    <div className={gridFor(bookingMiniFAQData.length)}>
      {bookingMiniFAQData.map((it) => {
        const Icon = ICON_MAP[it.icon];
        return (
          <div key={it.q} className={row}>
            <div className={iconBlue}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-white/90">{it.q}</div>
              <div className="text-xs leading-normal text-white/40">{it.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  if (activeTab === "weather") {
    const weatherItems = [...weatherGuaranteeCards, { icon: AlertTriangle, title: "Port Authority", text: "Final go/no-go decision is based on Port Authority guidance and captain safety checks on the tour morning." }];
    return (
      <div className={gridFor(weatherItems.length)}>
        {weatherItems.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={row}>
              <div className={iconBlue}><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white/90">{card.title}</div>
                <div className="text-xs leading-normal text-white/40">{card.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}
const TOUR_INFO_TAB_TITLES = {
  included: "What's included",
  pickup: "Pickup",
  safety: "Safety",
  cancellation: "Cancellation",
  weather: "Weather Guarantee",
  faq: "FAQ",
};
function TourInfoModal({ activeTab = "included", onClose }) {
  const { cancellationSummaryCards, weatherGuaranteeCards } = transformTourCards(tourInfo, ICON_MAP);
  const includedSections = tourInfo.includedSections.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      icon: ICON_MAP[item.icon]
    }))
  }));
  return (
    <div className="flex max-h-[85vh] w-full flex-col bg-white p-0">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5">
        <div className="text-base sm:text-xl font-semibold text-secondary-900">
          {TOUR_INFO_TAB_TITLES[activeTab] || "Tour info"}
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
      <div className="tour-modal-light flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 text-sm text-secondary-600">
        <TourTabContent
          activeTab={activeTab}
          includedSections={includedSections}
          cancellationSummaryCards={cancellationSummaryCards}
          weatherGuaranteeCards={weatherGuaranteeCards}
        />
      </div>
    </div>
  );
}
function TourInfoInline() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("included");
  const [includedRestaurantPopup, setIncludedRestaurantPopup] = useState(null);
  const { cancellationSummaryCards, weatherGuaranteeCards } = transformTourCards(tourInfo, ICON_MAP);
  const includedSections = tourInfo.includedSections.map(section => ({ ...section, items: section.items.map(item => ({ ...item, icon: ICON_MAP[item.icon] })) }));
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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
        <Modal open={!!includedRestaurantPopup} onClose={() => setIncludedRestaurantPopup(null)} title={includedRestaurantPopup.name || "Restaurant"} subtitle="Included lunch" maxWidth="max-w-xl" hideDragHandle>
          <div className="pb-4">
            {includedRestaurantPopup.image && <div className="mb-4 aspect-4/3 overflow-hidden rounded-2xl border border-neutral-200"><img src={includedRestaurantPopup.image} alt={includedRestaurantPopup.name} className="h-full w-full object-cover" /></div>}
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
  isAvailabilityLoading = false,
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
  boatAnimKey = 0,
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
  const [gridDetailBoat, setGridDetailBoat] = useState(null);
  const [gridPickingDate, setGridPickingDate] = useState(false);
  const [gridDraftDate, setGridDraftDate] = useState("");
  const [draftFlexDate, setDraftFlexDate] = useState("");
  const [confirmModalData, setConfirmModalData] = useState(null);
  useEffect(() => {
    setGridPickingDate(false);
    setGridDraftDate("");
  }, [gridDetailBoat]);
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
      }
    },
    [inlineDatesFor, closePickDayMode, onDateSelectionPreference, onSelectFlexDate, onSelectBoatId, boats, groupSize, privateTours]
  );
  const confirmPickDayForBoat = useCallback(
    (boat, date) => {
      if (!date || !boat) return;
      const price = calculateBoatPrice(boat.tourId, date, groupSize, privateTours);
      onSelectFlexDate(date);
      onDateSelectionPreference("pickNow");
      if (boat.isPartner) {
        setPartnerBoat({ ...boat, priceValue: price ?? boat.priceValue });
      } else {
        onSelectBoatId(boat.id);
      }
    },
    [onDateSelectionPreference, onSelectFlexDate, onSelectBoatId, groupSize, privateTours]
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
    const bar = document.getElementById("step1-bar");
    const barRect = bar?.getBoundingClientRect();
    const barVisible = barRect && barRect.top >= 0 && barRect.bottom <= window.innerHeight;
    if (barVisible && bar) {
      const heroSection = document.getElementById("hero-section");
      const heroRect = heroSection?.getBoundingClientRect();
      const onDarkBg = heroRect && barRect.top >= heroRect.top && barRect.bottom <= heroRect.bottom;
      const pulseClass = onDarkBg ? "bar-pulse bar-pulse-light" : "bar-pulse";
      bar.classList.remove("bar-pulse", "bar-pulse-light");
      void bar.offsetWidth;
      pulseClass.split(" ").forEach(c => bar.classList.add(c));
      setTimeout(() => bar.classList.remove("bar-pulse", "bar-pulse-light"), 1600);
    } else {
      window.dispatchEvent(new CustomEvent("expand-sticky-bar"));
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

    // Add dynamic pricing and availability flags to each boat
    const listWithFlags = baseList.map(y => {
      const dateForPricing = dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart);
      const price = calculateBoatPrice(y.tourId, dateForPricing, groupSize, privateTours);
      const avail = availabilityByBoat?.[y.id];
      const isUnavailable = hasDateCriteria && avail !== undefined && !avail.available;
      const isOverCapacity = groupSize > y.people;
      return {
        ...y,
        priceValue: price ?? y.priceValue,
        _soldOut: !!isUnavailable,
        _overCapacity: !!isOverCapacity,
      };
    });

    // Filter by category if selected
    const afterCategory = selectedCategory
      ? listWithFlags.filter((y) => y.categories?.some((c) => c.id === selectedCategory))
      : listWithFlags;

    // Sort: available first, then sold out / over capacity at the end
    return afterCategory.sort((a, b) => {
      const aDisabled = a._soldOut || a._overCapacity ? 1 : 0;
      const bDisabled = b._soldOut || b._overCapacity ? 1 : 0;
      return aDisabled - bDisabled;
    });
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
  const dateSummaryCompact = !hasDateCriteria
    ? ""
    : dateMode === "exact" && exactDate
      ? `${formatShortDate(exactDate)} · ${groupSize} guest${groupSize !== 1 ? "s" : ""}`
      : dateMode === "flex" && rangeStart && rangeEnd
        ? `${formatRangeShort(rangeStart, rangeEnd)} · ${groupSize} guest${groupSize !== 1 ? "s" : ""}`
        : "";
  const openBoat = (boat) => {
    const now = Date.now();
    if (now - boatSelectGuardRef.current < 250) return;
    boatSelectGuardRef.current = now;
    if (boat.isPartner) {
      setPartnerBoat(boat);
    } else if (dateMode === "flex" && hasRange) {
      if (boat.id !== selectedBoatId) {
        onSelectFlexDate("");
      }
      openPickDayMode(boat.id);
    } else {
      onSelectBoatId(boat.id);
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
    const fitsGroup = !boat._overCapacity && groupSize <= boat.people;
    const soldOut = boat._soldOut || (dateMode === "exact" && exactDate && !availability?.available);
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

    const flashSaleDate = draftDate || (dateMode === "exact" ? exactDate : "");
    const isFlashSale = flashSaleDate ? getFlashSaleForDate(boat.tourId, flashSaleDate, privateTours) : false;

    const isSoon = boat.status === "soon";
    return (
      <div
        className={cn(
          "group relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white text-left shadow-none transition-all duration-300",
          isSelected && "border-neutral-200 shadow-2xl z-10",
          (isSoldOut || soldOut || !fitsGroup) && "opacity-70",
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
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 backdrop-blur-xs">
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
              <div className={cn("relative w-full", !(soldOut || isSoldOut || !fitsGroup) && "overflow-hidden")}>
                <PhotoCarousel
                  className="aspect-video cursor-pointer"
                  images={boat.images?.length ? boat.images : [boat.cover]}
                  alt={boat.name}
                  maximizeLeft
                  onOpenGallery={(startIndex) => {
                    const slides = (boat.images?.length ? boat.images : [boat.cover]).map(s => typeof s === "string" ? s : s?.path || s?.thumb || "").filter(Boolean);
                    Fancybox.show(slides.map(src => ({ src, type: "image" })), { startIndex: startIndex || 0 });
                  }}
                />
                {isSelected && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                        <Check className="h-6 w-6 text-white" strokeWidth={3} />
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-black text-white tracking-wide">Your pick</span>
                        <span className="text-xs text-white/60">Tap to change date</span>
                      </div>
                    </div>
                  </>
                )}
                {(soldOut || isSoldOut || !fitsGroup) && !isSelected && (
                  <>
                    <div className="pointer-events-none absolute inset-0 z-30 bg-[#0d1b2e]/50 backdrop-blur-[1px] rounded-xl" />
                    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center">
                      <span className="rounded-full backdrop-blur-md bg-white/20 border border-white/30 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                        {!fitsGroup ? `Max ${boat.people} guests` : "Sold out"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5 sm:pt-4">
                {/* Type label */}
                {boatTypeLabel && (
                  <div className="mb-2.5 text-xs leading-tight font-normal uppercase tracking-widest text-primary-500">{boatTypeLabel}</div>
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
                <div className="mt-1.5 sm:min-h-[4.5rem] text-sm leading-relaxed text-secondary-500 line-clamp-3">
                  {boatDescriptionText}
                </div>

                {/* Fleet size info */}
                {boat.fleetSize >= 1 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-secondary-500">
                    <Ship className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                    {boat.fleetSize} identical {boat.fleetSize === 1 ? "boat" : "boats"} — we assign the best available for your date
                  </div>
                )}

                {/* Features grid */}
                <div className="mt-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="grid grid-cols-2 gap-x-1.5 gap-y-2 sm:gap-x-4 sm:gap-y-2.5">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-secondary-700 sm:gap-2.5">
                      <Users className="h-3.5 w-3.5 shrink-0 text-primary-500 sm:h-4 sm:w-4" />
                      Up to {boat.people}
                    </div>
                    {boatFeatures.map(({ label, present, Icon }) => (
                      <div key={label} className={cn("flex items-center gap-1.5 text-sm sm:gap-2.5", present ? "font-bold text-secondary-700" : "text-secondary-300")}>
                        <Icon className={cn("h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4", present ? "text-primary-500" : "text-neutral-300")} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best for badge */}
                {bf.best_for && (
                  <div className="mt-3.5">
                    <div className="flex min-h-[2.25rem] items-center rounded-xl border border-primary-100 bg-primary-50 px-4 py-1">
                      <p className="text-xs font-semibold text-primary-700">Best for: {bf.best_for}</p>
                    </div>
                  </div>
                )}

                {/* Price + button */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className={cn("flex min-w-0 flex-col", (isSoldOut || isLocked) && "opacity-60")}>
                      <div className="flex items-baseline gap-x-1 flex-wrap">
                        {showFrom && <span className="text-xs sm:text-sm font-medium text-secondary-400">from</span>}
                        <span className="text-base sm:text-2xl font-black text-secondary-900 tracking-tight">
                          {boat.id === "angels" ? formatIDR(33000000) : formatIDR(isLocked ? (boat.gross_price || boat.priceValue) : draftPriceValue)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-secondary-400">
                          {boat.id === "angels" ? "/ 2 boats" : "/ boat"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLocked ? (
                        <button type="button" onClick={focusStepOne} className="inline-flex w-full h-11 px-6 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-200">
                          <Calendar className="h-4 w-4" />Select dates
                        </button>
                      ) : !fitsGroup ? (
                        <button type="button" onClick={focusStepOne}
                          className="inline-flex h-11 px-6 items-center justify-center gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30">
                          <Users className="h-4 w-4" />Change parameters
                        </button>
                      ) : isSoldOut || soldOut ? (
                        <button type="button" onClick={focusStepOne}
                          className="inline-flex h-11 px-6 items-center justify-center gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30">
                          <Calendar className="h-4 w-4" />Change date
                        </button>
                      ) : dateMode === "exact" && needsExactDateSelection ? (
                        <button type="button" onClick={() => scrollToBookingBar()} className="inline-flex w-full h-11 px-6 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-400 transition hover:bg-neutral-200">
                          Select date first
                        </button>
                      ) : isSelected ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (dateMode === "flex" && hasRange) {
                              openPickDayMode(boat.id);
                            } else {
                              focusStepOne();
                            }
                          }}
                          className="inline-flex w-full h-11 px-6 items-center justify-center gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30"
                        >
                          <Calendar className="h-4 w-4" />Change date
                        </button>
                      ) : (
                        <Button
                          type="button"
                          variant="primary"
                          className="h-11 rounded-full px-6"
                          onClick={() => {
                            if (!hasDateCriteria) {
                              focusStepOne();
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
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl rounded-b-none bg-white p-5 shadow-2xl sm:inset-0 sm:m-auto sm:h-fit sm:w-[420px] sm:rounded-3xl sm:p-6"
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
                            "flex min-h-58 flex-col items-center justify-center rounded-2xl border px-2 py-1 transition-all duration-200",
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
                  <div className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-4 text-center">
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
        className="bg-transparent !pt-5 sm:!pt-10 md:!pt-14 !pb-2 sm:!pb-4"
        centered
      >
        <PremiumContainer>

          {/* Filter + sort bar */}
          {(() => {
            const allBoatsArr = (boats || []).filter(y => y.status !== "disabled");
            // Count available boats per category (respecting current date/guest filters)
            const availableBase = (() => {
              const base = fitsOnly ? allBoatsArr.filter(y => groupSize <= y.people) : allBoatsArr;
              if (!hasDateCriteria || !fitsOnly) return base;
              return base.filter(y => availabilityByBoat?.[y.id]?.available);
            })();
            const countForCat = (catId) => availableBase.filter(b => b.categories?.some(c => c.id === catId)).length;
            const sortLabel = sort === "price" ? "By price" : sort === "comfort" ? "Largest" : sort === "soonest" ? "Soonest" : "Sort";
            const sortOptions = [
              { value: "recommended", label: "Recommended" },
              { value: "price", label: "Lowest price" },
              { value: "comfort", label: "Largest boat" },
              { value: "soonest", label: "Soonest available" },
            ];
            return (
            <div className="mb-4 sm:mb-6 space-y-2">
              <div className="sm:hidden flex items-center justify-between gap-2">
                <h3 className="text-xl font-semibold text-secondary-900 text-left">Choose your boat</h3>
                {dateSummaryCompact && (
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-secondary-600">
                    {dateSummaryCompact}
                  </span>
                )}
              </div>
              {/* Mobile: single scrollable row with sort + categories */}
              <div className="-mx-6 sm:mx-0">
                <div className="flex items-center gap-2 sm:gap-4 sm:flex-wrap">
                  <div className="hidden sm:flex sm:shrink-0 sm:flex-col sm:gap-1">
                    <h3 className="text-3xl font-bold tracking-tight text-secondary-900">Choose your boat</h3>
                    {dateSummaryCompact && (
                      <span className="text-left text-sm font-semibold text-secondary-500">{dateSummaryCompact}</span>
                    )}
                  </div>
                  <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto pb-0.5 sm:flex-wrap">
                    <div className="shrink-0 w-2 min-w-[16px] sm:hidden" aria-hidden="true" />
                    {/* Sort button — compact on mobile, before categories */}
                    <div className="relative shrink-0 sm:hidden">
                      <button type="button" onClick={() => setShowSortMenu(v => !v)}
                        className={cn("flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-all select-none sm:px-3 sm:py-1.5 sm:text-sm",
                          "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                        )}>
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>{sortLabel}</span>
                        <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", showSortMenu && "rotate-180")} />
                      </button>
                    </div>
                    <button type="button" onClick={() => { setSelectedCategory(null); setFitsOnly(false); }}
                      className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-all sm:px-3.5 sm:py-1.5 sm:text-sm",
                        !selectedCategory ? "border-primary-200 bg-primary-50 text-primary-600" : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                      )}>
                      All boats ({availableBase.length})
                    </button>
                    {allCategories.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-all sm:px-3.5 sm:py-1.5 sm:text-sm",
                          selectedCategory === cat.id ? "border-primary-200 bg-primary-50 text-primary-600" : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                        )}>
                        {cat.name} ({countForCat(cat.id)})
                      </button>
                    ))}
                    <div className="shrink-0 w-2 min-w-[16px] sm:hidden" aria-hidden="true" />
                  </div>
                  <div className="hidden shrink-0 ml-auto items-center gap-2 sm:flex">
                    <div className="relative">
                      <button type="button" onClick={() => setShowSortMenu(v => !v)}
                        className={cn("flex items-center justify-start gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all select-none",
                          "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                        )}>
                        <span className="flex items-center gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5" />{sortLabel}</span>
                        <ChevronDown className={cn("h-3 w-3 transition-transform", showSortMenu && "rotate-180")} />
                      </button>
                      {showSortMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                          <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                            {sortOptions.map((opt) => (
                              <button key={opt.value} type="button" onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                                className={cn("flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50",
                                  sort === opt.value ? "font-semibold text-primary-600" : "text-secondary-700"
                                )}>
                                {sort === opt.value && <Check className="h-3.5 w-3.5 text-primary-500" />}
                                <span className={sort !== opt.value ? "pl-5" : ""}>{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {!showAllBoats && <div id="mini-boats-nav" className="flex items-center gap-2" />}
                  </div>
                </div>
              </div>
              {/* Mobile sort bottom sheet */}
              {showSortMenu && (
                <div className="sm:hidden">
                  <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowSortMenu(false)} />
                  <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-5 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-secondary-900">Sort by</span>
                      <button type="button" onClick={() => setShowSortMenu(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {sortOptions.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => { setSort(opt.value); setShowSortMenu(false); }}
                          className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                            sort === opt.value ? "bg-primary-50 font-semibold text-primary-600" : "text-secondary-700 hover:bg-neutral-50"
                          )}>
                          {sort === opt.value && <Check className="h-4 w-4 text-primary-500" />}
                          <span className={sort !== opt.value ? "pl-7" : ""}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Mini carousel — animated transition */}
          <AnimatePresence mode="wait">
            {isAvailabilityLoading && hasDateCriteria ? (
              <motion.div
                key="availability-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonBoatCard key={`boat-skel-${i}`} />
                  ))}
                </div>
              </motion.div>
            ) : !showAllBoats && sorted.length === 0 && hasDateCriteria ? (
              <motion.div
                key="empty-placeholder"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col items-center justify-center px-6 py-0 sm:py-12 text-center">
                  <div className="mb-1.5 sm:mb-3 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-neutral-100">
                    <Ship className="h-7 w-7 sm:h-10 sm:w-10 text-secondary-300" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-secondary-900">No boats available</h4>
                  <p className="mt-1 sm:mt-1.5 max-w-[200px] sm:max-w-sm text-xs sm:text-sm text-secondary-500">
                    No boats for this date and group size. Try adjusting your search.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setTimeout(() => focusStepOne(), 800);
                    }}
                    className="mt-2.5 sm:mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2 sm:py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Choose other parameters
                  </button>
                </div>
              </motion.div>
            ) : !showAllBoats ? (
              <motion.div
                key={`mini-carousel-${boatAnimKey}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BoatMiniCarousel
                  key={sort + (selectedCategory || "")}
                  boats={sorted}
                  selectedBoatId={selectedBoatId}
                  hasDateCriteria={hasDateCriteria}
                  groupSize={groupSize}
                  onSelect={(boat) => {
                    if (!hasDateCriteria) { focusStepOne(); return; }
                    openBoat(boat);
                  }}
                  onFocusDate={focusStepOne}
                  formatPrice={formatIDR}
                  dateMode={dateMode}
                  hasRange={hasRange}
                  rangeDates={rangeDates}
                  availabilityByBoat={availabilityByBoat}
                  privateTours={privateTours}
                  selectedFlexDate={selectedFlexDate}
                  onConfirmDate={confirmPickDayForBoat}
                />
                {sorted.length > 0 && (
                  <div className="mb-6 mt-2 flex justify-center sm:mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAllBoats(true)}
                      className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:rounded-full sm:border sm:border-neutral-200 sm:bg-white sm:px-5 sm:py-2 sm:text-secondary-600 sm:shadow-sm sm:hover:border-neutral-300 sm:hover:text-secondary-800"
                    >
                      View all
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="full-grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div
                  ref={carouselRef}
                  className="grid gap-3 grid-cols-2 sm:grid-cols-4"
                >
                  {sorted.map((boat, i) => {
                    const isSelected = selectedBoatId === boat.id;
                    const photo = boat.cover || boat.images?.[0]?.thumb || boat.images?.[0]?.path || "";
                    const isSoldOutBoat = boat._soldOut || (dateMode === "exact" && exactDate && !availabilityByBoat?.[boat.id]?.available);
                    const isOverCap = boat._overCapacity || groupSize > boat.people;
                    const isDisabledBoat = isSoldOutBoat || isOverCap;
                    return (
                    <motion.div
                      key={boat.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.03, ease: "easeOut" }}
                      onClick={() => setGridDetailBoat(boat)}
                      className={cn(
                        "group flex flex-col cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border bg-white transition-all duration-200 hover:shadow-md",
                        isSelected ? "border-primary-500 border-2 shadow-md" : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-b-xl sm:aspect-[6/5]">
                        {photo ? (
                          <img src={photo} alt={boat.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-300"><Ship className="h-6 w-6" /></div>
                        )}
                        {boat.isPartner && (
                          <span className="absolute right-2 top-2 rounded-full bg-amber-50/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200 sm:hidden">By request</span>
                        )}
                        {isSelected && (
                          <>
                            <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                                <Check className="h-5 w-5 text-white" strokeWidth={3} />
                              </div>
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-black text-white tracking-wide">Your pick</span>
                                <span className="text-xs text-white/60">Tap to change date</span>
                              </div>
                            </div>
                          </>
                        )}
                        {!isSelected && isDisabledBoat && (
                          <>
                            <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                              <span className="rounded-full backdrop-blur-md bg-white/20 border border-white/30 px-3 py-1 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                                {isOverCap ? `Max ${boat.people} guests` : "Sold out"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-1.5 p-2.5 sm:p-4">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-secondary-900 truncate">{boat.name}</h4>
                          {!isSelected && boat.isPartner && (
                            <span className="hidden sm:inline-block shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200">By request</span>
                          )}
                        </div>
                        {isSelected ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              setTimeout(() => focusStepOne?.(), 800);
                            }}
                            className="mt-auto flex w-full h-11 items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-xs sm:text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30"
                          >
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            Change date
                          </button>
                        ) : isDisabledBoat ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); focusStepOne?.(); }}
                            className="mt-auto flex w-full h-11 items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-xs sm:text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30"
                          >
                            {isOverCap ? <><Users className="h-3 w-3 sm:h-4 sm:w-4" />Change parameters</> : <><Calendar className="h-3 w-3 sm:h-4 sm:w-4" />Change date</>}
                          </button>
                        ) : (
                          <>
                            {boat.boatFeatures?.best_for && (
                              <p className="mt-0.5 text-xs sm:text-sm text-secondary-400 truncate text-left capitalize">{boat.boatFeatures.best_for}</p>
                            )}
                            <div className={cn("mt-1 sm:mt-0.5 flex sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-0", formatIDR(boat.priceValue).replace(/\D/g, "").length >= 7 ? "flex-col" : "flex-row items-center justify-between")}>
                              <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-secondary-500"><Users className="h-3 w-3 sm:h-4 sm:w-4" />{boat.people}</span>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-sm sm:text-lg font-black text-secondary-900 tracking-tight">{formatIDR(boat.priceValue)}</span>
                                <span className="text-[10px] sm:text-xs text-secondary-400">/ boat</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: sorted.length * 0.06 + 0.3 }}
                  className="mt-6 flex justify-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllBoats(false);
                      setHasSwiped(false);
                      setTimeout(() => {
                        const title = document.getElementById("hero-title");
                        if (title) {
                          const navHeight = document.querySelector("nav")?.offsetHeight || 0;
                          const titleBottom = title.getBoundingClientRect().bottom + window.scrollY;
                          const isMobileView = window.innerWidth < 640;
                          window.scrollTo({ top: titleBottom - (isMobileView ? navHeight : 0), behavior: "smooth" });
                        }
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:rounded-full sm:border sm:border-neutral-200 sm:bg-white sm:px-5 sm:py-2 sm:text-secondary-600 sm:shadow-sm sm:hover:border-neutral-300 sm:hover:text-secondary-800"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Collapse
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </PremiumContainer>
      </PremiumSection>

      {/* Grid detail modal — same as carousel detail popup */}
      <Modal
        isOpen={!!gridDetailBoat}
        onClose={() => setGridDetailBoat(null)}
        maxWidth="max-w-xl"
        bodyClassName="p-0 overflow-hidden flex-1 min-h-0 flex flex-col"
        showClose={false}
        hideDragHandle
      >
        {gridDetailBoat && (() => {
            const boat = gridDetailBoat;
            const bf = boat.boatFeatures || {};
            const boatFeatures = getBoatFeatures(boat.boatFeatures);
            const boatTypeLabel = [bf.boat_type || null, boat.lengthMeters ? `${boat.lengthMeters}M` : null].filter(Boolean).join(" · ").toUpperCase();
            const boatDescriptionText = sanitizeDisplayText(boat.description, { stripTrailingOne: true });
            const isBoatSelected = selectedBoatId === boat.id;
            const isSoldOutBoat = boat._soldOut || (dateMode === "exact" && exactDate && !availabilityByBoat?.[boat.id]?.available);
            const isOverCap = boat._overCapacity || groupSize > boat.people;
            const isDisabledBoat = isSoldOutBoat || isOverCap;
            const gridCanPickDayInline = dateMode === "flex" && hasRange && !boat.isPartner;
            const gridBoatAvailableDates = availabilityByBoat?.[boat.id]?.availableDates ?? [];
            const gridDraftPrice = gridDraftDate ? calculateBoatPrice(boat.tourId, gridDraftDate, groupSize, privateTours) : null;
            const startGridPickingDate = () => {
              setGridDraftDate(isBoatSelected ? (selectedFlexDate || "") : "");
              setGridPickingDate(true);
            };
            return (
              <>
                  {/* Photo */}
                  <div className="relative w-full shrink-0 overflow-hidden">
                    <PhotoCarousel
                      className="aspect-video cursor-pointer"
                      images={boat.images?.length ? boat.images : [boat.cover]}
                      alt={boat.name}
                      maximizeLeft
                      onOpenGallery={(startIndex) => {
                        const slides = (boat.images?.length ? boat.images : [boat.cover]).map(s => typeof s === "string" ? s : s?.path || s?.thumb || "").filter(Boolean);
                        Fancybox.show(slides.map(src => ({ src, type: "image" })), { startIndex: startIndex || 0 });
                      }}
                    />
                    {isBoatSelected && (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                            <Check className="h-6 w-6 text-white" strokeWidth={3} />
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-black text-white tracking-wide">Your pick</span>
                            <span className="text-xs text-white/60">Tap to change date</span>
                          </div>
                        </div>
                      </>
                    )}
                    <button type="button" onClick={() => setGridDetailBoat(null)}
                      className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition hover:bg-white/40"
                      aria-label="Close">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Scrollable content */}
                  <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-4">
                    {gridPickingDate ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-lg font-bold tracking-tight text-secondary-900">Pick a day</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-secondary-400">Optional step</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGridPickingDate(false)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-secondary-500 transition hover:bg-white hover:text-secondary-900"
                            aria-label="Back to details"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4">
                          {rangeDates.length ? (
                            <div className="grid grid-cols-5 gap-2 pr-1">
                              {rangeDates.map((date) => {
                                const isAvailable = gridBoatAvailableDates.includes(date);
                                const isPicked = gridDraftDate === date;
                                const parsed = new Date(`${date}T00:00:00`);
                                const monthLabel = parsed.toLocaleString("en-US", { month: "short" });
                                const dayLabel = Number.isNaN(parsed.getTime()) ? "" : String(parsed.getDate());
                                return (
                                  <button
                                    key={date}
                                    type="button"
                                    onClick={() => { if (isAvailable) setGridDraftDate(date); }}
                                    className={cn(
                                      "flex min-h-58 flex-col items-center justify-center rounded-2xl border px-2 py-1 transition-all duration-200",
                                      isPicked
                                        ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm scale-102"
                                        : isAvailable
                                          ? "border-neutral-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-neutral-100 hover:text-primary-700"
                                          : "border-neutral-200 bg-neutral-50 text-secondary-500 opacity-40 cursor-not-allowed"
                                    )}
                                    disabled={!isAvailable}
                                  >
                                    <span className={cn("text-xs leading-tight font-semibold uppercase tracking-wide", isPicked ? "text-primary-600" : isAvailable ? "text-secondary-400" : "text-secondary-300")}>
                                      {monthLabel}
                                    </span>
                                    <span className={cn("mt-0.5 text-xl font-extrabold leading-none", isPicked ? "text-primary-700" : isAvailable ? "text-secondary-900" : "text-secondary-400")}>
                                      {dayLabel}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-4 text-center">
                              <Calendar className="mb-2 h-6 w-6 text-secondary-300" />
                              <div className="text-sm font-semibold text-secondary-500">Select a date range first</div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {boatTypeLabel && (
                          <div className="mb-2 text-xs leading-tight font-normal uppercase tracking-widest text-primary-500">{boatTypeLabel}</div>
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="text-xl font-bold text-secondary-900 leading-tight line-clamp-1">
                            {boat.id === "angels" ? "Two boats (14+ guests)" : boat.name}
                          </div>
                          {boat.isPartner && (
                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 border border-amber-200">By request</span>
                          )}
                        </div>
                        {boatDescriptionText && <p className="mt-1.5 text-sm leading-relaxed text-secondary-500">{boatDescriptionText}</p>}
                        {boat.fleetSize >= 1 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-secondary-500">
                            <Ship className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                            {boat.fleetSize} identical {boat.fleetSize === 1 ? "boat" : "boats"} — we assign the best available for your date
                          </div>
                        )}
                        <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            <div className="flex items-center gap-2.5 text-sm font-bold text-secondary-700"><Users className="h-4 w-4 shrink-0 text-primary-500" />Up to {boat.people}</div>
                            {boatFeatures.map(({ label, present, Icon }) => (
                              <div key={label} className={cn("flex items-center gap-2.5 text-sm", present ? "font-bold text-secondary-700" : "text-secondary-300")}>
                                <Icon className={cn("h-4 w-4 shrink-0", present ? "text-primary-500" : "text-neutral-300")} />{label}
                              </div>
                            ))}
                          </div>
                        </div>
                        {bf.best_for && (
                          <div className="mt-2.5">
                            <div className="flex min-h-[2.25rem] items-center rounded-xl border border-primary-100 bg-primary-50 px-4 py-1">
                              <p className="text-xs font-semibold text-primary-700">Best for: {bf.best_for}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Sticky footer */}
                  <div className="shrink-0 border-t border-neutral-100 bg-white px-5 py-3">
                    {gridPickingDate ? (
                      <div className="flex flex-col gap-3">
                        {gridDraftDate ? (
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-semibold text-secondary-500">
                              {new Date(`${gridDraftDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-secondary-900 tracking-tight">{formatIDR(gridDraftPrice ?? boat.priceValue)}</span>
                              <span className="text-2xs font-bold uppercase tracking-widest text-secondary-300">/ boat</span>
                            </div>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className={cn(
                            "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                            gridDraftDate
                              ? "bg-primary-600 text-white shadow-card hover:scale-101 hover:bg-primary-600-strong active:scale-98"
                              : "bg-neutral-100 text-secondary-300 cursor-not-allowed"
                          )}
                          onClick={() => { confirmPickDayForBoat(boat, gridDraftDate); setGridDetailBoat(null); }}
                          disabled={!gridDraftDate}
                        >
                          Confirm date
                        </button>
                      </div>
                    ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-x-1">
                        <span className="text-sm font-medium text-secondary-400">from</span>
                        <span className="text-2xl font-black text-secondary-900 tracking-tight">{formatIDR(boat.priceValue)}</span>
                        <span className="text-sm font-medium text-secondary-400">/ boat</span>
                      </div>
                      {hasDateCriteria && isBoatSelected ? (
                        <button type="button" onClick={() => {
                            if (gridCanPickDayInline) { startGridPickingDate(); return; }
                            setGridDetailBoat(null); focusStepOne();
                          }}
                          className="shrink-0 h-11 px-6 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />Change date
                        </button>
                      ) : hasDateCriteria && isDisabledBoat ? (
                        <button type="button" onClick={() => { setGridDetailBoat(null); focusStepOne(); }}
                          className="shrink-0 h-11 px-6 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30 flex items-center gap-1.5">
                          {isOverCap ? <><Users className="h-4 w-4" />Change parameters</> : <><Calendar className="h-4 w-4" />Change date</>}
                        </button>
                      ) : hasDateCriteria ? (
                        <button type="button" onClick={() => {
                            if (gridCanPickDayInline) { startGridPickingDate(); return; }
                            const boatId = boat.id;
                            setGridDetailBoat(null);
                            if (boat.isPartner) {
                              setTimeout(() => setPartnerBoat(boat), 430);
                            } else {
                              setTimeout(() => onSelectBoatId(boatId), 430);
                            }
                          }}
                          className="shrink-0 h-11 px-6 rounded-full bg-[#2563eb] text-sm font-bold text-white transition hover:bg-[#1d4ed8]">
                          Select
                        </button>
                      ) : (
                        <button type="button" onClick={() => {
                            setGridDetailBoat(null);
                            setTimeout(() => {
                              scrollToBookingBar();
                              setTimeout(() => focusStepOne?.(), 700);
                            }, 420);
                          }}
                          className="shrink-0 h-11 px-6 rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-400 transition hover:bg-neutral-200">
                          Select date first
                        </button>
                      )}
                    </div>
                    )}
                  </div>
              </>
            );
          })()}
      </Modal>

      {/* Standalone pick-day modal — renders regardless of mini-carousel/grid view */}
      <AnimatePresence>
        {inlineDatesFor && (() => {
          const pdBoat = (boats || []).find(b => b.id === inlineDatesFor);
          if (!pdBoat) return null;
          const pdAvailability = availabilityByBoat?.[pdBoat.id];
          const pdAvailableDates = pdAvailability?.availableDates ?? [];
          const pdDraftDate = pdAvailableDates.includes(draftFlexDate) ? draftFlexDate : "";
          let pdDraftPriceValue = pdBoat.priceValue;
          if (pdDraftDate && typeof calculateBoatPrice === 'function' && privateTours) {
            const p = calculateBoatPrice(pdBoat.tourId, pdDraftDate, groupSize, privateTours);
            if (p !== null) pdDraftPriceValue = p;
          }
          return (
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
                className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl rounded-b-none bg-white p-5 shadow-2xl sm:inset-0 sm:m-auto sm:h-fit sm:w-[420px] sm:rounded-3xl sm:p-6"
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
                        const isAvailable = pdAvailableDates.includes(date);
                        const isPicked = draftFlexDate === date;
                        const parsed = new Date(`${date}T00:00:00`);
                        const monthLabel = parsed.toLocaleString("en-US", { month: "short" });
                        const dayLabel = Number.isNaN(parsed.getTime()) ? "" : String(parsed.getDate());
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => { if (isAvailable) setDraftFlexDate(date); }}
                            className={cn(
                              "flex min-h-58 flex-col items-center justify-center rounded-2xl border px-2 py-1 transition-all duration-200",
                              isPicked
                                ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm scale-102"
                                : isAvailable
                                  ? "border-neutral-200 bg-white text-secondary-600 hover:border-primary-200 hover:bg-neutral-100 hover:text-primary-700"
                                  : "border-neutral-200 bg-neutral-50 text-secondary-500 opacity-40 cursor-not-allowed"
                            )}
                            disabled={!isAvailable}
                          >
                            <span className={cn("text-xs leading-tight font-semibold uppercase tracking-wide", isPicked ? "text-primary-600" : isAvailable ? "text-secondary-400" : "text-secondary-300")}>{monthLabel}</span>
                            <span className={cn("mt-0.5 text-xl font-extrabold leading-none", isPicked ? "text-primary-700" : isAvailable ? "text-secondary-900" : "text-secondary-400")}>{dayLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-4 text-center">
                      <Calendar className="mb-2 h-6 w-6 text-secondary-300" />
                      <div className="text-sm font-semibold text-secondary-500">Select a date range first</div>
                    </div>
                  )}
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  {pdDraftDate ? (
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-xs font-semibold text-secondary-500">
                        {new Date(`${pdDraftDate}T00:00:00`).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-secondary-900 tracking-tight">{formatIDR(pdDraftPriceValue)}</span>
                        <span className="text-2xs font-bold uppercase tracking-widest text-secondary-300">/ boat</span>
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                      pdDraftDate
                        ? "bg-primary-600 text-white shadow-card hover:scale-101 hover:bg-primary-600-strong active:scale-98"
                        : "bg-neutral-100 text-secondary-300 cursor-not-allowed"
                    )}
                    onClick={() => confirmPickDay(pdDraftDate)}
                    disabled={!pdDraftDate}
                  >
                    Confirm date
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
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
      <div className="flex h-250 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-400">
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
      className="group relative w-full rounded-2xl cursor-pointer"
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
        className="flex h-250 snap-x snap-mandatory rounded-2xl"
        style={{ overflowX: "scroll", scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={handleScroll}
      >
        {images.map((src, i) => (
          <div key={i} className="flex-none w-full snap-center relative shrink-0 h-250 overflow-hidden">
            <img
              src={src}
              alt={i === activeIndex ? "Day style preview" : ""}
              loading={Math.abs(i - activeIndex) <= 1 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-soft via-transparent to-transparent rounded-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/5 to-transparent rounded-2xl" />

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
function StepThree({ selectedStyleId, onSelectStyleId, onContinue, onSkip, onHighlightExtra, onOpenTourInfo, vibes = [], styles = [], extrasCatalog = [], allExtrasCatalog = [], hasDateCriteria = false, selectedBoatId = null, onFocusStepOne, priceDisplay = null, dateDisplay = null, guestsDisplay = null, capacityLabel = null, selectedExtras = {}, onExtraQtyChange, onShowExtras, transfers, selectedTransferId, onSelectTransferId, pickupAddress, onSetPickupAddress, dropoffAddress, onSetDropoffAddress, formatIDR: formatPrice, onOpenExtra, totalGuests = 1 }) {
  const { categories, loading: extrasLoading } = useExtras();
  const [ctaPulse, setCtaPulse] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [transferDetailsPopup, setTransferDetailsPopup] = useState(null);
  const [routeModalStyle, setRouteModalStyle] = useState(null);
  const [routeModalRestaurant, setRouteModalRestaurant] = useState(null);
  useEffect(() => {
    if (!routeModalStyle) { setRouteModalRestaurant(null); return; }
    if (routeModalStyle.restaurant && typeof routeModalStyle.restaurant === "object") {
      setRouteModalRestaurant(routeModalStyle.restaurant);
      return;
    }
    const rid = routeModalStyle.restaurant_id;
    if (rid) {
      let alive = true;
      fetchRestaurant(rid).then(r => { if (alive) setRouteModalRestaurant(r); }).catch(() => {});
      return () => { alive = false; };
    }
  }, [routeModalStyle]);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [skipPickupAddress, setSkipPickupAddress] = useState(false);
  const [samePickupDropoff, setSamePickupDropoff] = useState(false);
  const [selectionError, setSelectionError] = useState(false);
  const [openIncludedCategories, setOpenIncludedCategories] = useState({});
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
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const [scheduleExtraPopup, setScheduleExtraPopup] = useState(null);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [canScrollRouteLeft, setCanScrollRouteLeft] = useState(false);
  const [canScrollRouteRight, setCanScrollRouteRight] = useState(true);
  const updateRouteScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollRouteLeft(el.scrollLeft > 1);
    setCanScrollRouteRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || showAllStyles) return;
    el.addEventListener("scroll", updateRouteScrollState, { passive: true });
    updateRouteScrollState();
    return () => el.removeEventListener("scroll", updateRouteScrollState);
  }, [updateRouteScrollState, showAllStyles]);
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
      const images = (style.photos || []).map(p => p.thumb || p.path);
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

  const heroUrls = useMemo(() => styles.map((s) => (styleImages[s.id || s.slug] || [])[0]).filter(Boolean), [styles, styleImages]);
  const imagesReady = useImagePreload(heroUrls);
  const routeSkeletonCount = Math.max(3, Math.min(styles.length || 3, 6));
  const showRoutesSkeleton = extrasLoading || (styles.length > 0 && !imagesReady);

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
  const { cancellationSummaryCards, weatherGuaranteeCards } = useMemo(() => transformTourCards(tourInfo, ICON_MAP), []);

  const classifyExtra = useCallback((extra) => {
    const name = (extra.name || "").toLowerCase();
    const cat = (extra.categoryName || "").toLowerCase();
    const SCHEDULE_PATTERNS = /div(e|ing)|jet.?ski|banana|kayak|parasail|surf|watersport|sport|activity|extended.?tour|coral.?restor|massage|mass[aá]ge/i;
    if (SCHEDULE_PATTERNS.test(name) || SCHEDULE_PATTERNS.test(cat)) return "schedule";
    return "included";
  }, []);

  const includedExtras = useMemo(
    () => extrasCatalog.filter(e => classifyExtra(e) === "included"),
    [extrasCatalog, classifyExtra]
  );
  const scheduleExtras = useMemo(
    () => extrasCatalog.filter(e => classifyExtra(e) === "schedule"),
    [extrasCatalog, classifyExtra]
  );

  const infoContent = useCallback((activeTab) => {
    const row = "flex items-start gap-3 py-3";
    const iconBlue = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600";
    const gridFor = (count) => cn("grid gap-x-6", count === 4 ? "grid-cols-1 sm:grid-cols-2" : count <= 3 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3");
    const grid = "grid grid-cols-1 sm:grid-cols-3 gap-x-6";
    if (activeTab === "included") {
      const selectedVibe = vibes.find(v => v.id === selectedBoatId) || null;
      const highlightCards = (selectedVibe?.included ?? []).map(i => ({ svg: i.icon_svg, title: i.name, desc: i.description || "" }));
      const chipItems = (selectedVibe?.includes ?? []).map(i => ({ svg: i.icon_svg, label: i.name }));
      const cols = highlightCards.length <= 2 ? "grid-cols-2" : highlightCards.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";
      return (
        <div className="space-y-5">
          <div className={cn("grid gap-3", cols)}>
            {highlightCards.map((card) => (
              <div key={card.title} className="flex flex-col items-center text-center rounded-2xl border border-primary-200/50 bg-primary-50/50 px-3 py-4 transition-all hover:bg-primary-50/70">
                {card.svg && (
                  <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                    <span className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: card.svg }} />
                  </div>
                )}
                <div className="text-sm font-semibold text-secondary-900">{card.title}</div>
                {card.desc && <div className="mt-0.5 text-xs leading-normal text-secondary-500">{card.desc}</div>}
              </div>
            ))}
          </div>
          {chipItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chipItems.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary-200/50 bg-primary-50/50 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-secondary-700">
                  {item.svg && <span className="h-4 w-4 shrink-0 text-primary-600 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: item.svg }} />}
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (activeTab === "pickup") return (
      <div>
        <div className="flex flex-col sm:flex-row gap-5">
          <img src="https://bluuu.tours/storage/app/media/driver.webp" alt="Bluuu transfer" className="h-40 w-full sm:w-48 shrink-0 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-white">Private transfer</h4>
              {transfers?.length > 0 && (
                <Button onClick={() => setPickupModalOpen(true)} data-cta="primary"
                  className="hidden sm:inline-flex h-10 gap-2 shadow-none" style={{ boxShadow: "none" }}>
                  <Car className="h-4 w-4" />
                  Book transfer
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm text-white/50 leading-relaxed">Dedicated car for your group. After booking, we confirm the exact pickup time on WhatsApp.</p>
            <p className="mt-1 text-sm text-primary-400"><span>Optional: upgrade to minivan for 6+ guests.</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Canggu/Berawa", "Batu Belig", "Seminyak", "Legian/Kuta"].map((area) => (
                <span key={area} className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary-200/50 bg-primary-50/50 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-secondary-700">
                  <MapPin className="h-4 w-4 shrink-0 text-primary-400" strokeWidth={1.5} />
                  {area}
                </span>
              ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/90 whitespace-nowrap"><Anchor className="h-3.5 w-3.5 shrink-0 text-primary-400" strokeWidth={1.5} /><strong>Meeting point:</strong> Serangan Harbor (Bluuu lounge)</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 flex items-center px-[20px]">
              <div className="h-px w-full border-t border-dashed border-primary-200" />
            </div>
            <div className="relative flex items-start">
              {[
                "Book your tour\nonline",
                "Receive WhatsApp confirmation",
                "Private car picks you up",
                "Arrive at Serangan Harbor lounge",
              ].map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-200/50 bg-primary-50/50 text-sm font-bold text-primary-700">{i + 1}</span>
                  <span className="text-xs font-medium text-center leading-tight text-white/60 max-w-[120px] whitespace-pre-line">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {transfers?.length > 0 && (
          <div className="mt-5 flex justify-end sm:hidden">
            <Button onClick={() => setPickupModalOpen(true)} data-cta="primary"
              className="shadow-none" style={{ boxShadow: "none" }}>
              <Car className="h-4 w-4" />
              Book transfer
            </Button>
          </div>
        )}
        <Modal open={pickupModalOpen} onClose={() => { setPickupModalOpen(false); setTransferDetailsPopup(null); }} maxWidth="max-w-2xl" showClose hideDragHandle
          title="Transfer" bodyClassName="px-6 pb-6 pt-3"
          footer={
            <div className="space-y-3">
              <div className="text-sm text-secondary-500">
                Selected: <b className="text-secondary-900">{selectedTransferId ? (transfers?.find(tr => String(tr.id) === String(selectedTransferId))?.name || "—") : "Make my own way"}</b>
              </div>
              <Button className="h-12 w-full text-sm !font-black" onClick={() => { if (selectedTransferId === null) onSelectTransferId?.(""); setPickupModalOpen(false); setTransferDetailsPopup(null); }}>
                Confirm
              </Button>
            </div>
          }>
          <div className="space-y-2.5">
            <button type="button" onClick={() => onSelectTransferId?.("")}
              className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all", !selectedTransferId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
              <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", !selectedTransferId ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                {!selectedTransferId && <Check className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-secondary-900">Make my own way</div>
                <div className="text-xs text-secondary-500 mt-0.5">I'll get to Serangan Harbor myself</div>
              </div>
              <span className="text-base font-semibold text-emerald-600 shrink-0">Free</span>
            </button>
            {transfers?.map((t) => {
              const isSel = String(selectedTransferId) === String(t.id);
              return (
                <div key={t.id} role="button" tabIndex={0} onClick={() => onSelectTransferId?.(t.id)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer", isSel ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", isSel ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                    {isSel && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-secondary-900">{t.name}</div>
                    <div className="text-xs text-secondary-500 mt-0.5">{t.name?.toLowerCase().includes("drop") ? "Door-to-door, both ways" : "Door-to-door pickup to the harbor"}</div>
                    {(t.description || t.short_description) && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setTransferDetailsPopup({ title: t.name, description: t.description || t.short_description, image: t.image || null }); }}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100">
                        <Info className="h-3.5 w-3.5" />
                        See full description
                      </button>
                    )}
                  </div>
                  <span className={cn("text-base font-semibold shrink-0", !t.price || t.price === 0 ? "text-emerald-600" : "text-primary-700")}>{!t.price || t.price === 0 ? "Free" : formatPrice(t.price)}</span>
                </div>
              );
            })}
          </div>
          {selectedTransferId && (() => {
            const selT = transfers?.find(tr => String(tr.id) === String(selectedTransferId));
            const isShuttle = selT?.name?.toLowerCase().includes("shuttle") || selT?.name?.toLowerCase().includes("free");
            if (isShuttle) return null;
            const hasDropoff = selT?.name?.toLowerCase().includes("drop");
            return (
              <div className="mt-4 space-y-3">
                {!skipPickupAddress && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Pickup address</label>
                      <AddressAutocomplete
                        value={pickupAddress || ""}
                        onChange={(val) => {
                          onSetPickupAddress?.(val);
                          if (samePickupDropoff && onSetDropoffAddress) onSetDropoffAddress(val);
                        }}
                        placeholder="Enter your hotel or villa address"
                        className="mt-1 w-full h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>
                    {hasDropoff && !samePickupDropoff && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Dropoff address</label>
                        <AddressAutocomplete
                          value={dropoffAddress || ""}
                          onChange={(val) => onSetDropoffAddress?.(val)}
                          placeholder="Enter your dropoff address"
                          className="mt-1 w-full h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                      </div>
                    )}
                    {showPickupMap && (
                      <div className="overflow-hidden rounded-2xl border border-neutral-200">
                        <iframe
                          title="Pick location on map"
                          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d126000!2d115.2!3d-8.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid"
                          className="w-full h-56 sm:h-64 border-0"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-2 text-xs text-secondary-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>
                          Click the map to pick a point, or drag the marker
                        </div>
                      </div>
                    )}
                    {hasDropoff && (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={samePickupDropoff}
                          onChange={(e) => {
                            setSamePickupDropoff(e.target.checked);
                            if (e.target.checked && onSetDropoffAddress) onSetDropoffAddress(pickupAddress || "");
                          }}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600" />
                        <span className="text-xs text-secondary-400">Same address for pickup and dropoff</span>
                      </label>
                    )}
                  </>
                )}
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={skipPickupAddress}
                    onChange={(e) => {
                      setSkipPickupAddress(e.target.checked);
                      if (e.target.checked) {
                        onSetPickupAddress?.("");
                        onSetDropoffAddress?.("");
                      }
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600" />
                  <span className="text-xs text-secondary-400">Skip for now — add address in your account later</span>
                </label>
              </div>
            );
          })()}
        </Modal>
        {transferDetailsPopup && createPortal(
          <div className="fixed inset-0 z-[10001] flex items-center justify-center px-6" onClick={() => setTransferDetailsPopup(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setTransferDetailsPopup(null)}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/80 backdrop-blur-sm text-secondary-500 hover:bg-neutral-100 transition"
                aria-label="Close">
                <X className="h-4 w-4" />
              </button>
              {transferDetailsPopup.image && (
                <img src={transferDetailsPopup.image} alt={transferDetailsPopup.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-5 space-y-2.5">
                <h4 className="text-base font-bold text-secondary-900">{transferDetailsPopup.title}</h4>
                {transferDetailsPopup.description && (
                  <div className="text-sm text-secondary-600 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5" dangerouslySetInnerHTML={{ __html: transferDetailsPopup.description }} />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
    if (activeTab === "safety") return (
      <div className={gridFor(TOUR_SAFETY_ITEMS.length)}>
        {TOUR_SAFETY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={row}>
              <div className={iconBlue}><Icon className="h-4 w-4" strokeWidth={1.5} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white/90">{item.label}</div>
                <div className="text-xs leading-normal text-white/40">{item.helper}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
    if (activeTab === "cancellation") return (
      <div className={gridFor(cancellationSummaryCards.length)}>
        {cancellationSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={row}>
              <div className={cn(iconBlue, card.accentClassName)}>
                <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", card.iconClassName)} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white/90">{card.title}</div>
                <div className="text-xs leading-normal text-white/40">{card.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
    if (activeTab === "faq") return (
      <div className={grid}>
        {bookingMiniFAQData.map((it) => {
          const Icon = ICON_MAP[it.icon];
          return (
            <div key={it.q} className={row}>
              <div className={iconBlue}><Icon className="h-4 w-4" strokeWidth={1.5} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-semibold text-white/90">{it.q}</div>
                <div className="text-xs sm:text-sm leading-relaxed text-white/40">{it.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
    if (activeTab === "weather") {
      const weatherItems = [...weatherGuaranteeCards, { icon: AlertTriangle, title: "Port Authority", text: "Final go/no-go decision is based on Port Authority guidance and captain safety checks on the tour morning." }];
      return (
        <div className={gridFor(weatherItems.length)}>
          {weatherItems.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={row}>
                <div className={iconBlue}><Icon className="h-4 w-4" strokeWidth={1.5} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-white/90">{card.title}</div>
                  <div className="text-xs leading-normal text-white/40">{card.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  }, [cancellationSummaryCards, weatherGuaranteeCards, includedExtras, selectedExtras, onExtraQtyChange, openIncludedCategories, pickupModalOpen, showPickupMap, skipPickupAddress, samePickupDropoff, transfers, selectedTransferId, onSelectTransferId, pickupAddress, onSetPickupAddress, dropoffAddress, onSetDropoffAddress, formatPrice]);

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
      backgroundClassName={SECTION_BACKGROUNDS.lagoon}
      kicker=""
      size="none"
      className="py-4 sm:py-8"
    >
      <div ref={stepRef} className="pb-8 sm:pb-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h3 id="route-heading" className="text-xl sm:text-3xl font-semibold tracking-tight text-secondary-900">Choose your route</h3>
            <p className="mt-1 text-sm sm:text-base text-secondary-500">Select one route to continue. You can still customize extras next.</p>
          </div>
          {!showAllStyles && styles.length > 1 && (
            <div className="hidden sm:flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={!canScrollRouteLeft}
                onClick={() => {
                  const track = carouselRef.current;
                  if (!track) return;
                  const card = track.querySelector("[data-route-card]");
                  const step = card ? card.getBoundingClientRect().width + 16 : 300;
                  track.scrollBy({ left: -step, behavior: "smooth" });
                }}
                className={cn("inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition",
                  canScrollRouteLeft ? "text-secondary-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-secondary-900" : "text-neutral-300 cursor-not-allowed opacity-50"
                )}
                aria-label="Previous"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={!canScrollRouteRight}
                onClick={() => {
                  const track = carouselRef.current;
                  if (!track) return;
                  const card = track.querySelector("[data-route-card]");
                  const step = card ? card.getBoundingClientRect().width + 16 : 300;
                  track.scrollBy({ left: step, behavior: "smooth" });
                }}
                className={cn("inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition",
                  canScrollRouteRight ? "text-secondary-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-secondary-900" : "text-neutral-300 cursor-not-allowed opacity-50"
                )}
                aria-label="Next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {showRoutesSkeleton ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: routeSkeletonCount }, (_, i) => (
              <SkeletonCard key={`route-skel-${i}`} />
            ))}
          </div>
        ) : styles.length ? (
          <>
            <div className={cn(!showAllStyles && "sm:-my-4 sm:py-4 sm:overflow-y-visible")}>
              <div
                ref={carouselRef}
                className={cn(
                  "no-scrollbar flex overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  !showAllStyles ? "snap-x snap-mandatory -mx-4 sm:mx-0 sm:gap-4 sm:pb-4" : "sm:grid sm:gap-4 sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-3 flex flex-col overflow-visible gap-4"
                )}
              >
              {styles.map((style) => {
                const isSelected = String(style.id) === String(selectedStyleId) || style.slug === selectedStyleId;
                const images = styleImages[style.id] || styleImages[style.slug] || [];
                const activeIndex = activeSlideByStyleId[style.id] ?? activeSlideByStyleId[style.slug] ?? 0;
                const styleId = style.slug || String(style.id);
                const routeRestaurant = getRouteRestaurantDetails(style);
                const addOnBadge = style.badge || styleId === "dive-highlights" || styleId === "watersport-day" || styleId === "classic-route";
                const hiddenChips = {
                  "classic-route": ["lunch included"],
                  "watersport-day": ["banana boat"],
                };
                const hidden = (hiddenChips[styleId] || []).map(s => s.toLowerCase());
                const chips = (style.highlights?.length >= 2
                  ? style.highlights.filter(h => !hidden.includes(h.label?.toLowerCase()))
                  : [
                    { label: "Comfort pace", icon: Clock },
                    { label: "Photo moments", icon: Camera },
                  ]);
                return (
                  <div
                    key={style.id}
                    data-route-card
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white text-left transition-all duration-300 sm:min-h-470 sm:mx-0 sm:first:ml-0 sm:last:mr-0",
                      !showAllStyles ? "w-[86vw] shrink-0 snap-center snap-always sm:w-[calc((100%-32px)/3)] sm:snap-start mx-1.5 first:ml-4 last:mr-4" : "w-full sm:w-auto",
                      "hover:border-primary-300 hover:shadow-md",
                      isSelected && "border-primary-500 border-2 bg-white shadow-md z-10"
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
                          <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/50 backdrop-blur-[1px]" />
                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                              <Check className="h-6 w-6 text-white" strokeWidth={3} />
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-sm font-black text-white tracking-wide">Your pick</span>
                              <span className="text-xs text-white/60">Tap to change date</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4 pt-4">
                      {/* Title row */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-xl font-semibold text-secondary-900 leading-tight line-clamp-1">{style.title}</div>
                        {addOnBadge ? (
                          <div className="group/tooltip relative ml-auto flex shrink-0 items-center">
                            <span className="inline-flex cursor-help items-center rounded-full border border-primary-200 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                              {typeof addOnBadge === 'string' ? addOnBadge : "Add-on"}
                            </span>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100 z-50">
                              <div className="rounded-2xl bg-secondary-900 px-3 py-2.5 text-xs font-medium leading-relaxed text-white shadow-xl">
                                This route is built around add-ons — we'll suggest extras in the next steps.
                                <div className="absolute -bottom-1 right-4 h-3 w-3 rotate-45 rounded-sm bg-secondary-900"></div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Description */}
                      <div className="mt-1.5 text-sm leading-relaxed text-secondary-500">
                        <span className="line-clamp-2">{style.description}</span>
                        {" "}<button type="button" onClick={(e) => { e.stopPropagation(); setRouteModalStyle(style); }} className="inline text-primary-600 font-semibold hover:text-primary-700 transition-colors">See&nbsp;more&nbsp;→</button>
                      </div>

                      {/* Highlights grid */}
                      <div className="mt-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3">
                        <div className="grid grid-cols-1 gap-y-2 sm:gap-y-2.5">
                          {chips.map((item) => {
                            const Icon = typeof item.icon === 'string' ? ICON_MAP[item.icon] || MapPin : (item.icon || MapPin);
                            return (
                              <div key={item.label} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-secondary-700">
                                {item.icon_svg
                                  ? <span className="h-3.5 w-3.5 shrink-0 text-primary-500 sm:h-4 sm:w-4 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: item.icon_svg }} />
                                  : <Icon className="h-3.5 w-3.5 shrink-0 text-primary-500 sm:h-4 sm:w-4" />}
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {style.best_for || style.bestFor ? (
                        <div className="mt-2 flex items-start gap-2 text-sm font-semibold leading-5 text-secondary-600">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{style.best_for || style.bestFor}</span>
                        </div>
                      ) : null}

                      {/* Button */}
                      <div className="mt-auto pt-4">
                        <div className="flex items-center justify-end">
                          {isSelected ? (
                            <div className="inline-flex h-11 px-6 items-center justify-center gap-2 rounded-full bg-[#2563eb] text-sm font-bold text-white">
                              <Check className="h-4 w-4" />Selected
                            </div>
                          ) : !hasDateCriteria ? (
                            <button
                              type="button"
                              className="h-11 rounded-full px-6 border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-400 transition hover:bg-neutral-200"
                              onClick={(event) => {
                                event.stopPropagation();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                setTimeout(() => onFocusStepOne?.(), 800);
                              }}
                            >
                              Pick a date first
                            </button>
                          ) : !selectedBoatId ? (
                            <button
                              type="button"
                              className="h-11 rounded-full px-6 border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-400 transition hover:bg-neutral-200"
                              onClick={(event) => {
                                event.stopPropagation();
                                const title = document.getElementById("hero-title");
                                if (title) {
                                  const navHeight = document.querySelector("nav")?.offsetHeight || 0;
                                  const titleBottom = title.getBoundingClientRect().bottom + window.scrollY;
                                  const isMobileView = window.innerWidth < 640;
                                  window.scrollTo({ top: titleBottom - (isMobileView ? navHeight : 0), behavior: "smooth" });
                                }
                              }}
                            >
                              Pick a boat first
                            </button>
                          ) : (
                            <Button
                              type="button"
                              variant="primary"
                              className="h-11 rounded-full px-6"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectionError(false);
                                onSelectStyleId(style.id || style.slug);
                              }}
                            >
                              Select
                            </Button>
                          )}
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
            </div>
{null}
            {!showAllStyles && (
              <div className="mt-3 sm:mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllStyles(true)}
                  className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:rounded-full sm:border sm:border-neutral-200 sm:bg-white sm:px-5 sm:py-2 sm:text-secondary-600 sm:shadow-sm sm:hover:border-neutral-300 sm:hover:text-secondary-800"
                >
                  View all
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
            {showAllStyles && (
              <div className="mt-3 sm:mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllStyles(false);
                    setHasSwiped(false);
                    setTimeout(() => {
                      const heading = document.getElementById("route-heading");
                      if (heading) {
                        const navHeight = document.querySelector("nav")?.offsetHeight || 0;
                        const headingTop = heading.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({ top: headingTop - navHeight - 24, behavior: "smooth" });
                      }
                    }, 50);
                  }}
                  className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:rounded-full sm:border sm:border-neutral-200 sm:bg-white sm:px-5 sm:py-2 sm:text-secondary-600 sm:shadow-sm sm:hover:border-neutral-300 sm:hover:text-secondary-800"
                >
                  <ChevronUp className="h-4 w-4" />
                  Collapse
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-secondary-500">
            Routes are temporarily unavailable for the selected filters. Try another date or check again soon.
          </div>
        )}
      </div>
      {selectedStyleId && scheduleByStyleId[selectedStyleId] ? (
        <div className="mt-2 sm:mt-4 -mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)] bg-primary-50/40 py-6 sm:py-10" id="tour-details-section">
          {(() => {
            const schedule = scheduleByStyleId[selectedStyleId];
            const style = styles.find(s => String(s.id) === String(selectedStyleId) || s.slug === selectedStyleId);
            const note = addOnNoteByStyleId[selectedStyleId];
            const currentIdx = styles.findIndex(s => String(s.id) === String(selectedStyleId) || s.slug === selectedStyleId);
            const prevStyle = styles.length > 1 ? styles[(currentIdx - 1 + styles.length) % styles.length] : null;
            const nextStyle = styles.length > 1 ? styles[(currentIdx + 1) % styles.length] : null;
            return (
              <TourDetailsCard
                withTimeline
                hideTierBadges
                sectionTitle={style?.title || "Private Tour"}
                style={style}
                schedule={schedule}
                note={note}
                restaurant={selectedRestaurantData || style?.restaurant}
                onRestaurantClick={setRestaurantDataPopup}
                onAnotherRoute={() => document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                onContinue={onContinue}
                continueLabel="Choose your boat"
                capacityLabel={capacityLabel}
                infoContent={infoContent}
                prevLabel={prevStyle?.title}
                nextLabel={nextStyle?.title}
                onPrev={prevStyle ? () => {
                  onSelectStyleId(prevStyle.id || prevStyle.slug);
                  setTimeout(() => document.getElementById("tour-details-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
                } : undefined}
                onNext={nextStyle ? () => {
                  onSelectStyleId(nextStyle.id || nextStyle.slug);
                  setTimeout(() => document.getElementById("tour-details-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
                } : undefined}
                reserveLabel={`Add Extras for ${style?.title || "Tour"}`}
                onReserve={() => {
                  onShowExtras?.();
                }}
                priceDisplay={priceDisplay}
                dateDisplay={dateDisplay}
                guestsDisplay={guestsDisplay}
                extrasCatalog={extrasCatalog}
                allExtrasCatalog={allExtrasCatalog.length ? allExtrasCatalog : extrasCatalog}
                selectedExtras={selectedExtras}
                onChangeExtraQty={onExtraQtyChange}
                formatPrice={formatPrice}
                onOpenExtra={onOpenExtra}
                totalGuests={totalGuests}
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

      {/* ── Route Detail Modal ── */}
      <Modal
        isOpen={!!routeModalStyle}
        onClose={() => { setRouteModalStyle(null); setRouteModalRestaurant(null); }}
        maxWidth="max-w-3xl"
        bodyClassName="p-0"
        showClose={false}
        hideDragHandle
      >
        {routeModalStyle && (() => {
          const style = routeModalStyle;
          const photos = style.photos?.length ? style.photos : [];
          const schedule = scheduleByStyleId[style.id] || scheduleByStyleId[style.slug] || null;
          const scheduleItems = schedule ? [...(schedule.beforeLunch || []), ...(schedule.afterLunch || [])] : [];
          const rest = routeModalRestaurant || style.restaurant;
          const restPhotos = rest?.images_with_thumbs?.length
            ? rest.images_with_thumbs.map(img => ({ thumb: img.thumb, path: img.thumb }))
            : rest?.image ? [{ thumb: rest.image, path: rest.image }] : [];
          const chips = style.highlights?.filter(h => h.label) || [];
          const imgSrc = (s) => s?.thumb || s?.path || s;
          const openGallery = (startIndex) => {
            Fancybox.show(photos.map(img => ({ src: img?.path || img?.thumb || img, type: "image" })), { startIndex: startIndex || 0 });
          };

          return (
            <div className="relative">
              {/* Sticky close */}
              <div className="sticky top-0 z-20 pointer-events-none h-0">
                <button type="button" onClick={() => { setRouteModalStyle(null); setRouteModalRestaurant(null); }}
                  className="pointer-events-auto absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/60 bg-white/90 backdrop-blur-sm shadow-sm text-secondary-500 transition-all hover:bg-white hover:text-secondary-900 sm:right-4 sm:top-4"
                  aria-label="Close"><X className="h-4.5 w-4.5" /></button>
              </div>

              {/* Photo mosaic desktop */}
              {photos.length > 0 && (<>
                <div className={cn("hidden sm:grid gap-1.5 p-6 pb-0", photos.length > 1 ? "grid-cols-[3fr_2fr]" : "grid-cols-1")}>
                  <button type="button" onClick={() => openGallery(0)} className="relative overflow-hidden rounded-2xl group/img cursor-pointer">
                    <img src={imgSrc(photos[0])} alt={style.title} className="h-full w-full object-cover aspect-[4/3] transition-transform duration-500 group-hover/img:scale-[1.03]" loading="eager" />
                  </button>
                  {photos.length > 1 && (
                    <div className="grid grid-rows-2 gap-1.5">
                      {photos.slice(1, 3).map((p, i) => (
                        <button key={i} type="button" onClick={() => openGallery(i + 1)} className="relative overflow-hidden rounded-2xl group/img cursor-pointer">
                          <img src={imgSrc(p)} alt="" className="h-full w-full object-cover aspect-[3/2] transition-transform duration-500 group-hover/img:scale-[1.03]" loading="lazy" />
                          {i === 1 && photos.length > 3 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                              <span className="flex items-center gap-1.5 text-sm font-semibold text-white"><Maximize className="h-4 w-4" />+{photos.length - 3} photos</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Mobile carousel */}
                <div className="sm:hidden">
                  <PhotoCarousel className="aspect-[4/3]" images={photos} alt={style.title} alwaysShowControls maximizeLeft onOpenGallery={openGallery} />
                </div>
              </>)}

              {/* Title */}
              <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-0">
                <h2 className="text-xl sm:text-2xl font-black text-secondary-900 leading-tight">{style.popup_title || style.title}</h2>
                {style.description && <p className="mt-1.5 text-sm text-secondary-500 leading-relaxed">{style.description}</p>}
                {style.best_for && <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-secondary-600"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{style.best_for}</p>}
              </div>

              <div className="px-5 sm:px-6 py-6 space-y-8">
                {/* Highlights */}
                {chips.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-3">What's included</h3>
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip) => {
                        const Icon = typeof chip.icon === "string" ? ICON_MAP[chip.icon] || MapPin : (chip.icon || MapPin);
                        return (
                          <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-transparent px-3 py-1.5 text-xs font-medium text-secondary-700">
                            {chip.icon_svg
                              ? <span className="h-3.5 w-3.5 text-primary-600 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: chip.icon_svg }} />
                              : <Icon className="h-3.5 w-3.5 text-primary-600" strokeWidth={1.5} />}
                            {chip.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {scheduleItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-4">Your day on the water</h3>
                    <div className="relative pl-10 space-y-0">
                      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-primary-300 via-primary-200 to-primary-100" />
                      {scheduleItems.map((item, i) => {
                        const Icon = resolveScheduleIcon(item.title);
                        const detailsRaw = sanitizeDisplayText(item.details, { stripTrailingOne: true });
                        return (
                          <div key={i} className="relative flex gap-3 pb-6 last:pb-0">
                            <div className="absolute -left-10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 border-2 border-primary-400 z-10">
                              <Icon className="h-4 w-4 text-primary-600" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold tabular-nums text-primary-600">{item.time ? item.time.replace(/\./g, ":") : ""}</span>
                                <span className="text-sm font-semibold text-secondary-900">{item.title}</span>
                              </div>
                              {detailsRaw && <p className="mt-0.5 text-xs text-secondary-500 leading-relaxed">{detailsRaw}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Restaurant */}
                {rest && rest.name && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-3">Lunch included</h3>
                    <div className="rounded-2xl border border-neutral-200/60 overflow-hidden">
                      {restPhotos.length > 0 && (
                        <PhotoCarousel className="aspect-[16/9] sm:aspect-[21/9]" images={restPhotos} alt={rest.name} alwaysShowControls
                          onOpenGallery={(i) => { Fancybox.show(restPhotos.map(img => ({ src: img.path || img.thumb, type: "image" })), { startIndex: i || 0 }); }} />
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <UtensilsCrossed className="h-4 w-4 text-primary-500" />
                          <span className="text-base font-bold text-secondary-900">{rest.name}</span>
                        </div>
                        {rest.description && <p className="text-sm text-secondary-500 leading-relaxed">{sanitizeDisplayText(rest.description, { stripTrailingOne: true })}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
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
  const [showTransferMap, setShowTransferMap] = useState(false);

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
        const isLargeGroup = totalGuests > 5;
        const unitPrice = (isLargeGroup && transfer.bus_price)
          ? Number(transfer.bus_price)
          : Number(transfer.price || 0);
        const isSelected = String(selectedTransferId) === String(transfer.id);
        const finalName = transfer.name;
        const transferName = String(transfer.name || "").toLowerCase();
        const isPickupDropoffTransfer = /pick[\s-]?up|drop[\s-]?off/.test(transferName);
        const transferCapacityHint = isPickupDropoffTransfer
          ? (isLargeGroup
            ? "6+ guests: minivan price is applied. Up to 5 guests use car price."
            : "Up to 5 guests: car price. For 6+ guests, minivan price is applied.")
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
                      {formatIDR(unitPrice)}
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
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
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
                {!skipAddress && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Pickup address</label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={pickupAddress}
                          onChange={(e) => handlePickupChange(e.target.value)}
                          placeholder="Enter your hotel or villa address"
                          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none"
                        />
                        <button type="button" onClick={() => setShowTransferMap(!showTransferMap)}
                          className={cn("shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border transition", showTransferMap ? "border-primary-400 bg-primary-50 text-primary-600" : "border-neutral-200 bg-white text-secondary-400 hover:border-neutral-300 hover:text-secondary-600")}
                          title="Show map">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                        </button>
                      </div>
                    </div>
                    {needsDropoff && !sameAddress && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Dropoff address</label>
                        <div className="mt-1 flex gap-2">
                          <input
                            type="text"
                            value={dropoffAddress}
                            onChange={(e) => onSetDropoffAddress && onSetDropoffAddress(e.target.value)}
                            placeholder="Enter your dropoff address"
                            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none"
                          />
                          <button type="button" onClick={() => setShowTransferMap(!showTransferMap)}
                            className={cn("shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border transition", showTransferMap ? "border-primary-400 bg-primary-50 text-primary-600" : "border-neutral-200 bg-white text-secondary-400 hover:border-neutral-300 hover:text-secondary-600")}
                            title="Show map">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {showTransferMap && (
                      <div className="overflow-hidden rounded-xl border border-neutral-200">
                        <iframe
                          title="Pick location on map"
                          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d126000!2d115.2!3d-8.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid"
                          className="w-full h-48 sm:h-56 border-0"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-2 text-xs text-secondary-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>
                          Click the map to pick a point, or drag the marker
                        </div>
                      </div>
                    )}
                    {needsDropoff && (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sameAddress}
                          onChange={(e) => handleSameAddressChange(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600"
                        />
                        <span className="text-xs text-secondary-400">Same address for pickup and dropoff</span>
                      </label>
                    )}
                  </>
                )}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={skipAddress}
                    onChange={(e) => handleSkipAddressChange(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600"
                  />
                  <span className="text-xs text-secondary-400">Skip for now — add address in your account later</span>
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  const content = (
    <div className="flex flex-col gap-4">
      <div className={cn(framed && "overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur-md")}>
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
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] hover:bg-primary-700 transition-all"
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
      kicker=""
      backgroundClassName={SECTION_BACKGROUNDS.mist}
    >
      {content}
    </Section>
  );
}
function StepExtras({
  showExtrasSection = false,
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
  isBirthday = false,
  onBirthdayChange,
}) {
  const { categories, privateRoutes } = useExtras();
  const contacts = useSiteContacts();
  const setIsBirthday = onBirthdayChange || (() => {});
  const styleKeyById = {
    "classic-route": "classic",
    "family-first": "family_easygoing",
    "celebration-day": "celebration",
    "dive-highlights": "manta_first",
    "watersport-day": "snorkel_focused",
    "chill-relax": "relaxed_scenic",
  };
  const STYLE_RECOMMENDATIONS = {
    classic: ["Photographer", "GoPro rental", "Private transfer", "Snack box", "Extra towels", "Wetsuit"],
    relaxed_scenic: ["Photographer", "Pro photographer", "Floating breakfast", "Champagne setup", "GoPro rental", "Extra towels"],
    family_easygoing: ["Photographer", "GoPro rental", "Snack box", "Extra towels", "Private transfer"],
    celebration: ["Pro photographer", "Champagne setup", "Decorations", "Photographer", "Drone", "Floating breakfast"],
    manta_first: ["Wetsuit", "GoPro rental", "Underwater photo", "Extra snorkel guide", "Photographer"],
    snorkel_focused: ["GoPro rental", "Wetsuit", "Photographer", "Extra snorkel guide", "Snack box"],
  };
  const getExtraByName = (name) => {
    const exact = extrasCatalog.find((extra) => extra.name === name);
    if (exact) return exact;
    return extrasCatalog.find((extra) => extra.name.toLowerCase() === name.toLowerCase()) || null;
  };
  const recommendedExtras = useMemo(() => {
    const key = selectedStyleId ? (styleKeyById[selectedStyleId] || "classic") : "classic";
    const list = STYLE_RECOMMENDATIONS[key] || STYLE_RECOMMENDATIONS.classic;
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
  const [extrasFilter, setExtrasFilter] = useState(null);
  const [extrasVisibleCount, setExtrasVisibleCount] = useState(3);
  const [activeExtraId, setActiveExtraId] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.id) setActiveExtraId(e.detail.id);
    };
    window.addEventListener("open-extra-popup", handler);
    return () => window.removeEventListener("open-extra-popup", handler);
  }, []);
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
    const isLargeGroup = totalGuests > 5;
    const price = (isLargeGroup && transfer.bus_price) ? Number(transfer.bus_price) : Number(transfer.price || 0);
    return {
      id: `transfer-${transfer.id}`,
      kind: "transfer",
      name: transfer.name,
      price,
      pricingType: "per_booking",
      quantity: 1,
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
  const transferSummary = selectedTransferItem?.name || (selectedTransferId === "" ? "Make my own way" : "Not selected");
  const insuranceSummary = selectedCoverItem?.name || (selectedCoverId === "" ? "No coverage" : "Not selected");
  const transferCoverSummary = [
    selectedTransferItem ? `Transfer: ${selectedTransferItem.name}` : (selectedTransferId === "" ? "Transfer: Make my own way" : "Transfer: not selected"),
    selectedCoverItem ? `Insurance: ${selectedCoverItem.name}` : (selectedCoverId === "" ? "Insurance: No coverage" : "Insurance: not selected"),
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
    const isAutoQty = extra.qtyType === 'per_car' || extra.per_car || extra.qtyType === 'per_person' || extra.qtyType === 'fixed';
    const autoQty = (extra.qtyType === 'per_car' || extra.per_car)
      ? (Math.ceil(totalGuests / 5) || 1)
      : extra.qtyType === 'per_person'
        ? (totalGuests || 1)
        : 1;
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
          ) : isAutoQty ? (
            qty > 0 ? (
              <div className="flex items-center gap-2 sm:w-full sm:justify-end">
                <div className="inline-flex h-9 w-full items-center justify-between rounded-full border border-neutral-200 bg-white px-2 text-secondary-900 shadow-sm sm:h-10 sm:px-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeExtraQty(extra.id, 0);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full text-secondary-700 transition-colors hover:text-primary-600 active:scale-90 sm:h-8 sm:w-8"
                    aria-label={`Remove ${extra.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="min-w-6 text-center text-base font-bold leading-none text-secondary-900 sm:min-w-7 sm:text-lg">
                    ×{autoQty}
                  </div>
                  <div className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeExtraQty(extra.id, autoQty);
                }}
                className="inline-flex h-9 w-full items-center justify-center rounded-full border border-primary-50 bg-neutral-100 px-2.5 text-sm font-bold text-primary-600 transition duration-200 ease-out hover:bg-white active:scale-95 sm:h-10 sm:px-3"
              >
                Add
              </button>
            )
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

  const [showAllExtras, setShowAllExtras] = useState(false);
  const extrasCarouselRef = useRef(null);
  const [extrasActiveDot, setExtrasActiveDot] = useState(0);
  const [canScrollExtrasLeft, setCanScrollExtrasLeft] = useState(false);
  const [canScrollExtrasRight, setCanScrollExtrasRight] = useState(true);
  const updateExtrasScroll = useCallback(() => {
    const el = extrasCarouselRef.current;
    if (!el) return;
    setCanScrollExtrasLeft(el.scrollLeft > 1);
    setCanScrollExtrasRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    const card = el.querySelector("[data-extra-card]");
    if (card) {
      const cardW = card.offsetWidth + 12;
      setExtrasActiveDot(Math.floor(el.scrollLeft / (cardW * 2)));
    }
  }, []);
  useEffect(() => {
    const el = extrasCarouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateExtrasScroll, { passive: true });
    updateExtrasScroll();
    return () => el.removeEventListener("scroll", updateExtrasScroll);
  }, [updateExtrasScroll, filteredExtras]);

  const EXTRAS_CATEGORY_PILLS = useMemo(() => {
    const pills = [];
    extraCategories.forEach(cat => {
      if (cat.id === "all") return;
      const hasExtras = combinedExtras.some(e => (e.category || extraCategoryById[e.id]) === cat.id || e.categoryIds?.includes(cat.id));
      if (hasExtras) pills.push({ id: cat.id, label: cat.show_name || cat.label });
    });
    return pills;
  }, [extraCategories, combinedExtras, extraCategoryById]);

  // Auto-select first pill when pills load and no filter set
  const activeFilter = extrasFilter || (EXTRAS_CATEGORY_PILLS[0]?.id ?? "all");
  const extrasForDisplay = useMemo(() => {
    if (activeFilter === "all") return combinedExtras;
    return combinedExtras.filter(extra => {
      const catId = extra.category || extraCategoryById[extra.id] || "comfort";
      return catId === activeFilter || extra.categoryIds?.includes(activeFilter);
    });
  }, [activeFilter, combinedExtras, extraCategoryById]);

  const renderExtraCard = (extra) => {
    const qty = selectedExtras[extra.id] || 0;
    const hasChildSelected = extra.hasChildren && extra.children?.some(c => (selectedExtras[c.id] || 0) > 0);
    const isSelected = qty > 0 || hasChildSelected;
    const imgSrc = extra.images_with_thumbs?.[0]?.thumb || extra.image || extraImageById[extra.id] || extraImageById[extra.name?.toLowerCase().replace(/\s+/g, "-")] || extraFallbackImage;
    const totalQty = extra.hasChildren
      ? extra.children?.reduce((sum, c) => sum + (selectedExtras[c.id] || 0), 0) || 0
      : qty;
    const totalPrice = extra.hasChildren
      ? extra.children?.reduce((sum, c) => sum + (selectedExtras[c.id] || 0) * Number(c.price || 0), 0) || 0
      : qty * Number(extra.price || 0);
    return (
      <div key={extra.id} className={cn(
        "group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border bg-white transition-all duration-200 h-full",
        "hover:shadow-md",
        isSelected ? "border-primary-500 border-2 shadow-md" : "border-neutral-200 hover:border-neutral-300"
      )}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-b-xl">
          <img src={imgSrc} alt={extra.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          {isSelected && (
            <>
              <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/40 backdrop-blur-[1px]" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.6)]">
                  <Check className="h-5 w-5 text-white" strokeWidth={3} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-secondary-900 truncate">{extra.name}</h4>
            {/* Mobile: price under title */}
            <div className="mt-0.5 sm:hidden">
              {isSelected ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm text-secondary-400">×{totalQty}</span>
                  <span className="text-sm font-black text-secondary-900 tracking-tight ml-1">{totalPrice > 0 ? formatIDR(totalPrice) : "Free"}</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-0.5">
                  {extra.hasChildren ? (
                    <span className="text-sm text-secondary-400">from <span className="text-sm font-black text-secondary-900">{formatIDR(Math.min(...extra.children.map(c => Number(c.price || 0))))}</span></span>
                  ) : (
                    <span className="text-sm font-black text-secondary-900 tracking-tight">{Number(extra.price || 0) > 0 ? formatIDR(extra.price) : "Free"}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Desktop: price + button inline */}
          {isSelected ? (
            <div className="mt-1.5 hidden sm:flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm text-secondary-400">×{totalQty}</span>
                <span className="text-base font-black text-secondary-900 tracking-tight ml-1">{totalPrice > 0 ? formatIDR(totalPrice) : "Free"}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveExtraId(extra.id); }}
                className="shrink-0 h-9 px-4 rounded-full text-sm font-bold transition border border-[#2563eb]/50 bg-[#2563eb]/10 text-[#2563eb]"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="mt-1.5 hidden sm:flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-0.5">
                {extra.hasChildren ? (
                  <span className="text-sm text-secondary-400">from <span className="text-base font-black text-secondary-900">{formatIDR(Math.min(...extra.children.map(c => Number(c.price || 0))))}</span></span>
                ) : (
                  <span className="text-base font-black text-secondary-900 tracking-tight">{Number(extra.price || 0) > 0 ? formatIDR(extra.price) : "Free"}</span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveExtraId(extra.id); }}
                className="shrink-0 h-9 px-4 rounded-full text-sm font-semibold transition bg-primary-600 text-white hover:bg-primary-700"
              >
                Add
              </button>
            </div>
          )}
          {/* Mobile: pill button at bottom */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveExtraId(extra.id); }}
            className={cn(
              "mt-2 w-full h-8 rounded-full text-xs font-semibold transition sm:hidden",
              isSelected
                ? "border border-primary-200 bg-primary-50 text-primary-600"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            {isSelected ? "Edit" : "Add"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Step: Extras carousel */}
      {showExtrasSection && selectedStyleId && (
      <Section
        id={sectionId}
        backgroundClassName={SECTION_BACKGROUNDS.mist}
        size="none"
        className="py-8 sm:py-8"
      >
        <div className="pb-0">
          {/* Header + pills */}
          <div className="mb-6 sm:mb-6 space-y-4 sm:space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-3xl font-semibold tracking-tight text-secondary-900">Choose extras for {selectedStyleTitle}</h3>
                <p className="mt-2 sm:mt-1 text-sm sm:text-base text-secondary-500">Optional — you can add extras anytime after booking.</p>
              </div>
              {!showAllExtras && extrasForDisplay.length > 2 && (
                <div className="hidden sm:flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={!canScrollExtrasLeft}
                    onClick={() => {
                      const track = extrasCarouselRef.current;
                      if (!track) return;
                      const card = track.querySelector("[data-extra-card]");
                      const step = card ? card.getBoundingClientRect().width + 12 : 300;
                      track.scrollBy({ left: -step, behavior: "smooth" });
                    }}
                    className={cn("inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition",
                      canScrollExtrasLeft ? "text-secondary-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-secondary-900" : "text-neutral-300 cursor-not-allowed opacity-50"
                    )}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!canScrollExtrasRight}
                    onClick={() => {
                      const track = extrasCarouselRef.current;
                      if (!track) return;
                      const card = track.querySelector("[data-extra-card]");
                      const step = card ? card.getBoundingClientRect().width + 12 : 300;
                      track.scrollBy({ left: step, behavior: "smooth" });
                    }}
                    className={cn("inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition",
                      canScrollExtrasRight ? "text-secondary-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-secondary-900" : "text-neutral-300 cursor-not-allowed opacity-50"
                    )}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="-mx-6 sm:mx-0">
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-6 pb-0.5 sm:px-0 sm:flex-wrap">
                  {EXTRAS_CATEGORY_PILLS.map((pill) => {
                    const isActive = activeFilter === pill.id;
                    const count = pill.id === "all" ? combinedExtras.length : (extrasFilterCounts[pill.id] ?? combinedExtras.filter(e => (e.category || extraCategoryById[e.id]) === pill.id || e.categoryIds?.includes(pill.id)).length);
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => { setExtrasFilter(pill.id); setShowAllExtras(false); }}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 sm:px-3.5 text-[13px] font-semibold sm:text-sm transition-all",
                          isActive
                            ? "border-primary-200 bg-primary-50 text-primary-600"
                            : "border-neutral-200 bg-white text-secondary-500 hover:border-neutral-300"
                        )}
                      >
                        {pill.label}
                        <span className={cn("text-[11px]", isActive ? "text-primary-500" : "text-secondary-400")}>({count})</span>
                      </button>
                    );
                  })}
                </div>
            </div>
          </div>

          {/* Birthday toggle — Celebration Day only */}
          {(selectedStyleId === "celebration-day" || (privateRoutes || []).find(s => String(s.id) === String(selectedStyleId))?.slug === "celebration-day") && (
            <button
              type="button"
              onClick={() => setIsBirthday(prev => !prev)}
              className={cn(
                "mb-5 flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all",
                isBirthday
                  ? "border-primary-500 bg-primary-50 shadow-sm"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                isBirthday ? "bg-primary-600" : "bg-neutral-100"
              )}>
                <PartyPopper className={cn("h-5 w-5", isBirthday ? "text-white" : "text-secondary-400")} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-secondary-900">It's a birthday!</div>
                <div className="text-xs text-secondary-500">Let us know so the crew can prepare a surprise</div>
              </div>
              <div className={cn(
                "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                isBirthday ? "bg-primary-600" : "bg-neutral-200"
              )}>
                <div className={cn(
                  "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  isBirthday ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
            </button>
          )}

          {/* Carousel / Grid */}
          <AnimatePresence mode="wait">
            {!showAllExtras ? (
              <motion.div
                key="extras-carousel"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div
                  ref={extrasCarouselRef}
                  className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scroll-pl-4 sm:scroll-pl-0 sm:mx-0"
                >
                  <div className="shrink-0 w-4 min-w-[16px] sm:hidden" aria-hidden="true" />
                  {extrasForDisplay.map((extra, i) => (
                    <motion.div
                      key={extra.id}
                      data-extra-card
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={cn("shrink-0 w-[calc((100vw-60px)/2)] sm:w-[calc((100%-36px)/4)]", i % 2 === 0 ? "snap-start" : "", "last:mr-4 sm:last:mr-0")}
                    >
                      {renderExtraCard(extra)}
                    </motion.div>
                  ))}
                </div>
                {/* Mobile dots */}
                {extrasForDisplay.length > 2 && isMobile && (
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {Array.from({ length: Math.ceil(extrasForDisplay.length / 2) }, (_, i) => (
                      <div key={i} className={cn("h-1.5 rounded-full transition-all", extrasActiveDot === i ? "bg-secondary-900 w-3" : "bg-secondary-300 w-1.5")} />
                    ))}
                  </div>
                )}
                {/* View all button — only if more than 4 items in current filter */}
                {extrasForDisplay.length > 4 && (
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllExtras(true)}
                      className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:rounded-full sm:border sm:border-neutral-200 sm:bg-white sm:px-5 sm:py-2 sm:text-secondary-600 sm:shadow-sm sm:hover:border-neutral-300 sm:hover:text-secondary-800"
                    >
                      View all ({extrasForDisplay.length})
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="extras-grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {extrasForDisplay.map((extra, i) => (
                    <motion.div
                      key={extra.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      {renderExtraCard(extra)}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllExtras(false);
                      setTimeout(() => {
                        const target = document.getElementById(sectionId);
                        if (target) {
                          const navHeight = document.querySelector("nav")?.offsetHeight || 0;
                          const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:rounded-full sm:border sm:border-neutral-200 sm:bg-white sm:px-5 sm:py-2 sm:text-secondary-600 sm:shadow-sm sm:hover:border-neutral-300 sm:hover:text-secondary-800"
                  >
                    <ChevronUp className="h-4 w-4" />
                    Collapse
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected summary */}
          {extrasSummaryList.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsManageExtrasOpen?.(true)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50/60 px-4 py-3 transition hover:bg-primary-50 hover:border-primary-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex flex-1 items-center justify-between min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-sm font-bold text-secondary-900">{extrasSummaryList.length} add-ons</span>
                    <span className="text-sm font-bold text-primary-600">{formatIDR(extrasSubtotal)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                    Edit
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
        <div className="h-8 sm:h-0" />
      </Section>
      )}

      {showExtrasSection && selectedStyleId && onReview && (
        <Section
          id="step-6"
          backgroundClassName={SECTION_BACKGROUNDS.lagoon}
          size="none"
          className="py-2 sm:py-4"
        >
          <div className="pb-2 sm:pb-4 flex justify-center">
            <button type="button" onClick={onReview}
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] hover:bg-primary-700 transition-all">
              Review your booking <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </Section>
      )}
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
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
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
        totalGuests={totalGuests}
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
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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
  transfers,
  selectedTransferId,
  onSelectTransferId,
  covers,
  selectedCoverId,
  onSelectCoverId,
  totalGuests,
  pickupAddress,
  onSetPickupAddress,
  dropoffAddress,
  onSetDropoffAddress,
}) {
  const [activeEditor, setActiveEditor] = useState(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const [transferDetailsPopup2, setTransferDetailsPopup2] = useState(null);
  const [showReviewMap, setShowReviewMap] = useState(false);
  const [skipReviewAddress, setSkipReviewAddress] = useState(false);
  const [sameReviewAddress, setSameReviewAddress] = useState(false);
  const contacts = useSiteContacts();
  const isDateSelected = dateLabel && dateLabel !== "Date not selected";
  const isBoatSelected = Boolean(selectedBoat);
  const extrasCount = selectedExtrasSummary?.reduce((sum, extra) => sum + (extra.quantity || 0), 0) || 0;
  const extrasPreview = selectedExtrasSummary?.slice(0, 3) ?? [];
  const hasMoreExtras = (selectedExtrasSummary?.length ?? 0) > extrasPreview.length;
  const selectedTransferItem = transfers?.find(t => String(t.id) === String(selectedTransferId));
  const selectedCoverItem = covers?.find(c => String(c.id) === String(selectedCoverId));
  const transferSummary = selectedTransferItem?.name || (selectedTransferId === "" ? "Make my own way" : "Not selected");
  const insuranceSummary = selectedCoverItem?.name || (selectedCoverId === "" ? "No coverage" : "Not selected");
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
  const isTransferSelected = selectedTransferId !== null;
  const isProtectionSelected = selectedCoverId !== null;
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
  ];
  const handleRowClick = (row) => {
    if (row.id === "date" || row.id === "guests") {
      window.dispatchEvent(new CustomEvent("expand-sticky-bar"));
      return;
    }
    closeEditor();
    row.onClick?.();
  };
  const [isReserving, setIsReserving] = useState(false);
  const handleReserve = () => {
    if (!isReserveEnabled || isReserving) return;
    window.dispatchEvent(new CustomEvent("collapse-sticky-bar"));
    setIsReserving(true);
    onReserve?.();
    setTimeout(() => setIsReserving(false), 1000);
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
        <div className="mt-6 grid gap-6 lg:gap-8 lg:grid-cols-asymmetric-base min-w-0">
          <div className="flex flex-col gap-4 min-w-0">
            <div className={`${CARD.radius} ${CARD.border} ${CARD.bg} ${CARD.shadow}`}>
              <div className="px-4 pt-4 pb-0 sm:px-5 sm:pt-5 sm:pb-0">
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
                            "flex w-full items-center gap-4 py-4 text-left transition",
                            isMuted && "opacity-55"
                          )}
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold text-secondary-900">{row.label}</div>
                            <div className={cn("mt-0.5 text-sm", valueTone)}>{row.value}</div>
                          </div>
                          <span className="text-sm font-semibold text-primary-600 shrink-0">{row.action}</span>
                        </button>
                      </div>
                    );
                  })}
                  {/* Extras — inline in the list */}
                  <div>
                    <button type="button" onClick={() => setActiveEditor(activeEditor === "extras" ? null : "extras")}
                      className="flex w-full items-center gap-4 py-4 text-left transition"
                      aria-expanded={activeEditor === "extras"}>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                        <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-secondary-900">Extras{extrasCount > 0 ? ` (${extrasCount})` : ""}</div>
                        <div className="mt-0.5 text-sm text-secondary-500 truncate">
                          {selectedExtrasSummary?.length
                            ? selectedExtrasSummary.map(e => e.name).join(", ")
                            : "No extras selected"}
                        </div>
                      </div>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-500">
                        {activeEditor === "extras" ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {activeEditor === "extras" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="overflow-hidden">
                          <div className="pb-4 pl-16">
                            {selectedExtrasSummary?.length ? (
                              <div className="space-y-1">
                                {selectedExtrasSummary.map((extra) => (
                                  <div key={extra.id} className="flex items-center gap-3 rounded-lg py-2 pr-1">
                                    <span className="flex-1 min-w-0 text-sm text-secondary-500 font-medium truncate">{extra.name} <span className="text-secondary-900">×{extra.quantity}</span></span>
                                    <span className="text-sm font-bold text-secondary-900 shrink-0">{extra.price * extra.quantity > 0 ? formatIDR(extra.price * extra.quantity) : "Free"}</span>
                                    <button
                                      type="button"
                                      onClick={() => onChangeExtraQty(extra.id, 0)}
                                      className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-300 hover:border-red-200 hover:text-red-400 transition"
                                      aria-label={`Remove ${extra.name}`}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-secondary-500">No extras selected.</div>
                            )}
                            <button
                              type="button"
                              onClick={() => onOpenManageExtras?.()}
                              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <Plus className="h-4 w-4" /> Add Extras
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </div>

            {/* Transfer — separate card */}
            <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent("collapse-sticky-bar")); setIsTransferOpen(true); }}
              className={cn("flex w-full items-center gap-3.5 border bg-white p-4 text-left transition-all", CARD.radius, selectedTransferId !== null ? `border-primary-200 ${CARD.shadow}` : "border-neutral-200")}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                <Car className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-primary-600">Transfer</div>
                <div className="mt-0.5 text-base font-semibold text-secondary-900">{transferSummary}</div>
                <div className={cn("mt-0.5 text-sm font-semibold", selectedTransferItem ? (Number(selectedTransferItem.price || 0) === 0 ? "text-emerald-600" : "text-primary-700") : (selectedTransferId === "" ? "text-emerald-600" : "text-secondary-400"))}>
                  {selectedTransferItem ? (Number(selectedTransferItem.price || 0) === 0 ? "Free" : formatIDR(selectedTransferItem.price)) : (selectedTransferId === "" ? "Free" : "—")}
                </div>
              </div>
              <span className="text-sm font-semibold text-primary-600 shrink-0">{selectedTransferId !== null ? "Edit" : "Select"}</span>
            </button>

            {/* Insurance — separate card */}
            <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent("collapse-sticky-bar")); setIsInsuranceOpen(true); }}
              className={cn("flex w-full items-center gap-3.5 border bg-white p-4 text-left transition-all", CARD.radius, selectedCoverId !== null ? `border-primary-200 ${CARD.shadow}` : "border-neutral-200")}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-primary-600">Trip Protection</div>
                <div className="mt-0.5 text-base font-semibold text-secondary-900">{insuranceSummary}</div>
                <div className={cn("mt-0.5 text-sm font-semibold", selectedCoverItem ? (Number(selectedCoverItem.price || 0) === 0 ? "text-emerald-600" : "text-primary-700") : (selectedCoverId === "" ? "text-emerald-600" : "text-secondary-400"))}>
                  {selectedCoverItem ? (Number(selectedCoverItem.price || 0) === 0 ? "Free" : formatIDR(selectedCoverItem.price) + (selectedCoverItem.per_boat ? " / boat" : " / person")) : (selectedCoverId === "" ? "Free" : "—")}
                </div>
              </div>
              <span className="text-sm font-semibold text-primary-600 shrink-0">{selectedCoverId !== null ? "Edit" : "Select"}</span>
            </button>

            {/* Transfer Modal */}
            <Modal open={isTransferOpen} onClose={() => setIsTransferOpen(false)} maxWidth="max-w-2xl" showClose hideDragHandle
              title="Transfer" bodyClassName="px-6 pb-6 pt-3"
              footer={
                <div className="space-y-3">
                  <div className="text-sm text-secondary-500">
                    Selected: <b className="text-secondary-900">{selectedTransferId ? (transfers?.find(tr => String(tr.id) === String(selectedTransferId))?.name || "—") : "Make my own way"}</b>
                  </div>
                  <Button className="h-12 w-full text-sm !font-black" onClick={() => { if (selectedTransferId === null) onSelectTransferId?.(""); setIsTransferOpen(false); }}>
                    Confirm
                  </Button>
                </div>
              }>
              <div className="space-y-2.5">
                <button type="button" onClick={() => onSelectTransferId?.("")}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all", !selectedTransferId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", !selectedTransferId ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                    {!selectedTransferId && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-secondary-900">Make my own way</div>
                    <div className="text-xs text-secondary-500 mt-0.5">I'll get to Serangan Harbor myself</div>
                  </div>
                  <span className="text-base font-semibold text-emerald-600 shrink-0">Free</span>
                </button>
                {transfers?.map((t) => {
                  const isSel = String(selectedTransferId) === String(t.id);
                  return (
                    <div key={t.id} role="button" tabIndex={0} onClick={() => onSelectTransferId?.(t.id)}
                      className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer", isSel ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", isSel ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                        {isSel && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-secondary-900">{t.name}</div>
                        <div className="text-xs text-secondary-500 mt-0.5">{t.name?.toLowerCase().includes("drop") ? "Door-to-door, both ways" : "Door-to-door pickup to the harbor"}</div>
                        {(t.description || t.short_description) && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); setTransferDetailsPopup2({ title: t.name, description: t.description || t.short_description, image: t.image || null }); }}
                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100">
                            <Info className="h-3.5 w-3.5" />
                            See full description
                          </button>
                        )}
                      </div>
                      <span className={cn("text-base font-semibold shrink-0", !t.price || t.price === 0 ? "text-emerald-600" : "text-primary-700")}>{!t.price || t.price === 0 ? "Free" : formatIDR(t.price)}</span>
                    </div>
                  );
                })}
              </div>
              {selectedTransferId && (() => {
                const selT = transfers?.find(tr => String(tr.id) === String(selectedTransferId));
                const isShuttle = selT?.name?.toLowerCase().includes("shuttle") || selT?.name?.toLowerCase().includes("free");
                if (isShuttle) return null;
                const hasDropoff = selT?.name?.toLowerCase().includes("drop");
                return (
                  <div className="mt-4 space-y-3">
                    {!skipReviewAddress && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Pickup address</label>
                          <AddressAutocomplete
                            value={pickupAddress || ""}
                            onChange={(val) => {
                              onSetPickupAddress?.(val);
                              if (sameReviewAddress && onSetDropoffAddress) onSetDropoffAddress(val);
                            }}
                            placeholder="Enter your hotel or villa address"
                            className="mt-1 w-full h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                          />
                        </div>
                        {hasDropoff && !sameReviewAddress && (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Dropoff address</label>
                            <AddressAutocomplete
                              value={dropoffAddress || ""}
                              onChange={(val) => onSetDropoffAddress?.(val)}
                              placeholder="Enter your dropoff address"
                              className="mt-1 w-full h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                            />
                          </div>
                        )}
                        {showReviewMap && (
                          <div className="overflow-hidden rounded-2xl border border-neutral-200">
                            <iframe
                              title="Pick location on map"
                              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d126000!2d115.2!3d-8.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid"
                              className="w-full h-56 sm:h-64 border-0"
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                            <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-2 text-xs text-secondary-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/></svg>
                              Click the map to pick a point, or drag the marker
                            </div>
                          </div>
                        )}
                        {hasDropoff && (
                          <label className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={sameReviewAddress}
                              onChange={(e) => {
                                setSameReviewAddress(e.target.checked);
                                if (e.target.checked && onSetDropoffAddress) onSetDropoffAddress(pickupAddress || "");
                              }}
                              className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600" />
                            <span className="text-xs text-secondary-400">Same address for pickup and dropoff</span>
                          </label>
                        )}
                      </>
                    )}
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={skipReviewAddress}
                        onChange={(e) => {
                          setSkipReviewAddress(e.target.checked);
                          if (e.target.checked) {
                            onSetPickupAddress?.("");
                            onSetDropoffAddress?.("");
                          }
                        }}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600" />
                      <span className="text-xs text-secondary-400">Skip for now — add address in your account later</span>
                    </label>
                  </div>
                );
              })()}
            </Modal>

            {/* Insurance Modal */}
            <Modal open={isInsuranceOpen} onClose={() => setIsInsuranceOpen(false)} maxWidth="max-w-2xl" showClose hideDragHandle
              title="Trip protection" bodyClassName="px-6 pb-6 pt-3">
              <div className="space-y-2.5">
                <button type="button" onClick={() => onSelectCoverId?.("")}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all", !selectedCoverId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", !selectedCoverId ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                    {!selectedCoverId && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-secondary-900">No coverage</div>
                    <div className="text-xs text-secondary-500 mt-0.5">I have my own insurance</div>
                  </div>
                  <span className="text-base font-semibold text-emerald-600 shrink-0">Free</span>
                </button>
                {covers?.map((c) => {
                  const isSel = String(selectedCoverId) === String(c.id);
                  return (
                    <div key={c.id} role="button" tabIndex={0} onClick={() => onSelectCoverId?.(c.id)}
                      className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer", isSel ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", isSel ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                        {isSel && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-secondary-900">{c.name}</div>
                        <div className="text-xs text-secondary-500 mt-0.5 line-clamp-2">{c.description ? c.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim() : "Trip protection coverage"}</div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className={cn("text-sm font-semibold", !c.price || c.price === 0 ? "text-emerald-600" : "text-primary-700")}>
                            {!c.price || c.price === 0 ? "Free" : <>{formatIDR(c.price)} <span className="text-xs text-secondary-400 font-normal">/ {c.per_boat ? "boat" : "person"}</span></>}
                          </span>
                        </div>
                        {c.description && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); setTransferDetailsPopup2({ title: c.name, description: c.description, image: c.image || "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg" }); }}
                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100">
                            <Info className="h-3.5 w-3.5" />
                            See full description
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Button className="h-12 w-full text-sm !font-black" onClick={() => { if (selectedCoverId === null) onSelectCoverId?.(""); setIsInsuranceOpen(false); }}>
                  Confirm
                </Button>
              </div>
            </Modal>
            {/* Details modal — photo header, scrollable content */}
            <Modal open={!!transferDetailsPopup2} onClose={() => setTransferDetailsPopup2(null)} maxWidth="max-w-lg" showClose={false} hideDragHandle bodyClassName="p-0">
              {transferDetailsPopup2 && (
                <>
                  <div className="relative sticky top-0 z-10">
                    {transferDetailsPopup2.image ? (
                      <img src={transferDetailsPopup2.image} alt={transferDetailsPopup2.title} className="w-full aspect-[16/10] object-cover" />
                    ) : (
                      <div className="w-full aspect-[16/10] bg-neutral-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4">
                      <h3 className="text-xl font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{transferDetailsPopup2.title}</h3>
                    </div>
                    <button type="button" onClick={() => setTransferDetailsPopup2(null)}
                      className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white transition hover:bg-black/50"
                      aria-label="Close">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="px-5 pt-4 pb-6">
                    {transferDetailsPopup2.description && (
                      <div className="text-sm text-secondary-600 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5" dangerouslySetInnerHTML={{ __html: transferDetailsPopup2.description }} />
                    )}
                  </div>
                </>
              )}
            </Modal>
          </div>
          <div className="sticky top-6 self-start space-y-3">
          <div className={`${CARD.radius} ${CARD.border} ${CARD.bg} ${CARD.shadow} px-4 pt-4 pb-6 sm:px-5 sm:pt-5 sm:pb-8 flex flex-col`}>
            <div className="text-lg font-semibold text-secondary-900">Price summary</div>
            <div className="mt-[46px] space-y-3 text-sm text-secondary-600">
              <div className="flex items-center justify-between">
                <span>Boat base price</span>
                <span className="text-base font-semibold text-secondary-900">{formatIDR(basePrice)}</span>
              </div>
              {guestFeeTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span>Guest fee ({groupSize} guests)</span>
                  <span className="text-base font-semibold text-secondary-900">{formatIDR(guestFeeTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Extras</span>
                <span className="text-base font-semibold text-secondary-900">{formatIDR(extrasSubtotalIDR)}</span>
              </div>
              <div className="h-px w-full bg-neutral-200 my-2" />
              <div className="flex items-center justify-between text-base font-semibold text-secondary-900">
                <span>Total</span>
                <span className="text-xl font-black text-primary-500">{formatIDR(basePrice + guestFeeTotal + extrasSubtotalIDR)}</span>
              </div>
            </div>
            <div className="mt-7 space-y-4">
              <Button type="button" onClick={handleReserve} size="md" className="w-full" disabled={!isReserveEnabled || isReserving}>
                {isReserving ? "Processing..." : reserveLabel}
              </Button>
              <div className="text-center text-sm text-secondary-500">
                {isReserveEnabled ? "Secure checkout · " + (selectedBoat?.isPartner ? "On Request" : "Instant confirmation") : ""}
              </div>
            </div>
            <div className="mt-auto pt-6 space-y-4">
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
                  </div>
                </div>
              </div>
              <div className="p-2">
                <p className="text-sm text-secondary-600"><b className="text-secondary-900">Not sure about the date?</b><br />Reserve now and change it up to 24h before the tour.</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => onOpenTourInfo?.("cancellation", "review")} className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors">
                  <Shield className="h-3.5 w-3.5" /> Cancellation 24 hours
                </button>
                <button type="button" onClick={() => onOpenTourInfo?.("weather", "review")} className="inline-flex items-center gap-1 text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors">
                  <CloudRain className="h-3.5 w-3.5" /> Weather Guarantee
                </button>
              </div>
            </div>
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
                  <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card sm:p-7">
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
  const reviewSources = [];
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
  const featuredReviews = [];
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
    <span className={cn("flex items-center justify-center rounded-2xl bg-white ring-1 ring-neutral-200", sizeClassName)}>
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
        "inline-flex h-9 items-center gap-2 rounded-2xl border border-transparent bg-neutral-100 px-3 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-200 hover:text-secondary-900 group",
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
    <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-sm font-semibold text-secondary-600">
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
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
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
                        className="rounded-2xl border border-neutral-200 bg-white px-3 py-1 font-semibold shadow-card"
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
                      className="group relative min-w-72pct snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card sm:min-w-65"
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
                    className="min-w-82pct snap-start rounded-2xl border border-neutral-200 bg-white p-4 shadow-card sm:min-w-80 lg:min-w-340"
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
                        className="mt-3 block overflow-hidden rounded-2xl border border-neutral-200 bg-white"
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
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
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
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white sm:w-80">
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
                      className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
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
            <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
              <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-500" />
              Starter
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Chicken Taco</div>
              <div className="mt-1 text-secondary-600">
                Slice of taco, salad, fried chicken in Spanish flour, spicy mix, avocado
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-2xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
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
            <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
              <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-600" />
              Maincourse
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Korean Fried Chicken Burger</div>
              <div className="mt-1 text-secondary-600">
                Spicy mix, cilantro, cucumber pickle, French fries
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-2xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
              or
            </div>
            <div className="mt-3">
              <div className="font-semibold text-secondary-900">Autentic Padthai</div>
              <div className="mt-1 text-secondary-600">
                Vegetarian style Pad Thai, tofu, local peanut and tamarind glaze
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-2xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
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
            <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
              <Coffee className="h-3.5 w-3.5 text-secondary-600" />
              Free flow
            </div>
            <div className="mt-2 text-secondary-600">Mineral water or ice tea</div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600">
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
          "group flex h-full w-75 min-w-75 snap-start flex-col rounded-2xl border bg-white p-5 text-left shadow-card transition-transform",
          "sm:w-65 sm:min-w-65 sm:p-4",
          "hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card",
          isSelected ? "border-neutral-300 ring-1 ring-border-soft" : "border-neutral-200"
        )}
        aria-pressed={isSelected}
      >
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200">
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
            <div className="absolute right-3 top-3 rounded-2xl bg-white/90 backdrop-blur-md px-3 py-1 text-sm font-semibold text-secondary-600 shadow-card">
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
            className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-2xl bg-white shadow-card"
          >
            <span
              className={cn(
                "h-3.5 w-3.5 rounded-2xl border-2",
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
            <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-secondary-600" />
              {yacht.people} people
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-1 whitespace-nowrap">
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
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600 shadow-card">
          Select your dates in Step 1 to unlock availability.
        </div>
      ) : null}
      {hasDateCriteria && !availableYachts.length ? (
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600 shadow-card">
          No boats available for this group size and date selection.
        </div>
      ) : null}
      <div style={{ marginLeft: -16, marginRight: -16 }} className="sm:mx-0">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4"
          style={{ paddingLeft: 16, paddingRight: 16, scrollPaddingLeft: 16 }}
        >
          {availableYachts.map((yacht) => renderCard(yacht))}
        </div>
      </div>
      {selectedYacht ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-secondary-600 shadow-card">
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
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:hidden">
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
              <div className="hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:block">
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
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
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
                        "rounded-2xl border px-3 py-1 transition",
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
                            "rounded-2xl border px-3 py-1 text-sm font-semibold transition",
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
const SCHEDULE_ICON_MAP = {
  Coffee, Ship, Waves, Car, Wine, Sparkles, Star, MapPin, Camera, Fish,
  Clock, Anchor, Compass, Users, Sun, UtensilsCrossed, Check, Info, Shield,
};

function buildGroupsFromRoute(before = [], after = []) {
  const toItem = (raw) => {
    if (raw.type === "or-chip") return { type: "or-chip" };
    return {
      time: raw.time || "",
      duration: raw.duration || "",
      title: raw.title || "",
      icon: SCHEDULE_ICON_MAP[raw.icon] || Ship,
      text: raw.details || raw.text || "",
      info: raw.info || undefined,
      badges: raw.badges
        ? (typeof raw.badges === "string"
            ? raw.badges.split(",").map((b) => b.trim()).filter(Boolean)
            : Array.isArray(raw.badges) ? raw.badges.map((b) => (typeof b === "object" ? b.value : b)).filter(Boolean) : [])
        : undefined,
      images: raw.images
        ? (typeof raw.images === "string"
            ? raw.images.split("\n").map((u) => u.trim()).filter(Boolean)
            : Array.isArray(raw.images) ? raw.images.filter(Boolean) : [])
        : undefined,
      isAddon: !!raw.is_addon,
      extraId: raw.extra_id ? Number(raw.extra_id) : undefined,
      tint: "from-neutral-100 to-white",
      iconTone: "text-secondary-600 bg-neutral-50",
    };
  };

  const groups = [];
  if (before.length > 0) {
    groups.push({ label: "Morning", range: "", items: before.map(toItem) });
  }
  if (after.length > 0) {
    // Split after-lunch by or-chip and regular items into Afternoon + Sunset groups
    // or just put all into Afternoon
    groups.push({ label: "Afternoon", range: "", items: after.map(toItem) });
  }
  return groups;
}

function DayPlan({ route, onHighlightExtra } = {}) {
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
  const HARDCODED_GROUPS = [
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
  const groups = useMemo(() => {
    const before = route?.schedule_before_lunch;
    const after = route?.schedule_after_lunch;
    if ((before?.length || 0) + (after?.length || 0) > 0) {
      return buildGroupsFromRoute(before || [], after || []);
    }
    return HARDCODED_GROUPS;
  }, [route]);
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
                    className="relative w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-card"
                  >
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-secondary-900">{g.label}</div>
                        <div className="hidden items-center gap-1.5 sm:flex">
                          {(compactIcons[g.label] ?? []).map((Icon, idx) => (
                            <span
                              key={`${g.label}-icon-${idx}`}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm text-secondary-500"
                            >
                              <Icon className="h-3 w-3" />
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-sm font-semibold text-secondary-600">
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
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-sm font-semibold text-secondary-600"
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
                      <div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-2.5 py-0.5 text-sm font-semibold text-secondary-600">
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
                            className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-card"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 text-secondary-600">
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
                            <div className="flex shrink-0 flex-col gap-1.5">
                              {s.images ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInfoItem(s);
                                    setInfoPhoto(0);
                                    setDetailsOpen(false);
                                  }}
                                  className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-secondary-600 transition hover:border-neutral-300"
                                >
                                  More info
                                </button>
                              ) : null}
                              {s.isAddon && s.extraId && onHighlightExtra ? (
                                <button
                                  type="button"
                                  onClick={() => onHighlightExtra(s.extraId)}
                                  className="rounded-2xl border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
                                >
                                  + Add
                                </button>
                              ) : null}
                            </div>
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
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:hidden">
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
                          className="rounded-2xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:block">
              <div className="text-sm font-semibold text-secondary-900">Details</div>
              {infoItem.info ? <p className="mt-2 text-sm leading-6 text-secondary-600">{infoItem.info}</p> : null}
              {infoItem.badges ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {infoItem.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-2xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
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
      <Card className="rounded-2xl p-6 sm:p-8">
        <div className={showAll ? "hidden" : "block"}>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card sm:p-6">
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
                className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card"
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
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Plus</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {extras.map((x) => (
                <span
                  key={x}
                  className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                >
                  <Check className="h-3.5 w-3.5 text-secondary-600" />
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:mt-6 sm:grid-cols-2">
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
          <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-secondary-900">Transfer options</div>
              <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Add at checkout</div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {options.map((option) => (
                <div
                  key={option.title}
                  className="rounded-2xl"
                >
                  <div className="h-full rounded-2xl border border-neutral-200 bg-neutral-100 p-5 shadow-card">
                    {option.tag ? (
                      <span className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold text-secondary-600">
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
            <div className="mt-5 rounded-2xl border border-neutral-200 p-4 text-sm text-secondary-600">
              Add transfer on the next step after choosing your date and yacht. We will confirm route and timing by WhatsApp.
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="h-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
            <div className="text-sm font-semibold text-secondary-900">Why travelers choose private transfer</div>
            <div className="mt-3 grid gap-2">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="flex items-start gap-2.5 rounded-2xl border border-neutral-200 bg-white px-2.5 py-2"
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="text-sm font-semibold text-secondary-900">Core protections</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {coreItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-card"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-secondary-600 shadow-card">
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
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
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
                <div key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-secondary-600">
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
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            Safety-first operations with continuous SOP updates and mandatory quarterly guide training.
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            Emergency procedures include pre-departure briefings, evacuation protocols, and incident reporting.
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
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
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            Insurance Provider: PT Jasa Raharja Putera insurance company.
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            Coverage: Up to IDR 200 million per passenger.
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
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
            <div key={item} className="rounded-2xl border border-neutral-200 bg-white p-3">
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
            <div key={item} className="rounded-2xl border border-neutral-200 bg-white p-3">
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
            <div key={idx} className="rounded-2xl border border-neutral-200 bg-white p-3">
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
  const cardBase = "p-6 rounded-2xl";
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
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-2xl bg-primary-50 blur-3xl" />
                  <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-2xl bg-primary-50 blur-3xl" />
                </>
              ) : null}
              {isPrivate ? (
                <>
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-2xl bg-primary-50 blur-3xl" />
                  <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-2xl bg-primary-50 blur-3xl" />
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
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="text-sm font-semibold text-secondary-900">Premium Private vs Standard Private (another operator)</div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2">
          <div className="min-w-80pct snap-start rounded-2xl border border-neutral-200 bg-white p-4 sm:min-w-0">
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
          <div className="min-w-80pct snap-start rounded-2xl border border-neutral-200 bg-white p-4 sm:min-w-0">
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
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
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
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-r from-primary-50 via-white to-primary-100 p-8 shadow-card animate-gradient-flow">
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
              <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-secondary-600">
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
          <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-secondary-600">
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
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, []);
  const { selectedCurrency } = useCurrency();
  const { privateTours, privateTransfers: transfers, privateCovers: allCovers } = useTours();
  const { extras, privateRoutes } = useExtras();
  const covers = allCovers || [];
  // State Declarations
  const [selectedBoatId, setSelectedBoatId] = useState(null);
  const [dateMode, setDateMode] = useState("exact");
  const [exactDate, setExactDate] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("date")) return p.get("date");
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [boatAnimKey, setBoatAnimKey] = useState(0);
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
  // Confirmed search criteria — only updated when the user presses "Search",
  // so the boat list doesn't refetch/reorder on every date/guest edit.
  const [searchDateMode, setSearchDateMode] = useState(dateMode);
  const [searchExactDate, setSearchExactDate] = useState(exactDate);
  const [searchRangeStart, setSearchRangeStart] = useState(rangeStart);
  const [searchRangeEnd, setSearchRangeEnd] = useState(rangeEnd);
  const [searchAdults, setSearchAdults] = useState(adults);
  const [searchKids, setSearchKids] = useState(kids);
  const searchTotalGuests = searchAdults + searchKids;
  const searchHasDateCriteria = searchDateMode === "exact"
    ? !!searchExactDate
    : !!(searchRangeStart && searchRangeEnd);
  const commitSearch = useCallback(() => {
    setSearchDateMode(dateMode);
    setSearchExactDate(exactDate);
    setSearchRangeStart(rangeStart);
    setSearchRangeEnd(rangeEnd);
    setSearchAdults(adults);
    setSearchKids(kids);
  }, [dateMode, exactDate, rangeStart, rangeEnd, adults, kids]);
  const hasPendingSearchChanges =
    dateMode !== searchDateMode ||
    exactDate !== searchExactDate ||
    rangeStart !== searchRangeStart ||
    rangeEnd !== searchRangeEnd ||
    adults !== searchAdults ||
    kids !== searchKids;
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
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [calendarAvailMap, setCalendarAvailMap] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const dateParam = p.get("date");
    const d = dateParam ? new Date(dateParam + "T00:00:00") : new Date(Date.now() + 24 * 60 * 60 * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [tourDetails, setTourDetails] = useState(null);
  const [loadingTourDetails, setLoadingTourDetails] = useState(false);
  const [datePricing, setDatePricing] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [payMode, setPayMode] = useState("full");
  const [payMethod, setPayMethod] = useState("card");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedLiability, setAgreedLiability] = useState(false);
  const [supportChildren, setSupportChildren] = useState(false);
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
        included: Array.isArray(tour.included) ? tour.included : [],
        includes: Array.isArray(tour.includes) ? tour.includes : [],
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
  // Keep URL in sync with selections so reload / browser back / sharing restores
  // state (mirrors private.jsx). private1 boats are keyed by String(tour.id), so
  // selectedBoatId is already the tourId string the `tour` reader expects.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (exactDate) p.set("date", exactDate); else p.delete("date");
    p.set("adults", String(adults));
    p.set("kids", String(kids));
    if (selectedBoatId) p.set("tour", String(selectedBoatId)); else p.delete("tour");
    if (selectedStyleId) p.set("route", String(selectedStyleId)); else p.delete("route");
    if (selectedTransferId) p.set("transfer", String(selectedTransferId)); else p.delete("transfer");
    if (selectedCoverId) p.set("cover", String(selectedCoverId)); else p.delete("cover");
    history.replaceState(null, "", `?${p.toString()}`);
  }, [exactDate, adults, kids, selectedBoatId, selectedStyleId, selectedTransferId, selectedCoverId]);
  // Fetch availability from backend when user confirms a date or date range via Search
  useEffect(() => {
    if (!yachtOptions.some((y) => y.tourId)) return;
    const hasExact = searchDateMode === "exact" && searchExactDate;
    const hasRange = searchDateMode !== "exact" && searchRangeStart && searchRangeEnd;
    if (!hasExact && !hasRange) {
      setAvailabilityMap({});
      setIsAvailabilityLoading(false);
      return;
    }
    setIsAvailabilityLoading(true);
    const fetchAvailability = async () => {
      const results = {};
      const queryParams = hasExact
        ? `?date=${searchExactDate}`
        : `?start=${searchRangeStart}&end=${searchRangeEnd}`;
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
      } finally {
        setIsAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [yachtOptions, searchDateMode, searchExactDate, searchRangeStart, searchRangeEnd]);

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
  // Explicitly reset selected boat on mount as per user request — but NOT when a
  // ?tour= param is present, otherwise this clobbers the boat the URL just
  // pre-selected (this effect runs after the tour-read effect on mount).
  useEffect(() => {
    if (urlTourIdRef.current) return;
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
      qtyType: e.qty_type || "manual",
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
      included: y.included || [],
      includes: y.includes || [],
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
        const isLargeGroup = totalGuests > 5;
        const price = (isLargeGroup && transfer.bus_price) ? Number(transfer.bus_price) : Number(transfer.price || 0);
        sum += price;
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
      const capacityOk = searchTotalGuests <= yacht.people;
      let availableDates = [];
      // available = date availability only (not capacity)
      let dateAvailable = true;
      if (searchDateMode === "exact") {
        if (searchExactDate) {
          dateAvailable = isDateAvailable(yacht.id, searchExactDate);
        }
      } else if (searchRangeStart && searchRangeEnd) {
        availableDates = getAvailableDates(yacht.id, searchRangeStart, searchRangeEnd);
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
  }, [searchDateMode, searchExactDate, searchRangeStart, searchRangeEnd, searchTotalGuests, yachtOptions, isDateAvailable, getAvailableDates]);

  const totalPrice = mainBasePrice + guestFeeTotal + extrasSubtotalIDR;
  const partPrice = Math.round(totalPrice * 0.5);
  const donationAmount = Math.round(totalPrice * 0.01);
  const handleOpenCheckout = () => {
    const analyticsItem = buildTourAnalyticsItem({
      itemId: selectedYacht?.tourId ?? selectedYacht?.id,
      itemName: selectedYacht?.name || "Private Tour",
      itemCategory: "Private Tour",
      price: totalPrice,
    });
    trackAddToCart({ value: totalPrice, currency: "IDR", items: [analyticsItem] });
    trackBeginCheckout({ value: totalPrice, currency: "IDR", items: [analyticsItem] });
    trackPixelInitiateCheckout({
      contentIds: selectedYacht?.tourId ?? selectedYacht?.id,
      value: totalPrice,
      currency: "IDR",
      numItems: adults + kids,
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
      ...(isBirthday ? { is_birthday: "1" } : {}),
      ...(supportChildren ? { donationAmount: String(donationAmount) } : {}),
    });
    if (selectedExtrasSummary.length) {
      params.set("extras", JSON.stringify(selectedExtrasSummary.map(i => ({
        id: i.id,
        quantity: i.quantity,
        price: i.price ?? 0,
        name: i.name ?? "",
      }))));
    }
    const utmQs = getUtmQueryString();
    trackAddPaymentInfo({ value: totalPrice, currency: "IDR" });
    trackPixelAddPaymentInfo({ value: totalPrice, currency: "IDR" });
    window.location.href = `/payment?${params.toString()}${utmQs ? `&${utmQs}` : ""}`;
  };
  const availableYachts = useMemo(() => {
    const baseList = yachtOptions.filter((yacht) => searchTotalGuests <= yacht.people);
    if (!searchHasDateCriteria) return baseList;
    return baseList.filter((yacht) => boatAvailability[yacht.id]?.available);
  }, [boatAvailability, searchHasDateCriteria, searchTotalGuests]);
  const [tourInfoTab, setTourInfoTab] = useState("included");
  const [tourInfoContext, setTourInfoContext] = useState(null);
  const [isTourInfoOpen, setIsTourInfoOpen] = useState(false);
  const [isManageExtrasOpen, setIsManageExtrasOpen] = useState(false);
  const [showExtrasSection, setShowExtrasSection] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
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
    if (!searchHasDateCriteria) {
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
  }, [availableYachts, selectedBoatId, searchHasDateCriteria]);
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
  const contacts = useSiteContacts();
  const { activePolicyKey: globalPolicyKey, activePolicy: globalPolicy, closePolicy: closeGlobalPolicy } = usePolicyModal();
  return (
    <>
      <SEO
        title="Private Yacht Tour to Nusa Penida from Bali | Bluuu Tours"
        description="Exclusive private yacht tour from Bali to Nusa Penida — manta rays, snorkeling, cliff views & gourmet lunch. Up to 13 guests, fully crewed."
        image="https://bluuu.tours/storage/app/media/bluuu/private.webp"
        canonical="https://bluuu.tours/private-tour-to-nusa-penida"
        noindex
      />
      <CurrencyBridge />
      <div
        className="home2-wrapper min-h-screen text-secondary-900 bg-neutral-100"
      >
        <Navbar
          variant="fullbar"
          links={SITE_NAV_LINKS}
          cta={{ label: "Check availability", href: "#booking" }}
        />
        <Hero>
          <StepOne
            embedded
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
              setBoatAnimKey(k => k + 1);
              const title = document.getElementById("hero-title");
              if (title) {
                const navHeight = document.querySelector("nav")?.offsetHeight || 0;
                const titleBottom = title.getBoundingClientRect().bottom + window.scrollY;
                const isMobileView = window.innerWidth < 640;
                window.scrollTo({ top: titleBottom - (isMobileView ? navHeight : 0), behavior: "smooth" });
              }
            }}
            onConfirmSearch={commitSearch}
            hasPendingChanges={hasPendingSearchChanges}
            globalAvailabilityMap={globalAvailabilityMap}
          />
        </Hero>
        <div className="relative">
            <StepTwo
              dateMode={searchDateMode}
              exactDate={searchExactDate}
              rangeStart={searchRangeStart}
              rangeEnd={searchRangeEnd}
              groupSize={searchTotalGuests}
              adults={searchAdults}
              kids={searchKids}
              selectedBoatId={selectedBoatId}
              onSelectBoatId={(id) => {
                setSelectedBoatId(id);
                setBoatAnimKey(k => k + 1);
                setTimeout(() => {
                  const target = document.getElementById("step-2");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                  if (!searchHasDateCriteria) {
                    window.dispatchEvent(new CustomEvent("expand-sticky-bar"));
                  }
                }, 500);
              }}
              availabilityByBoat={boatAvailability}
              hasDateCriteria={searchHasDateCriteria}
              isAvailabilityLoading={isAvailabilityLoading}
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
              boatAnimKey={boatAnimKey}
            />
        </div>
        <StepThree
          selectedStyleId={selectedStyleId}
          hasDateCriteria={hasDateCriteria}
          selectedBoatId={selectedBoatId}
          onFocusStepOne={() => {
            const bar = document.getElementById("step1-bar");
            const barRect = bar?.getBoundingClientRect();
            const barVisible = barRect && barRect.top >= 0 && barRect.bottom <= window.innerHeight;
            if (barVisible && bar) {
              bar.classList.remove("bar-pulse", "bar-pulse-light");
              void bar.offsetWidth;
              const heroSection = document.getElementById("hero-section");
              const heroRect = heroSection?.getBoundingClientRect();
              const onDarkBg = heroRect && barRect.top >= heroRect.top && barRect.bottom <= heroRect.bottom;
              const cls = onDarkBg ? ["bar-pulse", "bar-pulse-light"] : ["bar-pulse"];
              cls.forEach(c => bar.classList.add(c));
              setTimeout(() => bar.classList.remove("bar-pulse", "bar-pulse-light"), 1600);
            } else {
              window.dispatchEvent(new CustomEvent("expand-sticky-bar"));
            }
          }}
          onSelectStyleId={(id) => {
            setSelectedStyleId(id);
            setTimeout(() => {
              const target = document.getElementById("tour-details-section");
              if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
          }}
          vibes={vibes}
          styles={privateRoutes}
          extrasCatalog={extrasCatalog}
          allExtrasCatalog={rawExtrasCatalog}
          totalGuests={totalGuests}
          priceDisplay={selectedYacht ? formatIDR((() => { const dateForPrice = dateMode === "exact" ? exactDate : selectedFlexDate; let base; if (dateForPrice && selectedYacht.tourId) { const p = calculateBoatPrice(selectedYacht.tourId, dateForPrice, totalGuests, privateTours); base = p !== null ? p : selectedYacht.priceValue; } else { base = selectedYacht.priceValue; } return base + (extrasSubtotalIDR || 0); })()) : null}
          dateDisplay={dateMode === "exact" ? (exactDate ? new Date(exactDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null) : (selectedFlexDate ? new Date(selectedFlexDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : rangeStart && rangeEnd ? `${new Date(rangeStart + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(rangeEnd + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : null)}
          guestsDisplay={`${adults} adult${adults !== 1 ? "s" : ""}${kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}`}
          capacityLabel={selectedYacht ? `Up to ${selectedYacht.people}` : null}
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
          selectedExtras={selectedExtras}
          onExtraQtyChange={handleExtraQtyChange}
          onShowExtras={() => {
            setShowExtrasSection(true);
            setTimeout(() => {
              const target = document.getElementById("step-6");
              if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }}
          transfers={transfers}
          selectedTransferId={selectedTransferId}
          onSelectTransferId={setSelectedTransferId}
          pickupAddress={pickupAddress}
          onSetPickupAddress={setPickupAddress}
          dropoffAddress={dropoffAddress}
          onSetDropoffAddress={setDropoffAddress}
          formatIDR={formatIDR}
          onOpenExtra={(id) => {
            setShowExtrasSection(true);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("open-extra-popup", { detail: { id } }));
            }, 100);
          }}
        />

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
          maxWidth="max-w-xl"
          bodyClassName="p-0"
          showClose={false}
        >
          <TourInfoModal
            activeTab={tourInfoTab}
            onClose={() => setIsTourInfoOpen(false)}
          />
        </Modal>
        <div className="relative">
            <StepExtras
              showExtrasSection={showExtrasSection}
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
                setShowReview(true);
                setTimeout(() => {
                  const target = document.getElementById("step-review");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
              isBirthday={isBirthday}
              onBirthdayChange={setIsBirthday}
              onSkip={() => {
                setSelectedExtras({});
                setShowReview(true);
                setTimeout(() => {
                  const target = document.getElementById("step-review");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
            />
        </div>
        {showReview && (
        <div className="relative">
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
              onOpenManageExtras={() => {
                setShowExtrasSection(true);
                setTimeout(() => {
                  const target = document.getElementById("step-6");
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
              onChangeExtraQty={handleExtraQtyChange}
              onReserve={handleOpenCheckout}
              transfers={transfers}
              selectedTransferId={selectedTransferId}
              onSelectTransferId={setSelectedTransferId}
              covers={covers}
              selectedCoverId={selectedCoverId}
              onSelectCoverId={setSelectedCoverId}
              totalGuests={totalGuests}
              pickupAddress={pickupAddress}
              onSetPickupAddress={setPickupAddress}
              dropoffAddress={dropoffAddress}
              onSetDropoffAddress={setDropoffAddress}
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
                    donationAmount={donationAmount}
                    supportChildren={supportChildren}
                    onSetSupportChildren={setSupportChildren}
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
        )}
        <ReviewsSection />
        <Footer />
      </div>
      <StickyBookingBar
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
        onConfirmSearch={commitSearch}
        hasPendingChanges={hasPendingSearchChanges}
        onContinue={() => {
          const reviewEl = document.getElementById("step-review");
          if (reviewEl && reviewEl.getBoundingClientRect().top < window.innerHeight) {
            reviewEl.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          const title = document.getElementById("hero-title");
          if (title) {
            const navHeight = document.querySelector("nav")?.offsetHeight || 0;
            const titleBottom = title.getBoundingClientRect().bottom + window.scrollY;
            const isMobileView = window.innerWidth < 640;
            window.scrollTo({ top: titleBottom - (isMobileView ? navHeight : 0), behavior: "smooth" });
          }
        }}
        globalAvailabilityMap={globalAvailabilityMap}
      />
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
  donationAmount = 0,
  supportChildren = false,
  onSetSupportChildren,
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
                  <div key={s.num} className="flex flex-col items-center gap-3">
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
                        "text-2xs leading-tight font-bold uppercase tracking-wider whitespace-nowrap transition-colors text-center",
                        isActive ? "text-primary-700" : isCompleted ? "text-primary-600 cursor-pointer" : "text-neutral-300"
                      )}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-3 h-2" />

          <div className={`${CARD.radius} ${CARD.border} bg-white p-4 shadow-lg shadow-neutral-100/40 sm:p-6`}>
            <h3 className="mb-4 text-lg font-bold text-secondary-900 sm:mb-5 sm:text-xl">
              {step === 1 ? "How would you like to pay?" : step === 2 ? "Select payment method" : "Contact details"}
            </h3>

            {step === 1 && (
              <div className="space-y-2.5">
                <button
                  onClick={() => onSetPayMode("full")}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
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
                      <span className="font-bold text-secondary-900">{formatIDR(totalPrice + (supportChildren ? donationAmount : 0))}</span>
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
                    "relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
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
                        <span className="rounded-full border border-primary-200 bg-primary-50/50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-600">Flexible</span>
                      </div>
                      <span className="font-bold text-secondary-900">{formatIDR(partPrice + (supportChildren ? donationAmount : 0))}</span>
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                      Pay {formatIDR(partPrice + (supportChildren ? donationAmount : 0))} now, and the rest ({formatIDR(totalPrice - partPrice)}) on the day.
                    </div>
                  </div>
                </button>

                <div className="mt-1 border-t border-dashed border-neutral-200 pt-3.5">
                  <label
                    htmlFor="checkout-support-children"
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                      supportChildren
                        ? "border-rose-300 bg-rose-50/70 ring-1 ring-rose-300/40"
                        : "border-rose-100 bg-rose-50/30 hover:border-rose-200 hover:bg-rose-50/50"
                    )}
                  >
                    <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors", supportChildren ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-500")}>
                      <Heart className="h-4 w-4" fill={supportChildren ? "currentColor" : "none"} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <span className="font-bold text-secondary-900">Support children in need</span>
                        <span className="font-bold text-rose-600">+{formatIDR(donationAmount)}</span>
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                        By checking this box, 1% of your booking will be donated to help orphaned children. Every contribution, no matter how small, makes a real difference.
                      </div>
                    </div>
                    <input
                      id="checkout-support-children"
                      type="checkbox"
                      checked={supportChildren}
                      onChange={(e) => onSetSupportChildren?.(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-rose-300 accent-rose-500 focus:ring-rose-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <button
                  onClick={() => onSetPayMethod("card")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border p-3.5 transition",
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
                {/* PayPal временно отключён */}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3.5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Name*</label>
                    <input
                      type="text"
                      autoComplete="new-password"
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
                    autoComplete="new-password"
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
                <Button variant="secondary" onClick={() => onSetStep(step - 1)} className="h-11 px-5">Back</Button>
              ) : (
                <Button variant="ghost" onClick={onCancel} className="h-11 px-4 text-secondary-400 hover:bg-red-50 hover:text-red-500">Cancel</Button>
              )}
              <Button
                onClick={() => step < 3 ? onSetStep(step + 1) : handleFinalize()}
                disabled={step === 3 && (!agreedTerms || !agreedLiability)}
                className="h-11 min-w-32 px-5 shadow-md shadow-primary-600/20"
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
                    <span className="rounded-full border border-primary-200 bg-primary-50/50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-600">Flexible</span>
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
                "flex w-full items-center justify-between rounded-2xl border-2 p-4 transition",
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
            {/* PayPal временно отключён */}
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
                  "mt-1.5 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:ring-1",
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
                  "mt-1.5 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:ring-1",
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
                className="mt-1.5 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
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
