import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Discover.nika.css";
import ReviewsSection from "./components/common/ReviewsSection";
import AddressAutocomplete from "./components/common/AddressAutocomplete";
import RatingPill from "./components/common/RatingPill";
import { getBoatFeatures, bfOn } from "./utils/boatFeatures";
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
import { AnimatePresence, motion } from "framer-motion";
import { useCurrency } from "./CurrencyContext";
import { useTours } from "./ToursContext";
import { useExtras } from "./contexts/ExtrasContext";
import { useRules } from "./contexts/RulesContext";
import Skeleton, { CardSkeleton, GallerySkeleton } from "./components/common/Skeleton";
import { fetchRestaurant, fetchRestaurants } from "./api/extras";
import { apiUrl } from "./api/base";
import { buildTourAnalyticsItem, getUtmQueryString, trackAddToCart, trackBeginCheckout, trackAddPaymentInfo, trackViewItem, trackPixelViewContent, trackPixelAddToCart, trackPixelInitiateCheckout, trackPixelAddPaymentInfo } from "./lib/analytics";

// Shared Components & Utils
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
  getFlashSaleForDate
} from "./components/booking/utils";
import {
  BRAND,
  LINKS,
  INFO_DRAWER_TABS,
  SECTIONS,
  SECTION_BACKGROUNDS,
  REVIEW_SOURCE_ICON_MAP,
  GUEST_FEE_IDR,
  MAX_GUESTS,
  GROUP_TRANSFER_THRESHOLD,
  TRUST_INCLUDED_SHORT,
  REVIEW_COUNT_SHORT
} from "./components/booking/constants";
import { CARD } from "./lib/tokens";
import Modal from "./components/booking/ui/Modal";
import RestaurantModal from "./components/tour/RestaurantModal";
import ScheduleModal from "./components/tour/ScheduleModal";
import RestaurantCard from "./components/tour/RestaurantCard";
import TourDetailsCard from "./components/tour/TourDetailsCard";
import ScheduleItemCompact from "./components/tour/ScheduleItemCompact";
import { TransfersCompact, CoversCompact } from "./components/booking/TransferCoverPanels";
import Section from "./components/common/Section";
import { PremiumSection, PremiumContainer } from "./components/booking/ui/Section";
import { PremiumCard as Card } from "./components/booking/ui/Card";
import Pill from "./components/booking/ui/Pill";
import { GallerySection } from "./components/booking/sections/GallerySection";
import { SocialProof } from "./components/booking/sections/SocialProof";
import { WhyBluuu } from "./components/booking/sections/WhyBluuu";
import { Included } from "./components/booking/sections/Included";
import { LunchHighlight } from "./components/booking/sections/LunchHighlight";
import { FAQSection as FAQ } from "./components/booking/sections/FAQSection";
import { PrimaryLink, SecondaryLink } from "./components/booking/ui/Links";

import {
  Anchor,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Calendar,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
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
  Heart,
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
  Youtube,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Ruler,
  Maximize,
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

import { tourInfo, bookingMiniFAQ as bookingMiniFAQData } from "./data/shared.json";
// Shared Components
import CustomDatePicker from "./components/common/CustomDatePicker";
import DatePickerBody from "./components/common/DatePickerBody";
import PhoneInput from "./components/common/PhoneInput";
import PolicyModal, { usePolicyModal } from "./components/common/PolicyModal";
import Button from "./components/common/Button";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import Accordion from "./components/common/Accordion";
import { cn } from "./lib/utils";
import { useSiteContacts } from "./hooks/useSiteContacts";
import SEO from "./components/SEO";
import Footer from "./components/common/Footer";

function SkeletonCard() {
  return (
    <div className="group relative flex min-h-70vh w-full shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white sm:min-h-470">
      <div className="relative h-250 shrink-0 overflow-hidden bg-neutral-100">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.3 }}
        />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`rounded-full bg-white/60 ${i === 0 ? "w-4 h-1.5" : "w-1.5 h-1.5"}`} />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
        <div className="flex items-center gap-2 min-h-9">
          <div className="h-4 w-4 shrink-0 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-5 w-2/5 rounded-lg bg-neutral-100 animate-pulse" />
        </div>
        <div className="space-y-1.5 min-h-10">
          <div className="h-3.5 w-full rounded-lg bg-neutral-100 animate-pulse" />
          <div className="h-3.5 w-4/5 rounded-lg bg-neutral-100 animate-pulse" />
        </div>
        <div className="h-4 w-24 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="flex min-h-3.75 flex-wrap content-start gap-x-3 gap-y-2">
          <div className="h-6 w-28 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-6 w-28 rounded-full bg-neutral-100 animate-pulse" />
        </div>
        <div className="h-3.5 w-3/5 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="mt-auto pt-2">
          <div className="h-10 w-full rounded-xl bg-neutral-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBoatCard({ className }) {
  return (
    <div className={cn("relative rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white overflow-hidden", className)}>
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

// Global formatters to bridge legacy utility functions with React Context
const CurrencyBridge = () => {
  const { formatPrice } = useCurrency();
  setGlobalFormatPrice(formatPrice); // Synchronous update to avoid stale prices during first render
  return null;
};

// --- Qoves-inspired Premium Components & Theme ---

const Q_THEME = {
  colors: {
    bg: "#f8fafc",
    surface: "#FFFFFF",
    surfaceSoft: "#f8fafc",
    text: "#0f172a",
    textSubtle: "#64748b",
    textLighter: "#94a3b8",
    accent: "#045cff",
    accentDark: "#0a4deb",
    border: "#e2e8f0",
    borderLight: "#f1f5f9",
  },
  text: {
    h1: "text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight",
    h2: "text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl",
    h3: "text-xl font-bold tracking-tight text-secondary-900 sm:text-2xl",
    body: "mt-3 max-w-2xl mx-auto text-lg leading-relaxed text-secondary-600",
    caption: "text-sm text-slate-500 font-medium",
    label: "text-xs font-black uppercase tracking-widest text-primary-600",
  },
  container: "container",
  section: "py-20 md:py-32",
  card: {
    base: "bg-white rounded-xl border border-slate-100 transition-all duration-300",
    hover: "hover:border-blue-100",
  },
};

// Lightweight sanity checks (non-blocking)
try {
  console.assert(new Set(SECTIONS.map((s) => s.id)).size === SECTIONS.length, "SECTIONS ids must be unique");
  console.assert(!!BRAND?.name && !!BRAND?.product, "BRAND.name and BRAND.product must be set");
} catch (_) { }

const INPUT_BASE =
  "h-11 w-full rounded-full border border-neutral-200 bg-white text-base text-secondary-900 shadow-none outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

// Utility hooks for pricing and availability
function calculateBoatPrice(tourId, date, membersCount, privateTours) {
  if (!tourId || !privateTours?.length) return null;
  const tour = privateTours.find((t) => Number(t.id) === Number(tourId));
  if (!tour) return null;

  // Robust date comparison: convert date object to YYYY-MM-DD string
  let dateStr = date;
  if (date instanceof Date) {
    dateStr = date.toISOString().split('T')[0];
  } else if (date && typeof date === 'object' && date.startDate) {
    // Handle date range objects if necessary
    dateStr = new Date(date.startDate).toISOString().split('T')[0];
  }

  // Flexibility for 'package' vs 'packages'
  let pricelist = tour.packages?.pricelist || tour.package?.pricelist || tour.pricelist || [];
  let boatPriceToAdd = Number(tour.boat_price) || 0;

  // Check for date-specific pricing
  if (dateStr && tour.pricesbydates?.length) {
    const specificPricing = tour.pricesbydates.find((p) => {
      const start = p.date_start;
      const end = p.date_end;
      return dateStr >= start && dateStr <= end;
    });
    if (specificPricing) {
      const pkg = specificPricing.packages || specificPricing.package;
      if (pkg?.pricelist) {
        pricelist = pkg.pricelist;
      }
      if (specificPricing.boat_price !== undefined && specificPricing.boat_price !== null) {
        boatPriceToAdd = Number(specificPricing.boat_price);
      }
    }
  }

  if (!pricelist.length) return null;

  // Find price for membersCount
  const countStr = String(membersCount);
  let priceEntry = pricelist.find((p) => String(p.members_count) === countStr);

  // Fallback: if not found, use the closest one or the highest one
  if (!priceEntry) {
    const sorted = [...pricelist].sort((a, b) => Number(a.members_count) - Number(b.members_count));
    priceEntry = sorted.reverse().find((p) => Number(p.members_count) <= membersCount) || sorted[0];
  }

  // Shared tours (classes_id 9 or 10 usually, or identified by context)
  const isShared = Number(tour.classes_id) === 9 || Number(tour.classes_id) === 10;

  return priceEntry ? Number(priceEntry.price) + (isShared ? 0 : boatPriceToAdd) : null;
}

function useBoatPricing(tourId, date, membersCount, privateTours) {
  return useMemo(() => calculateBoatPrice(tourId, date, membersCount, privateTours), [tourId, date, membersCount, privateTours]);
}
function usePricing(date, initialPrice = 0) {
  const [state, setState] = useState({
    price: initialPrice,
    remainingSeats: null,
    loading: false,
  });
  useEffect(() => {
    if (!date) return;
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const res = await fetch(apiUrl(`pricing?date=${date}`), { signal: controller.signal });
        if (!res.ok) throw new Error("pricing fetch failed");
        const data = await res.json();
        if (!active) return;
        const nextPrice = Number(data?.price);
        const nextSeats = Number(data?.remainingSeats);
        setState({
          price: Number.isFinite(nextPrice) ? nextPrice : initialPrice,
          remainingSeats: Number.isFinite(nextSeats) ? Math.max(0, nextSeats) : null,
          loading: false,
        });
      } catch (_) {
        if (!active) return;
        setState((prev) => ({ ...prev, loading: false }));
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [date]);
  return state;
}

function BookingCard({
  compact = false,
  selectedYacht,
  cartItems,
  extrasTotalUSD,
  selectedVibe,
  onOpenTourInfo,
}) {
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
    const analyticsCurrency = selectedYacht?.priceValue ? "IDR" : "USD";
    const analyticsTotal = price + extrasTotal;
    trackAddToCart({
      value: analyticsTotal,
      currency: analyticsCurrency,
      items: [
        buildTourAnalyticsItem({
          itemId: selectedYacht?.tourId ?? selectedYacht?.id,
          itemName: selectedYacht?.name || "Shared Tour",
          itemCategory: "Shared Tour",
          price: analyticsTotal,
          currency: analyticsCurrency,
        }),
      ],
    });
    const params = new URLSearchParams({ date, adults: String(adults), kids: String(kids) });
    params.set("tourId", String(selectedYacht?.tourId ?? selectedYacht?.id ?? ""));
    const availEntry = availabilityMap[selectedYacht?.id]?.[date];
    if (availEntry?.boat_id) params.set("boatId", String(availEntry.boat_id));
    params.set("tourName", selectedYacht?.name || "Shared Tour");
    params.set("tourCategory", "Shared Tour");
    if (selectedYacht?.routeId) params.set("routeId", String(selectedYacht.routeId));
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
        {remainingSeats !== null && remainingSeats > 0 && remainingSeats < 8 ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Popular date — only {remainingSeats} seat{remainingSeats === 1 ? "" : "s"} left
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
            style={reserveDisabled ? undefined : { boxShadow: '0 4px 24px -2px rgba(0, 127, 255, 0.45), 0 2px 8px -1px rgba(0, 127, 255, 0.3)' }}
            disabled={reserveDisabled}
          >
            Reserve now <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="text-center text-sm text-secondary-500">
            Secure checkout · Instant confirmation
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
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Ticket, label: "Lock today's rate" },
            { icon: Calendar, label: "Stay flexible" },
            { icon: Clock, label: "Smart decision" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-sm py-4 px-2">
                <Icon className="h-6 w-6 text-primary-600" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-secondary-900">{item.label}</span>
              </div>
            );
          })}
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
                images={vibe.photos?.length ? vibe.photos : [vibe.hero]}
                alt={vibe.title}
                onOpenGallery={() => onOpenGallery(vibe.id)}
                className="aspect-4/3"
              />
              <div className="absolute left-3 top-3 rounded-full border border-neutral-200 bg-white/70 px-2 py-0.5 text-sm font-semibold text-secondary-600">
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
                                                <span className="min-w-5 text-center text-sm font-black text-secondary-900 tabular-nums">
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
                            className="inline-flex h-9 w-110 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-xs font-black text-secondary-600 transition hover:bg-neutral-100"
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

function Hero({ children }) {
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
    <section id="hero-section" className="relative z-20 min-h-[60vh]">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,30,55,0.25) 0%, rgba(0,30,55,0.55) 50%, rgba(0,20,42,0.88) 100%)'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-[60vh]">
        {/* Top: headline + booking bar */}
        <div className="container flex flex-1 flex-col items-center justify-center text-center py-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Shared tour to <span className="italic" style={{ color: 'var(--primary-300)' }}>Nusa Penida</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm font-normal text-white/70 sm:text-base">
            Comfort boat + snorkeling + mantas + Kelingking.<br className="sm:hidden" /> All-inclusive.
          </p>
          <p className="mt-3 text-xs font-normal text-white/60 sm:text-sm">
            From <span className="font-bold text-white">{formatUSD(80)}</span> / person
            <span className="mx-1.5 text-white/30">·</span>
            Free cancellation <span className="font-bold text-white">24h</span>
          </p>
          {children}
        </div>

        {/* Bottom: trust strip */}
        <div>
          <div className="container">
            <div className="flex w-full items-center py-5">
              <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-3">
                <CloudRain className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--h2-blue-light)' }} />
                <span className="text-2xs sm:text-sm font-semibold text-white">Weather Guarantee</span>
              </div>
              <div className="h-4 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-3">
                <Ship className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--h2-blue-light)' }} />
                <span className="text-2xs sm:text-sm font-semibold text-white">Shared boat</span>
              </div>
              <div className="h-4 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" strokeWidth={1.5} style={{ color: 'var(--h2-blue-light)' }} />
                <span className="text-2xs sm:text-sm font-semibold text-white">Small groups</span>
              </div>
            </div>
          </div>
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
        <div className="relative overflow-hidden rounded-none border-none bg-gradient-to-br from-white to-neutral-50 p-6 shadow-none sm:rounded-xl sm:border sm:border-neutral-200">
          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-accent-soft to-transparent opacity-40 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-text-accent-theme-soft to-transparent opacity-30 blur-xl" />
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
      text: "We'll show options that fit your group on that day.",
      icon: Calendar,
      number: "01",
    },
    {
      title: "Choose your option",
      text: "Classic is the best value. Premium is the relaxed version.",
      icon: Ship,
      number: "02",
    },
    {
      title: "Add transfer & cover",
      text: "Add a private pickup and travel insurance if you need them. Both are optional.",
      icon: Ticket,
      number: "03",
      wide: true,
    },
  ];

  return (
    <PremiumSection
      id="how-it-works"
      className="py-16 sm:min-h-screen sm:py-0 sm:flex sm:items-center md:py-24 md:min-h-0 md:block"
      backgroundClassName="bg-transparent"
    >
      <PremiumContainer>
        <div className="animate-in flex items-center justify-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-0">
            {steps.map((step, i) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3 py-2 sm:py-0">
                  <span className="text-xs font-semibold tabular-nums text-secondary-300">{step.number}</span>
                  <span className="text-sm font-medium text-secondary-700">{step.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block sm:mx-5 h-px w-6 bg-neutral-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </PremiumContainer>
    </PremiumSection>
  );
}

function StepNumberSide({ number, isLast = false }) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 bottom-0 hidden lg:block" style={{ width: '80px' }}>
      <div className="flex h-full flex-col items-center pt-16">
        <span className="text-6xl font-extralight tabular-nums tracking-tight select-none" style={{ color: 'var(--neutral-200, #E6EAEC)' }}>{number}</span>
        {!isLast && <div className="mt-4 flex-1 w-px" style={{ background: 'linear-gradient(to bottom, var(--neutral-200, #E6EAEC), transparent)' }} />}
      </div>
    </div>
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

  const [openPanel, setOpenPanel] = useState(null); // "dates" | "guests" | null
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
    // Scroll the dropdown panel into center of viewport when dates panel opens (skip if omitId = sticky bar)
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

  // Smart auto-close: waits for mouse to leave panel area
  const scheduleAutoClose = useCallback((delay = 1500) => {
    clearTimeout(autoCloseTimerRef.current);
    const tryClose = () => {
      if (hoveringRef.current) {
        // Mouse still in panel — retry after another delay
        autoCloseTimerRef.current = setTimeout(tryClose, 800);
      } else {
        setOpenPanel(null);
      }
    };
    autoCloseTimerRef.current = setTimeout(tryClose, delay);
  }, []);

  // Clean up timer on unmount or panel change
  useEffect(() => {
    if (!openPanel) clearTimeout(autoCloseTimerRef.current);
    return () => clearTimeout(autoCloseTimerRef.current);
  }, [openPanel]);

  // Close dropdown on outside click
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

  // Close on Escape
  useEffect(() => {
    if (!openPanel) return undefined;
    const handler = (e) => { if (e.key === "Escape") setOpenPanel(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openPanel]);

  // Auto-close guests panel after inactivity
  useEffect(() => {
    if (openPanel !== "guests") return undefined;
    scheduleAutoClose(1500);
    return () => clearTimeout(autoCloseTimerRef.current);
  }, [openPanel, adults, kids, scheduleAutoClose]);

  const hasDateSelection = dateMode === "exact" ? !!exactDate : !!(rangeStart && rangeEnd);
  const hasGuests = totalGuests > 0;

  // Summary labels for the bar
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
    <div id={omitId ? undefined : "step-1"} className={omitId ? "w-full" : embedded ? "w-full mt-8 mb-2" : "sticky top-[52px] z-[60] py-3 bg-neutral-100/95 backdrop-blur-md"}>
      <div className={omitId ? "mx-auto max-w-3xl" : "mx-auto sm:max-w-3xl px-2 sm:px-6"}>
        {/* Search Bar */}
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
          {/* Dates pill */}
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
                    {/* Mobile close button */}
                    <div className="sm:hidden flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-secondary-900">Select dates</span>
                      <button type="button" onClick={() => setOpenPanel(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3 max-sm:space-y-2.5 sm:text-center">
                      {/* Mode toggle */}
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

          {/* Divider */}
          <div className="h-9 w-px bg-neutral-200 shrink-0" />

          {/* Guests pill */}
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
                    {/* Mobile close button */}
                    <div className="sm:hidden flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-secondary-900">Guests</span>
                      <button type="button" onClick={() => setOpenPanel(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-5">
                      {/* Adults */}
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
                          <button
                            type="button"
                            onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                              adults <= 1
                                ? "border-neutral-100 text-neutral-200 cursor-not-allowed"
                                : "border-neutral-300 text-secondary-600 hover:border-secondary-900 hover:text-secondary-900"
                            )}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[24px] text-center text-base font-semibold text-secondary-900 tabular-nums">{adults}</span>
                          <button
                            type="button"
                            onClick={() => onAdultsChange(adults + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-secondary-600 transition-colors hover:border-secondary-900 hover:text-secondary-900"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-neutral-100" />

                      {/* Kids */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-secondary-900">Kids</div>
                            <div className="text-xs text-secondary-400">Ages 7-14</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onKidsChange(Math.max(0, kids - 1))}
                            disabled={kids <= 0}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                              kids <= 0
                                ? "border-neutral-100 text-neutral-200 cursor-not-allowed"
                                : "border-neutral-300 text-secondary-600 hover:border-secondary-900 hover:text-secondary-900"
                            )}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[24px] text-center text-base font-semibold text-secondary-900 tabular-nums">{kids}</span>
                          <button
                            type="button"
                            onClick={() => onKidsChange(kids + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-secondary-600 transition-colors hover:border-secondary-900 hover:text-secondary-900"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Info note */}
                      <div className="rounded-xl bg-neutral-50 px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                          <p className="text-xs leading-relaxed text-secondary-500 text-left">
                            Minimum age for shared tours is 7 — traveling with younger kids? <a href="/privatenew" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">A private tour is the way to go.</a>
                          </p>
                        </div>
                      </div>
                      {/* Mobile Continue button */}
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

          {/* Continue button */}
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
function StickyBookingBar(props) {
  const {
    dateMode, rangeStart, rangeEnd, exactDate,
    adults, kids, totalGuests, canContinue, onContinue,
  } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [topOffset, setTopOffset] = useState(24);

  // Dynamic top: 24px below navbar when visible, 24px from top when navbar hidden
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

  // Show only when the hero section has scrolled out of view
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

  // Collapse on scroll while expanded (debounced to avoid programmatic scroll triggers)
  useEffect(() => {
    if (!isExpanded) return;
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 400);
    const handler = () => { if (armed) setIsExpanded(false); };
    window.addEventListener("scroll", handler, { passive: true });
    return () => { clearTimeout(armTimer); window.removeEventListener("scroll", handler); };
  }, [isExpanded]);

  // Expand + pulse when triggered from cards ("Pick a date first" button)
  const [isPulsing, setIsPulsing] = useState(false);
  useEffect(() => {
    const handler = () => {
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

  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const diff = Math.round((new Date(rangeEnd) - new Date(rangeStart)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);

  const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateSummary = dateMode === "exact"
    ? (exactDate ? fmtDate(exactDate) : "Choose dates")
    : (rangeStart && rangeEnd ? `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}` : "Choose dates");
  const guestSummary = totalGuests > 0
    ? `${adults} adult${adults !== 1 ? "s" : ""}${kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}`
    : "Add guests";

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
                @keyframes addon-pulse {
                  0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                  60%  { box-shadow: 0 0 0 10px rgba(59,130,246,0.08); }
                  100% { box-shadow: 0 0 0 16px rgba(59,130,246,0); }
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

const PICKUP_TIMELINE = [
  { icon: MapPin, label: "Hotel", sub: "Your stay" },
  { icon: Car, label: "Pickup", sub: "Private car" },
  { icon: Clock, label: "Drive", sub: "Traffic buffer" },
  { icon: Anchor, label: "Port", sub: "Meeting point" },
  { icon: Ship, label: "Boat", sub: "Departure" },
];
const PICKUP_DETAILS_LIST = [
  { icon: ArrowRight, label: "Round trip", helper: "Pickup + drop-off available." },
  { icon: Clock, label: "Timed pickup", helper: "Aligned with your boat schedule." },
  { icon: Shield, label: "Traffic buffer", helper: "We plan extra time for boarding." },
  { icon: MessageCircle, label: "Meeting point", helper: "Confirmed on WhatsApp." },
  { icon: MapPin, label: "Across Bali", helper: "We confirm feasibility after booking." },
  { icon: Users, label: "Large groups", helper: "Minivan can be arranged." },
];
const TOUR_SAFETY_ITEMS = [
  { icon: Shield, label: "Route safety", helper: "Safety-first routing policy. Route may change based on sea and weather conditions on the day." },
  { icon: BadgeCheck, label: "Certified guides", helper: "All guides are licensed and trained. A full safety briefing is given before every departure." },
  { icon: CheckCircle2, label: "Free cancellation 24h", helper: "Cancel up to 24 hours before departure and receive a full refund. No questions asked." },
  { icon: AlertTriangle, label: "Port Authority", helper: "Final go/no-go decisions are made on the morning of the tour based on Port Authority guidance and captain safety checks." },
];
const TIER_HIGHLIGHT_CARDS = {
  0: [ // Classic — highlight cards
    { icon: Waves, title: "Snorkeling & manta rays", desc: "4 top spots with crystal-clear water" },
    { icon: Compass, title: "Kelingking Cliff", desc: "Land tour to the iconic viewpoint" },
    { icon: UtensilsCrossed, title: "Lunch at cliff restaurant", desc: "Scenic beachside dining" },
    { icon: Camera, title: "GoPro photos", desc: "Underwater highlights by crew" },
  ],
  1: [ // Premium — highlight cards
    { icon: Clock, title: "Extra 1h on the route", desc: "More snorkeling time" },
    { icon: UtensilsCrossed, title: "Lunch at La Rossa", desc: "Beach club experience" },
    { icon: Wine, title: "Sunset prosecco", desc: "On the cruise back" },
    { icon: Camera, title: "Pro photographer", desc: "All day, delivered in 3 days" },
  ],
  2: [ // First Class — highlight cards
    { icon: Camera, title: "Drone footage", desc: "Next-day delivery" },
    { icon: Ship, title: "New yacht", desc: "Senior guides only" },
    { icon: Camera, title: "Free GoPro rental", desc: "Shoot your own content" },
    { icon: Globe, title: "High-speed Starlink", desc: "Wi-Fi on board" },
  ],
};
const TIER_EXTRA_CHIPS = {
  0: [ // Classic extra chips
    { icon: Car, label: "Free Transfer by Shuttlebus" },
  ],
  1: [ // Premium — classic highlights + photo chips
    { icon: Waves, label: "Snorkeling & manta rays" },
    { icon: Compass, label: "Kelingking Cliff tour" },
    { icon: Camera, label: "GoPro underwater by guides" },
    { icon: Clock, label: "Photos delivered in 3 days" },
  ],
  2: [ // First Class — premium highlights become chips too
    { icon: Waves, label: "Snorkeling & manta rays" },
    { icon: Compass, label: "Kelingking Cliff tour" },
    { icon: Clock, label: "Extra 1h route" },
    { icon: UtensilsCrossed, label: "Luxury cliff-top lunch" },
    { icon: Camera, label: "Pro photographer" },
    { icon: MapPin, label: "Photo at secret spot" },
    { icon: Wine, label: "Free flow prosecco" },
    { icon: Clock, label: "Photos delivered in 3 days" },
    { icon: Coffee, label: "Light breakfast & snacks" },
    { icon: Ship, label: "In-built sound system & onboard shower" },
  ],
};

function TourTabContent({ activeTab, tierIndex = 1, includedSections, cancellationSummaryCards, weatherGuaranteeCards, onRestaurantClick, tourIncluded, tourIncludes }) {
  const row = "flex items-start gap-3 py-3";
  const iconBlue = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-primary-400";
  const gridFor = (count) => cn("grid gap-x-6", count === 4 ? "grid-cols-1 sm:grid-cols-2" : count <= 3 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3");
  const grid = "grid grid-cols-1 sm:grid-cols-3 gap-x-6";
  if (activeTab === "included") {
    // Use tourIncluded/tourIncludes from backend if available, otherwise fallback to static data
    const hasTourData = tourIncluded?.length || tourIncludes?.length;
    const highlightCards = hasTourData && tourIncluded?.length
      ? tourIncluded.map(i => ({ title: i.name, desc: i.description, icon_svg: i.icon_svg }))
      : TIER_HIGHLIGHT_CARDS[tierIndex] || TIER_HIGHLIGHT_CARDS[1];
    const MINOR_LABELS = ["Snorkeling equipment", "Drinking water", "Towels", "Light breakfast & snacks", "In-built sound system & onboard shower"];
    const backendChips = hasTourData && tourIncludes?.length
      ? tourIncludes.map(i => ({ label: i.name, icon_svg: i.icon_svg }))
      : null;
    const extraChips = backendChips || TIER_EXTRA_CHIPS[tierIndex] || [];
    const baseChips = (includedSections || []).flatMap((s) => s.items);
    const allRawChips = backendChips
      ? backendChips
      : [...extraChips, ...baseChips.map((item) => ({ icon: item.icon, label: item.label }))];
    const mainChips = allRawChips.filter((item) => !MINOR_LABELS.includes(item.label || item.name)).sort((a, b) => (a.label||a.name||"").length - (b.label||b.name||"").length);
    const minorItems = backendChips ? [] : [...baseChips.filter((item) => MINOR_LABELS.includes(item.label)).map((item) => item.label), ...extraChips.filter((item) => MINOR_LABELS.includes(item.label)).map((item) => item.label)];
    const tierColors = {
      0: { card: "border border-primary-200/50 bg-primary-50/50 hover:bg-primary-50/70", iconBg: "bg-primary-500/10", iconText: "text-primary-600", chip: "border border-primary-200 bg-transparent", chipIcon: "text-primary-600" },
      1: { card: "border border-indigo-200/50 bg-indigo-50/50 hover:bg-indigo-50/70", iconBg: "bg-indigo-500/10", iconText: "text-indigo-600", chip: "border border-primary-200 bg-transparent", chipIcon: "text-primary-600" },
      2: { card: "border border-emerald-200/50 bg-emerald-50/50 hover:bg-emerald-50/70", iconBg: "bg-emerald-500/10", iconText: "text-emerald-600", chip: "border border-primary-200 bg-transparent", chipIcon: "text-primary-600" },
    };
    const tc = tierColors[tierIndex] || tierColors[0];
    return (
    <div className="space-y-5">
      {/* Highlight cards */}
      <div className={cn("grid gap-3", highlightCards.length <= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
        {highlightCards.map((card) => {
          const Icon = card.icon;
          const title = card.title || card.name;
          const desc = card.desc || card.description;
          return (
            <div key={title} className={cn("flex flex-col items-center text-center rounded-2xl px-3 py-4 transition-all", tc.card)}>
              <div className={cn("mb-2.5 flex h-11 w-11 items-center justify-center rounded-full", tc.iconBg)}>
                {card.icon_svg
                  ? <span className={cn("h-5 w-5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-current", tc.iconText)} dangerouslySetInnerHTML={{ __html: card.icon_svg }} />
                  : Icon ? <Icon className={cn("h-5 w-5", tc.iconText)} strokeWidth={1.5} /> : null}
              </div>
              <div className="text-sm font-semibold text-secondary-900">{title}</div>
              {desc && <div className="mt-0.5 text-xs leading-normal text-secondary-500">{desc}</div>}
            </div>
          );
        })}
      </div>
      {/* Included chips */}
      <div className="flex flex-wrap gap-2">
        {mainChips.map((item) => {
          const Icon = item.icon;
          const label = item.label || item.name;
          return (
            <span key={label} className={cn("inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-secondary-700", tc.chip)}>
              {item.icon_svg
                ? <span className={cn("h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-current", tc.chipIcon)} dangerouslySetInnerHTML={{ __html: item.icon_svg }} />
                : Icon ? <Icon className={cn("h-4 w-4 shrink-0", tc.chipIcon)} strokeWidth={1.5} /> : null}
              {label}
            </span>
          );
        })}
      </div>
      {/* Minor items as text */}
      {minorItems.length > 0 && (
        <p className="text-xs sm:text-sm text-secondary-400">{minorItems.join(" · ")}</p>
      )}
    </div>
  );
  }
  if (activeTab === "pickup") {
    return (
      <div>
        {/* Shuttle info */}
        <div className="flex flex-col sm:flex-row gap-5">
          <img src="https://bluuu.tours/storage/app/media/driver.webp" alt="Bluuu shuttle bus" className="h-40 w-full sm:w-48 shrink-0 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-bold text-white">Complimentary shuttle</h4>
                <p className="mt-1 text-sm text-white/50 leading-relaxed">Free pickup from major tourist hubs. After booking, we message the exact timing and the closest pickup point. Expect a short 5–10 minute pickup window based on your area.</p>
                <p className="mt-1 text-sm text-primary-400">Optional: private transfer upgrade for faster, more comfortable pickup.</p>
              </div>
              <Button data-cta="primary" onClick={() => {
                  const el = document.getElementById("step-3");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => window.dispatchEvent(new CustomEvent("open-transfer-modal")), 600);
                }}
                size="sm"
                className="hidden sm:inline-flex h-11 px-6 shrink-0">
                <Car className="h-4 w-4 text-white" />
                Book transfer
              </Button>
            </div>
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

        {/* How it works */}
        <div className="mt-5">
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-5 left-0 right-0 flex items-center px-[20px]">
              <div className="h-px w-full border-t border-dashed border-primary-200" />
            </div>
            {/* Steps */}
            <div className="relative flex items-start">
              {[
                "Book your tour\nonline",
                "Receive WhatsApp confirmation",
                "Meet the Bluuu Bus in your area",
                "Arrive at Serangan Harbor lounge",
              ].map((step, i) => {
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-200/50 bg-primary-50/50 text-sm font-bold text-primary-700">{i + 1}</span>
                    <span className="text-xs font-medium text-center leading-tight text-white/60 max-w-[120px] whitespace-pre-line">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end sm:hidden">
          <Button data-cta="primary" onClick={() => {
              const el = document.getElementById("step-3");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              setTimeout(() => window.dispatchEvent(new CustomEvent("open-transfer-modal")), 600);
            }}
            size="sm"
            className="inline-flex h-10 px-5 !text-white shadow-none"
            style={{ boxShadow: "none" }}>
            <Car className="h-4 w-4" />
            Book transfer
          </Button>
        </div>
      </div>
    );
  }
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
        const Icon = MINI_FAQ_ICON_MAP[it.icon];
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
  const [includedRestaurantPopup, setIncludedRestaurantPopup] = useState(null);
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
  return (
    <>
      <div className="flex max-h-[85vh] w-full flex-col bg-white p-0">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5">
          <div className="text-base font-semibold text-secondary-900">
            {TOUR_INFO_TAB_TITLES[activeTab] || "Tour info"}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700"
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
            onRestaurantClick={setIncludedRestaurantPopup}
          />
        </div>
      </div>
      <RestaurantModal
        restaurantData={includedRestaurantPopup}
        onClose={() => setIncludedRestaurantPopup(null)}
      />
    </>
  );
}
function TourInfoPanel() {
  const [activeTab, setActiveTab] = useState("included");
  const [includedRestaurantPopup, setIncludedRestaurantPopup] = useState(null);
  const cancellationSummaryCards = (tourInfo.cancellationCards ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon], accentClassName: card.accent, iconClassName: card.iconColor, iconWrapClassName: card.bg }));
  const weatherGuaranteeCards = (tourInfo.weatherGuarantee ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon] }));
  const includedSections = tourInfo.includedSections.map(section => ({ ...section, items: section.items.map(item => ({ ...item, icon: ICON_MAP[item.icon] })) }));
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="shrink-0 border-b border-neutral-200 px-4 pt-4 pb-3 sm:px-5">
          <h3 className="text-base font-semibold text-secondary-900 mb-2">Tour info</h3>
          <div className="no-scrollbar flex items-center gap-x-4 overflow-x-auto text-sm">
            {INFO_DRAWER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center whitespace-nowrap border-b-2 py-1 text-sm font-semibold transition -mb-px",
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-secondary-500 hover:text-secondary-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-secondary-600 sm:px-5">
          <TourTabContent
            activeTab={activeTab}
            includedSections={includedSections}
            cancellationSummaryCards={cancellationSummaryCards}
            weatherGuaranteeCards={weatherGuaranteeCards}
            onRestaurantClick={setIncludedRestaurantPopup}
          />
        </div>
      </div>
      <RestaurantModal
        restaurantData={includedRestaurantPopup}
        onClose={() => setIncludedRestaurantPopup(null)}
      />
    </>
  );
}
function TourInfoInline() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("included");
  const [includedRestaurantPopup, setIncludedRestaurantPopup] = useState(null);
  const cancellationSummaryCards = (tourInfo.cancellationCards ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon], accentClassName: card.accent, iconClassName: card.iconColor, iconWrapClassName: card.bg }));
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
              <div className="border-b border-neutral-200 px-4 pt-3 pb-3 sm:px-5">
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
              <div className="px-4 py-4 text-sm text-secondary-600 sm:px-5">
                <TourTabContent
                  activeTab={activeTab}
                  includedSections={includedSections}
                  cancellationSummaryCards={cancellationSummaryCards}
                  weatherGuaranteeCards={weatherGuaranteeCards}
                  onRestaurantClick={setIncludedRestaurantPopup}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <RestaurantModal
        restaurantData={includedRestaurantPopup}
        onClose={() => setIncludedRestaurantPopup(null)}
      />
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
const TIER_CONFIGS = [
  { strip: "BEST PRICE",   stripColor: "#1a3a4a", label: "CLASSIC" },
  { strip: "MOST POPULAR", stripColor: "#2563eb", label: "PREMIUM" },
  { strip: "TOP TIER",     stripColor: "#1a3a4a", label: "ELITE"   },
];

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
  onExactDateChange,
}) {
  const [sort, setSort] = useState("recommended");
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const boatSelectGuardRef = useRef(0);
  const hasAutoOpenedPickDayRef = useRef(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const hasSwipedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inlineDatesFor, setInlineDatesFor] = useState(null);
  useEffect(() => {
    if (!inlineDatesFor) { document.body.classList.remove("wa-hidden"); return; }
    document.body.classList.add("wa-hidden");
    return () => document.body.classList.remove("wa-hidden");
  }, [inlineDatesFor]);
  const [pickDayDark, setPickDayDark] = useState(false);
  const [pickDayNearbyMap, setPickDayNearbyMap] = useState({});
  const [scheduleModalBoat, setScheduleModalBoat] = useState(null);
  const [fetchedRouteSchedule, setFetchedRouteSchedule] = useState(null);
  const [isFetchingRouteSchedule, setIsFetchingRouteSchedule] = useState(false);
  const [fcModalBoat, setFcModalBoat] = useState(null);
  const [fcSchedule, setFcSchedule] = useState(null);
  const [fcRestaurant, setFcRestaurant] = useState(null);
  const [fcLoading, setFcLoading] = useState(false);
  const [routeRestaurantPopup, setRouteRestaurantPopup] = useState(null);
  const [showAllBoats, setShowAllBoats] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [draftFlexDate, setDraftFlexDate] = useState("");
  const [confirmModalData, setConfirmModalData] = useState(null);
  const hasRange = dateMode === "flex" && rangeStart && rangeEnd;
  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);
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
  useEffect(() => {
    const handler = (e) => {
      const boatId = e.detail?.boatId;
      if (boatId) {
        setInlineDatesFor(boatId);
        setDraftFlexDate("");
        const isLight = document.getElementById("tour-details-section")?.classList.contains("tour-section-light");
        setPickDayDark(!isLight);
      }
    };
    window.addEventListener("open-pick-day", handler);
    return () => window.removeEventListener("open-pick-day", handler);
  }, []);

  const openPickDayMode = useCallback(
    (boatId) => {
      setPickDayDark(false);
      setInlineDatesFor(boatId);
      setDraftFlexDate(selectedBoatId === boatId ? selectedFlexDate : "");
      setTimeout(() => {
        const card = document.querySelector(`[data-boat-id="${boatId}"]`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    },
    [selectedBoatId, selectedFlexDate]
  );
  const confirmPickDay = useCallback(
    (date) => {
      if (!date) return;
      const rawBoat = (boats || []).find((b) => b.id === inlineDatesFor);
      if (!rawBoat) return;
      onSelectBoatId(inlineDatesFor);
      if (dateMode === "exact") {
        onExactDateChange?.(date);
      } else {
        onSelectFlexDate(date);
        onDateSelectionPreference("pickNow");
      }
      closePickDayMode();
      // Scroll to tour details section
      setTimeout(() => {
        const details = document.getElementById("tour-details-section");
        if (details) {
          details.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    },
    [inlineDatesFor, dateMode, closePickDayMode, onDateSelectionPreference, onSelectFlexDate, onSelectBoatId, onExactDateChange, boats]
  );
  useEffect(() => {
    setSort("recommended");
  }, [dateMode]);

  useEffect(() => {
    if (!scheduleModalBoat || !scheduleModalBoat.routeId) {
      setFetchedRouteSchedule(null);
      return;
    }
    let isMounted = true;
    setIsFetchingRouteSchedule(true);
    fetch(apiUrl(`route/${scheduleModalBoat.routeId}`))
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setFetchedRouteSchedule({
          title: data.popup_title || data.title || scheduleModalBoat.name,
          beforeLunch: Array.isArray(data.schedule_before_lunch) ? data.schedule_before_lunch : [],
          afterLunch: Array.isArray(data.schedule_after_lunch) ? data.schedule_after_lunch : [],
          footerNotes: data.popup_afternoon ? [data.popup_afternoon] : [],
          restaurant: data.restaurant ?? null,
        });
      })
      .catch(err => console.error("Failed to fetch route schedule", err))
      .finally(() => {
        if (isMounted) setIsFetchingRouteSchedule(false);
      });
    return () => { isMounted = false; };
  }, [scheduleModalBoat]);

  // Fetch schedule + restaurant for First Class modal
  useEffect(() => {
    if (!fcModalBoat) { setFcSchedule(null); setFcRestaurant(null); return; }
    // Use inline routeSchedule if already available
    if (fcModalBoat.routeSchedule) {
      setFcSchedule(fcModalBoat.routeSchedule);
      if (fcModalBoat.routeSchedule.restaurant) setFcRestaurant(fcModalBoat.routeSchedule.restaurant);
      return;
    }
    if (!fcModalBoat.routeId) return;
    let alive = true;
    setFcLoading(true);
    fetch(apiUrl(`route/${fcModalBoat.routeId}`))
      .then(r => r.json())
      .then(data => {
        if (!alive) return;
        setFcSchedule({
          title: data.popup_title || data.title || fcModalBoat.name,
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          beforeLunch: Array.isArray(data.schedule_before_lunch) ? data.schedule_before_lunch : [],
          afterLunch: Array.isArray(data.schedule_after_lunch) ? data.schedule_after_lunch : [],
        });
        if (data.restaurant && typeof data.restaurant === "object") {
          setFcRestaurant(data.restaurant);
        } else if (data.restaurant_id) {
          fetchRestaurant(data.restaurant_id).then(r => { if (alive) setFcRestaurant(r); }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setFcLoading(false); });
    return () => { alive = false; };
  }, [fcModalBoat]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const focusStepOne = () => {
    const step1 = document.getElementById("step-1");
    const rect = step1?.getBoundingClientRect();
    if (rect && rect.bottom < 0) {
      window.dispatchEvent(new CustomEvent("expand-sticky-bar"));
    } else {
      const bar = document.getElementById("step1-bar");
      if (bar) {
        bar.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
  // Fetch nearby availability when "Check other dates" opens in exact-date mode
  useEffect(() => {
    if (hasRange || !inlineDatesFor) return;
    if (pickDayNearbyMap[inlineDatesFor]) return; // already fetched
    const boat = (boats || []).find(b => b.id === inlineDatesFor);
    if (!boat?.tourId) return;
    const start = new Date();
    const startStr = start.toISOString().slice(0, 10);
    const end = new Date(start);
    end.setDate(end.getDate() + 20);
    const endStr = end.toISOString().slice(0, 10);
    fetch(apiUrl(`availability/shared/${boat.tourId}?start=${startStr}&end=${endStr}`))
      .then(r => r.json())
      .then(rows => {
        const map = {};
        const boatCap = (boats || []).find(b => b.id === inlineDatesFor)?.people || 14;
        for (const row of rows) map[row.date] = { available_seats: Math.min(row.available_seats, boatCap), available: row.available };
        // DEV: mirror the same mock unavailability used in availabilityMap
        if (import.meta.env.DEV) {
          const boatIdx = (boats || []).findIndex(b => b.id === inlineDatesFor);
          map["2026-04-18"] = { available_seats: 0, available: false };
          if (boatIdx < 2) map["2026-04-20"] = { available_seats: 0, available: false };
          if (boatIdx === 0) map["2026-04-22"] = { available_seats: 0, available: false };
          if (boatIdx === 0) map["2026-04-25"] = { available_seats: 2, available: true };
        }
        setPickDayNearbyMap(prev => ({ ...prev, [inlineDatesFor]: map }));
      })
      .catch(() => {});
  }, [inlineDatesFor, hasRange, boats]);
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

    // Add dynamic pricing to each boat in the list
    const listWithPrices = baseList.map(y => {
      const dateForPricing = dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart);
      const price = calculateBoatPrice(y.tourId, dateForPricing, groupSize, privateTours);
      return {
        ...y,
        priceValue: price ?? y.priceValue
      };
    });

    return listWithPrices;
  }, [dateMode, groupSize, availabilityByBoat, hasDateCriteria, exactDate, selectedFlexDate, rangeStart, privateTours, boats]);
  const sorted = useMemo(() => {
    const isAvail = (y) => !hasDateCriteria || availabilityByBoat?.[y.id]?.available !== false;
    const items = [...list];
    if (sort === "price") {
      items.sort((a, b) => a.priceValue - b.priceValue);
    } else if (sort === "comfort") {
      items.sort((a, b) => Number(b.lengthMeters) - Number(a.lengthMeters));
    } else if (sort === "soonest") {
      items.sort((a, b) => {
        const aDate = availabilityByBoat?.[a.id]?.nextAvailable;
        const bDate = availabilityByBoat?.[b.id]?.nextAvailable;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.localeCompare(bDate);
      });
    }
    // Default: sort by price to keep popular tier in center
    if (sort === "recommended") {
      items.sort((a, b) => a.priceValue - b.priceValue);
    }
    return items;
  }, [list, sort, availabilityByBoat, hasDateCriteria]);
  const totalCount = sorted.length;
  const priceRankMap = useMemo(() => {
    const byPrice = [...list].sort((a, b) => a.priceValue - b.priceValue);
    const map = {};
    byPrice.forEach((b, i) => {
      map[b.id] = {
        rank: i,
        total: byPrice.length,
        prevPrice: i > 0 ? byPrice[i - 1].priceValue : 0,
        prevBadgeName: i > 0 ? (byPrice[i - 1].badgeName || null) : null,
      };
    });
    return map;
  }, [list]);
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
      if (boat.id !== selectedBoatId) {
        onSelectFlexDate("");
      }
      openPickDayMode(boat.id);
    } else {
      onSelectBoatId(boat.id);
    }
    setTimeout(() => {
      const section = document.getElementById("tour-details-section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const offset = (window.innerHeight - rect.height) / 2;
      const top = sectionTop - Math.max(offset, 0);
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 400);
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
    const premiumIndex = sorted.length === 3 ? 1 : 0;
    setActiveIndex(premiumIndex);
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector("[data-card]");
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 12;
        carouselRef.current.scrollTo({ left: premiumIndex * (cardWidth + gap), behavior: "instant" });
      }
    }
  }, [sorted]);

  // Sync description heights across boat cards
  useEffect(() => {
    const sync = () => {
      const el = carouselRef.current;
      if (!el) return;
      const descs = el.querySelectorAll("[data-boat-desc]");
      if (descs.length < 2) return;
      descs.forEach(d => { d.style.minHeight = ""; });
      let maxH = 0;
      descs.forEach(d => { maxH = Math.max(maxH, d.offsetHeight); });
      if (maxH > 0) {
        descs.forEach(d => { d.style.minHeight = `${maxH}px`; });
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (carouselRef.current) ro.observe(carouselRef.current);
    return () => ro.disconnect();
  }, [sorted]);

  // Sync banner heights across boat cards
  useEffect(() => {
    const syncBanners = () => {
      const el = carouselRef.current;
      if (!el) return;
      const banners = el.querySelectorAll("[data-boat-banner]");
      if (banners.length < 2) return;
      banners.forEach(b => { b.style.minHeight = ""; });
      let maxH = 0;
      banners.forEach(b => { maxH = Math.max(maxH, b.offsetHeight); });
      if (maxH > 0) {
        banners.forEach(b => { b.style.minHeight = `${maxH}px`; });
      }
    };
    syncBanners();
    const ro = new ResizeObserver(syncBanners);
    if (carouselRef.current) ro.observe(carouselRef.current);
    return () => ro.disconnect();
  }, [sorted]);

  const renderPrice = (value) => typeof value === "string" ? value : formatIDR(value);

  const renderBoatCard = (boat, { isSoldOut = false, isLocked = false, isTooSmall = false, isPopular = false, upgradeCost = 0, upgradeFromName = null, tierIndex = -1 } = {}) => {
    const availability = availabilityByBoat?.[boat.id];
    const fitsGroup = groupSize <= boat.people;
    const soldOut = dateMode === "exact" && exactDate && !availability?.available;
    const isDisabled = !fitsGroup || soldOut || isSoldOut || isLocked;
    const needsExactDateSelection = dateMode === "exact" && !exactDate;
    const availableDates = availability?.availableDates ?? [];
    const dateSeatsMap = availability?.dateSeatsMap ?? {};
    const selectedDateForBoat = selectedBoatId === boat.id ? (dateMode === "exact" ? exactDate : selectedFlexDate) : "";
    const showFrom = !((dateMode === "exact" && !!exactDate) || !!selectedDateForBoat);
    const displayPerks = (Array.isArray(boat.listItems) ? boat.listItems : [])
      .map((item) => {
        const text = sanitizeDisplayText(
          typeof item === "object" ? item.text : item,
          { stripTrailingOne: true }
        );
        return text ? { text, icon: (typeof item === "object" ? item.icon : null) || "check-icon-green" } : null;
      })
      .filter(Boolean);
    const nextAvailable = availability?.nextAvailable || availableDates[0];
    const isSelected = selectedBoatId === boat.id && !isLocked;
    const isPickDayMode = inlineDatesFor === boat.id;
    const isUnavailable = isSoldOut || isTooSmall;
    const availableSeats = availability?.availableSeats ?? null;
    const lowSeats = !isSoldOut && !isTooSmall && availableSeats !== null && availableSeats > 0 && availableSeats <= 3;
    // In exact mode nearby picker, draftFlexDate is valid if it exists in nearbyMap or availableDates
    const nearbyMap = pickDayNearbyMap[boat.id] || {};
    const draftDate = hasRange
      ? (availableDates.includes(draftFlexDate) ? draftFlexDate : "")
      : (draftFlexDate && (nearbyMap[draftFlexDate]?.available !== false) ? draftFlexDate : "");
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
    const tierCfg = tierIndex >= 0 ? TIER_CONFIGS[tierIndex] : null;
    // Header strip: always show using tier config fallback
    const stripText  = tierCfg?.strip  || null;
    const stripColor = tierCfg?.stripColor || "#1a3a4a";
    // Tier label shown below image
    const tierLabel = boat.badgeName || tierCfg?.label || "";
    const tierLabelColor = boat.badgeColor || (isPopular ? "#2563eb" : "#0f6eb4");
    const tierName = tierLabel
      ? tierLabel.charAt(0).toUpperCase() + tierLabel.slice(1).toLowerCase()
      : "";
    const props = boat.boatProps || {};
    const specBoatType = [
      props.boat_type || null,
      boat.lengthMeters ? `${boat.lengthMeters}m` : null,
    ].filter(Boolean).join(" · ") || "—";
    const specShade = bfOn(props.shade) ? "Full shade · flybridge" : "Partial shade · open deck";
    return (
      <div
        className={cn(
          "group relative flex h-full w-full shrink-0 flex-col overflow-hidden rounded-3xl text-left transition-all duration-300",
          "bg-white border",
          isUnavailable
            ? "border-neutral-200 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            : isSelected
              ? "border-[#2563eb] shadow-[0_8px_32px_rgba(37,99,235,0.15),0_2px_8px_rgba(0,0,0,0.08)]"
              : isPopular && !selectedBoatId
                ? "border-[#2563eb] shadow-[0_8px_32px_rgba(37,99,235,0.15),0_2px_8px_rgba(0,0,0,0.08)]"
                : "border-neutral-200 shadow-[0_2px_16px_rgba(0,0,0,0.07)]",
          isLocked && "cursor-pointer"
        )}
        onClick={() => {
          if (!isLocked) return;
          focusStepOne();
        }}
        role={isLocked ? "button" : undefined}
      >
        {/* Coming soon overlay hidden for design */}
        <div
          className="flex h-full flex-col"
          aria-hidden={false}
        >
          {/* Image with badge pill overlay */}
          <div className="relative w-full overflow-hidden rounded-t-3xl" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <PhotoCarousel
              className="aspect-video cursor-pointer"
              images={boat.images?.length ? boat.images : [boat.cover]}
              alt={boat.name}
              onOpenGallery={(startIndex) => {
                const slides = boat.images?.length ? boat.images : [boat.cover];
                Fancybox.show(slides.map(img => ({ src: img?.path || img, type: "image" })), { startIndex: startIndex || 0 });
              }}
            />
            {stripText && (
              <div className="absolute left-3 top-3 z-10">
                <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg", isPopular ? "bg-[#2563eb]" : "bg-[#0d1b2e]/80 backdrop-blur-sm border border-white/20")}>
                  <Star className={cn("h-3 w-3", isPopular ? "fill-white text-white" : "fill-yellow-400 text-yellow-400")} />
                  <span className="text-xs font-medium uppercase tracking-widest text-white">{stripText}</span>
                </div>
              </div>
            )}
            {isSelected && (
              <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-1.5 shadow-[0_4px_16px_rgba(37,99,235,0.4)]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-widest text-white">Your pick</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-4 pt-3 sm:p-6 sm:pt-5">
            {/* Headline */}
            <h3 className="mb-1.5 sm:mb-2 text-2xl font-bold leading-tight text-secondary-900 line-clamp-3">
              {boat.headline || (boat.id === "angels" ? "Two boats (14+ guests)" : boat.name)}
            </h3>

            {/* Subheader description by tier */}
            <p className="mb-2 sm:mb-3 text-sm leading-relaxed text-secondary-500" data-boat-desc>
              {tierIndex === 0
                ? (<>Every highlight of Nusa Penida in one day — Kelingking Cliff, manta rays, and four top snorkel spots.{" "}<button type="button" onClick={(e) => { e.stopPropagation(); setFcModalBoat({ ...boat, _tierIndex: 0 }); }} className="inline text-primary-600 font-semibold hover:text-primary-700 transition-colors">See&nbsp;more&nbsp;→</button></>)
                : tierIndex === 1
                  ? (<>The full Classic experience upgraded — a dedicated pro photographer capturing your entire day.{" "}<button type="button" onClick={(e) => { e.stopPropagation(); setFcModalBoat({ ...boat, _tierIndex: 1 }); }} className="inline text-primary-600 font-semibold hover:text-primary-700 transition-colors">See&nbsp;more&nbsp;→</button></>)
                  : tierIndex === 2
                    ? (<>Our top-tier tour aboard a brand-new Fortune Yachts Eldorado with the most experienced guides in the fleet.{" "}<button type="button" onClick={(e) => { e.stopPropagation(); setFcModalBoat({ ...boat, _tierIndex: 2 }); }} className="inline text-primary-600 font-semibold hover:text-primary-700 transition-colors">See&nbsp;more&nbsp;→</button></>)
                    : boatDescriptionText || ""}
            </p>

            {/* Key highlights glass card */}
            <div className="mb-3 sm:mb-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/80 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
              {tierIndex === 0 ? (<>
                <div className="flex items-center gap-2.5"><Waves className="h-4 w-4 shrink-0 text-primary-500" /><span className="text-sm text-secondary-500"><strong className="text-secondary-800">Manta rays</strong> + 4 snorkel spots</span></div>
                <div className="flex items-center gap-2.5"><Compass className="h-4 w-4 shrink-0 text-primary-500" /><span className="text-sm text-secondary-500"><strong className="text-secondary-800">Kelingking Cliff</strong> land tour</span></div>
              </>) : tierIndex === 1 ? (<>
                <div className="flex items-center gap-2.5"><Camera className="h-4 w-4 shrink-0 text-primary-500" /><span className="text-sm text-secondary-500"><strong className="text-secondary-800">Pro photographer</strong> full day</span></div>
                <div className="flex items-center gap-2.5"><UtensilsCrossed className="h-4 w-4 shrink-0 text-primary-500" /><span className="text-sm text-secondary-500"><strong className="text-secondary-800">La Rossa Beach Club</strong> lunch</span></div>
              </>) : tierIndex === 2 ? (<>
                <div className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 shrink-0 text-primary-500" /><span className="text-sm text-secondary-500"><strong className="text-secondary-800">Drone footage</strong> + next-day delivery</span></div>
                <div className="flex items-center gap-2.5"><Ship className="h-4 w-4 shrink-0 text-primary-500" /><span className="text-sm text-secondary-500"><strong className="text-secondary-800">New yacht</strong> + senior guides only</span></div>
              </>) : null}
            </div>

            {/* Bottom section */}
            <div>
              {/* Price + max guests */}
              <div className={cn("mb-2 sm:mb-2 py-1 sm:py-2", (isSoldOut || isLocked) && "opacity-60")}>
                {isFlashSale && !isLocked && (
                  <div className="mb-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      ⚡ Flash Sale
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-1">
                    {showFrom && <span className="text-sm font-medium text-secondary-400">from</span>}
                    <span className={cn("text-2xl sm:text-3xl font-black tracking-tight", isUnavailable ? "text-primary-300" : "text-primary-600")}>
                      {boat.id === "angels" ? renderPrice(33000000) : renderPrice(draftPriceValue)}
                    </span>
                    <span className="text-sm font-medium text-secondary-400">
                      {`/ ${Math.max(1, groupSize)} person${groupSize > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 text-sm font-medium text-secondary-400 whitespace-nowrap", !isUnavailable && lowSeats && "hidden")}><Users className="h-3.5 w-3.5" />{boat.people}</span>
                    {!isUnavailable && lowSeats && (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2 sm:px-2.5 py-0.5 sm:py-1 text-2xs sm:text-xs font-bold text-amber-700 whitespace-nowrap">
                        <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                        Only {availableSeats} left
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner */}
              {isUnavailable ? (
                <div data-boat-banner className="mb-3 sm:mb-4 flex min-h-[2.25rem] items-center rounded-xl border border-red-200 bg-red-50 px-4 py-1">
                  <p className="text-xs font-semibold text-red-700">{isTooSmall ? `Not available · max ${boat.people} guests` : "Not available on selected date"}</p>
                </div>
              ) : upgradeCost > 0 && upgradeFromName ? (
                <div data-boat-banner className="mb-3 sm:mb-4 flex min-h-[2.25rem] items-center rounded-xl border border-primary-100 bg-primary-50 px-4 py-1">
                  <p className="text-xs font-semibold text-primary-700">↑ Only +{formatIDR(upgradeCost)}/person to upgrade from {upgradeFromName}</p>
                </div>
              ) : tierIndex === 0 ? (
                <div data-boat-banner className="mb-3 sm:mb-4 flex min-h-[2.25rem] items-center rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-1">
                  <p className="text-xs font-semibold text-emerald-700">✦ Best price guaranteed</p>
                </div>
              ) : null}

              {/* Action button */}
              <div className="mb-1">
                {isUnavailable ? (
                  <button type="button" onClick={(e) => { e.stopPropagation(); if (isTooSmall) { focusStepOne(); } else { openPickDayMode(boat.id); } }}
                    className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white text-sm font-bold text-secondary-800 transition-all hover:bg-neutral-50">
                    {isTooSmall ? "Change group size" : "Try another date"}<ArrowRight className="h-4 w-4" />
                  </button>
                ) : isLocked ? (
                  <button type="button" onClick={focusStepOne} className="inline-flex w-full h-11 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-200">
                    <Calendar className="h-4 w-4" />Select dates
                  </button>
                ) : dateMode === "exact" && needsExactDateSelection ? (
                  <button type="button" onClick={focusStepOne} className="inline-flex w-full h-11 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-secondary-400 transition hover:bg-neutral-200">
                    Select date first
                  </button>
                ) : isSelected ? (
                  <button type="button" onClick={(e) => { e.stopPropagation(); openPickDayMode(boat.id); }}
                    className="inline-flex w-full h-11 items-center justify-center gap-1.5 rounded-full border border-[#2563eb]/50 bg-[#2563eb]/20 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#2563eb]/30">
                    <Calendar className="h-4 w-4" />{selectedDateForBoat ? "Change date" : "Pick a date"}
                  </button>
                ) : (
                  <button type="button"
                    className={cn("inline-flex w-full h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-200",
                      isDisabled ? "border border-neutral-200 bg-neutral-50 text-secondary-300 cursor-not-allowed"
                        : isPopular ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40"
                        : "border border-neutral-300 bg-white text-secondary-800 hover:bg-neutral-50"
                    )}
                    onClick={() => { if (!hasDateCriteria) { focusStepOne(); return; } openBoat(boat); }}
                    disabled={isDisabled}>
                    {!hasDateCriteria ? "Pick a date first" : tierName ? `Select ${tierName}` : "Select"}
                    {!isDisabled && <ArrowRight className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Feature checklist — below buttons */}
            {(() => {
              const HIDDEN_PERKS = ["most experienced guides","drone photos, video","instax photos","delivered next day","delivered next morning","fortune yachts eldorado","brand-new","la rossa beach club"];
              const SPLIT_RULES = [
                { match: "gopro photos", parts: (t) => [t.replace(/,?\s*gopro photos/i, "").replace(/,\s*$/, ""), "GoPro photos"] },
                { match: "transfer & insurance", parts: () => ["Free Transfer by Shuttlebus", "Insurance"] },
                { match: "transfer and insurance", parts: () => ["Free Transfer by Shuttlebus", "Insurance"] },
              ];
              const rawPerks = (Array.isArray(boat.listItems) ? boat.listItems : [])
                .map((item) => {
                  const text = sanitizeDisplayText(typeof item === "object" ? item.text : item, { stripTrailingOne: true });
                  const icon = typeof item === "object" ? item.icon : "check-icon-green";
                  if (!text || icon === "none-icon-red" || icon === "minis-icon-red") return null;
                  const lower = text.toLowerCase();
                  if (HIDDEN_PERKS.some(h => lower.includes(h))) return null;
                  return { text, isExtra: icon === "plus-icon-green" };
                })
                .filter(Boolean);
              const perks = rawPerks.flatMap((perk) => {
                for (const rule of SPLIT_RULES) {
                  if (perk.text.toLowerCase().includes(rule.match)) {
                    return rule.parts(perk.text).filter(Boolean).map(t => ({ text: t.trim(), isExtra: perk.isExtra }));
                  }
                }
                return [perk];
              });
              if (!perks.length) return null;
              return (
                <div className="mt-4 border-t border-neutral-100 pt-3">
                  <ul className="space-y-2">
                    {perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-secondary-600">
                        {perk.isExtra ? (
                          <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-primary-600"><Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" strokeWidth={2.5} /></span>
                        ) : (
                          <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500"><Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" strokeWidth={2.5} /></span>
                        )}
                        <span>{perk.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
        </div>
        {isPickDayMode && createPortal(
          <AnimatePresence>
            {isPickDayMode && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                onClick={closePickDayMode}
              />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className={cn("fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl rounded-b-none border p-5 shadow-2xl sm:inset-0 sm:m-auto sm:h-fit sm:w-[420px] sm:rounded-3xl sm:p-6", pickDayDark ? "bg-[#111d35] border-white/10" : "bg-white border-neutral-200")}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn("text-lg font-bold tracking-tight", pickDayDark ? "text-white" : "text-secondary-900")}>Pick a day</div>
                <button
                  type="button"
                  onClick={closePickDayMode}
                  className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full border transition", pickDayDark ? "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80" : "border-neutral-200 bg-neutral-50 text-secondary-400 hover:bg-neutral-100 hover:text-secondary-700")}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex-1 overflow-y-auto">
                {hasRange ? (
                  <div className="grid grid-cols-5 gap-2 pr-1 py-1">
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
                              ? pickDayDark ? "border-primary-500 bg-primary-500/20 text-primary-300 shadow-sm scale-102" : "border-primary-500 bg-primary-50 text-primary-600 shadow-sm scale-102"
                              : isAvailable
                                ? pickDayDark ? "border-white/10 bg-white/5 text-white/70 hover:border-primary-400/30 hover:bg-primary-500/10" : "border-neutral-200 bg-neutral-50 text-secondary-700 hover:border-primary-300 hover:bg-primary-50/50"
                                : pickDayDark ? "border-white/5 bg-white/[0.02] text-white/20 opacity-50 cursor-not-allowed" : "border-neutral-100 bg-neutral-50 text-secondary-300 opacity-50 cursor-not-allowed"
                          )}
                          disabled={!isAvailable}
                        >
                          <span
                            className={cn(
                              "text-xs leading-tight font-semibold uppercase tracking-wide",
                              isPicked ? "text-primary-400" : isAvailable ? (pickDayDark ? "text-white/40" : "text-secondary-400") : (pickDayDark ? "text-white/15" : "text-secondary-300")
                            )}
                          >
                            {monthLabel}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 text-sm font-bold leading-none",
                              isPicked ? "text-primary-400" : isAvailable ? (pickDayDark ? "text-white/90" : "text-secondary-900") : (pickDayDark ? "text-white/15" : "text-secondary-300")
                            )}
                          >
                            {dayLabel}
                          </span>
                          {dateSeatsMap[date] !== undefined && (
                            <span
                              className={cn(
                                "mt-0.5 text-[10px] font-semibold leading-none",
                                dateSeatsMap[date] <= 0
                                  ? "text-red-400"
                                  : dateSeatsMap[date] <= 3
                                    ? (isPicked ? "text-primary-500" : "text-amber-500")
                                    : (isPicked ? "text-primary-400" : pickDayDark ? "text-white/50" : "text-secondary-500")
                              )}
                            >
                              {dateSeatsMap[date] > 0 ? `${dateSeatsMap[date]} seats` : "sold out"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (() => {
                  const nearbyMap = pickDayNearbyMap[inlineDatesFor] || {};
                  const nearbyDates = (() => {
                    const dates = [];
                    const cursor = new Date();
                    cursor.setDate(cursor.getDate() + 1);
                    for (let i = 0; i < 20; i++) {
                      dates.push(cursor.toISOString().slice(0, 10));
                      cursor.setDate(cursor.getDate() + 1);
                    }
                    return dates;
                  })();
                  const hasNearby = Object.keys(nearbyMap).length > 0;
                  if (!hasNearby) return (
                    <div className="flex items-center justify-center py-6">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-500" />
                    </div>
                  );
                  return (
                    <div className="grid grid-cols-5 gap-2 pr-1">
                      {nearbyDates.map((date) => {
                        const entry = nearbyMap[date];
                        const isAvail = entry ? entry.available : true;
                        const seats = entry?.available_seats ?? null;
                        const isPicked = draftFlexDate === date;
                        const parsed = new Date(`${date}T00:00:00`);
                        const monthLabel = parsed.toLocaleString("en-US", { month: "short" });
                        const dayLabel = String(parsed.getDate());
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => { if (isAvail) setDraftFlexDate(date); }}
                            disabled={!isAvail}
                            className={cn(
                              "flex min-h-58 flex-col items-center justify-center rounded-xl border px-2 py-1 transition-all duration-200",
                              isPicked
                                ? pickDayDark ? "border-primary-500 bg-primary-500/20 text-primary-300 shadow-sm scale-102" : "border-primary-500 bg-primary-50 text-primary-600 shadow-sm scale-102"
                                : isAvail
                                  ? pickDayDark ? "border-white/10 bg-white/5 text-white/70 hover:border-primary-400/30 hover:bg-primary-500/10" : "border-neutral-200 bg-neutral-50 text-secondary-700 hover:border-primary-300 hover:bg-primary-50/50"
                                  : pickDayDark ? "border-white/5 bg-white/[0.02] text-white/20 opacity-50 cursor-not-allowed" : "border-neutral-100 bg-neutral-50 text-secondary-300 opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className={cn("text-xs leading-tight font-semibold uppercase tracking-wide", isPicked ? "text-primary-400" : isAvail ? (pickDayDark ? "text-white/40" : "text-secondary-400") : (pickDayDark ? "text-white/15" : "text-secondary-300"))}>{monthLabel}</span>
                            <span className={cn("mt-0.5 text-sm font-bold leading-none", isPicked ? (pickDayDark ? "text-primary-400" : "text-primary-600") : isAvail ? (pickDayDark ? "text-white/90" : "text-secondary-900") : (pickDayDark ? "text-white/15" : "text-secondary-300"))}>{dayLabel}</span>
                            {seats !== null && (
                              <span
                                className={cn(
                                  "mt-0.5 text-[10px] font-semibold leading-none",
                                  seats <= 0
                                    ? "text-red-400"
                                    : seats <= 3
                                      ? (isPicked ? "text-primary-500" : "text-amber-500")
                                      : (isPicked ? "text-primary-400" : pickDayDark ? "text-white/50" : "text-secondary-500")
                                )}
                              >
                                {seats > 0 ? `${seats} seats` : "sold out"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {draftDate ? (
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-semibold text-secondary-400">
                      {new Date(`${draftDate}T00:00:00`).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      {isFlashSale && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">⚡ Sale</span>
                      )}
                      <span className="text-lg font-black text-primary-600 tracking-tight">
                        {boat.id === "angels" ? renderPrice(33000000) : renderPrice(draftPriceValue)}
                      </span>
                      <span className="text-sm font-medium text-secondary-400">
                        {boat.id === "angels" ? "/ 2 boats" : `/ ${Math.max(1, groupSize)} person${groupSize > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>
                ) : null}
                {/* Desktop: full button */}
                <button
                  type="button"
                  className={cn(
                    "hidden sm:inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                    draftDate
                      ? "bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:scale-98"
                      : pickDayDark ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/10" : "bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200"
                  )}
                  onClick={() => confirmPickDay(draftDate)}
                  disabled={!draftDate}
                >
                  Confirm date
                </button>
                {/* Mobile: full Continue button */}
                <button
                  type="button"
                  className={cn(
                    "sm:hidden flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                    draftDate
                      ? "bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:scale-95"
                      : pickDayDark ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                  )}
                  onClick={() => confirmPickDay(draftDate)}
                  disabled={!draftDate}
                >
                  Continue
                </button>
              </div>
            </motion.div>
            </>
          )}
          </AnimatePresence>,
          document.body
        )}
      </div >
    );
  };
  return (
    <>
      <PremiumSection
        id="step-2"
        className="bg-neutral-50 !pt-6 md:!pt-8 lg:!pt-10 !pb-4 md:!pb-6 lg:!pb-8"
        centered
      >
        <PremiumContainer>
          <div className="animate-in mb-4 sm:mb-6 flex flex-col items-center text-center">
            <h2 className="ds-h2 !text-secondary-900 mb-2 text-xl sm:text-2xl">Choose your option</h2>
            <p className="text-secondary-500 text-sm sm:text-base sm:whitespace-nowrap">
              Classic is the best value.<br className="sm:hidden" /> Premium is the relaxed version of the day.
            </p>
          </div>

          {isAvailabilityLoading && hasDateCriteria ? (
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonBoatCard key={`boat-skel-${i}`} className="w-[86vw] shrink-0 sm:w-auto" />
              ))}
            </div>
          ) : (
          <>
          {(() => {
            if (!hasDateCriteria) return null;
            const soldOutCount = sorted.filter(b => availabilityByBoat?.[b.id]?.available === false).length;
            const allSoldOut = soldOutCount === sorted.length && sorted.length > 0;
            const mostSoldOut = soldOutCount >= 2 && !allSoldOut;
            if (allSoldOut) return (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-white px-5 py-3.5">
                <div className="text-left">
                  <p className="text-sm font-semibold text-secondary-900">
                    No tours available for selected parameters
                  </p>
                  <p className="text-xs text-secondary-500">Try changing the date or number of guests.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={focusStepOne}
                    className="inline-flex items-center rounded-full border border-primary-400 bg-white px-4 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
                  >
                    Change parameters
                  </button>
                  <a
                    href="/privatenew"
                    className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                  >
                    Private tour
                  </a>
                </div>
              </div>
            );
            if (mostSoldOut) return (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-300 bg-white px-5 py-3.5">
                <div className="text-left">
                  <p className="text-sm font-semibold text-secondary-900">
                    Most tours unavailable for selected parameters
                  </p>
                  <p className="text-xs text-secondary-500">Try changing the date or number of guests.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={focusStepOne}
                    className="inline-flex items-center rounded-full border border-primary-400 bg-white px-4 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
                  >
                    Change parameters
                  </button>
                  <a
                    href="/privatenew"
                    className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                  >
                    Private tour
                  </a>
                </div>
              </div>
            );
            return null;
          })()}

          <div
            ref={carouselRef}
            className={cn(
              "boat-carousel no-scrollbar flex overflow-x-auto pb-8 pt-1 -mx-4 sm:mx-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:gap-4 sm:overflow-visible sm:pb-0 sm:pt-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:items-start",
              dateMode === "flex" || showAllBoats ? "sm:flex-col sm:overflow-visible" : ""
            )}
          >
            {sorted.map((boat) => {
              const boatSoldOut = hasDateCriteria && availabilityByBoat?.[boat.id]?.available === false;
              const boatTooSmall = groupSize > boat.people;
              const rankInfo = priceRankMap[boat.id];
              const rank = rankInfo?.rank ?? -1;
              const total = rankInfo?.total ?? 1;
              const tierIndex = total === 3 ? rank : total === 2 ? (rank === 0 ? 0 : 2) : -1;
              const isPopular = tierIndex === 1;
              const upgradeCost = rank > 0 && rankInfo?.prevPrice ? boat.priceValue - rankInfo.prevPrice : 0;
              const prevTierIndex = tierIndex > 0 ? tierIndex - 1 : -1;
              const upgradeFromName = rank > 0 ? (rankInfo?.prevBadgeName || TIER_CONFIGS[prevTierIndex]?.label || null) : null;
              return (
                <div
                  key={boat.id}
                  data-card
                  data-boat-id={boat.id}
                  className={cn(
                    "relative flex min-h-70vh w-[86vw] sm:w-full shrink-0 sm:min-h-0 sm:h-full mx-1.5 sm:mx-0 first:ml-4 last:mr-4 sm:first:ml-0 sm:last:mr-0",
                    (dateMode === "flex" || showAllBoats) && "mb-4 sm:mb-0"
                  )}
                >
                  {renderBoatCard(boat, { isSoldOut: boatSoldOut, isTooSmall: boatTooSmall, isPopular, upgradeCost, upgradeFromName, tierIndex })}
                </div>
              );
            })}
          </div>
          {isMobile && totalCount > 1 && dateMode !== "flex" && !showAllBoats ? (
            <div className="mt-1 flex items-center justify-center gap-2">
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
                      "rounded-full transition-all duration-200",
                      isActive ? "h-2 w-2 bg-primary-600" : "h-1.5 w-1.5 bg-primary-200"
                    )}
                    aria-label={`Go to boat ${dotIndex + 1}`}
                  />
                );
              })}
            </div>
          ) : null}
          {isMobile && !hasSwiped && totalCount > 1 && dateMode !== "flex" && !showAllBoats ? (
            <div className="mt-2 flex items-center justify-center gap-1 text-sm text-secondary-300">
              <ChevronLeft className="h-3 w-3" />
              <span>Swipe</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          ) : null}
          {/* View all boats button removed for mobile */}
          {isMobile && showAllBoats && dateMode !== "flex" && (
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
          {/* Feature checklists now inside individual cards */}
          </>
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
                <span className="text-xs font-semibold text-secondary-400">{`/ ${Math.max(1, confirmModalData.adults + (confirmModalData.kids || 0))} person${(confirmModalData.adults + (confirmModalData.kids || 0)) > 1 ? "s" : ""}`}</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 px-4 pb-4 pt-4 flex items-center gap-3">
              <button
                type="button"
                className="flex-1 h-11 rounded-full border border-neutral-200 bg-white text-sm font-semibold text-secondary-700 transition hover:bg-neutral-50"
                onClick={() => {
                  setConfirmModalData(null);
                  setTimeout(() => {
                    document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 80);
                }}
              >
                Another option
              </button>
              <Button
                className="flex-1 rounded-full h-11 text-sm font-black normal-case tracking-normal transition-all hover:scale-101 active:scale-98"
                onClick={() => {
                  setConfirmModalData(null);
                  setTimeout(() => {
                    (() => { const t = document.getElementById("tour-details-section"); if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); } })();
                  }, 80);
                }}
              >
                Tour details <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <ScheduleModal
        isOpen={!!scheduleModalBoat}
        onClose={() => setScheduleModalBoat(null)}
        title={fetchedRouteSchedule?.title || scheduleModalBoat?.name}
        schedule={fetchedRouteSchedule || scheduleModalBoat?.routeSchedule}
        isLoading={isFetchingRouteSchedule}
        restaurantData={fetchedRouteSchedule?.restaurant}
        onRestaurantClick={(r) => setRouteRestaurantPopup(r)}
        sectionLabels={{ beforeLunch: "Morning", afterLunch: "Afternoon" }}
        allBoats={sorted.filter(b => b.routeId)}
        currentBoatId={scheduleModalBoat?.id}
        onSwitchBoat={(b) => setScheduleModalBoat(b)}
      />
      <RestaurantModal
        restaurantData={routeRestaurantPopup}
        onClose={() => setRouteRestaurantPopup(null)}
      />

      {/* ── First Class Experience Modal ── */}
      <Modal
        isOpen={!!fcModalBoat}
        onClose={() => setFcModalBoat(null)}
        maxWidth="max-w-3xl"
        bodyClassName="p-0"
        showClose={false}
        hideDragHandle
      >
        {fcModalBoat && (() => {
          const boat = fcModalBoat;
          const tierIdx = boat._tierIndex ?? 2;
          const slides = boat.images?.length ? boat.images : [boat.cover];
          const schedule = fcSchedule || boat.routeSchedule;
          const scheduleItems = schedule
            ? [...(schedule.beforeLunch || []), ...(schedule.afterLunch || [])]
            : [];
          const highlights = boat.included?.length ? boat.included : TIER_HIGHLIGHT_CARDS[tierIdx] || [];
          const chips = boat.includes?.length ? boat.includes : TIER_EXTRA_CHIPS[tierIdx] || [];
          const restaurant = fcRestaurant;
          const restaurantPhotos = restaurant?.images_with_thumbs?.length
            ? restaurant.images_with_thumbs.map(img => ({ thumb: img.thumb, path: img.original || img.hero || img.thumb }))
            : restaurant?.image ? [{ thumb: restaurant.image, path: restaurant.image }] : [];
          const props = boat.boatProps || {};
          const specBoatType = [props.boat_type || null, boat.lengthMeters ? `${boat.lengthMeters}m` : null].filter(Boolean).join(" · ") || "—";
          const specShade = bfOn(props.shade) ? "Full shade · flybridge" : "Partial shade · open deck";
          const PERK_HEADERS = ["everything in classic", "everything in premium", "everything in standard", "plus:"];
          const perks = (Array.isArray(boat.listItems) ? boat.listItems : [])
            .map(item => {
              const text = sanitizeDisplayText(typeof item === "object" ? item.text : item, { stripTrailingOne: true });
              if (!text) return null;
              const lower = text.toLowerCase();
              if (PERK_HEADERS.some(h => lower.includes(h))) return null;
              return text;
            })
            .filter(Boolean);

          const openGallery = (startIndex) => {
            Fancybox.show(slides.map(img => ({ src: img?.path || img?.thumb || img, type: "image" })), { startIndex: startIndex || 0 });
          };
          const imgSrc = (s) => s?.thumb || s?.path || s;

          return (
            <div className="relative">
              {/* Sticky close button */}
              <div className="sticky top-0 z-20 pointer-events-none h-0">
                <button
                  type="button"
                  onClick={() => setFcModalBoat(null)}
                  className="pointer-events-auto absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/60 bg-white/90 backdrop-blur-sm shadow-sm text-secondary-500 transition-all hover:bg-white hover:text-secondary-900 sm:right-4 sm:top-4"
                  aria-label="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* 1. Photo mosaic + title */}
              {/* Desktop: 1 large left + 2 small right */}
              <div className={cn("hidden sm:grid gap-1.5 p-5 pb-0 sm:p-6 sm:pb-0", slides.length > 1 ? "grid-cols-[3fr_2fr]" : "grid-cols-1")}>
                <button type="button" onClick={() => openGallery(0)} className="relative overflow-hidden rounded-2xl group/img cursor-pointer">
                  <img src={imgSrc(slides[0])} alt={boat.name} className="h-full w-full object-cover aspect-[4/3] transition-transform duration-500 group-hover/img:scale-[1.03]" loading="eager" />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                </button>
                {slides.length > 1 && <div className="grid grid-rows-2 gap-1.5">
                  {slides.slice(1, 3).map((s, i) => (
                    <button key={i} type="button" onClick={() => openGallery(i + 1)} className="relative overflow-hidden rounded-2xl group/img cursor-pointer">
                      <img src={imgSrc(s)} alt="" className="h-full w-full object-cover aspect-[3/2] transition-transform duration-500 group-hover/img:scale-[1.03]" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                      {i === 1 && slides.length > 3 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-white"><Maximize className="h-4 w-4" />+{slides.length - 3} photos</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>}
              </div>
              {/* Mobile: single hero + view all */}
              <div className="sm:hidden relative">
                <PhotoCarousel
                  className="aspect-[4/3]"
                  images={slides}
                  alt={boat.name}
                  alwaysShowControls
                  maximizeLeft
                  onOpenGallery={openGallery}
                />
              </div>

              {/* Title block below photos */}
              {(() => {
                const tierBadge = TIER_CONFIGS[tierIdx];
                const tierColors = { 0: "bg-primary-500", 1: "bg-indigo-500", 2: "bg-emerald-500" };
                const badgeBg = tierColors[tierIdx] || "bg-primary-500";
                const descriptions = {
                  0: "The essential Nusa Penida experience — Kelingking Cliff, manta rays, and four top snorkel spots.",
                  1: "The full Classic experience upgraded — pro photographer, La Rossa Beach Club, and sunset prosecco.",
                  2: "Our top-tier experience aboard a brand-new yacht with the most experienced guides in the fleet.",
                };
                return (
              <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1", badgeBg)}>
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">{tierBadge?.label || boat.badgeName || "Tour"}</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-secondary-900 leading-tight">
                  {boat.headline || boat.name}
                </h2>
                <p className="mt-1.5 text-sm text-secondary-500 max-w-lg leading-relaxed">
                  {descriptions[tierIdx] || boat.description || ""}
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-secondary-400">from</span>
                  <span className="text-lg font-black tracking-tight text-primary-600">{formatIDR(boat.priceValue)}</span>
                  <span className="text-xs text-secondary-400">/ person</span>
                </div>
              </div>
                );
              })()}

              <div className="px-5 sm:px-6 py-6 space-y-8">
                {/* 2. Key highlights */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">What makes it special</h3>
                  {(() => {
                    const tc = { 0: { card: "border-primary-200/50 bg-primary-50/50 hover:bg-primary-50/70", iconBg: "bg-primary-500/10", iconText: "text-primary-600" }, 1: { card: "border-indigo-200/50 bg-indigo-50/50 hover:bg-indigo-50/70", iconBg: "bg-indigo-500/10", iconText: "text-indigo-600" }, 2: { card: "border-emerald-200/50 bg-emerald-50/50 hover:bg-emerald-50/70", iconBg: "bg-emerald-500/10", iconText: "text-emerald-600" } };
                    const c = tc[tierIdx] || tc[0];
                    return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {highlights.map((card) => {
                      const Icon = card.icon;
                      const title = card.name || card.title;
                      const desc = card.description || card.desc;
                      return (
                        <div key={title} className={cn("flex flex-col items-center text-center rounded-2xl border px-3 py-4 transition-all", c.card)}>
                          <div className={cn("mb-2.5 flex h-11 w-11 items-center justify-center rounded-full", c.iconBg)}>
                            {card.icon_svg
                              ? <span className={cn("h-5 w-5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-current", c.iconText)} dangerouslySetInnerHTML={{ __html: card.icon_svg }} />
                              : Icon ? <Icon className={cn("h-5 w-5", c.iconText)} strokeWidth={1.5} /> : null}
                          </div>
                          <div className="text-sm font-semibold text-secondary-900">{title}</div>
                          {desc && <div className="mt-0.5 text-xs leading-normal text-secondary-500">{desc}</div>}
                        </div>
                      );
                    })}
                  </div>
                    );
                  })()}
                </div>

                {/* 3. Everything included */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">Everything included</h3>
                  {(() => {
                    const chipColors = { 0: { border: "border-primary-200", icon: "text-primary-600" }, 1: { border: "border-indigo-200", icon: "text-indigo-600" }, 2: { border: "border-emerald-200", icon: "text-emerald-600" } };
                    const cc = chipColors[tierIdx] || chipColors[0];
                    return (
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const Icon = chip.icon;
                      const label = chip.name || chip.label;
                      return (
                        <span key={label} className={cn("inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium text-secondary-700", cc.border)}>
                          {chip.icon_svg
                            ? <span className={cn("h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:stroke-current", cc.icon)} dangerouslySetInnerHTML={{ __html: chip.icon_svg }} />
                            : Icon ? <Icon className={cn("h-3.5 w-3.5", cc.icon)} strokeWidth={1.5} /> : null}
                          {label}
                        </span>
                      );
                    })}
                    {perks.map((text, i) => {
                      const isDuplicate = chips.some(c => c.label.toLowerCase() === text.toLowerCase());
                      if (isDuplicate) return null;
                      return (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-secondary-600">
                          <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
                          {text}
                        </span>
                      );
                    })}
                  </div>
                    );
                  })()}
                </div>

                {/* 4. Your boat */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">Your boat</h3>
                  <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/80 p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
                        <Ship className="h-5 w-5 text-primary-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-secondary-900">{boat.name}</div>
                        {specBoatType !== "—" && <div className="text-xs text-secondary-500">{specBoatType}</div>}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 text-sm text-secondary-600 whitespace-nowrap">
                        <Users className="h-4 w-4 shrink-0 text-primary-500" />
                        <span>Up to <strong className="text-secondary-800">{boat.people}</strong> guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary-600 whitespace-nowrap">
                        <Sun className="h-4 w-4 shrink-0 text-primary-500" />
                        <span>{specShade}</span>
                      </div>
                      {bfOn(props.starlink) && (
                        <div className="flex items-center gap-2 text-sm text-secondary-600 whitespace-nowrap">
                          <Globe className="h-4 w-4 shrink-0 text-primary-500" />
                          <span>High-speed <strong className="text-secondary-800">Starlink</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Day schedule */}
                {scheduleItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-4">Your day on the water</h3>
                    <div className="relative pl-10 space-y-0">
                      {/* Timeline line */}
                      {(() => {
                        const tl = { 0: { line: "from-primary-300 via-primary-200 to-primary-100", dot: "bg-primary-50 border-primary-400", icon: "text-primary-600", time: "text-primary-600" }, 1: { line: "from-indigo-300 via-indigo-200 to-indigo-100", dot: "bg-indigo-50 border-indigo-400", icon: "text-indigo-600", time: "text-indigo-600" }, 2: { line: "from-emerald-300 via-emerald-200 to-emerald-100", dot: "bg-emerald-50 border-emerald-400", icon: "text-emerald-600", time: "text-emerald-600" } };
                        const t = tl[tierIdx] || tl[0];
                        return (<>
                      <div className={cn("absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b", t.line)} />
                      {scheduleItems.map((item, i) => {
                        const Icon = resolveScheduleIcon(item.title);
                        const detailsRaw = sanitizeDisplayText(item.details, { stripTrailingOne: true });
                        return (
                          <div key={i} className="relative flex gap-3 pb-6 last:pb-0">
                            <div className={cn("absolute -left-10 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 z-10", t.dot)}>
                              <Icon className={cn("h-4 w-4", t.icon)} strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold tabular-nums", t.time)}>{item.time ? item.time.replace(/\./g, ":") : ""}</span>
                                <span className="text-sm font-semibold text-secondary-900">{item.title}</span>
                              </div>
                              {detailsRaw && <p className="mt-0.5 text-xs text-secondary-500 leading-relaxed">{detailsRaw}</p>}
                            </div>
                          </div>
                        );
                      })}
                        </>);
                      })()}
                    </div>
                  </div>
                )}

                {/* 6. Restaurant */}
                {restaurant && restaurant.name && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-3">Lunch included</h3>
                    <div className="rounded-2xl border border-neutral-200/60 overflow-hidden sm:flex sm:items-stretch">
                      {restaurantPhotos.length > 0 && (
                        <div className="sm:w-1/2 sm:shrink-0">
                          <PhotoCarousel
                            className="aspect-[16/9] sm:aspect-[4/3]"
                            images={restaurantPhotos}
                            alt={restaurant.name}
                            alwaysShowControls
                            onOpenGallery={(i) => {
                              Fancybox.show(restaurantPhotos.map(img => ({ src: img.path || img.thumb, type: "image" })), { startIndex: i || 0 });
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4 sm:w-1/2 sm:flex sm:flex-col sm:justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <UtensilsCrossed className="h-4 w-4 text-primary-500" />
                          <span className="text-base font-bold text-secondary-900">{restaurant.name}</span>
                        </div>
                        {restaurant.description && (
                          <p className="text-sm text-secondary-500 leading-relaxed">{sanitizeDisplayText(restaurant.description, { stripTrailingOne: true })}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })()}
      </Modal>
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-soft via-transparent to-transparent rounded-xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/20 to-transparent" />

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
      // Prefer tour photos: find the matching vibe (tour) by slug/id
      const matchedVibe = vibes.find(v => v.id === style.slug || v.id === String(style.id));
      const tourImages = matchedVibe
        ? [matchedVibe.hero, ...(matchedVibe.photos || []).map(p => p?.thumb || p?.path || p)].filter(Boolean)
        : [];

      const images = tourImages.length
        ? tourImages
        : (style.photos || []).map(p => p.thumb || p.path);

      if (!images.length) {
        // Last resort: pool from all vibes
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
    return () => track.removeEventListener("scroll", handleScroll);
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
          if (data?.restaurant && typeof data.restaurant === "object") { setter(data.restaurant); return; }
          const rid = data?.restaurant_id || (typeof data?.restaurant === "number" ? data.restaurant : null);
          if (rid) {
            fetchRestaurant(rid).then((r) => { if (!cancelled) setter(r); }).catch(() => { if (!cancelled) setter(null); });
          } else {
            setter(null);
          }
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
          <div className="no-scrollbar flex gap-0 overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory sm:grid sm:gap-4 sm:overflow-visible sm:pb-0 sm:snap-none sm:grid-cols-2 lg:grid-cols-3">
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
                !showAllStyles ? "snap-x snap-mandatory" : "flex-col overflow-visible px-4"
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
                      <DayStyleCarousel
                        images={images}
                        activeIndex={activeIndex}
                        onChange={(nextIndex) => {
                          setActiveSlideByStyleId((prev) => ({ ...prev, [style.id || style.slug]: nextIndex }));
                        }}
                        onOpenGallery={() => {
                          const fullPaths = (style.photos || []).map(p => p.path || p.thumb).filter(Boolean);
                          Fancybox.show((fullPaths.length ? fullPaths : images).map(src => ({ src, type: "image" })), {
                            startIndex: activeIndex,
                            hideScrollbar: false,
                          });
                        }}
                      />
                    </div>
                    <div
                      className="flex flex-1 flex-col gap-2 p-4 pt-5"
                    >
                      <div className="flex items-center gap-2 min-h-9">
                        <span className="inline-flex h-5 w-5 items-center justify-center">
                          <span className={cn("flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 transition-colors", isSelected && "bg-primary-100")}>
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-xl bg-secondary-300 transition-colors",
                                isSelected && "bg-primary-600 h-2 w-2"
                              )}
                            />
                          </span>
                        </span>
                        <div className="text-base sm:text-xl font-semibold text-secondary-900">{style.title}</div>
                        {addOnBadge ? (
                          <div className="group/tooltip relative ml-auto flex items-center">
                            <span className="inline-flex cursor-help items-center rounded-full border border-primary-200 bg-neutral-100 px-2 py-0.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                              {typeof addOnBadge === 'string' ? addOnBadge : "Add-on"}
                            </span>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100 z-50">
                              <div className="rounded-xl bg-secondary-900 px-3 py-2.5 text-xs font-medium leading-relaxed text-white shadow-xl">
                                This route is built around add-ons — we’ll suggest extras in the next steps.
                                <div className="absolute -bottom-1 right-4 h-3 w-3 rotate-45 rounded-sm bg-secondary-900"></div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="line-clamp-2 text-sm font-medium text-secondary-500 min-h-10">
                        {style.description}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveItineraryId(style.id || style.slug);
                        }}
                        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-4"
                      >
                        See itinerary
                      </button>
                      <div className="flex min-h-3.75 flex-wrap content-start gap-x-3 gap-y-2">
                        {chips.map((item) => {
                          const Icon = typeof item.icon === 'string' ? ICON_MAP[item.icon] || MapPin : item.icon;
                          return (
                            <Pill key={item.label} icon={Icon}>
                              {item.label}
                            </Pill>
                          );
                        })}
                      </div>
                      <div className="mt-auto flex flex-col gap-3 pt-1">
                        {style.best_for || style.bestFor ? (
                          <div className="flex min-h-5 items-start gap-2 text-sm font-semibold leading-5 text-secondary-500">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{style.best_for || style.bestFor}</span>
                          </div>
                        ) : <div className="min-h-5" />}
                        {isSelected ? (
                          <Button
                            className="w-full"
                            disabled
                          >
                            <Check className="h-4 w-4" />
                            Selected
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="primary"
                            className="w-full"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectionError(false);
                              onSelectStyleId(style.id || style.slug);
                            }}
                          >
                            Select route
                          </Button>
                        )}
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
              <div className="mt-4 flex justify-center">
                <Button
                  variant="secondary"
                  className="rounded-full bg-white hover:bg-neutral-50 px-6 font-bold"
                  onClick={() => setShowAllStyles(true)}
                >
                  View all routes
                </Button>
              </div>
            )}
            {isMobile && showAllStyles && (
              <div className="mt-4 flex justify-center">
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
          <div className="animate-in mb-8">
            <h2 className="ds-h2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-heading)' }}>Tour details</h2>
            <p className="mt-2 text-base" style={{ color: 'var(--text-muted)' }}>
              Review itinerary, whats included, pickup, and safety then reserve.
            </p>
          </div>
          {(() => {
            const schedule = scheduleByStyleId[selectedStyleId];
            const style = styles.find(s => String(s.id) === String(selectedStyleId) || s.slug === selectedStyleId);
            const note = addOnNoteByStyleId[selectedStyleId];
            return (
              <TourDetailsCard
                withTimeline
                style={style}
                schedule={schedule}
                note={note}
                restaurant={selectedRestaurantData || style?.restaurant}
                onRestaurantClick={setRestaurantDataPopup}
                schedulePhotos={style?.schedule_photos}
                onAnotherRoute={() => document.getElementById("step-2")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                onContinue={onContinue}
                continueLabel="Choose your tour"
                infoContent={(activeTab) => {
                  if (activeTab === "included") return (
                    <TourTabContent
                      activeTab="included"
                      includedSections={tourInfo.includedSections.map(section => ({ ...section, items: section.items.map(item => ({ ...item, icon: ICON_MAP[item.icon] })) }))}
                      cancellationSummaryCards={[]}
                      weatherGuaranteeCards={[]}
                      tourIncluded={style?.included}
                      tourIncludes={style?.includes}
                    />
                  );
                  if (activeTab === "pickup") return (
                    <div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <img src="https://bluuu.tours/storage/app/media/driver.webp" alt="Bluuu transfer" className="h-40 w-full sm:w-48 shrink-0 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-lg font-bold text-white">Complimentary shuttle</h4>
                            <Button data-cta="primary" onClick={() => {
                                const el = document.getElementById("step-3");
                                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                setTimeout(() => window.dispatchEvent(new CustomEvent("open-transfer-modal")), 600);
                              }}
                              size="sm"
                              className="hidden sm:inline-flex h-11 px-6 shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                              Book transfer
                            </Button>
                          </div>
                          <p className="mt-1 text-sm text-white/50 leading-relaxed">Free pickup from major tourist hubs. After booking, we message the exact timing and the closest pickup point.</p>
                          <p className="mt-1 text-sm text-primary-400">Optional: private transfer upgrade for faster, more comfortable pickup.</p>
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
                              "Shuttle picks you up",
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
                    </div>
                  );
                  return null;
                }}
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
  const selectedTransfer = transfers?.find((t) => String(t.id) === String(selectedTransferId));
  const [expandedTransferDetailsId, setExpandedTransferDetailsId] = useState(null);
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
  const transferOptions = (
    <div className="flex flex-col divide-y divide-neutral-100">
      {/* Option: No thanks */}
      <label className={cn(
        "group flex items-center gap-4 px-6 py-4 cursor-pointer transition-all",
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
        <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center">
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
              "group flex items-center gap-4 px-6 py-4 cursor-pointer transition-all",
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
                    <span className="text-sm font-medium text-secondary-400">/ group</span>
                  </div>
                  {hasTransferDetails && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setExpandedTransferDetailsId(prev => prev === transfer.id ? null : transfer.id);
                      }}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                      aria-label={`See transfer details for ${finalName}`}
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>{String(expandedTransferDetailsId) === String(transfer.id) ? "Hide description" : "See full description"}</span>
                      {String(expandedTransferDetailsId) === String(transfer.id) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  {hasTransferDetails && String(expandedTransferDetailsId) === String(transfer.id) && (
                    <div
                      className="mt-2 text-xs leading-relaxed text-secondary-600 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5"
                      dangerouslySetInnerHTML={{ __html: transfer.description || transfer.short_description || transferDetails.description }}
                    />
                  )}
                </div>
              </div>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center">
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
                  <AddressAutocomplete
                    value={pickupAddress}
                    onChange={(val) => handlePickupChange(val)}
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
                      <AddressAutocomplete
                        value={dropoffAddress}
                        onChange={(val) => onSetDropoffAddress && onSetDropoffAddress(val)}
                        placeholder="Enter your dropoff address"
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none"
                      />
                    )}
                    <label className="mt-2 flex cursor-pointer items-center gap-2">
                      <input
                        id="transfer-same-address"
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
      {showCovers && (
        <CoversCompact
          covers={covers}
          selectedCoverId={selectedCoverId}
          onSelectCoverId={onSelectCoverId}
          formatPrice={formatIDR}
          showHeader={showHeader}
          framed={framed}
        />
      )}
      {
        showContinue && (
          <div className="flex justify-end mt-6">
            <Button size="md" className="px-8 shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)]" onClick={onContinue}>
              Review your booking <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
      kicker="STEP 3 OF 4"
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
  const { categories, sharedRoutes: privateRoutes } = useExtras();
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
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [pickerQty, setPickerQty] = useState(1);
  const [justAddedId, setJustAddedId] = useState(null);
  const [draftQuantities, setDraftQuantities] = useState({});
  const [isExtrasOpen, setIsExtrasOpen] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const closeManageExtras = useCallback(() => {
    setIsManageExtrasOpen?.(false);
  }, [setIsManageExtrasOpen]);
  const activeExtraForPopup = useMemo(
    () => (activeExtraId ? extrasCatalog.find((e) => e.id === activeExtraId) : null),
    [activeExtraId, extrasCatalog]
  );
  useEffect(() => {
    if (!activeExtraForPopup) {
      setSelectedChildId(null);
      setDescExpanded(false);
      setPickerQty(1);
      setJustAddedId(null);
      return;
    }
    setPickerQty(1);
    setJustAddedId(null);
    if (activeExtraForPopup.hasChildren && activeExtraForPopup.children?.length) {
      // Find currently selected child or default to first
      const currentSelected = activeExtraForPopup.children.find(c => selectedExtras[c.id] > 0);
      setSelectedChildId(currentSelected ? currentSelected.id : activeExtraForPopup.children[0].id);
    } else {
      setSelectedChildId(null);
    }
    setDraftQuantities((prev) => {
      const next = { ...prev };
      if (activeExtraForPopup.hasChildren && activeExtraForPopup.children?.length) {
        activeExtraForPopup.children.forEach((child) => {
          const maxChildQty = child.available != null ? Math.max(1, Number(child.available)) : Infinity;
          next[child.id] = Math.min(Number(selectedExtras[child.id] || 0), maxChildQty);
        });
      } else {
        const maxQty = activeExtraForPopup.available != null ? Math.max(1, Number(activeExtraForPopup.available)) : Infinity;
        next[activeExtraForPopup.id] = Math.max(1, Math.min(1, maxQty));
      }
      return next;
    });
  }, [activeExtraForPopup]);
  const getDraftQty = (id, max = Infinity) => {
    const raw = draftQuantities[id];
    const normalized = Number.isFinite(raw) ? raw : 1;
    return Math.max(1, Math.min(normalized, max));
  };
  const updateDraftQty = (id, next, max = Infinity) => {
    setDraftQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(next, max)),
    }));
  };
  const activeExtraMaxQty =
    activeExtraForPopup?.available != null ? Math.max(1, Number(activeExtraForPopup.available)) : Infinity;
  const isActiveExtraSoldOut =
    activeExtraForPopup?.available != null && Number(activeExtraForPopup.available) <= 0;
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
  const getUnitLabel = (extra) => (extra.pricingType === "per_person" ? "/ person" : "/ group");
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
      pricingType: "per_person",
      quantity: totalGuests,
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
            <div className="line-clamp-1 text-base leading-tight font-bold leading-tight text-secondary-900 sm:line-clamp-2 sm:text-base sm:leading-tight">
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
        <div className="flex w-104 shrink-0 flex-col items-end justify-center gap-1">
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
        className="bg-transparent !py-4 md:!py-6 scroll-mt-20"
      >
        <PremiumContainer>
          <div className="mb-5 flex flex-col items-center text-center">
            <h2 className="ds-h2 !text-secondary-900">Transfer & insurance</h2>
            <p className="mt-1 text-sm text-secondary-500">Optional — add only what you need.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <div className={cn("flex flex-col gap-4")}>
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
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
                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
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
                          formatPrice={formatIDR}
                          showHeader={false}
                          framed={false}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* TourInfoInline removed — content moved to Tour details tabs */}
                {onReview && (
                  <div className="mt-3 flex justify-center sm:justify-end">
                    <Button size="md" className="w-full sm:w-auto px-8 shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)]" onClick={onReview}>
                      Review your booking <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!activeExtraId && !!activeExtraForPopup}
        onClose={() => setActiveExtraId(null)}
        maxWidth="max-w-screen-sm"
        bodyClassName="p-0 max-h-none overflow-hidden"
        showClose={false}
      >
        {activeExtraForPopup ? (() => {
          const hasChildren = activeExtraForPopup.hasChildren && activeExtraForPopup.children?.length > 0;
          const currentItem = hasChildren
            ? activeExtraForPopup.children.find((c) => c.id === selectedChildId) || activeExtraForPopup.children[0]
            : activeExtraForPopup;
          const isSoldOut = currentItem?.available != null && Number(currentItem.available) <= 0;
          const maxQty = currentItem?.available != null ? Math.max(1, Number(currentItem.available)) : Infinity;
          const qty = getDraftQty(currentItem?.id, maxQty);
          const draftTotal = hasChildren
            ? activeExtraForPopup.children.reduce((sum, c) => sum + Math.max(0, draftQuantities[c.id] ?? 0) * Number(c.price || 0), 0)
            : qty * Number(currentItem?.price || 0);
          const draftCount = hasChildren
            ? activeExtraForPopup.children.reduce((sum, c) => sum + Math.max(0, draftQuantities[c.id] ?? 0), 0)
            : qty;
          const handleConfirm = () => {
            if (hasChildren) {
              activeExtraForPopup.children.forEach(child => {
                onChangeExtraQty(child.id, Math.max(0, draftQuantities[child.id] ?? 0));
              });
            } else {
              onChangeExtraQty(currentItem.id, qty);
            }
            setActiveExtraId(null);
          };
          const handleSkip = () => {
            setActiveExtraId(null);
          };
          const imgSrc = (hasChildren && currentItem?.images_with_thumbs?.[0]?.thumb) ||
            activeExtraForPopup.images_with_thumbs?.[0]?.thumb ||
            extraImageById[activeExtraForPopup.id] ||
            extraImageById[activeExtraForPopup.name?.toLowerCase().replace(/\s+/g, "-")] ||
            extraFallbackImage;
          const addedItems = hasChildren
            ? activeExtraForPopup.children.filter(c => (draftQuantities[c.id] ?? 0) > 0)
            : [];
          const selectedChild = hasChildren
            ? activeExtraForPopup.children.find(c => c.id === selectedChildId) || activeExtraForPopup.children[0]
            : null;
          const selectedSoldOut = selectedChild?.available != null && Number(selectedChild.available) <= 0;
          const selectedMaxQty = selectedChild?.available != null ? Math.max(1, Number(selectedChild.available)) : 99;

          return (
            <div className="flex h-full w-full flex-col overflow-hidden bg-white">
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-100 bg-white px-5 py-3 sm:py-4">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-secondary-900 leading-tight">{activeExtraForPopup.name}</h2>
                </div>
                <button
                  onClick={() => setActiveExtraId(null)}
                  className="group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-secondary-600 transition-all hover:bg-neutral-100 hover:text-secondary-900"
                  type="button"
                >
                  <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="custom-scrollbar flex-1 overflow-y-auto">
                <div className="relative overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={hasChildren ? (currentItem?.name || activeExtraForPopup.name) : activeExtraForPopup.name}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                    <span className="text-sm font-semibold text-white drop-shadow">
                      {hasChildren ? (currentItem?.name || activeExtraForPopup.name) : activeExtraForPopup.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-4">
                  {activeExtraForPopup.description && (
                    <div className="text-sm leading-relaxed text-secondary-600" dangerouslySetInnerHTML={{ __html: activeExtraForPopup.description }} />
                  )}

                  {activeExtraForPopup.details?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeExtraForPopup.details.map((detail) => (
                        <div key={detail} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-secondary-600">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}

                  {hasChildren && (
                    <div className="space-y-3">
                      <div className="relative">
                        <select
                          value={selectedChildId || ""}
                          onChange={(e) => { setSelectedChildId(e.target.value); setPickerQty(1); }}
                          className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-secondary-900 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 transition"
                        >
                          {activeExtraForPopup.children.map((child) => {
                            const childSoldOut = child.available != null && Number(child.available) <= 0;
                            return (
                              <option key={child.id} value={child.id} disabled={childSoldOut}>
                                {child.name}{childSoldOut ? " (Sold out)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      </div>
                      {!selectedSoldOut && (
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white">
                            <button type="button" onClick={() => setPickerQty(v => Math.max(1, v - 1))} disabled={pickerQty <= 1} className="flex h-10 w-10 items-center justify-center text-secondary-500 hover:bg-neutral-50 disabled:opacity-30 transition rounded-l-xl">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-bold tabular-nums text-secondary-900">{pickerQty}</span>
                            <button type="button" onClick={() => setPickerQty(v => Math.min(selectedMaxQty, v + 1))} disabled={pickerQty >= selectedMaxQty} className="flex h-10 w-10 items-center justify-center text-secondary-500 hover:bg-neutral-50 disabled:opacity-30 transition rounded-r-xl">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary-600 min-w-12">{formatIDR((selectedChild?.price || 0) * pickerQty)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDraftQuantities(prev => ({ ...prev, [selectedChildId]: (Number(prev[selectedChildId] || 0) + pickerQty) }));
                              setPickerQty(1);
                              setJustAddedId(selectedChildId);
                              setTimeout(() => setJustAddedId(null), 1200);
                            }}
                            className={cn(
                              "flex-1 h-10 rounded-xl text-sm font-bold transition",
                              justAddedId === selectedChildId
                                ? "border-2 border-green-500 bg-green-50 text-green-600"
                                : "border-2 border-primary-500 bg-white text-primary-600 hover:bg-primary-50"
                            )}
                          >
                            {justAddedId === selectedChildId ? <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Added</> : "+ Add"}
                          </button>
                        </div>
                      )}
                      {addedItems.length > 0 && (
                        <div className="border-t border-neutral-100 pt-1">
                          <div className="text-2xs font-bold uppercase tracking-widest text-secondary-400 py-2">Your selection</div>
                          {addedItems.map((child, idx) => (
                            <div key={child.id} className={cn("flex items-center gap-3 py-3", idx > 0 && "border-t border-neutral-100")}>
                              {child.images_with_thumbs?.[0]?.thumb ? (
                                <img src={child.images_with_thumbs[0].thumb} alt={child.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                              ) : child.emoji ? (
                                <span className="text-xl">{child.emoji}</span>
                              ) : null}
                              <span className="flex-1 truncate text-sm font-medium text-secondary-800">{child.name}</span>
                              <span className="text-sm text-secondary-400">× {draftQuantities[child.id]}</span>
                              <span className="text-sm font-bold text-secondary-900 min-w-12 text-right">{formatIDR(child.price * Number(draftQuantities[child.id] || 0))}</span>
                              <button type="button" onClick={() => setDraftQuantities(prev => ({ ...prev, [child.id]: 0 }))} className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-400 hover:border-red-200 hover:text-red-500 transition">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasChildren && (
                    <div className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                      isSoldOut ? "border-neutral-200 bg-white opacity-50" : "border-primary-300 bg-primary-50"
                    )}>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-secondary-400 mb-0.5">Quantity</div>
                        <div className="text-xs font-bold text-primary-600">{isSoldOut ? "Sold out" : formatIDR(currentItem.price)}</div>
                      </div>
                      {!isSoldOut && (
                        <div className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-white px-1.5">
                          <button type="button" onClick={() => updateDraftQty(currentItem.id, qty - 1, maxQty)} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-secondary-500 hover:bg-neutral-100 disabled:opacity-30 transition" disabled={qty <= 1}><Minus className="h-3 w-3" /></button>
                          <span className="min-w-6 text-center text-sm font-bold tabular-nums text-primary-600">{qty}</span>
                          <button type="button" onClick={() => updateDraftQty(currentItem.id, qty + 1, maxQty)} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-secondary-500 hover:bg-neutral-100 disabled:opacity-30 transition" disabled={qty >= maxQty}><Plus className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer: Skip + Confirm */}
              <div className="shrink-0 border-t border-neutral-100 bg-white px-5 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-secondary-400">Add-on total</div>
                    <div className="text-base font-bold text-secondary-900">
                      {draftTotal > 0 ? formatIDR(draftTotal) : <span className="text-secondary-300 font-normal text-sm">—</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-secondary-600 hover:bg-neutral-50 transition"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={draftCount === 0}
                      className={cn(
                        "inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-bold transition",
                        draftCount > 0 ? "border-2 border-secondary-900 bg-white text-secondary-900 hover:bg-neutral-50" : "cursor-not-allowed border border-neutral-200 bg-white text-neutral-300"
                      )}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })() : null}
      </Modal>
    </>
  );
}
function WhyBookNow() {
  const trustItems = [
    { icon: Ticket, title: "Lock today's rate", description: "Prices can rise — secure the current rate." },
    { icon: Calendar, title: "Stay flexible", description: "Cancel anytime or reschedule with ease." },
    { icon: Clock, title: "Smart decision", description: "Reserve now and keep full flexibility." },
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
  availabilityMap,
  calendarAvailMap,
  onCalendarMonthChange,
  selectedBoatId,
  transfers,
  selectedTransferId,
  onSelectTransferId,
  transferConfirmed,
  onTransferConfirm,
  covers,
  selectedCoverId,
  onSelectCoverId,
  coverConfirmed,
  onCoverConfirm,
  pickupAddress,
  onSetPickupAddress,
  dropoffAddress,
  onSetDropoffAddress,
  pickupAddressConfirmed = false,
  onSetPickupAddressConfirmed,
  dropoffAddressConfirmed = false,
  onSetDropoffAddressConfirmed,
  pendingTransferModal,
  onPendingTransferModalConsumed,
}) {
  const [activeEditor, setActiveEditor] = useState(null);
  const contacts = useSiteContacts();
  const totalGuests = (adults || 0) + (kids || 0);
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
      label: "Tour",
      icon: Ship,
      value: selectedBoat?.name ?? "Not selected",
      action: isBoatSelected ? "Change" : "Select",
      onClick: () => {
        const target = document.getElementById("step-2");
        if (target) {
          const nav = document.querySelector("nav") || document.querySelector("header");
          const navH = nav ? nav.getBoundingClientRect().height : 0;
          const y = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      },
    },
  ];
  const [expandedRow, setExpandedRow] = useState(null);
  useEffect(() => {
    if (pendingTransferModal) {
      setExpandedRow("transfer-modal");
      onPendingTransferModalConsumed?.();
    }
  }, [pendingTransferModal, onPendingTransferModalConsumed]);
  const [transferInfoModal, setTransferInfoModal] = useState(null);
  const [expandedTransferDetailId3, setExpandedTransferDetailId3] = useState(null);
  const [showSharedMap, setShowSharedMap] = useState(false);
  const [skipSharedAddress, setSkipSharedAddress] = useState(false);
  const [sameSharedAddress, setSameSharedAddress] = useState(false);
  const [expandedCoverDetailId3, setExpandedCoverDetailId3] = useState(null);
  const selectedTransferForAddress = transfers?.find(t => String(t.id) === String(selectedTransferId));
  const isShuttleTransfer = selectedTransferForAddress?.name?.toLowerCase().includes("shuttle") || selectedTransferForAddress?.name?.toLowerCase().includes("free");
  const hasDropoffTransfer = selectedTransferForAddress?.name?.toLowerCase().includes("drop");
  const pickupAddressNeedsConfirm = Boolean(selectedTransferId && !isShuttleTransfer && !skipSharedAddress && pickupAddress && pickupAddress.trim() && !pickupAddressConfirmed);
  const dropoffAddressNeedsConfirm = Boolean(selectedTransferId && !isShuttleTransfer && hasDropoffTransfer && !sameSharedAddress && !skipSharedAddress && dropoffAddress && dropoffAddress.trim() && !dropoffAddressConfirmed);
  const addressNeedsConfirm = pickupAddressNeedsConfirm || dropoffAddressNeedsConfirm;
  const isReserveEnabled = isDateSelected && isBoatSelected && !addressNeedsConfirm;
  const reserveLabel = !isDateSelected
    ? "Select date to continue"
    : !isBoatSelected
      ? "Select option to continue"
      : addressNeedsConfirm
        ? "Confirm pickup address to continue"
        : "RESERVE WITH 30%";
  const handleRowClick = (row) => {
    if (row.expandable) {
      setExpandedRow(expandedRow === row.id ? null : row.id);
      return;
    }
    if (row.id === "date" || row.id === "guests") {
      window.dispatchEvent(new CustomEvent("expand-sticky-bar"));
      return;
    }
    closeEditor();
    row.onClick?.();
  };
  const handleReserve = () => {
    if (!isReserveEnabled) return;
    window.dispatchEvent(new CustomEvent("collapse-sticky-bar"));
    onReserve?.();
  };
  return (
    <PremiumSection
      id="step-review"
      backgroundClassName={SECTION_BACKGROUNDS.mist}
    >
      <PremiumContainer>
        <div className="mb-4 sm:mb-6 flex flex-col items-center text-center">
          <h2 className="ds-h2 !text-secondary-900 mb-2 text-xl sm:text-2xl">Review your tour</h2>
          <p className="text-secondary-500 text-sm sm:text-base">Confirm details before reserving.</p>
        </div>
        {/* InfoLinksRow removed — info available in Tour Details */}
        <div className="mt-6 grid gap-8 lg:grid-cols-asymmetric-base lg:items-start">
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-neutral-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <div className="px-5 pt-5 pb-3">
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
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                              <Icon className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-secondary-900">{row.label}</div>
                              <div className={cn("mt-0.5 text-sm", valueTone)}>{row.value}</div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-primary-600 shrink-0">{row.action}</span>
                        </button>
                        {row.id === "date" && isEditingDate && (
                          <Modal
                            open={isEditingDate}
                            onClose={closeEditor}
                            title="Choose a date"
                            subtitle="Available dates for your selected tour"
                            maxWidth="max-w-lg"
                          >
                            <div className="space-y-4 px-1">
                              <CustomDatePicker
                                mode="single"
                                inline
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
                                    return val === undefined || val.available > 0;
                                  };
                                })()}
                                renderDayContents={(() => {
                                  const boatMap = selectedBoatId && calendarAvailMap ? calendarAvailMap[selectedBoatId] : null;
                                  if (!boatMap || Object.keys(boatMap).length === 0) return undefined;
                                  return (dayOfMonth, date) => {
                                    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                                    const val = boatMap[iso];
                                    const seats = val?.available_seats;
                                    return (
                                      <>
                                        <span className="day-number">{dayOfMonth}</span>
                                        {seats !== undefined && (
                                          <span className="day-sub">{seats > 0 ? (seats > 10 ? "10+" : `${seats} left`) : "full"}</span>
                                        )}
                                      </>
                                    );
                                  };
                                })()}
                                onMonthChange={onCalendarMonthChange}
                                className="w-full rounded-xl bg-white"
                              />
                              <div className="flex flex-wrap gap-2">
                                <Button type="button" onClick={applyDateEdit} size="sm">
                                  Apply
                                </Button>
                                <Button type="button" variant="secondary" onClick={closeEditor} size="sm">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </Modal>
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

            </div>

            {/* Add-ons: Transfer & Insurance — Variant C style */}
            <div className="mt-4 space-y-3">
              {/* Transfer — compact summary row */}
              <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent("collapse-sticky-bar")); setExpandedRow("transfer-modal"); }}
                style={!transferConfirmed ? { animation: "addon-pulse 2s ease-out infinite" } : undefined}
                className={cn("flex w-full items-center gap-3.5 rounded-3xl border bg-white p-4 text-left transition-all", selectedTransferId ? "border-primary-200" : "border-neutral-200", transferConfirmed && "shadow-[0_2px_16px_rgba(0,0,0,0.07)]")}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                  <Car className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary-600">Transfer</div>
                  <div className="mt-0.5 text-base font-semibold text-secondary-900">
                    {transferConfirmed ? (selectedTransferId ? (transfers?.find(tr => String(tr.id) === String(selectedTransferId))?.name || "Selected") : "Make my own way") : "Not selected"}
                  </div>
                  <div className={cn("mt-0.5 text-sm font-semibold", transferConfirmed ? (() => { const p = selectedTransferId ? (transfers?.find(tr => String(tr.id) === String(selectedTransferId))?.price || 0) : 0; return p === 0 ? "text-emerald-600" : "text-primary-700"; })() : "text-secondary-400")}>
                    {transferConfirmed ? (() => { const p = selectedTransferId ? (transfers?.find(tr => String(tr.id) === String(selectedTransferId))?.price || 0) : 0; return p === 0 ? "Free" : formatIDR(p); })() : "—"}
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-600 shrink-0">{transferConfirmed ? "Edit" : "Select"}</span>
              </button>

              {/* Insurance — compact summary row */}
              <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent("collapse-sticky-bar")); setExpandedRow("insurance-modal"); }}
                style={!coverConfirmed ? { animation: "addon-pulse 2s ease-out infinite 0.5s" } : undefined}
                className={cn("flex w-full items-center gap-3.5 rounded-3xl border bg-white p-4 text-left transition-all", selectedCoverId ? "border-emerald-200" : "border-neutral-200", coverConfirmed && "shadow-[0_2px_16px_rgba(0,0,0,0.07)]")}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Trip protection</div>
                  <div className="mt-0.5 text-base font-semibold text-secondary-900">
                    {coverConfirmed ? (selectedCoverId ? (covers?.find(cv => String(cv.id) === String(selectedCoverId))?.name || "Selected") : "No coverage") : "Not selected"}
                  </div>
                  <div className={cn("mt-0.5 text-sm font-semibold", coverConfirmed ? (() => { const p = selectedCoverId ? (covers?.find(cv => String(cv.id) === String(selectedCoverId))?.price || 0) : 0; return p === 0 ? "text-emerald-600" : "text-primary-700"; })() : "text-secondary-400")}>
                    {coverConfirmed ? (() => { const p = selectedCoverId ? (covers?.find(cv => String(cv.id) === String(selectedCoverId))?.price || 0) : 0; return p === 0 ? "Free" : formatIDR(p * totalGuests); })() : "—"}
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-600 shrink-0">{coverConfirmed ? "Change" : "Select"}</span>
              </button>
            </div>

            {/* Transfer picker modal */}
            <Modal open={expandedRow === "transfer-modal"} onClose={() => setExpandedRow(null)} maxWidth="max-w-2xl" showClose hideDragHandle
              title="Transfer" bodyClassName="px-6 pb-6 pt-3"
              footer={
                <div className="space-y-3">
                  <div className="text-sm text-secondary-500">
                    Selected: <b className="text-secondary-900">{selectedTransferId ? (transfers?.find(tr => String(tr.id) === String(selectedTransferId))?.name || "—") : "Free shuttle"}</b>
                  </div>
                  <Button
                    className="h-12 w-full text-sm !font-black disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(() => {
                      if (!selectedTransferId || skipSharedAddress) return false;
                      const selT = transfers?.find(tr => String(tr.id) === String(selectedTransferId));
                      const isShuttleSel = selT?.name?.toLowerCase().includes("shuttle") || selT?.name?.toLowerCase().includes("free");
                      if (isShuttleSel) return false;
                      const hasDropoffSel = selT?.name?.toLowerCase().includes("drop");
                      const pickupNeedsConfirm = Boolean(pickupAddress && pickupAddress.trim() && !pickupAddressConfirmed);
                      const dropoffNeedsConfirm = Boolean(hasDropoffSel && !sameSharedAddress && dropoffAddress && dropoffAddress.trim() && !dropoffAddressConfirmed);
                      return pickupNeedsConfirm || dropoffNeedsConfirm;
                    })()}
                    onClick={() => { onTransferConfirm?.(); setExpandedRow(null); }}
                  >
                    Confirm
                  </Button>
                </div>
              }>
              <div>
                  <div className="space-y-2.5">
                    {/* Self-arrival */}
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
                    {/* Transfers from API */}
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
                              <>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setExpandedTransferDetailId3(prev => prev === t.id ? null : t.id); }}
                                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100">
                                  <Info className="h-3.5 w-3.5" />
                                  {expandedTransferDetailId3 === t.id ? "Hide description" : "See full description"}
                                  {expandedTransferDetailId3 === t.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </button>
                                {expandedTransferDetailId3 === t.id && (() => {
                                  const name = (t.name || "").toLowerCase();
                                  const isShuttle = name.includes("shuttle") || name.includes("free");
                                  const TRANSFER_IMAGE = "https://bluuu.tours/storage/app/media/driver.webp";
                                  const PRIVATE_DESC = "Book your transfer with us for a smooth trip! If you come on your own, you can take an online taxi (Go-Jek or Grab) to Serangan in the morning. But for the return, online taxis are not allowed by local government. You'll need a local taxi, which is very expensive. It's best to book your return transfer in advance with us!";
                                  const SHUTTLE_HUBS = ["Canggu/Berawa", "Batu Belig", "Seminyak", "Legian/Kuta"];
                                  if (isShuttle) {
                                    return (
                                      <div className="mt-2 space-y-2.5 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3">
                                        <p className="text-xs text-secondary-600 leading-relaxed">
                                          Free pickup from major tourist hubs. After booking, we message the exact timing and the closest pickup point. Expect a short 5–10 minute pickup window based on your area. <span className="italic text-primary-600">Optional: private transfer upgrade for faster, more comfortable pickup.</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-secondary-700">
                                          <Anchor className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                                          <span><b>Meeting point:</b> Serangan Harbor (Bluuu lounge)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {SHUTTLE_HUBS.map(h => (
                                            <span key={h} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-secondary-700">
                                              <MapPin className="h-3 w-3 text-primary-500" strokeWidth={1.5} />{h}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="mt-2 text-xs text-secondary-600 leading-relaxed rounded-xl border border-neutral-100 bg-neutral-50/60 p-3">
                                      {PRIVATE_DESC}
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                          <span className={cn("text-base font-semibold shrink-0", !t.price || t.price === 0 ? "text-emerald-600" : "text-primary-700")}>{!t.price || t.price === 0 ? "Free" : formatIDR(t.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Address fields — hidden for Free Shuttle Bus */}
                  {selectedTransferId && (() => {
                    const selT = transfers?.find(tr => String(tr.id) === String(selectedTransferId));
                    const isShuttle = selT?.name?.toLowerCase().includes("shuttle") || selT?.name?.toLowerCase().includes("free");
                    if (isShuttle) return null;
                    const hasDropoff = selT?.name?.toLowerCase().includes("drop");
                    return (
                      <div className="mt-4 space-y-3">
                        {!skipSharedAddress && (
                          <>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Pickup address</label>
                              <AddressAutocomplete
                                value={pickupAddress || ""}
                                onChange={(val) => {
                                  onSetPickupAddress?.(val);
                                  if (sameSharedAddress && onSetDropoffAddress) onSetDropoffAddress(val);
                                }}
                                confirmed={pickupAddressConfirmed}
                                onConfirmedChange={(val) => {
                                  onSetPickupAddressConfirmed?.(val);
                                  if (sameSharedAddress) onSetDropoffAddressConfirmed?.(val);
                                }}
                                placeholder="Enter your hotel or villa address"
                                className="mt-1 w-full h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                              />
                            </div>
                            {hasDropoff && !sameSharedAddress && (
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Dropoff address</label>
                                <AddressAutocomplete
                                  value={dropoffAddress || ""}
                                  onChange={(val) => onSetDropoffAddress?.(val)}
                                  confirmed={dropoffAddressConfirmed}
                                  onConfirmedChange={(val) => onSetDropoffAddressConfirmed?.(val)}
                                  placeholder="Enter your dropoff address"
                                  className="mt-1 w-full h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                                />
                              </div>
                            )}
                            {showSharedMap && (
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
                                <input type="checkbox" checked={sameSharedAddress}
                                  onChange={(e) => {
                                    setSameSharedAddress(e.target.checked);
                                    if (e.target.checked && onSetDropoffAddress) {
                                      onSetDropoffAddress(pickupAddress || "");
                                      onSetDropoffAddressConfirmed?.(pickupAddressConfirmed);
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600" />
                                <span className="text-xs text-secondary-400">Same address for pickup and dropoff</span>
                              </label>
                            )}
                          </>
                        )}
                        <label className="flex cursor-pointer items-center gap-2">
                          <input type="checkbox" checked={skipSharedAddress}
                            onChange={(e) => {
                              setSkipSharedAddress(e.target.checked);
                              if (e.target.checked) {
                                onSetPickupAddress?.("");
                                onSetDropoffAddress?.("");
                                onSetPickupAddressConfirmed?.(false);
                                onSetDropoffAddressConfirmed?.(false);
                              }
                            }}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600" />
                          <span className="text-xs text-secondary-400">Skip for now — add address in your account later</span>
                        </label>
                      </div>
                    );
                  })()}
                </div>
            </Modal>

            {/* Insurance picker modal */}
            <Modal open={expandedRow === "insurance-modal"} onClose={() => setExpandedRow(null)} maxWidth="max-w-2xl" showClose hideDragHandle
              title="Trip protection"
              footer={
                <div className="space-y-3">
                  <div className="text-sm text-secondary-500">
                    Selected: <b className="text-secondary-900">{selectedCoverId ? (covers?.find(cv => String(cv.id) === String(selectedCoverId))?.name || "Coverage") : "No coverage"}</b>
                  </div>
                  <Button className="h-12 w-full text-sm !font-black" onClick={() => { onCoverConfirm?.(); setExpandedRow(null); }}>
                    Confirm
                  </Button>
                </div>
              }>
              <div className="space-y-2.5">
                  <button type="button" onClick={() => onSelectCoverId?.(null)}
                    className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all", !selectedCoverId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                    <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", !selectedCoverId ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                      {!selectedCoverId && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
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
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-secondary-900">{c.name}</div>
                          <div className="text-xs text-secondary-500 mt-0.5">100% refund cancellation protection</div>
                          {(c.description || c.short_description) && (
                            <>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setExpandedCoverDetailId3(prev => prev === c.id ? null : c.id); }}
                                className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100">
                                <Info className="h-3.5 w-3.5" />
                                {expandedCoverDetailId3 === c.id ? "Hide description" : "See full description"}
                                {expandedCoverDetailId3 === c.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                              {expandedCoverDetailId3 === c.id && (
                                <div className="mt-2 space-y-1.5 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-xs text-secondary-600 leading-relaxed">
                                  <p className="font-semibold text-secondary-900">Fully Flexible Ticket with 100% Refund Cancellation Protection</p>
                                  <p>Upgrade to a fully flexible ticket:</p>
                                  <ul className="space-y-1 list-none">
                                    <li>– x1 time reschedule at no extra charge</li>
                                    <li>– 100% refund for: sickness, accident, COVID-19, "Bali belly", hangover, flight disruption, adverse weather, transport failure, pre-existing conditions, theft, bike crash, home emergency</li>
                                  </ul>
                                  <p className="italic text-secondary-400">Refund does not apply to car transportation if service was already provided.</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-semibold text-primary-700">{formatIDR(c.price)}</span>
                          <span className="text-xs text-secondary-400 sm:ml-1 block sm:inline">/ person</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </Modal>

            {/* Trust alert popups */}
          </div>
          <div className="lg:self-start">
          <div className="rounded-3xl border border-neutral-200 bg-white px-5 pt-5 pb-8 flex flex-col shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
            <div className="text-lg font-semibold text-secondary-900">Price summary</div>
            <div className="mt-[46px] space-y-3 text-sm text-secondary-600">
              <div className="flex items-center justify-between">
                <span>Boat base price</span>
                <span className="text-base font-semibold text-secondary-900">{formatIDR(basePrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Extras</span>
                <span className="text-base font-semibold text-secondary-900">{formatIDR(extrasSubtotalIDR)}</span>
              </div>
              {guestFeeTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span>Guest fee ({groupSize} guests)</span>
                  <span className="text-base font-semibold text-secondary-900">{formatIDR(guestFeeTotal)}</span>
                </div>
              )}
              <div className="h-px w-full bg-neutral-200 my-2" />
              <div className="flex items-center justify-between text-base font-semibold text-secondary-900">
                <span>Pay today (30%)</span>
                <span className="text-xl font-black text-primary-500">{formatIDR(Math.round((basePrice + guestFeeTotal + extrasSubtotalIDR) * 0.3))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pay at check-in (70%)</span>
                <span className="text-base font-semibold text-secondary-900">{formatIDR((basePrice + guestFeeTotal + extrasSubtotalIDR) - Math.round((basePrice + guestFeeTotal + extrasSubtotalIDR) * 0.3))}</span>
              </div>
              <div className="h-px w-full bg-neutral-200 my-2" />
              <div className="flex items-center justify-between">
                <span>Total price</span>
                <span className="text-base font-semibold text-secondary-900">{formatIDR(basePrice + guestFeeTotal + extrasSubtotalIDR)}</span>
              </div>
            </div>
            <div className="mt-7 space-y-4">
              <Button type="button" onClick={handleReserve} size="md" className="w-full" disabled={!isReserveEnabled}>
                {reserveLabel} {isReserveEnabled ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
              <div className="text-center text-sm text-secondary-500">
                {isReserveEnabled ? "Only 30% today · Remaining balance at check-in" : ""}
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
// GallerySection, SocialProof, QuickFAQSection, WhyBluuu, LunchHighlight removed (moved to components/booking/sections)
// Included removed (moved to components/booking/sections)
// QuickFAQSection replaced by direct use of BookingMiniFAQ or FAQSection
// LunchHighlight logic moved to components/booking/sections/LunchHighlight.jsx
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
            <div className="absolute right-3 top-3 rounded-xl bg-white/90 px-3 py-1 text-sm font-semibold text-secondary-600 shadow-card">
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
const SCHEDULE_ICON_MAP_SHARED = {
  Coffee, Ship, Waves, Car, Wine, Sparkles, Star, MapPin, Camera, Fish,
  Clock, Anchor, Compass, Users, Sun, UtensilsCrossed,
};

function buildGroupsFromRouteShared(before = [], after = []) {
  const toItem = (raw) => {
    if (raw.type === "or-chip") return { type: "or-chip" };
    return {
      time: raw.time || "",
      duration: raw.duration || "",
      title: raw.title || "",
      icon: SCHEDULE_ICON_MAP_SHARED[raw.icon] || Ship,
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
  if (before.length > 0) groups.push({ label: "Morning", range: "", items: before.map(toItem) });
  if (after.length > 0) groups.push({ label: "Afternoon", range: "", items: after.map(toItem) });
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
      return buildGroupsFromRouteShared(before || [], after || []);
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
      <div className="grid gap-4 lg:grid-cols-12">
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
                            <div className="flex shrink-0 flex-col gap-1.5">
                              {s.images ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInfoItem(s);
                                    setInfoPhoto(0);
                                    setDetailsOpen(false);
                                  }}
                                  className="rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-secondary-600 transition hover:border-neutral-300"
                                >
                                  More info
                                </button>
                              ) : null}
                              {s.isAddon && s.extraId && onHighlightExtra ? (
                                <button
                                  type="button"
                                  onClick={() => onHighlightExtra(s.extraId)}
                                  className="rounded-xl border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
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
// Included removed (moved to components/booking/sections)
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
      price: `from ${formatUSD(35)}`,
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
      price: `${formatUSD(1200)}+`,
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
      price: `from ${formatUSD(799)}`,
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
                  <div className="text-3xl font-bold text-white">{formatUSD(1200)}+</div>
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
          <div className="min-w-4/5 snap-start rounded-xl border border-neutral-200 bg-white p-4 sm:min-w-0">
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


function BookingMini() {
  const [adults, setAdults] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });
  const { sharedTours } = useTours();
  const initialPrice = sharedTours?.[0]?.show_price || sharedTours?.[0]?.gross_price || 0;
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
      {remainingSeats !== null && remainingSeats > 0 && remainingSeats < 8 ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Popular date — only {remainingSeats} seat{remainingSeats === 1 ? "" : "s"} left
        </div>
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
export default function Shared_tour_01() {
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, []);
  const { selectedCurrency } = useCurrency();
  const contacts = useSiteContacts();
  const { sharedTours, sharedTransfers: transfers, sharedCovers: allCovers, loading } = useTours();
  const { extras, sharedRoutes: privateRoutes } = useExtras();
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
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [coverConfirmed, setCoverConfirmed] = useState(false);
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
  const [pickupAddressConfirmed, setPickupAddressConfirmed] = useState(false);
  const [dropoffAddressConfirmed, setDropoffAddressConfirmed] = useState(false);
  const [inlineRouteSchedule, setInlineRouteSchedule] = useState(null);
  const [isFetchingInlineRoute, setIsFetchingInlineRoute] = useState(false);
  const [inlineRestaurantPopup, setInlineRestaurantPopup] = useState(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [payMode, setPayMode] = useState("part");
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
    trackPixelViewContent({ contentName: "Shared Tour", value: 0, currency: "IDR" });
  }, []);

  const yachtOptions = useMemo(() => {
    // Backend already filters by classes_id=9 (shared tours)
    const validTours = sharedTours || [];
    if (!validTours.length) return [];
    // Map the filtered tours to shared options.
    const options = validTours.map((tour) => {
      // Price from show_price / gross_price for shared tours (per guest)
      const defaultPrice = Number(tour.show_price) || Number(tour.gross_price) || Number(tour.price) || 0;
      const json = tour.json || {};
      const scheduleRaw = Array.isArray(json.schedule) ? json.schedule : Array.isArray(tour.schedule) ? tour.schedule : [];
      const schedule = scheduleRaw
        .map((item) => ({
          label: String(item.label || item.title || item.name || "").trim(),
          detail: String(item.detail || item.description || item.text || item.subtitle || "").trim(),
          time: String(item.time || "").trim(),
          duration: String(item.duration || "").trim(),
          section: String(item.section || item.group || item.part || "").toLowerCase().trim(),
        }))
        .filter((item) => item.label);
      const rawList = Array.isArray(tour.list)
        ? tour.list
        : Array.isArray(tour?.json?.list)
          ? tour.json.list
          : [];
      const listItems = rawList
        .map((item) => {
          if (typeof item === "string") return { text: item.trim(), icon: "check-icon-green" };
          if (item && typeof item === "object") {
            const text = String(item.text || item.test || item.title || "").trim();
            return text ? { text, icon: item.icon || "check-icon-green" } : null;
          }
          return null;
        })
        .filter(Boolean);
      // Build route schedule from embedded route data (returned by API) or fall back to routes list
      const embeddedRoute = tour.route || null;
      const routeId = tour.route_id ?? null;
      const linkedRoute = embeddedRoute
        || (routeId ? (privateRoutes || []).find(r => Number(r.id) === Number(routeId)) : null);
      const routeSchedule = linkedRoute
        ? {
          title: linkedRoute.popup_title || linkedRoute.title || "",
          beforeLunch: Array.isArray(linkedRoute.schedule_before_lunch) ? linkedRoute.schedule_before_lunch : [],
          afterLunch: Array.isArray(linkedRoute.schedule_after_lunch) ? linkedRoute.schedule_after_lunch : [],
          footerNotes: linkedRoute.popup_afternoon ? [linkedRoute.popup_afternoon] : [],
          restaurant: linkedRoute.restaurant ?? null,
          schedulePhotos: Array.isArray(linkedRoute.schedule_photos) ? linkedRoute.schedule_photos : [],
        }
        : null;
      return {
        id: tour.slug || String(tour.id),
        tourId: tour.id,
        name: tour.name || "Shared Tour",
        slug: tour.slug || "",
        priceValue: defaultPrice,
        isPartner: tour.account_id !== 1 && !!tour.account_id,
        people: Number(tour.capacity) || 14,
        lengthMeters: getBoatLength(tour),
        cover: tour.images_with_thumbs?.[0]?.thumb1 || tour.images_with_thumbs?.[0]?.original || "",
        cover_small: tour.images_with_thumbs?.[0]?.thumb1_small || "",
        images: tour.images_with_thumbs?.map(img => ({ path: img.original || img.thumb1 || "", thumb: img.thumb1 || img.original || "", thumb_small: img.thumb1_small || "" })) || [],
        description: tour.description || "",
        listItems,
        packages: tour.packages,
        priceSuffix: "/ guest",
        schedule,
        routeId: routeId || (linkedRoute?.id ? Number(linkedRoute.id) : null),
        routeSchedule,
        status: tour.status || "ready",
        fleetSize: Number(tour.fleet_size) || 0,
        badgeName: tour.badge_name || null,
        badgeColor: tour.badge_color || null,
        boatProps: tour.props || {},
        headline: tour.json?.subtitle || tour.json?.headline || "",
        included: Array.isArray(tour.included) ? tour.included : [],
        includes: Array.isArray(tour.includes) ? tour.includes : [],
      };
    });
    // Final uniqueness sweep to prevent React duplicate key errors
    return Array.from(new Map(options.map(opt => [opt.id, opt])).values());
  }, [sharedTours, privateRoutes]);
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
  // Keep URL in sync with selections so reload / browser back / sharing restores state
  // (mirrors shared.jsx). The `tour` param round-trips against yachtOptions.tourId,
  // so write the selected boat's tourId (shared boats are keyed by slug, not id).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (exactDate) p.set("date", exactDate); else p.delete("date");
    p.set("adults", String(adults));
    p.set("kids", String(kids));
    if (selectedBoatId) {
      const t = yachtOptions.find((y) => y.id === selectedBoatId)?.tourId;
      if (t != null) p.set("tour", String(t));
    } else {
      p.delete("tour");
    }
    if (selectedTransferId) p.set("transfer", String(selectedTransferId)); else p.delete("transfer");
    if (selectedCoverId) p.set("cover", String(selectedCoverId)); else p.delete("cover");
    history.replaceState(null, "", `?${p.toString()}`);
  }, [exactDate, adults, kids, selectedBoatId, selectedTransferId, selectedCoverId, yachtOptions]);
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
      const queryParams = hasExact
        ? `?date=${searchExactDate}`
        : `?start=${searchRangeStart}&end=${searchRangeEnd}`;
      const results = {};
      try {
        await Promise.all(
          yachtOptions.map(async (yacht) => {
            if (!yacht.tourId) return;
            try {
              const res = await fetch(apiUrl(`availability/shared/${yacht.tourId}${queryParams}`));
              if (!res.ok) return;
              const rows = await res.json(); // [{ tour_id, date, available_seats, available, price_per_person }]
              if (!results[yacht.id]) results[yacht.id] = {};
              for (const row of rows) {
                results[yacht.id][row.date] = {
                  available_seats: Math.min(row.available_seats, yacht.people || 14),
                  available: row.available,
                  price_per_person: row.price_per_person,
                  boat_id: row.boat_id,
                };
              }
            } catch (err) {
              console.error(`Failed to fetch availability for ${yacht.name}:`, err);
            }
          })
        );
        // DEV: inject mock unavailability states for UI testing
        if (import.meta.env.DEV && yachtOptions.length) {
          const DATE_ALL_SOLDOUT  = "2026-04-18"; // все туры заняты
          const DATE_TWO_SOLDOUT  = "2026-04-20"; // 2 тура заняты
          const DATE_ONE_SOLDOUT  = "2026-04-22"; // 1 тур занят
          const DATE_LOW_SEATS    = "2026-04-25"; // мало мест (2) у первого тура
          yachtOptions.forEach((yacht, idx) => {
            if (!results[yacht.id]) results[yacht.id] = {};
            results[yacht.id][DATE_ALL_SOLDOUT] = { available_seats: 0, available: false };
            if (idx < 2) results[yacht.id][DATE_TWO_SOLDOUT] = { available_seats: 0, available: false };
            if (idx === 0) results[yacht.id][DATE_ONE_SOLDOUT] = { available_seats: 0, available: false };
            if (idx === 0) results[yacht.id][DATE_LOW_SEATS]   = { available_seats: 2, available: true };
          });
        }
        setAvailabilityMap(results);
      } catch (err) {
        console.error("Failed to fetch shared pricing/availability:", err);
      } finally {
        setIsAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [yachtOptions, searchDateMode, searchExactDate, searchRangeStart, searchRangeEnd]);

  // Preload availability for the calendar month when boat is selected or month changes
  useEffect(() => {
    if (!selectedBoatId) return;
    const yacht = yachtOptions.find((y) => y.id === selectedBoatId);
    if (!yacht?.tourId) return;
    const [year, month] = calendarMonth.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    fetch(apiUrl(`availability/shared/${yacht.tourId}?start=${start}&end=${end}`))
      .then((r) => r.json())
      .then((rows) => {
        const monthMap = {};
        for (const row of rows) monthMap[row.date] = row;
        setCalendarAvailMap((prev) => ({
          ...prev,
          [selectedBoatId]: { ...(prev[selectedBoatId] || {}), ...monthMap },
        }));
      })
      .catch(console.error);
  }, [selectedBoatId, calendarMonth, yachtOptions]);

  // Global picker month — tracks the month currently visible in the main date picker
  const [globalPickerMonth, setGlobalPickerMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [globalMonthAvailCache, setGlobalMonthAvailCache] = useState({});
  // Fetch all-tours availability for the month shown in the main date picker
  useEffect(() => {
    if (!yachtOptions.some((y) => y.tourId)) return;
    if (globalMonthAvailCache[globalPickerMonth]) return; // already cached
    const [year, month] = globalPickerMonth.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    Promise.all(
      yachtOptions.filter((y) => y.tourId).map((yacht) =>
        fetch(apiUrl(`availability/shared/${yacht.tourId}?start=${start}&end=${end}`))
          .then((r) => r.json())
          .catch(() => [])
      )
    ).then((allResults) => {
      // For each date, track the max available seats across all tours
      const dateMaxSeats = {};
      for (const rows of allResults) {
        for (const row of rows) {
          const prev = dateMaxSeats[row.date] ?? -1;
          if (row.available_seats > prev) dateMaxSeats[row.date] = row.available_seats;
        }
      }
      // DEV: apply same mock data so picker matches card states
      if (import.meta.env.DEV) {
        dateMaxSeats["2026-04-18"] = 0;
        // 2026-04-20: 2 out of 3 tours sold out, but one still has seats — leave as is
        // 2026-04-22: 1 tour sold out — leave others
      }
      setGlobalMonthAvailCache((prev) => ({ ...prev, [globalPickerMonth]: dateMaxSeats }));
    });
  }, [globalPickerMonth, yachtOptions]);

  const isDateAvailable = useCallback((boatId, dateStr, groupSize = 1) => {
    if (!dateStr) return false;
    const boatMap = availabilityMap[boatId];
    // Not fetched yet — assume available
    if (!boatMap || Object.keys(boatMap).length === 0) return true;
    const entry = boatMap[dateStr];
    if (entry === undefined) return true; // date not in response — assume available
    // Available if there are enough seats for the group
    return entry.available_seats >= groupSize;
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
        // Shared tour — backend has classes_id=9.
        const tour = (sharedTours || []).find(t => (t.slug || String(t.id)) === String(selectedBoatId));
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
  }, [selectedBoatId, selectedYacht, sharedTours, fetchTourDetail]);

  useEffect(() => {
    if (!selectedYacht || !selectedYacht.routeId) {
      setInlineRouteSchedule(null);
      return;
    }
    let isMounted = true;
    setIsFetchingInlineRoute(true);
    setInlineRouteSchedule(null);
    fetch(apiUrl(`route/${selectedYacht.routeId}`))
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const restaurantObj = data.restaurant && typeof data.restaurant === "object" ? data.restaurant : null;
        const restaurantId = restaurantObj ? null : (data.restaurant_id || (typeof data.restaurant === "number" ? data.restaurant : null));
        const base = {
          title: data.popup_title || data.title || "",
          description: data.description || data.short_description || "",
          map: data.map || null,
          beforeLunch: Array.isArray(data.schedule_before_lunch) ? data.schedule_before_lunch : [],
          afterLunch: Array.isArray(data.schedule_after_lunch) ? data.schedule_after_lunch : [],
          footerNotes: data.popup_afternoon ? [data.popup_afternoon] : [],
          restaurant: restaurantObj,
          schedulePhotos: Array.isArray(data.schedule_photos) ? data.schedule_photos : [],
        };
        setInlineRouteSchedule(base);
        if (restaurantId) {
          fetchRestaurant(restaurantId).then(r => {
            if (isMounted) setInlineRouteSchedule(prev => prev ? { ...prev, restaurant: r } : prev);
          }).catch(() => {});
        }
      })
      .catch(err => console.error("Failed to fetch inline route schedule", err))
      .finally(() => {
        if (isMounted) setIsFetchingInlineRoute(false);
      });
    return () => { isMounted = false; };
  }, [selectedYacht]);

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
    if (!selectedYacht) return sharedTours;
    if (!datePricing) return sharedTours;
    // Merge date pricing into the tour object for the hook
    return (sharedTours || []).map(t => {
      if (Number(t.id) !== Number(selectedYacht.tourId)) return t;
      return { ...t, pricesbydates: datePricing };
    });
  }, [sharedTours, selectedYacht, datePricing]);
  const dynamicBoatPrice = useBoatPricing(
    selectedYacht?.tourId,
    dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart),
    totalGuests,
    pricingTourData
  );
  const mainBasePrice = dynamicBoatPrice ?? ((selectedYacht?.priceValue || 0) * totalGuests);
  // If we are using dynamic pricing from the pricelist, guest fee is usually built-in.
  // Otherwise, fallback to the manual guest fee calculation.
  const guestFeeTotal = dynamicBoatPrice !== null ? 0 : totalGuests * GUEST_FEE_IDR;
  // Merge all cached months into a single map: date → max available seats across all tours
  const globalAvailabilityMap = useMemo(() => {
    const map = {};
    for (const monthData of Object.values(globalMonthAvailCache)) {
      for (const [date, maxSeats] of Object.entries(monthData)) {
        const prev = map[date] ?? -1;
        if (maxSeats > prev) map[date] = maxSeats;
      }
    }
    return map; // date → number (max seats); absent = unknown (assume available)
  }, [globalMonthAvailCache]);
  // filterDate for main date picker: disable days where ALL tours are sold out
  const globalFilterDate = useCallback((date) => {
    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (!(iso in globalAvailabilityMap)) return true; // no data → allow
    return globalAvailabilityMap[iso] >= totalGuests;
  }, [globalAvailabilityMap, totalGuests]);
  const handleGlobalMonthChange = useCallback((date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setGlobalPickerMonth(key);
  }, []);
  const getAvailableDates = useCallback((boatId, start, end, groupSize = 1) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];
    if (endDate < startDate) return [];
    const dates = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate && dates.length < 31) {
      const iso = cursor.toISOString().slice(0, 10);
      if (isDateAvailable(boatId, iso, groupSize)) {
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
        const isLargeGroup = totalGuests > 5;
        const price = (isLargeGroup && transfer.bus_price) ? Number(transfer.bus_price) : Number(transfer.price || 0);
        sum += price;
      }
    }
    // Add selected cover
    if (selectedCoverId) {
      const cover = covers?.find(c => String(c.id) === String(selectedCoverId));
      if (cover) {
        sum += Number(cover.price || 0) * totalGuests;
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
        const isLargeGroup = totalGuests > 5;
        const price = (isLargeGroup && transfer.bus_price) ? Number(transfer.bus_price) : Number(transfer.price || 0);
        summary.push({
          id: `transfer-${transfer.id}`,
          name: transfer.name,
          price: price,
          pricingType: "per_booking",
          quantity: 1
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
          pricingType: "per_person",
          quantity: totalGuests
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
      let available = capacityOk;
      let availableSeats = null;
      if (searchDateMode === "exact") {
        if (searchExactDate) {
          const entry = availabilityMap[yacht.id]?.[searchExactDate];
          availableSeats = entry?.available_seats ?? null;
          available = capacityOk && isDateAvailable(yacht.id, searchExactDate, searchTotalGuests);
        }
      } else if (searchRangeStart && searchRangeEnd) {
        availableDates = getAvailableDates(yacht.id, searchRangeStart, searchRangeEnd, searchTotalGuests);
        available = capacityOk && availableDates.length > 0;
        if (availableDates.length > 0) {
          const entry = availabilityMap[yacht.id]?.[availableDates[0]];
          availableSeats = entry?.available_seats ?? null;
        }
      }
      // Build per-date seat counts for the tile picker (capped at boat capacity)
      const dateSeatsMap = {};
      const boatCapacity = yacht.people || 14;
      const rawBoatMap = availabilityMap[yacht.id] || {};
      for (const [date, entry] of Object.entries(rawBoatMap)) {
        if (entry?.available_seats !== undefined) {
          dateSeatsMap[date] = Math.min(entry.available_seats, boatCapacity);
        }
      }

      acc[yacht.id] = {
        available,
        capacityOk,
        availableDates,
        availableSeats,
        nextAvailable: availableDates[0] ?? null,
        dateSeatsMap,
      };
      return acc;
    }, {});
  }, [searchDateMode, searchExactDate, searchRangeStart, searchRangeEnd, searchTotalGuests, yachtOptions, isDateAvailable, getAvailableDates, availabilityMap]);

  const totalPrice = mainBasePrice + guestFeeTotal + extrasSubtotalIDR;
  const partPrice = Math.round(totalPrice * 0.3);
  const donationAmount = Math.round(totalPrice * 0.01);
  const handleOpenCheckout = () => {
    const analyticsItem = buildTourAnalyticsItem({
      itemId: selectedYacht?.tourId ?? selectedYacht?.id,
      itemName: selectedYacht?.name || "Shared Tour",
      itemCategory: "Shared Tour",
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

  // Listen for checkout trigger dispatched by StepTwo "Pick a day" confirm
  useEffect(() => {
    const handler = () => handleOpenCheckout();
    window.addEventListener("shared-proceed-checkout", handler);
    return () => window.removeEventListener("shared-proceed-checkout", handler);
  }, [selectedBoatId, exactDate, selectedFlexDate, totalPrice]);

  const handleApplyCheckout = () => {
    const _checkoutDate = dateMode === "exact" ? exactDate : (selectedFlexDate || rangeStart || "");
    const _availBoatId = availabilityMap[selectedYacht?.id]?.[_checkoutDate]?.boat_id ?? null;
    const params = new URLSearchParams({
      date: _checkoutDate,
      adults: String(adults),
      kids: String(kids),
      boat: String(selectedYacht?.tourId ?? selectedYacht?.id ?? ""),
      tourId: String(selectedYacht?.tourId ?? selectedYacht?.id ?? ""),
      tourName: selectedYacht?.name ?? "Shared Tour",
      tourCategory: "Shared Tour",
      tourType: "shared",
      style: String(selectedStyle?.id ?? selectedYacht?.routeId ?? ""),
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
      boatPrice: "0",
      totalBoatPrice: String(mainBasePrice ?? 0),
      extrasTotal: String(extrasSubtotalIDR ?? 0),
      ...(_availBoatId ? { availBoatId: String(_availBoatId) } : {}),
      analyticsCurrency: "IDR",
      analyticsTotal: String(totalPrice),
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
    // Only reset if the boat doesn't exist at all in options (not just unavailable)
    if (selectedBoatId && yachtOptions.length && !yachtOptions.some((yacht) => yacht.id === selectedBoatId)) {
      setSelectedBoatId(null);
    }
  }, [yachtOptions, selectedBoatId]);
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
  // Scroll to tour details when boat is selected
  useEffect(() => {
    if (!selectedBoatId) return;
    const timer = setTimeout(() => {
      const target = document.getElementById("tour-details-section");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedBoatId]);
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
  const stepTwoLocked = false;
  const stepExtrasLocked = false;
  const [showExtras, setShowExtras] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [pendingTransferModal, setPendingTransferModal] = useState(false);
  useEffect(() => {
    const handler = () => {
      setShowExtras(true);
      setShowReview(true);
      setPendingTransferModal(true);
      setTimeout(() => document.getElementById("step-review")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    };
    window.addEventListener("open-transfer-modal", handler);
    return () => window.removeEventListener("open-transfer-modal", handler);
  }, []);
  const stepFiveLocked = false;
  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  const stepTwoInlineHint = null;
  const stepExtrasInlineHint = null;
  const stepFiveInlineHint = null;
  const tourDetailsInlineHint = null;
  const { activePolicyKey: globalPolicyKey, activePolicy: globalPolicy, closePolicy: closeGlobalPolicy } = usePolicyModal();

  // Design system: scroll-triggered entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.home2-wrapper .animate-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

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
  return (
    <>
      <SEO
        title="Shared Yacht Tour to Nusa Penida | Bluuu"
        description="Book a shared yacht tour to Nusa Penida — enjoy group snorkeling, island sights, and manta rays on a day trip from Bali."
        image="https://bluuu.tours/storage/app/media/bluuu/shared.webp"
        canonical="https://bluuu.tours/shared-tour-to-nusa-penida"
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
              const target = document.getElementById("step-2");
              if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onConfirmSearch={commitSearch}
            hasPendingChanges={hasPendingSearchChanges}
            onMonthChange={handleGlobalMonthChange}
          />
        </Hero>

        {/* What's included — visual overview (hidden on mobile) */}
        <div className="hidden sm:block bg-neutral-100 py-4 sm:py-5">
          <div className="container">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: Clock, label: "Full day trip", sub: "8:00 AM – 6:00 PM" },
                { icon: Waves, label: "Snorkeling", sub: "Manta rays & coral reefs" },
                { icon: MapPin, label: "Kelingking Cliff", sub: "Famous viewpoint" },
                { icon: UtensilsCrossed, label: "Lunch included", sub: "Beachside restaurant" },
                { icon: Ticket, label: "All tickets", sub: "No extra fees" },
                { icon: Camera, label: "GoPro footage", sub: "Underwater highlights" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-secondary-900">{label}</div>
                    <div className="mt-0.5 text-xs text-secondary-400">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          onContinue={() => {
            const target = document.getElementById("step-2");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onConfirmSearch={commitSearch}
          hasPendingChanges={hasPendingSearchChanges}
          onMonthChange={handleGlobalMonthChange}
        />
        <div className="relative pt-6 sm:pt-8">
        <div className="relative">
          <div className={cn(stepTwoLocked && "pointer-events-none select-none opacity-45")}>
            {loading ? (
              <PremiumSection id="step-2" centered>
                <PremiumContainer>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                </PremiumContainer>
              </PremiumSection>
            ) : (
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
                  if (!searchHasDateCriteria) return;
                  setSelectedBoatId(id);
                  setTimeout(() => {
                    const target = document.getElementById("tour-details-section");
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
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
                  openSelectionModal();
                }}
                onOpenTourInfo={openTourInfo}
                onOpenDateModal={openSelectionModal}
                onExactDateChange={(d) => { setExactDate(d); setSearchExactDate(d); }}
                boats={yachtOptions}
                privateTours={sharedTours}
                selectedStyleTitle={selectedStyleTitle}
              />
            )}
          </div>
          {renderInlineDateHint(stepTwoInlineHint)}
        </div>
        </div>{/* end step 2 wrapper */}

        {/* Date Selection Modal */}
        <AnimatePresence>
          {isSelectionModalOpen && (
            <Modal
              isOpen={isSelectionModalOpen}
              onClose={closeSelectionModal}
              title="Select Dates"
              maxWidth="max-w-lg"
              className="selection-modal-compact"
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
                    className="w-full rounded-xl border-0 shadow-none"
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
                        // Close on end selection? Maybe let user close manually or confirm
                      } else {
                        setRangeEnd("");
                      }
                    }}
                    className="w-full rounded-xl border-0 shadow-none"
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
        <div className="relative">
          <div>
            {/* Tour Details Section */}
            {selectedBoatId && <PremiumSection id="tour-details-section" className="mt-12 pt-6 sm:pt-6 pb-10 sm:pb-10" backgroundClassName="bg-gradient-to-br from-[#0c1425] via-[#111d35] to-[#0a1628]">
              <PremiumContainer>
                <div className="relative min-h-[400px]">
                  {(() => {
                    const navBoats = (yachtOptions || []).filter(b => b.routeId);
                    const currentIdx = navBoats.findIndex(b => b.id === selectedBoatId);
                    const prevBoat = navBoats.length > 1 ? navBoats[(currentIdx - 1 + navBoats.length) % navBoats.length] : null;
                    const nextBoat = navBoats.length > 1 ? navBoats[(currentIdx + 1) % navBoats.length] : null;
                    const sortedByPrice = [...navBoats].sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
                    const selectedRank = sortedByPrice.findIndex(b => b.id === selectedBoatId);
                    const selectedTotal = sortedByPrice.length;
                    const selectedTierIndex = selectedTotal === 3 ? selectedRank : selectedTotal === 2 ? (selectedRank === 0 ? 0 : 2) : -1;
                    const boatAvail = boatAvailability?.[selectedBoatId];
                    const boatSoldOut = searchHasDateCriteria && boatAvail?.available === false;
                    const boatTooSmall = selectedYacht && searchTotalGuests > selectedYacht.people;
                    const boatUnavailable = boatSoldOut || boatTooSmall;
                    return (
                      <TourDetailsCard
                        withTimeline
                        sectionTitle={selectedYacht?.name || "Shared Tour"}
                        style={{
                          title: inlineRouteSchedule?.title || selectedStyleTitle || selectedYacht?.name,
                          description: inlineRouteSchedule?.description || selectedStyle?.description,
                          map: inlineRouteSchedule?.map || selectedStyle?.map || "https://bluuu.tours/themes/bluuu/assets/images/map.webp",
                        }}
                        schedule={{
                          beforeLunch: inlineRouteSchedule?.beforeLunch || selectedYacht?.routeSchedule?.beforeLunch || [],
                          afterLunch: inlineRouteSchedule?.afterLunch || selectedYacht?.routeSchedule?.afterLunch || [],
                          footerNotes: inlineRouteSchedule?.footerNotes || selectedYacht?.routeSchedule?.footerNotes || [],
                        }}
                        restaurant={inlineRouteSchedule?.restaurant || selectedYacht?.routeSchedule?.restaurant}
                        onRestaurantClick={setInlineRestaurantPopup}
                        schedulePhotos={inlineRouteSchedule?.schedulePhotos || selectedYacht?.routeSchedule?.schedulePhotos}
                        priceDisplay={selectedYacht ? formatIDR((() => { const dateForPrice = dateMode === "exact" ? exactDate : selectedFlexDate; if (dateForPrice && selectedYacht.tourId) { const p = calculateBoatPrice(selectedYacht.tourId, dateForPrice, totalGuests, sharedTours); if (p !== null) return p; } return selectedYacht.priceValue; })()) : null}
                        dateDisplay={dateMode === "exact" ? (exactDate ? new Date(exactDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null) : (selectedFlexDate ? new Date(selectedFlexDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : rangeStart && rangeEnd ? `${new Date(rangeStart + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(rangeEnd + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : null)}
                        guestsDisplay={`${adults} adult${adults !== 1 ? "s" : ""}${kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}`}
                        isUnavailable={boatUnavailable}
                        unavailableReason={boatTooSmall ? `Max ${selectedYacht?.people} guests` : "Not available on selected date"}
                        onChangeParams={() => { window.dispatchEvent(new CustomEvent("open-pick-day", { detail: { boatId: selectedBoatId } })); }}
                        prevLabel={prevBoat?.name}
                        nextLabel={nextBoat?.name}
                        onPrev={prevBoat ? () => { setSelectedBoatId(prevBoat.id); setTimeout(() => (() => { const t = document.getElementById("tour-details-section"); if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); } })(), 200); } : undefined}
                        onNext={nextBoat ? () => { setSelectedBoatId(nextBoat.id); setTimeout(() => (() => { const t = document.getElementById("tour-details-section"); if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); } })(), 200); } : undefined}
                        includedChips={tourInfo.includedSections.flatMap(section => section.items.map(item => ({ ...item, icon: ICON_MAP[item.icon] })))}
                        infoTabs={INFO_DRAWER_TABS}
                        infoContent={(tab) => (
                          <TourTabContent
                            activeTab={tab}
                            tierIndex={selectedTierIndex}
                            includedSections={tourInfo.includedSections.map(section => ({ ...section, items: section.items.map(item => ({ ...item, icon: ICON_MAP[item.icon] })) }))}
                            cancellationSummaryCards={(tourInfo.cancellationCards ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon], accentClassName: card.accent, iconClassName: card.iconColor, iconWrapClassName: card.bg }))}
                            weatherGuaranteeCards={(tourInfo.weatherGuarantee ?? []).map(card => ({ ...card, icon: ICON_MAP[card.icon] }))}
                          />
                        )}
                        onReserve={() => { setShowExtras(true); setShowReview(true); setTimeout(() => document.getElementById("step-review")?.scrollIntoView({ behavior: "smooth", block: "start" }), 200); }}
                      />
                    );
                  })()}
                </div>
              </PremiumContainer>
            </PremiumSection>}

          </div>
          {renderInlineDateHint(tourDetailsInlineHint)}
        </div>

        {/* StepExtras removed — transfer & insurance moved to review */}
        {showReview && <>
        <div className="relative">
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
              onReserve={handleOpenCheckout}
              transfers={transfers}
              selectedTransferId={selectedTransferId}
              onSelectTransferId={setSelectedTransferId}
              transferConfirmed={transferConfirmed}
              onTransferConfirm={() => setTransferConfirmed(true)}
              covers={covers}
              selectedCoverId={selectedCoverId}
              onSelectCoverId={setSelectedCoverId}
              coverConfirmed={coverConfirmed}
              onCoverConfirm={() => setCoverConfirmed(true)}
              pickupAddress={pickupAddress}
              onSetPickupAddress={setPickupAddress}
              dropoffAddress={dropoffAddress}
              onSetDropoffAddress={setDropoffAddress}
              pickupAddressConfirmed={pickupAddressConfirmed}
              onSetPickupAddressConfirmed={setPickupAddressConfirmed}
              dropoffAddressConfirmed={dropoffAddressConfirmed}
              onSetDropoffAddressConfirmed={setDropoffAddressConfirmed}
              pendingTransferModal={pendingTransferModal}
              onPendingTransferModalConsumed={() => setPendingTransferModal(false)}
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
                    selectedTransferId={selectedTransferId}
                    pickupAddress={pickupAddress}
                    onSetPickupAddress={setPickupAddress}
                    dropoffAddress={dropoffAddress}
                    onSetDropoffAddress={setDropoffAddress}
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
        </div>
        </>}
        </div>{/* end step 4 wrapper */}
        <ReviewsSection />
        <Footer />
      </div>
      <PolicyModal activePolicyKey={globalPolicyKey} activePolicy={globalPolicy} onClose={closeGlobalPolicy} />
      <RestaurantModal
        restaurantData={inlineRestaurantPopup}
        onClose={() => setInlineRestaurantPopup(null)}
      />
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
  selectedTransferId,
  pickupAddress,
  onSetPickupAddress,
  dropoffAddress,
  onSetDropoffAddress,
  onFinalize,
  onCancel,
}) {
  const isLastStep = step === 2;
  const canContinue = isLastStep ? (contactName && contactEmail && agreedTerms && agreedLiability) : true;
  const [errors, setErrors] = useState({});
  const [sameAddress, setSameAddress] = useState(false);

  const handleSameAddressChange = (checked) => {
    setSameAddress(checked);
    if (checked) onSetDropoffAddress(pickupAddress);
  };

  const handlePickupChange = (val) => {
    onSetPickupAddress(val);
    if (sameAddress) onSetDropoffAddress(val);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const digits = String(phone).replace(/[^0-9]/g, "");
    return digits.length >= 7 && digits.length <= 15;
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
    { num: 2, label: "Your details" },
  ];
  const { activePolicyKey, activePolicy, openPolicy: openPolicyModal, closePolicy: closePolicyModal } = usePolicyModal();

  return (
    <>
      <Section id="step-checkout" className="py-8 sm:py-10" containerClassName="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Complete your booking</h2>
            <p className="mt-1 text-sm text-secondary-500 sm:text-base">
              {step === 1 ? "Secure your booking by paying only 30% today." : "Secure your spot in just a few steps."}
            </p>
          </div>

          <div className="mb-7 flex items-start justify-center">
            {steps.map((s, i) => {
              const isActive = s.num === step;
              const isCompleted = s.num < step;
              return (
                <div key={s.num} className="flex items-start">
                  {i > 0 && <div className="mx-6 mt-[17px] h-0.5 w-16 rounded bg-neutral-100 sm:mx-10 sm:w-28" />}
                  <div className="flex flex-col items-center gap-3">
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
                </div>
              );
            })}
          </div>

          <div className="mb-3 h-2" />

          <div className={`${CARD.radius} ${CARD.border} ${CARD.bg} p-4 shadow-lg shadow-neutral-100/40 sm:p-6`}>
            <h3 className="mb-4 text-lg font-bold text-secondary-900 sm:mb-5 sm:text-xl">
              {step === 1 ? "Choose how you'd like to pay" : "Contact details"}
            </h3>

            {step === 1 && (
              <div className="space-y-2.5">
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
                        <span className="font-bold text-secondary-900">Reserve with 30% today</span>
                        <span className="rounded-full border border-primary-600 bg-primary-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Recommended</span>
                      </div>
                      <span className="font-bold text-secondary-900">{formatIDR(partPrice + (supportChildren ? donationAmount : 0))}</span>
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                      Pay {formatIDR(partPrice + (supportChildren ? donationAmount : 0))} now to confirm your booking.
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                      Pay the remaining {formatIDR(totalPrice - partPrice)} at check-in before departure.
                    </div>
                  </div>
                </button>

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
                      <span className="font-bold text-secondary-900">{formatIDR(totalPrice + (supportChildren ? donationAmount : 0))} + 2.5% Xendit fee</span>
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-secondary-500 sm:text-sm">
                      Pay the full amount now and have nothing left to pay on the day.
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
                {(String(selectedTransferId) === "1" || String(selectedTransferId) === "2") && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Pickup address*</label>
                    <input
                      type="text"
                      autoComplete="new-password"
                      value={pickupAddress}
                      onChange={(e) => handlePickupChange(e.target.value)}
                      placeholder="Enter your hotel or villa address"
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                    />
                  </div>
                )}
                {String(selectedTransferId) === "2" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Dropoff address*</label>
                    {!sameAddress && (
                      <input
                        type="text"
                        autoComplete="new-password"
                        value={dropoffAddress}
                        onChange={(e) => onSetDropoffAddress(e.target.value)}
                        placeholder="Enter your dropoff address"
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                      />
                    )}
                    <label className="mt-2 flex cursor-pointer items-center gap-2">
                      <input
                        id="same-address"
                        type="checkbox"
                        checked={sameAddress}
                        onChange={(e) => handleSameAddressChange(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 accent-primary-600"
                      />
                      <span className="text-xs text-secondary-400">Same address for pickup and dropoff</span>
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-600">Any special requests?</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => onSetSpecialRequests(e.target.value)}
                    placeholder="Write your comments here"
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
                onClick={() => step < 2 ? onSetStep(step + 1) : handleFinalize()}
                disabled={step === 2 && (!agreedTerms || !agreedLiability)}
                className="h-11 min-w-32 px-5 shadow-md shadow-primary-600/20"
              >
                {step < 2 ? (payMode === "part" ? "CONTINUE WITH 30%" : "CONTINUE WITH FULL PAYMENT") : "Complete booking"}
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
      subtitle={step === 1 ? "Pay now or pay 50% later" : step === 2 ? "We accept Visa, MasterCard, AmEx, and more." : "Enter your contact details"}
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
