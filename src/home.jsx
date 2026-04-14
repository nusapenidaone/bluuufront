import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrency } from "./CurrencyContext";
import { useTours } from "./ToursContext";
import { useExtras } from "./contexts/ExtrasContext";
import Modal from "./components/common/Modal";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import Skeleton, { CardSkeleton, GallerySkeleton } from "./components/common/Skeleton";
import { cn } from "./lib/utils";
import { useSiteContacts } from "./hooks/useSiteContacts";
import { useSEO } from "./hooks/useSEO";
import Footer from "./components/common/Footer";
import LogoSlider from "./components/common/LogoSlider";
import { getBoatFeatures } from "./utils/boatFeatures";
import { getBoatLength, sanitizeDisplayText } from "./utils/displayUtils";

// Global formatters to bridge legacy utility functions with React Context
let _globalFormatPrice = (val, opts) => `IDR ${Number(val).toLocaleString()}`;
const CurrencyBridge = () => {
  const currency = useCurrency();
  if (typeof currency?.formatPrice === "function") {
    _globalFormatPrice = currency.formatPrice; // Synchronous update to avoid stale prices during first render
  }
  return null;
};
import {
  Anchor,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Car,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Plus,
  Coffee,
  Fish,
  Trophy,
  ExternalLink,
  Globe,
  LifeBuoy,
  MapPin,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Shield,
  Ship,
  Sparkles,
  Star,
  Sun,
  Ticket,
  Users,
  UtensilsCrossed,
  Waves,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Wine,
  X,
} from "lucide-react";

const ROUTE_ICON_MAP = {
  MapPin, Fish, Clock, LifeBuoy, UtensilsCrossed, Camera, Shield, Waves,
  Anchor, Sun, BadgeCheck, Ship, Coffee, Ticket, Users, Wine, Globe, Star,
  Calendar, ArrowRight, Car, Sparkles,
};

function getScheduleIcon(title) {
  const t = (title || "").toLowerCase();
  if (/snorkel|swim|wave|crystal|lagoon|reef/.test(t)) return Waves;
  if (/lunch|restaurant|food|dinner|eat|meal/.test(t)) return UtensilsCrossed;
  if (/depart|departure/.test(t)) return Ship;
  if (/return|back|cruise|transfer/.test(t)) return Anchor;
  if (/manta|dive|fish/.test(t)) return Fish;
  if (/car|land|tour|viewpoint|cliff|trek|hike|temple|monument/.test(t)) return Car;
  if (/meeting|briefing|welcome|pickup/.test(t)) return Users;
  if (/coffee|drink|break/.test(t)) return Coffee;
  if (/photo|camera/.test(t)) return Camera;
  if (/sunset|sun|rise/.test(t)) return Sun;
  return MapPin;
}

const BRAND = {
  name: "Bluuu",
  product: "Nusa Penida day tours",
  reviewCount: "8,595",
  reviewLabel: "reviews",
  badges: [
    { icon: Star, label: "Customer choice" },
    { icon: MapPin, label: "Free Bluuu Bus shuttle" },
    { icon: BadgeCheck, label: "Safety first" },
    { icon: LifeBuoy, label: "24/7 support" },
  ],
};

const ACCENT = "#045cff";
const ACCENT_DARK = "#0a4deb";
const PAGE_BG = "#FFFFFF";
const HERO_BACKGROUND_IMAGE = "https://bluuu.tours/storage/app/media/shared.webp";

const SECTIONS = [
  { id: "tours", label: "Tours" },
  { id: "compare", label: "Compare" },
  { id: "plan", label: "Schedule" },
  { id: "social", label: "Reviews" },
  { id: "why", label: "Why book" },
  { id: "included", label: "Included" },
  { id: "faq", label: "FAQ" },
  { id: "book", label: "Book" },
];

const TOUR_HIGHLIGHT_BADGES = [
  { icon: Ship, label: "Bali → Nusa Penida" },
  { icon: LifeBuoy, label: "Full day tour" },
];

const OVERVIEW_HIGHLIGHTS = [
  {
    icon: Ship,
    title: "Comfort yacht",
    text: "Relaxed ride with attentive crew and smooth transitions.",
  },
  {
    icon: Waves,
    title: "Multiple snorkel spots",
    text: "Curated underwater stops supported by quality gear.",
  },
  {
    icon: MapPin,
    title: "Curated land highlights",
    text: "Comfortable transfers to iconic viewpoints with time to enjoy.",
  },
  {
    icon: Star,
    title: "Swim with mantas",
    text: "Swim with manta rays when conditions allow, guided by crew.",
  },
];

const TOUR_OPTIONS_BASE = [
  {
    id: "shared",
    name: "Shared Tour",
    badge: "Best value",
    tone: "shared",
    summary: "Unique shared speedboat day tour with all the highlights.",
    highlights: [
      "Best snorkel spots",
      "Lunch at scenic restaurant",
      "Land Tour to Kelingking Cliff",
      "Swim with Manta Rays",
      "Showers, towels, drinks & ice cream",
    ],
    bestFor: "Value seekers, solo travelers, couples",
    cta: "Shared",
    priceValue: 1300000,
    priceNote: "/ person",
  },
  {
    id: "premium-shared",
    name: "Premium Shared",
    badge: "Most booked",
    tone: "premium",
    summary: "Shared comfort with elevated perks and more space.",
    highlights: [
      "Everything in Comfort, plus premium touches",
      "Upgraded Premium boat",
      "1 extra ‘Secret’ snorkel spot",
      "3 bottles of Prosecco to share onboard",
      "Pro photographer for all day",
    ],
    bestFor: "Couples, comfort lovers, small groups",
    cta: "Premium Shared",
    priceValue: 1900000,
    priceNote: "/ person",
  },
  {
    id: "private",
    name: "Private",
    badge: "For families and groups",
    tone: "private",
    summary: "Private yacht experience with flexible pace and extras.",
    highlights: [
      "Choose your yacht model",
      "Private boat — only your group onboard",
      "Flexible pace and timing (within route)",
      "Add extras: diving, pro photographer, jet ski & more (optional)",
      "Lunch in scenic restaurant",
    ],
    bestFor: "Families, birthdays, groups who want privacy",
    cta: "Private",
    priceValue: 14900000,
    priceNote: "/ boat",
  },
  {
    id: "premium-private",
    name: "Premium Private",
    badge: "Top tier",
    tone: "premium-private",
    summary: "A premium private day with seamless flow and extra amenities.",
    highlights: [
      "Everything in Private, plus premium touches",
      "Upgraded premium boat",
      "1 extra ‘secret’ snorkel spot (when conditions allow)",
      "3 bottles of Prosecco to share onboard",
      "Pro photographer for all day",
    ],
    bestFor: "Luxury seekers, proposals, special occasions",
    cta: "Premium Private",
    priceValue: 19900000,
    priceNote: "/ boat",
  },
];

// GALLERY_ITEMS removed to strictly use API data


const COMMON_GROUND_ITEMS = [
  "Same route: Bali to Nusa Penida",
  "Same Bluuu crew and safety standards",
  "Snorkel stops plus swim with mantas",
  "Free cancellation 24h and weather guarantee",
];


export function useTourOptions() {
  const { privateTours, sharedTours } = useTours();
  const { formatPrice } = useCurrency();

  return useMemo(() => {
    return TOUR_OPTIONS_BASE.map(opt => {
      if (opt.id === "private" && privateTours?.length) {
        const standard = privateTours.find(t => t.name.includes("Standard")) || privateTours[0];
        if (standard) {
          const minPricelist = standard.packages?.pricelist?.length ? Math.min(...standard.packages.pricelist.map(p => Number(p.price))) : 0;
          const boatPrice = Number(standard.boat_price) || 0;
          const priceValue = minPricelist + boatPrice;
          if (priceValue > 0) {
            return { ...opt, priceValue, priceNote: `from ${formatPrice(priceValue, { fromCurrency: "IDR" })} / boat` };
          }
        }
      }
      if (opt.id === "premium-private" && privateTours?.length) {
        const premium = privateTours.find(t => t.name.includes("Premium") || t.name.includes("First Class")) || privateTours[1];
        if (premium) {
          const minPricelist = premium.packages?.pricelist?.length ? Math.min(...premium.packages.pricelist.map(p => Number(p.price))) : 0;
          const boatPrice = Number(premium.boat_price) || 0;
          const priceValue = minPricelist + boatPrice;
          if (priceValue > 0) {
            return { ...opt, priceValue, priceNote: `from ${formatPrice(priceValue, { fromCurrency: "IDR" })} / boat` };
          }
        }
      }
      return opt;
    });
  }, [privateTours, sharedTours, formatPrice]);
}

const SAFETY_ITEMS = [
  "Free shuttle from selected areas (Canggu/Berawa, Batu Belig, Seminyak, Legian/Kuta)",
  "Two certified guides on every boat (first-aid trained)",
  "Experienced crew (3+ years) and our own fleet (not outsourced)",
];

try {
  console.assert(new Set(SECTIONS.map((s) => s.id)).size === SECTIONS.length, "SECTIONS ids must be unique");
} catch (_) { }

function formatIDR(value) {
  return _globalFormatPrice(value, { fromCurrency: "IDR" });
}

function formatUSD(value) {
  return _globalFormatPrice(value, { fromCurrency: "USD" });
}

function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-secondary-900 shadow-card">
      <Icon className="h-4 w-4 text-primary-600" />
      {children}
    </span>
  );
}







function GalleryBlock() {
  const { loading, gallery: apiGallery, privateTours } = useTours();

  // Use dedicated gallery items; fall back to tour images if none
  const galleryItems = useMemo(() => {
    if (apiGallery?.length) {
      return apiGallery.map((g) => ({
        id: g.id,
        src: g.url,
        thumb: g.thumb || g.url,
        thumbSmall: g.thumb_small || null,
        title: g.title || "",
      }));
    }
    return (privateTours || [])
      .flatMap((t) => t.images_with_thumbs || [])
      .filter(Boolean)
      .map((img, i) => ({
        id: i,
        src: img.original || img.thumb1 || img,
        thumb: img.thumb1 || img.original || img,
        thumbSmall: img.thumb1_small || null,
        title: "",
      }));
  }, [apiGallery, privateTours]);

  // Desktop: 5 previews (1 large + 2×2); Mobile: 3 previews (1 large + 2 bottom)
  const preview = galleryItems.slice(0, 5);
  const previewMob = galleryItems.slice(0, 3);

  const openFancybox = (startIndex = 0) => {
    Fancybox.show(
      galleryItems.map((item) => ({
        src: item.src,
        thumb: item.thumb,
        caption: item.title || undefined,
      })),
      { startIndex }
    );
  };

  return (
    <section id="gallery" className="py-12 sm:py-16">
      <div className="container">
        {/* Header */}
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-primary-600">From our guests</div>
            <h2 className="mt-1.5 text-2xl font-bold text-secondary-900 sm:text-3xl">
              This is what your day looks like
            </h2>
          </div>
        </div>

        {/* Gallery grid */}
        {loading ? (
          <GallerySkeleton />
        ) : previewMob.length > 0 ? (
          <div className="relative overflow-hidden rounded-xl sm:rounded-xl">

            {/* ── MOBILE: 1 large + 2 bottom ── */}
            <div className="grid h-440 grid-rows-gallery-asymmetric gap-0.75 sm:hidden">
              {/* Large image */}
              <button
                type="button"
                className="group relative overflow-hidden"
                onClick={() => openFancybox(0)}
              >
                <img
                  src={previewMob[0].thumb}
                  srcSet={previewMob[0].thumbSmall ? `${previewMob[0].thumbSmall} 400w, ${previewMob[0].thumb} 800w` : undefined}
                  sizes="100vw"
                  alt={previewMob[0].title || "Gallery"}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </button>

              {/* 2 small images in a row */}
              <div className="grid grid-cols-2 gap-0.75">
                {[previewMob[1], previewMob[2]].map((item, i) => {
                  if (!item) return <div key={i} className="bg-neutral-200" />;
                  return (
                    <button
                      key={item.id ?? i}
                      type="button"
                      className="group relative overflow-hidden"
                      onClick={() => openFancybox(i + 1)}
                    >
                      <img
                        src={item.thumb}
                        srcSet={item.thumbSmall ? `${item.thumbSmall} 400w, ${item.thumb} 800w` : undefined}
                        sizes="50vw"
                        alt={item.title || "Gallery"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── DESKTOP: 1 large left + 2×2 right ── */}
            <div className="hidden h-520 grid-cols-2 gap-0.75 sm:grid">
              {/* Main large image */}
              <button
                type="button"
                className="group relative overflow-hidden"
                onClick={() => openFancybox(0)}
              >
                <img
                  src={preview[0].thumb}
                  alt={preview[0].title || "Gallery"}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </button>

              {/* 2 × 2 grid */}
              <div className="grid grid-cols-2 gap-0.75">
                <div className="grid min-h-0 grid-rows-gallery-asymmetric-alt gap-0.75">
                  {[preview[1], preview[3]].map((item, i) => {
                    if (!item) return <div key={i} className="bg-neutral-200" />;
                    const imageIndex = i === 0 ? 1 : 3;
                    return (
                      <button
                        key={item.id ?? imageIndex}
                        type="button"
                        className="group relative h-full overflow-hidden"
                        onClick={() => openFancybox(imageIndex)}
                      >
                        <img
                          src={item.thumb}
                          alt={item.title || "Gallery"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                      </button>
                    );
                  })}
                </div>
                <div className="grid min-h-0 grid-rows-gallery-asymmetric-rev gap-0.75">
                  {[preview[2], preview[4]].map((item, i) => {
                    if (!item) return <div key={i} className="bg-neutral-200" />;
                    const imageIndex = i === 0 ? 2 : 4;
                    return (
                      <button
                        key={item.id ?? imageIndex}
                        type="button"
                        className="group relative h-full overflow-hidden"
                        onClick={() => openFancybox(imageIndex)}
                      >
                        <img
                          src={item.thumb}
                          alt={item.title || "Gallery"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating "Show all photos" pill */}
            <button
              type="button"
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-secondary-900 shadow-md transition hover:bg-neutral-50 hover:shadow-lg"
              onClick={() => openFancybox(0)}
            >
              <Camera className="h-4 w-4 text-secondary-500" />
              Show all photos
            </button>
          </div>
        ) : null}
      </div>

    </section>
  );
}



function TourPicker({ activeTourId, onSelectTour }) {
  const TOUR_OPTIONS = useTourOptions();
  const selectedTour = TOUR_OPTIONS.find((tour) => tour.id === activeTourId) ?? TOUR_OPTIONS[0];

  return (
    <Card className="rounded-xl p-6">
      <div className="text-sm font-semibold text-secondary-900">Check availability</div>
      <div className="mt-5 space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide-4xl text-secondary-500">Tour option</span>
          <div className="relative">
            <select
              value={activeTourId}
              onChange={(e) => onSelectTour?.(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-secondary-900 outline-none focus:border-primary-600/40 focus:ring-4 focus:ring-primary-600/10"
            >
              {TOUR_OPTIONS.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
          </div>
        </label>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-secondary-900">Tour price</div>
          <div className="text-lg font-semibold text-secondary-900">
            <span className="text-sm font-medium text-secondary-500 mr-1">from</span>
            {formatIDR(selectedTour.priceValue)}
          </div>
        </div>
        {selectedTour.priceNote ? (
          <div className="mt-1 text-xs font-semibold text-secondary-500">{selectedTour.priceNote}</div>
        ) : null}
        <p className="mt-3 text-sm text-secondary-600">
          Best for: <span className="font-semibold text-secondary-900">{selectedTour.bestFor}</span>
        </p>
        <div className="mt-3 space-y-2">
          {selectedTour.highlights.slice(0, 3).map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-secondary-600">
              <Check className="h-4 w-4 text-primary-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryLink href="#book" className="w-full justify-center">
        Check availability
      </PrimaryLink>
      <SecondaryButton onClick={() => alert("WhatsApp demo action")}>
        <MessageCircle className="h-4 w-4" />
        Chat with a manager
      </SecondaryButton>

      <div className="flex items-center justify-between text-xs font-semibold text-secondary-600">
        <span className="inline-flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-primary-600" />
          Free cancellation 24h
        </span>
        <span className="inline-flex items-center gap-1">
          <Sun className="h-3.5 w-3.5 text-primary-600" />
          Weather guarantee
        </span>
      </div>
    </Card>
  );
}

const VIDEO_MD = "https://bluuu.tours/storage/app/media/video-md";
const VIDEO_XL = "https://bluuu.tours/storage/app/media/video-xl";

function getVideoSrc() {
  const isMobile = window.innerWidth < 768;
  const base = isMobile ? VIDEO_MD : VIDEO_XL;
  const supportsWebm = document.createElement("video").canPlayType("video/webm") !== "";
  return base + (supportsWebm ? ".webm" : ".mp4");
}

function Hero() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

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
    <section className="relative pt-12 sm:pt-20 min-h-[600px] sm:min-h-[700px]">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div style={{ height: 40, overflow: 'hidden' }}><div className="elfsight-app-59bf9aa3-92ce-4654-aa87-9f5050b2af3a" /></div>
            <p className="mt-4 text-xs font-bold uppercase  text-primary-600 sm:text-sm">
              Full day tour · Bali to Nusa Penida · All-inclusive
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-secondary-900 sm:text-6xl lg:text-6xl">
              Award-winning tours to <br className="sm:hidden" /><span className="text-primary-600">Nusa Penida</span>
            </h1>
            <p className="mt-4 max-w-2xl  text-secondary-600 text-lg">
              Manta rays, snorkeling, diving, and a land tour — all in one unforgettable day.
            </p>
             <p className="mt-2 text-sm font-medium text-secondary-500">
              24/7 WhatsApp support · Full refund if bad weather · Free cancellation 24h
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              { <a
                href="#tours"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-primary inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-600 px-8 text-base font-bold text-white shadow-xl sm:h-14"
              >
                View tours <ArrowRight className="h-4 w-4" />
              </a> }
            </div>
           
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-12 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 shadow-2xl sm:mt-16 md:rounded-xl"
        >
          <div className="aspect-video sm:aspect-video-wide">
            <video
              ref={videoRef}
              poster="https://bluuu.tours/storage/app/media/poster.webp"
              muted
              loop
              playsInline
              fetchPriority="high"
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

const TRUST_ITEMS = [
  { Icon: Shield,        text: "Licensed & insured" },
  { Icon: Waves,         text: "Refund if bad weather" },
  { Icon: Clock,         text: "Free cancel 24h" },
  { Icon: Trophy,        text: "Best of the Best" },
  { Icon: MessageCircle, text: "24/7 WhatsApp" },
  { Icon: BadgeCheck,    text: "Secure payment" },
];

function TourTypeCardShell({
  featured = false,
  badge,
  badgeIcon: BadgeIcon,
  badgeTone = "dark",
  imageSrc,
  imageAlt,
  children,
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl bg-white border border-neutral-200 transition duration-300",
        featured && "border-neutral-200"
      )}
    >
      <div
        className={cn(
          "flex h-9 items-center justify-center gap-1.5 px-4 text-2xs font-semibold uppercase  text-white",
          badgeTone === "blue" ? "bg-primary-600" : "bg-brand-dark"
        )}
      >
        <div className="flex items-center justify-center gap-1.5">
          {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
          <span>{badge}</span>
        </div>
      </div>
      <div className={cn("rounded-b-xl", badgeTone === "blue" ? "bg-primary-600" : "bg-brand-dark")}>
        <div className="relative overflow-hidden rounded-xl">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="h-200 w-full object-cover transition duration-700 group-hover:scale-103 sm:h-220 lg:h-250"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/20 via-secondary-900/0 to-transparent" />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-5 sm:p-6">{children}</div>
    </article>
  );
}

function TourTypeBenefitItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-xs leading-6 text-secondary-600 sm:text-sm">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
      {children}
    </li>
  );
}

function TourTypeDetailRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3 text-xs leading-6 text-secondary-600 sm:text-sm">
      <Icon className="mt-1 h-4 w-4 shrink-0 text-secondary-400" />
      <span>{children}</span>
    </div>
  );
}

/* eslint-disable */
function LegacyTourTypeCards() {
  const TOUR_OPTIONS = useTourOptions();
  const { loading } = useTours();
  const [guests, setGuests] = useState(8);
  const [activeTab, setActiveTab] = useState("shared");

  const privateTour = TOUR_OPTIONS.find((t) => t.id === "private");
  const sharedTour  = TOUR_OPTIONS.find((t) => t.id === "shared");

  const boatPrice   = privateTour?.priceValue ?? 0;
  const sharedPrice = sharedTour?.priceValue  ?? 0;
  const perPerson   = guests > 0 ? Math.round(boatPrice / guests) : 0;
  const isCheaper   = sharedPrice > 0 && perPerson < sharedPrice;
  const isSame      = !isCheaper && sharedPrice > 0 && perPerson <= sharedPrice * 1.1;

  const InclItem = ({ children }) => (
    <li className="flex items-start gap-2 text-xs text-secondary-600">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-2.5 w-2.5 stroke-[3]" />
      </span>
      {children}
    </li>
  );

  const sharedCard = (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* Ribbon */}
      <div className="relative p-3 pb-0">
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-2xs font-bold text-white">
            ★ Best value
          </div>
          <img
            src="https://bluuu.tours/storage/app/media/shared.webp"
            alt="Shared group tour"
            loading="lazy" decoding="async"
            className="h-200 w-full object-cover"
          />
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-3xs font-bold uppercase tracking-widest text-secondary-400 mb-1">Join a small group</p>
        <h3 className="text-xl leading-tight font-bold text-secondary-900 mb-2">Shared Tour</h3>
        <p className="text-sm text-secondary-500 leading-relaxed mb-4">
          Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and hassle-free.
        </p>

        {/* Boat info box */}
        <div className="mb-4 rounded-xl bg-neutral-100 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm leading-tight text-secondary-600">
            <Anchor className="h-4 w-4 shrink-0 text-secondary-400" />
            <span>One shared speedboat · up to 10 guests</span>
          </div>
          <div className="flex items-center gap-2 text-sm leading-tight text-secondary-600">
            <Users className="h-4 w-4 shrink-0 text-secondary-400" />
            <span>Fixed departure · strangers may join</span>
          </div>
        </div>

        {/* Price box */}
        <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-baseline flex-wrap gap-1.5 mb-1">
            <span className="text-xs text-secondary-400">from</span>
            {loading
              ? <div className="h-8 w-32 animate-pulse rounded-lg bg-neutral-100" />
              : <span className="text-3xl leading-tight font-bold tracking-tight text-secondary-900">{formatIDR(sharedPrice)}</span>
            }
            <span className="text-xs text-secondary-500">/ person</span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-2xs font-bold uppercase text-emerald-700 border border-emerald-200">ALL INCLUSIVE</span>
          </div>
          <p className="text-xs text-secondary-400">Lunch, gear, guide, boat · no hidden fees</p>
        </div>

        {/* CTA */}
        <a
          href="/new/shared"
          className="btn-outline mb-1 flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary-600 py-3.5 text-base leading-tight font-semibold text-primary-600"
        >
          See tour details <ArrowRight className="h-4 w-4" />
        </a>
        <p className="mb-5 text-center text-2xs text-secondary-400">No payment required to view options</p>

        {/* Upgrade pill */}
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-2.5">
          <span className="text-sm leading-tight text-secondary-600">Want the whole boat for your group?</span>
          <a href="/new/private" className="ml-auto whitespace-nowrap text-sm leading-tight font-semibold text-primary-600 hover:underline">
            Go Private →
          </a>
        </div>

        {/* Included list */}
        <ul className="space-y-2.5 border-t border-neutral-100 pt-4">
          <InclItem>Small group — max 10 guests per boat</InclItem>
          <InclItem>Lunch at a clifftop restaurant — included</InclItem>
          <InclItem>Snorkeling with manta rays</InclItem>
          <InclItem>Kelingking Beach, Crystal Bay, Broken Beach</InclItem>
          <InclItem>Safety gear, certified crew &amp; guide</InclItem>
          <InclItem>All entrance fees included</InclItem>
        </ul>
      </div>
    </div>
  );

  const privateCard = (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* Ribbon */}
      <div className="relative p-3 pb-0">
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-2xs font-bold text-white">
            ✦ Most popular
          </div>
          <img
            src="https://bluuu.tours/storage/app/media/private.webp"
            alt="Private charter"
            loading="lazy" decoding="async"
            className="h-200 w-full object-cover rounded-xl"
          />
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-3xs font-bold uppercase tracking-widest text-primary-500 mb-1">Your boat, your rules</p>
        <h3 className="text-xl leading-tight font-bold text-secondary-900 mb-2">Private Charter</h3>
        <p className="text-sm text-secondary-500 leading-relaxed mb-4">
          The entire boat is yours — only your group. Choose your time, adjust your stops, set your pace.
        </p>

        {/* Boat info box */}
        <div className="mb-4 rounded-xl bg-neutral-100 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <Anchor className="h-4 w-4 shrink-0 text-secondary-400" />
            <span>20+ boats to choose from · all sizes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <Users className="h-4 w-4 shrink-0 text-secondary-400" />
            <span>2–45 guests · fully flexible itinerary</span>
          </div>
        </div>

        {/* Price box with slider */}
        <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-baseline flex-wrap gap-1.5 mb-1">
            <span className="text-xs text-secondary-400">from</span>
            {loading
              ? <div className="h-8 w-32 animate-pulse rounded-lg bg-primary-100" />
              : <span className="text-3xl leading-tight font-bold tracking-tight text-primary-700">{formatIDR(boatPrice)}</span>
            }
            <span className="text-xs text-secondary-500">/ boat</span>
          </div>
          {!loading && boatPrice > 0 && (
            <div onClick={e => e.preventDefault()}>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-secondary-500 whitespace-nowrap">Guests:</span>
                <input
                  type="range" min={2} max={16} value={guests}
                  onChange={e => setGuests(+e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 h-1.5 appearance-none rounded-full bg-primary-200 accent-primary-600 cursor-pointer"
                />
                <span className="text-sm font-bold text-primary-600 min-w-[20px] text-center">{guests}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-sm leading-tight font-semibold text-secondary-700">
                  = <span className="text-primary-600">{formatIDR(perPerson)}</span> / person
                </span>
                {isCheaper && <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-700">CHEAPER THAN GROUP!</span>}
                {isSame    && <span className="rounded-md bg-sky-100 px-2 py-0.5 text-2xs font-bold text-sky-700">≈ SAME AS GROUP</span>}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href="/new/private"
          className="btn-primary mb-1 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-base leading-tight font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
        >
          Choose your boat <ArrowRight className="h-4 w-4" />
        </a>
        <p className="mb-5 text-center text-2xs text-secondary-400">20+ boats · pick your favorite</p>

        {/* Included list */}
        <ul className="space-y-2.5 border-t border-primary-100 pt-4">
          <InclItem>Entire boat — only your group on board</InclItem>
          <InclItem>Flexible departure time, you decide</InclItem>
          <InclItem>Custom route &amp; stops on request</InclItem>
          <InclItem>Snorkeling + manta ray spots included</InclItem>
          <InclItem>Drone, diving, birthday setups &amp; more</InclItem>
          <InclItem>Safety gear, certified crew &amp; guide</InclItem>
        </ul>
      </div>
    </div>
  );

  return (
    <section id="tours" className="scroll-mt-24 py-16 sm:py-24 bg-neutral-100">
      <div className="mx-auto max-w-[1100px] px-4">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-2xs font-bold uppercase tracking-wide-4xl text-primary-600 mb-3">Two ways to explore</p>
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Choose your <span className="text-primary-600">tour type</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-tight text-secondary-500">
            Same island, same iconic spots — different experience. Pick what suits your group.
          </p>
        </div>

        {/* Mobile tab switcher */}
        <div className="mb-6 md:hidden">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-neutral-200 bg-white p-1.5 ">
            <button
              onClick={() => setActiveTab("shared")}
              className={`rounded-full py-3 text-sm font-semibold transition-all ${activeTab === "shared" ? "bg-primary-600 text-white shadow-md" : "text-secondary-500 hover:bg-neutral-50"}`}
            >
              <span className="block leading-tight">Shared tour</span>
              <span className={`block text-2xs font-normal mt-0.5 ${activeTab === "shared" ? "text-white/75" : "text-secondary-400"}`}>
                from {sharedPrice > 0 ? formatIDR(sharedPrice) : "—"}/person
              </span>
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`rounded-full py-3 text-sm font-semibold transition-all ${activeTab === "private" ? "bg-primary-600 text-white shadow-md" : "text-secondary-500 hover:bg-neutral-50"}`}
            >
              <span className="block leading-tight">Private charter</span>
              <span className={`block text-2xs font-normal mt-0.5 ${activeTab === "private" ? "text-white/75" : "text-secondary-400"}`}>
                from {boatPrice > 0 ? formatIDR(boatPrice) : "—"}/boat
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className={activeTab === "shared" ? "block" : "hidden md:block"}>{sharedCard}</div>
          <div className={activeTab === "private" ? "block" : "hidden md:block"}>{privateCard}</div>
        </div>

        {/* Trust bar */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
          {TRUST_ITEMS.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-4 py-2.5 text-sm leading-tight text-secondary-600 shadow-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <Icon className="h-3.5 w-3.5 text-primary-500" />
              </span>
              {text}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


/* eslint-enable */
function TourTypeCards() {
  const TOUR_OPTIONS = useTourOptions();
  const { loading } = useTours();
  const [guests, setGuests] = useState(8);
  const [activeTab, setActiveTab] = useState("shared");

  const privateTour = TOUR_OPTIONS.find((t) => t.id === "private");
  const sharedTour = TOUR_OPTIONS.find((t) => t.id === "shared");

  const boatPrice = privateTour?.priceValue ?? 0;
  const sharedPrice = sharedTour?.priceValue ?? 0;
  const perPerson = guests > 0 ? Math.round(boatPrice / guests) : 0;
  const isCheaper = sharedPrice > 0 && perPerson < sharedPrice;
  const isSame = !isCheaper && sharedPrice > 0 && perPerson <= sharedPrice * 1.1;
  const guestProgress = ((guests - 2) / 14) * 100;
  const privateComparisonBadge = isCheaper
    ? {
      label: "Better than shared",
      className: "border border-emerald-200 bg-emerald-100 text-emerald-700",
    }
    : isSame
      ? {
        label: "Close to shared",
        className: "border border-primary-200 bg-primary-100 text-primary-700",
      }
      : null;

  const sharedBenefits = [
    "Small group with up to 10 guests per boat",
    "Lunch at a clifftop restaurant included",
    "Snorkeling with manta rays and iconic reef spots",
    "Land highlights like Kelingking and Crystal Bay",
    "Safety gear, certified crew, and guide included",
  ];

  const privateBenefits = [
    "Entire boat reserved only for your group",
    "Flexible departure and stop timing",
    "Custom route and optional add-ons on request",
    "Snorkeling and manta ray spots included",
    "Great fit for families, birthdays, and friend groups",
  ];

  const sharedCard = (
    <TourTypeCardShell
      badge="Best value"
      badgeIcon={Star}
      imageSrc="https://bluuu.tours/storage/app/media/shared.webp"
      imageAlt="Shared group tour"
    >
      <div>
        <p className="mb-0.5 text-xs leading-tight font-semibold uppercase text-secondary-500">Join a small group</p>
        <h3 className="mb-1.5 text-2xl leading-tight font-semibold tracking-tight text-secondary-900">
          Shared Tour
        </h3>
        <p className="mb-6 text-sm leading-snug text-secondary-600">
          Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and smooth from pickup to drop-off.
        </p>
      </div>

      <div className="mb-2 flex flex-col space-y-2 rounded-xl bg-neutral-100 p-4">
        <TourTypeDetailRow icon={Anchor}><strong>One shared speedboat</strong> for up to <strong>10 guests</strong></TourTypeDetailRow>
        <TourTypeDetailRow icon={Users}><strong>Fixed departure time</strong> with fellow travellers onboard</TourTypeDetailRow>
      </div>

      <div className="mb-2 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-xs uppercase text-secondary-400">from</span>
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-xl bg-neutral-100" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-primary-600">{formatIDR(sharedPrice)}</span>
          )}
          <span className="text-sm text-secondary-500">/ person</span>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-2xs font-semibold uppercase text-emerald-700">
            All inclusive
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-snug text-secondary-500">
          Lunch, snorkeling gear, guide, and boat ride included. No hidden fees.
        </p>
      </div>

      <a
        href="/new/shared"
        className="btn-outline inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary-600 bg-white px-5 py-3.5 text-base leading-tight font-semibold text-primary-600"
      >
        See tour details <ArrowRight className="h-4 w-4" />
      </a>
      <p className="mb-3 mt-2 text-center text-xs leading-tight uppercase tracking-wide-lg text-secondary-400">
        No payment required to view options
      </p>

      <ul className="space-y-1.5 pt-2">
        {sharedBenefits.map((item) => (
          <TourTypeBenefitItem key={item}>{item}</TourTypeBenefitItem>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-primary-100 bg-primary-50/70 px-4 py-2.5 text-xs text-secondary-600">
        <span>Want the whole boat for your group instead?</span>
        <a href="/new/private" className="ml-auto whitespace-nowrap font-semibold text-primary-600 transition hover:text-primary-700">
          Go private <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </a>
      </div>
    </TourTypeCardShell>
  );

  const privateCard = (
    <TourTypeCardShell
      featured
      badge="Most popular"
      badgeIcon={Sparkles}
      badgeTone="blue"
      imageSrc="https://bluuu.tours/storage/app/media/private.webp"
      imageAlt="Private charter"
    >
      <div>
        <p className="mb-0.5 text-xs leading-tight font-semibold uppercase text-primary-600">Your boat, your rules</p>
        <h3 className="mb-1.5 text-2xl leading-tight font-semibold tracking-tight text-secondary-900">
          Private Charter
        </h3>
        <p className="mb-4 text-sm leading-snug text-secondary-600">
          The entire boat is yours. Choose the timing, adjust the stops, and set the pace for your group.
        </p>
      </div>

      <div className="mb-2 flex flex-col space-y-2 rounded-xl bg-neutral-100 p-4">
        <TourTypeDetailRow icon={Anchor}><strong>20+ boats</strong> available across different sizes and styles</TourTypeDetailRow>
        <TourTypeDetailRow icon={Users}><strong>2-45 guests</strong> with <strong>flexible routing</strong> and <strong>private pacing</strong></TourTypeDetailRow>
      </div>

      <div className="mb-2 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-xs uppercase text-secondary-400">from</span>
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-xl bg-neutral-100" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-primary-600">{formatIDR(boatPrice)}</span>
          )}
          <span className="text-sm text-secondary-500">/ entire boat</span>
        </div>

        {!loading && boatPrice > 0 && (
          <>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-secondary-400 whitespace-nowrap">Your group:</span>
              <input
                type="range"
                min={2}
                max={16}
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-primary-600"
                style={{
                  background: `linear-gradient(90deg, var(--primary-600) 0%, var(--primary-600) ${guestProgress}%, var(--primary-200) ${guestProgress}%, var(--primary-200) 100%)`,
                }}
              />
              <span key={guests} className="num-pop min-w-[20px] text-right text-sm font-bold text-secondary-900">{guests}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="text-xs text-secondary-400">=</span>
              <span key={perPerson} className="num-pop text-2xl font-bold text-primary-600">{formatIDR(perPerson)}</span>
              <span className="text-sm text-secondary-500">/ person</span>
              {privateComparisonBadge && (
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold uppercase", privateComparisonBadge.className)}>
                  {privateComparisonBadge.label}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <a
        href="/new/private"
        className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3.5 text-base leading-tight font-semibold text-white shadow-blue-glow"
      >
        Choose your boat <ArrowRight className="h-4 w-4" />
      </a>
      <p className="mb-3 mt-2 text-center text-2xs uppercase  text-secondary-400">
        20+ boats ready for your route
      </p>

      <ul className="space-y-1.5 pt-2">
        {privateBenefits.map((item) => (
          <TourTypeBenefitItem key={item}>{item}</TourTypeBenefitItem>
        ))}
      </ul>
    </TourTypeCardShell>
  );

  return (
    <section id="tours" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(0,127,255,0.09),transparent_70%)]" />
      <div className="container">
        <div className="mb-8 text-center sm:mb-12">
          <p className="mb-3 text-2xs font-semibold uppercase tracking-wide-4xl text-primary-600">Two ways to explore</p>
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Choose your <span className="text-primary-600">tour type</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-base leading-tight leading-7 text-secondary-500 sm:text-base">
            Same island, same iconic spots, different experience. Pick the format that fits your group best.
          </p>
        </div>

        <div className="mb-6 md:hidden">
          <div className="relative grid grid-cols-2 gap-1.5 rounded-xl border border-neutral-200 bg-white p-1.5 ">
              <button
                type="button"
                onClick={() => setActiveTab("shared")}
                className="relative flex flex-col items-center justify-center rounded-xl px-4 py-4 text-center z-10"
              >
                {activeTab === "shared" && (
                  <motion.div
                    layoutId="tourTabBg"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "#1B3132", boxShadow: "0 8px 20px rgba(27,49,50,0.30)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={cn("relative block text-sm font-semibold leading-tight", activeTab === "shared" ? "text-white" : "text-secondary-500")}>Shared tour</span>
                <span className={cn("relative mt-1 block text-2xs", activeTab === "shared" ? "text-white/70" : "text-secondary-400")}>
                  from {sharedPrice > 0 ? formatIDR(sharedPrice) : "--"} / person
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("private")}
                className="relative flex flex-col items-center justify-center rounded-xl px-4 py-4 text-center z-10"
              >
                {activeTab === "private" && (
                  <motion.div
                    layoutId="tourTabBg"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "#0073E0", boxShadow: "0 8px 20px rgba(0,115,224,0.22)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={cn("relative block text-sm font-semibold leading-tight", activeTab === "private" ? "text-white" : "text-secondary-500")}>Private charter</span>
                <span className={cn("relative mt-1 block text-2xs", activeTab === "private" ? "text-white/70" : "text-secondary-400")}>
                  from {boatPrice > 0 ? formatIDR(boatPrice) : "--"} / boat
                </span>
              </button>
          </div>
        </div>

        {/* Desktop — CSS subgrid: every section row is shared between both columns */}
        <div className="hidden md:grid md:grid-cols-2 gap-x-5 xl:gap-x-7">

          {/* ── SHARED ── */}
          <article className="[grid-row:span_7] grid [grid-template-rows:subgrid] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* 1. Badge */}
            <div className="flex h-9 items-center justify-center gap-1.5 bg-brand-dark px-4 text-2xs font-semibold uppercase text-white">
              <Star className="h-3.5 w-3.5" /><span>Best value</span>
            </div>
            {/* 2. Image */}
            <div className="rounded-b-xl bg-brand-dark">
              <div className="relative overflow-hidden rounded-xl">
                <img src="https://bluuu.tours/storage/app/media/shared.webp" alt="Shared group tour" loading="lazy" decoding="async" className="h-[220px] w-full object-cover transition duration-700 hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/20 to-transparent" />
              </div>
            </div>
            {/* 3. Title */}
            <div className="px-6 pt-5">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-secondary-400">Join a small group</p>
              <h3 className="mb-1.5 text-2xl font-bold tracking-tight text-secondary-900">Shared Tour</h3>
              <p className="text-sm leading-snug text-secondary-500">Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and smooth from pickup to drop-off.</p>
            </div>
            {/* 4. Info box */}
            <div className="px-6 pt-4">
              <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 px-4 py-3">
                <TourTypeDetailRow icon={Anchor}><strong>One shared speedboat</strong> for up to <strong>10 guests</strong></TourTypeDetailRow>
                <TourTypeDetailRow icon={Users}><strong>Fixed departure time</strong> with fellow travellers onboard</TourTypeDetailRow>
              </div>
            </div>
            {/* 5. Price box */}
            <div className="flex h-full px-6 pt-3">
              <div className="flex w-full flex-col rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                  <span className="text-sm text-secondary-400">from</span>
                  {loading
                    ? <div className="h-9 w-32 animate-pulse rounded-xl bg-neutral-100" />
                    : <span className="text-2xl font-bold tracking-tight text-primary-600">{formatIDR(sharedPrice)}</span>
                  }
                  <span className="text-sm text-secondary-500">/ person</span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-2xs font-semibold uppercase text-emerald-700">All inclusive</span>
                </div>
                <p className="mt-1.5 text-xs leading-snug text-secondary-500">Lunch, snorkeling gear, guide, and boat ride included. No hidden fees.</p>
              </div>
            </div>
            {/* 6. CTA */}
            <div className="px-6 pt-3">
              <a href="/new/shared" className="btn-outline flex w-full items-center justify-center gap-2 rounded-full border border-primary-600 py-3.5 text-base font-semibold text-primary-600">
                See tour details <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-2 text-center text-xs uppercase tracking-wide text-secondary-400">No payment required to view options</p>
            </div>
            {/* 7. Benefits + nudge */}
            <div className="flex flex-col justify-between px-6 pb-6 pt-3">
              <ul className="space-y-2">
                {sharedBenefits.map((item) => <TourTypeBenefitItem key={item}>{item}</TourTypeBenefitItem>)}
              </ul>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-2.5 text-xs text-secondary-600">
                <span>Want the whole boat for your group instead?</span>
                <a href="/new/private" className="ml-auto whitespace-nowrap font-semibold text-primary-600">Go private <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" /></a>
              </div>
            </div>
          </article>

          {/* ── PRIVATE ── */}
          <article className="[grid-row:span_7] grid [grid-template-rows:subgrid] overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-sm">
            {/* 1. Badge */}
            <div className="flex h-9 items-center justify-center gap-1.5 bg-primary-600 px-4 text-2xs font-semibold uppercase text-white">
              <Sparkles className="h-3.5 w-3.5" /><span>Most popular</span>
            </div>
            {/* 2. Image */}
            <div className="rounded-b-xl bg-primary-600">
              <div className="relative overflow-hidden rounded-xl">
                <img src="https://bluuu.tours/storage/app/media/private.webp" alt="Private charter" loading="lazy" decoding="async" className="h-[220px] w-full object-cover transition duration-700 hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/20 to-transparent" />
              </div>
            </div>
            {/* 3. Title */}
            <div className="px-6 pt-5">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary-500">Your boat, your rules</p>
              <h3 className="mb-1.5 text-2xl font-bold tracking-tight text-secondary-900">Private Charter</h3>
              <p className="text-sm leading-snug text-secondary-500">The entire boat is yours. Choose the timing, adjust the stops, and set the pace for your group.</p>
            </div>
            {/* 4. Info box */}
            <div className="px-6 pt-4">
              <div className="flex flex-col gap-2 rounded-xl bg-neutral-100 px-4 py-3">
                <TourTypeDetailRow icon={Anchor}><strong>20+ boats</strong> — speedboats to luxury yachts</TourTypeDetailRow>
                <TourTypeDetailRow icon={Users}><strong>2–45 guests</strong> — pick the right boat for your group</TourTypeDetailRow>
              </div>
            </div>
            {/* 5. Price box */}
            <div className="px-6 pt-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                  <span className="text-sm text-secondary-400">from</span>
                  {loading
                    ? <div className="h-9 w-32 animate-pulse rounded-xl bg-neutral-100" />
                    : <span className="text-2xl font-bold tracking-tight text-primary-600">{formatIDR(boatPrice)}</span>
                  }
                  <span className="text-sm text-secondary-500">/ entire boat</span>
                </div>
                {!loading && boatPrice > 0 && (
                  <>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-xs text-secondary-500 whitespace-nowrap">How many in your group?</span>
                      <input
                        type="range" min={2} max={16} value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-primary-600"
                        style={{ background: `linear-gradient(90deg, var(--primary-600) 0%, var(--primary-600) ${guestProgress}%, var(--primary-200) ${guestProgress}%, var(--primary-200) 100%)` }}
                      />
                      <span key={guests} className="num-pop min-w-[20px] text-right text-sm font-bold text-primary-600">{guests}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                      <span className="text-sm font-medium text-secondary-400">=</span>
                      <span key={perPerson} className="num-pop text-2xl font-bold text-primary-600">{formatIDR(perPerson)}</span>
                      <span className="text-sm text-secondary-500">/ person</span>
                      {privateComparisonBadge && (
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold uppercase", privateComparisonBadge.className)}>
                          {privateComparisonBadge.label}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* 6. CTA */}
            <div className="px-6 pt-3">
              <a href="/new/private" className="btn-primary flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-base font-semibold text-white shadow-blue-glow">
                Browse 20+ boats <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-2 text-center text-xs uppercase tracking-wide text-secondary-400">From speedboats to luxury yachts</p>
            </div>
            {/* 7. Benefits */}
            <div className="px-6 pb-6 pt-3">
              <ul className="space-y-2">
                {privateBenefits.map((item) => <TourTypeBenefitItem key={item}>{item}</TourTypeBenefitItem>)}
              </ul>
            </div>
          </article>

        </div>
        <div className="md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "shared" ? sharedCard : privateCard}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}


function RouteCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-5 w-2/5 animate-pulse rounded-lg bg-neutral-100" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-3.5 w-4/5 animate-pulse rounded-lg bg-neutral-100" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
        </div>
        <div className="mt-auto flex justify-end">
          <div className="h-4 w-24 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

function RouteCard({ route, bookHref }) {
  const tourImages = (route.tour_images || []).map(img => img.thumb1 || img.original).filter(Boolean);
  const displayImages = tourImages.length ? tourImages : (route.photos || []);
  const coverImg = typeof displayImages[0] === "string" ? displayImages[0] : (displayImages[0]?.thumb || displayImages[0]?.path);

  const chips = route.highlights || [];
  const bestFor = route.best_for || route.bestFor;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300">
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden rounded-b-2xl">
        {coverImg
          ? <img src={coverImg} alt={route.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-gradient-to-br from-primary-800 to-primary-600" />
        }
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold leading-tight text-secondary-900">{route.title}</h3>
        {route.description && (
          <div
            className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-secondary-500"
            dangerouslySetInnerHTML={{ __html: route.description }}
          />
        )}

        {/* Feature chips */}
        {chips.length > 0 && (
          <div className="mt-4 border-t border-neutral-100 pt-4 flex flex-wrap gap-x-4 gap-y-2">
            {chips.map((item) => {
              const Icon = typeof item.icon === "string"
                ? (ROUTE_ICON_MAP[item.icon] || Ship)
                : (item.icon || Ship);
              return (
                <div key={item.label} className="flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                  {item.label}
                </div>
              );
            })}
          </div>
        )}

        {/* Best for + link */}
        <div className="mt-auto pt-4">
          {bestFor && (
            <div className="mb-3 flex items-start gap-2 text-sm font-semibold leading-5 text-secondary-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{bestFor}</span>
            </div>
          )}
          <div className="border-t border-neutral-100 pt-4">
            <a
              href={bookHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-4"
            >
              See itinerary
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


function TourOptions({ activeTourId, onSelectTour }) {
  const { loading } = useTours();
  const TOUR_OPTIONS = useTourOptions();
  const toneStyles = {
    shared: {
      card: "bg-gradient-to-br from-[#f7fafc] via-[#f2f7fb] to-[#eef3f7]",
      text: "text-secondary-900",
      muted: "text-secondary-600",
      check: "text-primary-600",
      button: "bg-white border border-neutral-300 text-secondary-900 hover:border-[var(--accent)]/40",
    },
    premium: {
      card: "bg-gradient-to-br from-[#eef3f7] via-[#e2ebf3] to-[#d5e1ec] ring-0",
      text: "text-secondary-900",
      muted: "text-secondary-600",
      check: "text-primary-600",
      button: "bg-white border border-neutral-300 text-secondary-900 hover:border-[var(--accent)]/40",
    },
    private: {
      card: "bg-gradient-to-br from-[#f0f4f9] via-[#edf6fb] to-[#e3edf5]",
      text: "text-secondary-900",
      muted: "text-secondary-600",
      check: "text-primary-600",
      button: "bg-white border border-neutral-300 text-secondary-900 hover:border-[var(--accent)]/40",
    },
    "premium-private": {
      card: "bg-gradient-to-br from-[#e7edf6] via-[#dfe7ef] to-[#d5dfe7]",
      text: "text-secondary-900",
      muted: "text-secondary-600",
      check: "text-primary-600",
      button: "bg-white border border-neutral-300 text-secondary-900 hover:border-[var(--accent)]/40",
    },
  };
  const tourById = new Map(TOUR_OPTIONS.map((tour) => [tour.id, tour]));
  const groups = [
    {
      id: "shared-book",
      kicker: "Shared tours",
      title: "A shared tour that feels premium",
      subtitle: "Shared boats, small groups (max 13 guests), and a smooth, curated path.",
      tourIds: ["shared", "premium-shared"],
    },
    {
      id: "private-book",
      kicker: "Private tours",
      title: "Private yachts with elevated service",
      subtitle: "Fully private days for your group, flexible timing, and extra touches.",
      tourIds: ["private", "premium-private"],
    },
  ];

  return (
    <>
      {groups.map((group, index) => (
        <Section
          key={group.id}
          id={group.id}
          kicker={group.kicker}
          title={group.title}
          subtitle={group.subtitle}
          className="!pt-10 sm:!pt-12"
        >
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {group.tourIds.map((tourId) => {
                const tour = tourById.get(tourId);
                if (!tour) return null;
                const tone = toneStyles[tour.tone] ?? toneStyles.shared;
                const selected = activeTourId === tour.id;
                return (
                  <Card
                    key={tour.id}
                    className={cn(
                      "relative flex h-full flex-col p-6 shadow-none transition-all",
                      tone.card,
                      selected ? "ring-2 ring-primary-600" : ""
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-secondary-900">{tour.name}</h3>
                    </div>
                    <div className="text-xl font-semibold leading-tight text-secondary-900">
                      <span className="text-sm font-medium text-secondary-500 mr-1">from</span>
                      {formatIDR(tour.priceValue)}
                    </div>
                    {tour.priceNote ? (
                      <div className="text-xs font-semibold text-secondary-500">{tour.priceNote}</div>
                    ) : null}
                    <p className="mt-3 text-sm text-secondary-600">{tour.summary}</p>
                    <div className="mt-4 space-y-2">
                      {tour.highlights.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-secondary-600">
                          <Check className={cn("mt-1 h-4 w-4", tone.check)} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-secondary-600">
                      Best for: <span className="font-semibold text-secondary-900">{tour.bestFor}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectTour?.(tour.id)}
                      className={cn(
                        "mt-6 inline-flex items-center justify-center gap-2 rounded-[45px] border px-6 py-3 text-sm font-semibold transition",
                        tone.button
                      )}
                    >
                      {tour.cta}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      ))}
    </>
  );
}

function OverviewSection({ activeTourId, onSelectTour }) {
  const TOUR_OPTIONS = useTourOptions();
  const overviewDescription =
    "A full-day Nusa Penida experience that blends sea and land highlights. Expect curated stops, time in the water, and iconic viewpoints — organized to feel smooth, comfortable, and memorable across every tour type.";

  return (
    <Section
      id="overview"
      kicker="Tour overview"
      title="A full-day island experience"
      subtitle={overviewDescription}
      className="!pt-12 sm:!pt-16"
    >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {TOUR_HIGHLIGHT_BADGES.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-secondary-500"
              >
                <badge.icon className="h-3.5 w-3.5 text-primary-600" />
                {badge.label}
              </span>
            ))}
          </div>
          <div className="text-sm text-secondary-600">{overviewDescription}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {OVERVIEW_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight.title}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/90 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                  <highlight.icon className="h-6 w-6 text-secondary-900" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-secondary-900">{highlight.title}</div>
                  <div className="text-xs text-secondary-600">{highlight.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="text-sm font-semibold text-secondary-900">Safety & logistics</div>
              <div className="mt-3 space-y-2 text-sm text-secondary-600">
                {SAFETY_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 text-primary-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-semibold text-secondary-900">What stays the same for all tours</div>
              <ul className="mt-3 space-y-2 text-sm text-secondary-600">
                {COMMON_GROUND_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 text-primary-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
        <div className="lg:col-span-1">
          <TourPicker activeTourId={activeTourId} onSelectTour={onSelectTour} />
        </div>
      </div>
    </Section>
  );
}

function CompareTable() {
  const TOUR_OPTIONS = useTourOptions();
  const compareTones = {
    shared: "border-neutral-200 bg-gradient-to-br from-[#f7fafc] via-[#f2f7fb] to-[#eaf2f7]",
    premium: "border-neutral-200 bg-gradient-to-br from-[#eef3f7] via-[#e2ebf3] to-[#d5e1ec]",
    private: "border-neutral-200 bg-gradient-to-br from-[#f0f4f9] via-[#edf6fb] to-[#e3edf5]",
    "premium-private": "border-neutral-200 bg-gradient-to-br from-[#e7edf6] via-[#dfe7ef] to-[#d5dfe7]",
  };
  const compareRows = [
    {
      label: "From",
      render: (tour) => (
        <div className="text-sm font-semibold text-secondary-900 whitespace-nowrap">
          {tour.price?.replace("From ", "")}
        </div>
      ),
    },
    {
      label: "Best for",
      render: (tour) => (
        <div className="text-sm text-secondary-600 truncate" title={tour.bestFor}>
          {tour.bestFor}
        </div>
      ),
    },
    {
      label: "Top inclusions",
      render: (tour) => (
        <ul className="space-y-2 text-xs text-secondary-600">
          {tour.highlights.slice(0, 3).map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-primary-600" />
              <span className="truncate" title={item}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Positioning",
      render: (tour) => (
        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-secondary-500">
          {tour.badge}
        </span>
      ),
    },
  ];

  return (
    <Section
      id="compare"
      kicker="Compare"
      title="Compare all tour types"
      subtitle="Highlights and positioning pulled from the tour cards, so you can see the differences at a glance."
    >
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[180px_repeat(4,1fr)] border-b border-neutral-200 px-4 py-4">
              <div className="text-xs font-black uppercase tracking-widest text-primary-600">Tour</div>
              {TOUR_OPTIONS.map((tour) => (
                <div key={tour.id} className="px-3">
                  <div
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left",
                      compareTones[tour.tone] ?? compareTones.shared
                    )}
                  >
                    <div className="text-sm font-semibold text-secondary-900">{tour.name}</div>
                    <div className="mt-2 inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-secondary-500">
                      {tour.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {compareRows.map((row, idx) => (
              <div
                key={row.label}
                className={cn(
                  "grid grid-cols-[180px_repeat(4,1fr)] px-4 py-4",
                  idx % 2 === 0 ? "bg-neutral-50" : "bg-white",
                  idx !== compareRows.length - 1 ? "border-b border-neutral-200" : ""
                )}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-500">{row.label}</div>
                {TOUR_OPTIONS.map((tour) => (
                  <div key={`${row.label}-${tour.id}`} className="px-3">
                    {row.render(tour)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function SocialProof() {
  return (
    <Section
      id="social"
      kicker="Trusted by travelers"
      title="A premium tour with seamless flow"
    >
      <div className="overflow-hidden rounded-xl bg-white p-4 sm:p-6">
        <div className="elfsight-app-1f614ea8-8602-4273-83b3-ab40c213a3d7" data-elfsight-app-lazy />
      </div>
    </Section>
  );
}

function WhyBluuu() {
  const cards = [
    {
      iconUrl: "https://bluuu.tours/storage/app/media/icons%20from%20upwork/l1.svg",
      title: "Comfort-first boats",
      text: "A smooth ride, attentive crew, and a relaxed pace from start to finish.",
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
      title: "Free Cancellation",
      text: "Free cancellation up to 24 hours before your tour. Bad weather? We'll reschedule or refund.",
    },
  ];

  return (
    <Section
      id="why"
      kicker="Why book this tour"
      title="The premium way to do Nusa Penida in one day"
      subtitle="Comfort-first day trips with clear logistics and a flexible pace across every tour option."
      titleClassName="text-2xl sm:text-3xl"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 auto-rows-fr">
        {cards.map((c, i) => (
          <Card key={i} className="h-full p-4 sm:p-5">
            <div className="flex items-center justify-center">
              <img src={c.iconUrl} alt="" className="h-16 w-16 sm:h-24 sm:w-24" />
            </div>
            <div className="mt-1 text-xs font-semibold text-secondary-900 sm:text-sm">{c.title}</div>
            <div className="mt-1 text-xs leading-5 text-secondary-600 sm:text-sm sm:leading-6">{c.text}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <div className="text-sm font-semibold text-secondary-900">Designed for a seamless day on the water.</div>
            <div className="mt-2 text-sm leading-6 text-secondary-600">
              A dedicated crew manages the day end-to-end so you can relax and enjoy every moment.
            </div>
          </div>
          <div className="lg:col-span-4">
            <PrimaryLink href="#tours" className="w-full">
              Choose your tour
            </PrimaryLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

function DayPlan() {
  const BLOCK_BACKGROUND = "bg-white";

  const groups = [
    {
      label: "Morning",
      items: [
        {
          title: "Cruise & snorkel",
          icon: Waves,
          text: "Board the yacht and visit curated snorkel spots with calm waters.",
          tint: "bg-gradient-to-r from-[#eef6ff] to-[#f7fbff]",
          iconTone: "text-primary-600 bg-primary-600/20",
        },
      ],
    },
    {
      label: "Midday",
      items: [
        {
          title: "Lunch & relax",
          icon: UtensilsCrossed,
          text: "Lunch with ocean views and time to refresh before the second half.",
          tint: "bg-gradient-to-r from-[#eef6ff] to-[#f7fbff]",
          iconTone: "text-primary-600 bg-primary-600/20",
        },
      ],
    },
    {
      label: "Afternoon",
      items: [
        {
          title: "Land highlights",
          icon: Car,
          text: "Short land stops for viewpoints and photo moments.",
          tint: "bg-gradient-to-r from-[#eef6ff] to-[#f7fbff]",
          iconTone: "text-primary-600 bg-primary-600/20",
        },
        {
          title: "Swim with mantas",
          icon: Star,
          text: "Manta ray swim (conditions permitting), guided by the crew.",
          tint: "bg-gradient-to-r from-[#eef6ff] to-[#f7fbff]",
          iconTone: "text-primary-600 bg-primary-600/20",
        },
      ],
    },
    {
      label: "Return",
      items: [
        {
          title: "Back to Bali",
          icon: Ship,
          text: "Return crossing and wrap-up at the lounge.",
          tint: "bg-gradient-to-r from-[#eef6ff] to-[#f7fbff]",
          iconTone: "text-primary-600 bg-primary-600/20",
        },
      ],
    },
  ];

  return (
    <Section
      id="plan"
      kicker="What to expect"
      title="Your day plan"
      subtitle="A smooth full-day flow with snorkeling, lunch, land highlights, and manta time."
      className=""
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-secondary-400">{g.label}</div>
                <div className="space-y-2">
                  {g.items.map((s) => (
                    <div
                      key={`${g.label}-${s.title}`}
                      className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                        <s.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-secondary-900">{s.title}</div>
                        <div className="mt-1 text-sm text-secondary-600">{s.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="mt-8 lg:mt-0 lg:sticky lg:top-24">
            <img
              src="https://bluuu.tours/themes/bluuu/assets/images/map.webp"
              alt="Route overview map"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Included() {
  const highlights = [
    {
      title: "Comfort yacht",
      text: "Premium seating, a smoother ride, and attentive crew service all day.",
      icon: Ship,
    },
    {
      title: "Curated lunch",
      text: "Lunch with ocean views and thoughtful service to recharge the day.",
      icon: UtensilsCrossed,
    },
    {
      title: "Land highlights",
      text: "Short land stops for iconic views, photos, and a relaxed pace.",
      icon: MapPin,
    },
    {
      title: "Underwater GoPro",
      text: "Underwater GoPro coverage keeps your snorkel moments on film.",
      icon: Camera,
    },
    {
      title: "Snorkeling equipment",
      text: "High-quality snorkeling gear supplied for every guest.",
      icon: Sparkles,
    },
    {
      title: "All entrance tickets",
      text: "Entrance fees and passes handled so you can skip the queues.",
      icon: Ticket,
    },
  ];

  return (
    <Section
      id="included"
      kicker="Included"
      title="Everything you want is already covered"
      subtitle="Simple, transparent inclusions — so you can focus on the day, not the fine print."
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <h.icon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-secondary-900">{h.title}</div>
              <div className="mt-1 text-sm text-secondary-600">{h.text}</div>
            </div>
          </div>
        ))}
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
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
            isOpen
              ? "rotate-45 border-primary-200 bg-primary-50 text-primary-500"
              : "border-neutral-200 bg-neutral-50 text-secondary-400"
          )}
        >
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
  const { faqs: apiFaqs, loading: faqLoading } = useTours();
  const contacts = useSiteContacts();
  const [showAll, setShowAll] = useState(false);

  // API returns { id, question, answer }; normalize to { q, a } expected by FAQItem
  const normalizedFaqs = apiFaqs?.length
    ? apiFaqs.map(f => ({ q: f.question, a: f.answer }))
    : [];

  const primaryFaqs = normalizedFaqs.slice(0, 5);

  return (
    <Section
      id="faq"
      backgroundClassName="bg-gradient-to-b from-[#f0f6ff] via-white to-[#f5f9ff]"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">FAQ</div>
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {faqLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b border-neutral-100 px-6 py-5 last:border-0">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
                </div>
              ))}
            </div>
          ) : (
            (showAll ? normalizedFaqs : primaryFaqs).map((faq, i) => (
              <FAQItem key={faq.id ?? i} q={faq.q} a={faq.a} />
            ))
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          {!showAll && !faqLoading && normalizedFaqs.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              See all questions
            </button>
          )}

          <div className="relative flex w-full items-center gap-5 overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
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
function BookingMini({ activeTourId, onSelectTour }) {
  const TOUR_OPTIONS = useTourOptions();
  const todayISO = (() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  })();
  const [adults, setAdults] = useState(2);
  const [date, setDate] = useState(todayISO);

  const activeTour = TOUR_OPTIONS.find((tour) => tour.id === activeTourId) || TOUR_OPTIONS[0];

  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Book (demo)</div>
      <div className="mt-3 grid gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-secondary-600">Tour</span>
          <div className="relative">
            <select
              value={activeTourId}
              onChange={(e) => onSelectTour?.(e.target.value)}
              className="h-11 w-full appearance-none rounded-[18px] border border-neutral-200 bg-white px-3 pr-10 text-sm text-secondary-900 shadow-sm outline-none focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-primary-600/10"
            >
              {TOUR_OPTIONS.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
          </div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-secondary-600">Date</span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
              <input
                type="date"
                value={date}
                min={todayISO}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full rounded-[18px] border border-neutral-200 bg-white pl-10 pr-3 text-sm text-secondary-900 shadow-sm outline-none focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-primary-600/10"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-secondary-600">Guests</span>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
              <select
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                className="h-11 w-full appearance-none rounded-[18px] border border-neutral-200 bg-white pl-10 pr-10 text-sm text-secondary-900 shadow-sm outline-none focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-primary-600/10"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          onClick={() => alert(`Reserve: ${activeTour.name}, ${date}, guests: ${adults}. (Demo action)`)}
          className={cn(
            "btn-primary inline-flex w-full items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
          )}
        >
          Check availability <ArrowRight className="h-4 w-4" />
        </button>
        <SecondaryButton onClick={() => alert("WhatsApp demo action")}
        >
          <MessageCircle className="h-4 w-4" />
          Chat with a manager
        </SecondaryButton>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill icon={Shield}>Free cancellation 24h</Pill>
        <Pill icon={Sun}>Weather guarantee</Pill>
      </div>
    </Card>
  );
}



function MobileStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white backdrop-blur sm:hidden">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <a
          href="#book"
          className={cn(
            "btn-primary inline-flex w-full items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
          )}
        >
          Check availability <ArrowRight className="h-4 w-4" />
        </a>
        <div className="mt-2 flex items-center justify-between text-xs text-secondary-500">
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-primary-600" /> Free cancellation 24h
          </span>
          <span className="inline-flex items-center gap-1">
            <Sun className="h-3.5 w-3.5 text-primary-600" /> Weather guarantee
          </span>
        </div>
      </div>
    </div>
  );
}

function PrimaryLink({ href, children, className, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "btn-primary inline-flex items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-6 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
        className
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SecondaryLink({ href, children, className, targetBlank = false }) {
  return (
    <a
      href={href}
      target={targetBlank ? "_blank" : undefined}
      rel={targetBlank ? "noreferrer" : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[45px] border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-secondary-900 transition hover:bg-neutral-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
        className
      )}
    >
      {children}
    </a>
  );
}

function SecondaryButton({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-[45px] border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-secondary-900 transition hover:bg-neutral-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
        className
      )}
    >
      {children}
    </button>
  );
}

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-primary-300",
        className
      )}
    >
      {children}
    </div>
  );
}

function Section({ id, kicker, title, subtitle, children, titleAddon, className, titleClassName }) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-24", className)}>
      <div className="container">
        <div className="mb-10 text-center">
          {kicker ? (
            <div className="text-xs font-black uppercase tracking-widest text-primary-600">
              {kicker}
            </div>
          ) : null}
          {title ? (
            <>
              <h2 className={cn("mt-2 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl", titleClassName)}>
                {title}
              </h2>
              {titleAddon ? titleAddon : null}
            </>
          ) : null}
          {subtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-secondary-600">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function RoutesBlock({ id, kicker, title, subtitle, routes, bookHref, bookLabel, loading }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const skeletonItems = Array.from({ length: 3 });

  return (
    <Section id={id} kicker={kicker} title={title} subtitle={subtitle}>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonItems.map((_, i) => <RouteCardSkeleton key={i} />)}
        </div>
      ) : routes.length > 0 ? (
        <>
          {/* Cards — horizontal scroll on mobile, grid on desktop */}
          <div className="-mx-4 overflow-hidden sm:mx-0">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
              {routes.map((route) => (
                <div key={route.id} className="w-[300px] shrink-0 snap-center sm:w-auto">
                  <RouteCard route={route} bookHref={bookHref} />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex justify-center">
            <a href={bookHref} className="btn-primary inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
              {bookLabel} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </>
      ) : null}
    </Section>
  );
}

const SHARED_TIERS = [
  {
    id: "classic",
    ribbon: { text: "★ Best price", bg: "bg-neutral-800/80" },
    label: "Classic",
    title: "The essentials, done right",
    desc: "Everything you need, nothing you don't. The full Nusa Penida experience at the best price.",
    price: "$99",
    priceTag: null,
    imgGradient: "from-teal-700 to-teal-500",
    boat: [
      { Icon: Ship,  text: "Speedboat · 12m" },
      { Icon: Users, text: "Max 13 guests" },
      { Icon: Sun,   text: "Partial shade · open deck" },
    ],
    solid: false,
    upgradeNote: null,
    incl: [
      { plus: false, text: "Snorkeling at 4 top spots + manta rays" },
      { plus: false, text: "Land tour to Kelingking Cliff" },
      { plus: false, text: "Lunch at cliff restaurant" },
      { plus: false, text: "Snorkel gear, towels, GoPro photos" },
      { plus: false, text: "Hotel transfer & insurance" },
    ],
  },
  {
    id: "premium",
    ribbon: { text: "✦ Most popular", bg: "bg-primary-600" },
    label: "Premium",
    title: "More space, more time, more fun",
    desc: "Bigger boat, extra hour on the route, and sunset prosecco on the way back. The sweet spot.",
    price: "$129",
    priceTag: "BEST SELLER",
    imgGradient: "from-blue-800 to-blue-600",
    boat: [
      { Icon: Ship,  text: "Premium Speedboat · 13m · 2024–2025" },
      { Icon: Users, text: "Max 13 guests" },
      { Icon: Sun,   text: "Shaded lounge · extra deck space" },
    ],
    solid: true,
    featured: true,
    upgradeNote: "Only +$30/person to upgrade from Classic",
    incl: [
      { plus: false, text: "Everything in Classic, plus:" },
      { plus: true,  text: "Extra 1h on the route — more snorkeling time" },
      { plus: true,  text: "Lunch at La Rossa beach club" },
      { plus: true,  text: "Pro photographer all day — 20–30 edited photos" },
      { plus: true,  text: "Underwater GoPro photos & video by guides" },
      { plus: true,  text: "All photos & videos delivered within 3 days" },
      { plus: true,  text: "Sunset prosecco on the cruise back" },
      { plus: true,  text: "Sound system on board" },
    ],
  },
  {
    id: "elite",
    ribbon: { text: "★ Top tier", bg: "bg-neutral-800/80" },
    label: "Elite",
    title: "The best we offer",
    desc: "Handcrafted yacht by Fortune Yachts, premium service, and the most relaxed pace on the water.",
    price: "$149",
    priceTag: "TOP TIER",
    imgGradient: "from-slate-900 to-slate-700",
    boat: [
      { Icon: Ship,  text: "Eldorado yacht · 13m · 2026" },
      { Icon: Users, text: "Max 13 guests" },
      { Icon: Sun,   text: "Full shade · bow lounge with sofas" },
    ],
    solid: false,
    upgradeNote: "Only +$20/person more than Premium",
    incl: [
      { plus: false, text: "Everything in Premium, plus:" },
      { plus: true,  text: "Brand-new Fortune Yachts Eldorado" },
      { plus: true,  text: "Drone photos & video included" },
      { plus: true,  text: "All photos & videos delivered next day" },
      { plus: true,  text: "Free GoPro rental — shoot your own content" },
      { plus: true,  text: "Lunch at luxury cliff-top hotel restaurant" },
      { plus: true,  text: "Photo stop at secret spot" },
      { plus: true,  text: "Most experienced guides — 3+ years with Bluuu" },
    ],
  },
];

const SHARED_COMPARE_ROWS = [
  { label: "Boat",              values: ["Speedboat 12m", "Premium Speedboat 13m", "Eldorado yacht 13m"] },
  { label: "Year",              values: ["Mixed fleet", "2024–2025", "2026"] },
  { label: "Shade",             values: ["Partial", "Shaded lounge", "Full + bow lounge"] },
  { label: "Snorkeling spots",  values: ["✓ 4 spots", "✓ 4 spots", "✓ 4 spots"],  check: [true,true,true] },
  { label: "Manta rays",        values: ["✓", "✓", "✓"],  check: [true,true,true] },
  { label: "Extra time",        values: ["—", "+1 hour", "+1 hour"], check: [false,true,true] },
  { label: "Lunch",             values: ["Cliff restaurant", "La Rossa beach club", "Luxury restaurant"] },
  { label: "Photographer",      values: ["—", "✓ 20–30 photos", "✓ 20–30 photos"], check: [false,true,true] },
  { label: "Underwater GoPro",  values: ["✓ by guides", "✓ by guides", "✓ by guides"], check: [true,true,true] },
  { label: "Drone photo/video", values: ["—", "—", "✓"], check: [false,false,true] },
  { label: "Photo delivery",    values: ["—", "Within 3 days", "Next day"], check: [false,false,true] },
  { label: "GoPro rental",      values: ["—", "✓", "✓ Free"], check: [false,true,true] },
  { label: "Secret spot",       values: ["—", "—", "✓"], check: [false,false,true] },
  { label: "Sunset prosecco",   values: ["—", "✓", "✓"], check: [false,true,true] },
  { label: "Guides",            values: ["Certified", "Certified", "Senior 3yr+"] },
  { label: "Price / person",    values: ["$99", "$129", "$149"], priceRow: true },
];

function SharedTiersBlock() {
  const [activeIdx, setActiveIdx]     = useState(1); // default: Premium
  const [showCompare, setShowCompare] = useState(false);
  const { sharedTours } = useTours();
  const { formatPrice }              = useCurrency();

  // Sort tours cheapest→most expensive to map Classic/Premium/Elite by price rank
  const sortedTours = useMemo(() => {
    if (!sharedTours?.length) return [];
    return [...sharedTours]
      .filter(t => t.status !== "disabled" && t.status !== "hidden")
      .sort((a, b) => {
        const pa = Number(a.prices?.[0]?.price || a.price || 0);
        const pb = Number(b.prices?.[0]?.price || b.price || 0);
        return pa - pb;
      });
  }, [sharedTours]);

  const tierImages = useMemo(() =>
    sortedTours.slice(0, 3).map(t => {
      const imgs = t.images_with_thumbs || [];
      return imgs[0]?.thumb1 || imgs[0]?.original || null;
    }), [sortedTours]);

  // Merge live data (description + price) from DB into hardcoded tier configs
  const tiersWithData = useMemo(() =>
    SHARED_TIERS.map((tier, i) => {
      const tour = sortedTours[i];

      const liveDesc = sanitizeDisplayText(tour?.description || tour?.json?.subtitle || "");

      // Min price across all rate seasons
      const rawPrices = (tour?.prices || []).map(p => Number(p.price)).filter(p => p > 0);
      const rawPrice = rawPrices.length
        ? Math.min(...rawPrices)
        : Number(tour?.price || 0);
      const livePrice = rawPrice > 0
        ? formatPrice(rawPrice, { fromCurrency: "IDR" })
        : null;

      return {
        ...tier,
        desc:  liveDesc  || tier.desc,
        price: livePrice || tier.price,
      };
    }), [sortedTours, formatPrice]);

  const TierCard = ({ tier, idx }) => {
    const headerBg = tier.featured ? "bg-primary-600" : "bg-brand-dark";
    return (
    <div className={`flex h-full w-full flex-col overflow-hidden rounded-xl bg-white border border-neutral-200 transition duration-300 ${
      tier.featured ? "border-primary-300" : ""
    }`}>
      {/* Solid header badge strip */}
      <div className={`flex h-9 items-center justify-center gap-1.5 px-4 text-2xs font-semibold uppercase  text-white ${headerBg}`}>
        <span>{tier.ribbon.text}</span>
      </div>
      {/* Image with matching color wrapping bottom corners */}
      <div className={`rounded-b-xl ${headerBg}`}>
        <div className="relative overflow-hidden rounded-xl">
          {tierImages[idx] ? (
            <img src={tierImages[idx]} alt={tier.label} className="h-[190px] w-full object-cover transition duration-700 group-hover:scale-103" loading="lazy" decoding="async" />
          ) : (
            <div className={`h-[190px] w-full bg-gradient-to-br ${tier.imgGradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/20 via-secondary-900/0 to-transparent" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-primary-500">{tier.label}</p>
        <h3 className="mb-1.5 min-h-[3.5rem] text-lg font-bold leading-tight text-secondary-900 line-clamp-3">{tier.title}</h3>
        <div className="mb-4 min-h-[2.75rem]">
          <p className="text-sm leading-relaxed text-secondary-500 line-clamp-2">{tier.desc}</p>
        </div>

        {/* Boat box */}
        <div className="mb-4 rounded-xl bg-neutral-100 p-3 flex flex-col gap-2">
          {tier.boat.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-secondary-600">
              <Icon className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="text-2xs text-secondary-400">from</span>
            <span className={`text-2xl font-bold tracking-tight ${tier.featured ? "text-primary-600" : "text-secondary-900"}`}>
              {tier.price}
            </span>
            <span className="text-sm text-secondary-500">/ person</span>
            {tier.priceTag && (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {tier.priceTag}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <a
          href="/new/shared"
          className={`mb-1 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold transition ${
            tier.solid
              ? "bg-primary-600 text-white hover:bg-primary-500 shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
              : "border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
          }`}
        >
          Select {tier.label} <ArrowRight className="h-4 w-4" />
        </a>
        <p className="mb-4 text-center text-2xs text-secondary-400">No payment required to view options</p>

        {/* Upgrade nudge */}
        {tier.upgradeNote && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-2xs font-semibold text-primary-600">
            ↑ {tier.upgradeNote}
          </div>
        )}

        {/* Included list */}
        <ul className="space-y-2 border-t border-neutral-100 pt-4">
          {tier.incl.map(({ plus, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm text-secondary-500">
              <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-2xs font-bold ${
                plus ? "bg-primary-50 text-primary-600" : "bg-emerald-50 text-emerald-700"
              }`}>
                {plus ? "+" : "✓"}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
    );
  };

  return (
    <Section
      id="shared-group"
      kicker="Shared tours"
      title={<>Pick your <span className="text-primary-600">comfort level</span></>}
      subtitle="Same incredible route, same manta rays. Choose how much comfort, space, and extras you want on the water."
      className="bg-neutral-100"
    >
      {/* Mobile tabs */}
      <div className="mb-5 sm:hidden">
        <div className="relative grid grid-cols-3 gap-1.5 rounded-xl border border-neutral-200 bg-white p-1.5 ">
            {tiersWithData.map((t, i) => {
              const tabColor = t.featured ? "#0073E0" : "#1B3132";
              const tabShadow = t.featured ? "0 8px 20px rgba(0,115,224,0.22)" : "0 8px 20px rgba(27,49,50,0.30)";
              return (
              <button
                key={t.id}
                onClick={() => setActiveIdx(i)}
                className="relative flex flex-col items-center justify-center rounded-xl px-2 py-4 text-center z-10"
              >
                {activeIdx === i && (
                  <motion.div
                    layoutId="sharedTabBg"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: tabColor, boxShadow: tabShadow }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={cn("relative block text-sm font-semibold leading-tight", activeIdx === i ? "text-white" : "text-secondary-500")}>{t.label}</span>
                <span className={cn("relative mt-0.5 block text-2xs", activeIdx === i ? "text-white/70" : "text-secondary-400")}>
                  from {t.price}
                </span>
              </button>
              );
            })}
        </div>
      </div>

      {/* Cards grid — desktop always shows all; mobile animates */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {tiersWithData.map((tier, i) => (
          <div key={tier.id}>
            <TierCard tier={tier} idx={i} />
          </div>
        ))}
      </div>
      <div className="sm:hidden overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <TierCard tier={tiersWithData[activeIdx]} idx={activeIdx} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Compare toggle (mobile) */}
      <button
        onClick={() => setShowCompare(v => !v)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-primary-600 shadow-sm transition hover:bg-primary-50 sm:hidden"
      >
        {showCompare ? "Hide comparison" : "Compare all three side by side"}
        <ChevronDown className={`h-4 w-4 transition-transform ${showCompare ? "rotate-180" : ""}`} />
      </button>

      {/* Comparison table */}
      <div className={`mt-5 rounded-xl border border-neutral-200 bg-white p-5 ${showCompare ? "block" : "hidden sm:block"}`}>
        <p className="mb-4 text-sm font-bold text-secondary-900">Quick comparison</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="w-[38%] rounded-tl-xl bg-neutral-100 p-2 text-left font-semibold text-secondary-700"></th>
                {SHARED_TIERS.map((t, i) => (
                  <th key={t.id} className={`p-2 text-center font-bold ${i === 1 ? "bg-primary-50 text-primary-700" : "bg-neutral-100 text-secondary-700"} ${i === 2 ? "rounded-tr-xl" : ""}`}>
                    {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHARED_COMPARE_ROWS.map((row, ri) => (
                <tr key={row.label} className="border-t border-neutral-100">
                  <td className="py-2.5 px-3 font-medium text-secondary-500">{row.label}</td>
                  {row.values.map((val, vi) => (
                    <td key={vi} className={`py-2.5 px-3 text-center ${vi === 1 ? "bg-primary-50/50" : ""} ${
                      row.check?.[vi] ? "font-semibold text-emerald-600" :
                      row.priceRow ? "font-bold text-primary-600" :
                      val === "—" ? "text-secondary-300" : "text-secondary-600"
                    }`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 flex justify-center">
        <a href="/new/shared" className="btn-primary inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
          Book Shared Tour <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Section>
  );
}

function RouteBlocks() {
  const { privateRoutes, loading } = useExtras();
  return (
    <RoutesBlock
      id="private-group"
      kicker="Private routes"
      title="Pick your private tour route"
      subtitle="Your own yacht, your own pace — select the route for your group."
      routes={privateRoutes}
      bookHref="/new/private"
      bookLabel="Book Private Tour"
      loading={loading}
    />
  );
}

function BoatsHomeBlock() {
  const { privateTours, loading } = useTours();

  const boats = useMemo(() => {
    if (!privateTours?.length) return [];
    return privateTours.map((tour) => {
      const pricelist = tour.packages?.pricelist || [];
      const entry = pricelist.find(p => Number(p.members_count) === 1) || pricelist[0];
      const price = Number(tour.boat_price) || Number(entry?.price) || 0;
      const images = (tour.images_with_thumbs || []).map(img => img.thumb1 || img.original).filter(Boolean);
      const cover  = images[0] || null;
      const bf     = tour.boatFeatures || {};
      const lengthMeters = getBoatLength(tour);
      const boatTypeLabel = [bf.boat_type || null, lengthMeters ? `${lengthMeters}M` : null]
        .filter(Boolean).join(" · ").toUpperCase();
      return {
        id:           tour.id,
        name:         tour.name,
        cover,
        images,
        people:       tour.capacity || 1,
        price,
        desc:         sanitizeDisplayText(tour.description || "") || null,
        fleetSize:    Number(tour.fleet_size) || 0,
        boatFeatures: tour.boatFeatures || null,
        boatTypeLabel,
        bestFor:      bf.best_for || null,
      };
    });
  }, [privateTours]);

  const skeletons = Array.from({ length: 4 });

  return (
    <Section
      id="fleet"
      kicker="Our fleet"
      title="Choose your boat"
      subtitle="Every boat is fully private for your group. Pick the model, size, and style — we'll handle the rest."
    >
      <div className="-mx-4 overflow-hidden sm:mx-0">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} className="w-[300px] shrink-0 snap-center sm:w-auto rounded-xl border border-neutral-200 bg-white overflow-hidden">
                <div className="h-[200px] w-full animate-pulse bg-neutral-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
                </div>
              </div>
            ))
          : boats.map((boat) => {
              const boatFeatures = getBoatFeatures(boat.boatFeatures);
              return (
                <div key={boat.id} className="w-[300px] shrink-0 snap-center sm:w-auto">
                <a
                  href="/new/private"
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all"
                >
                  {/* Image */}
                  {(boat.cover || boat.images?.[0]) && (
                    <div className="relative w-full overflow-hidden aspect-video">
                      <img
                        src={boat.cover || boat.images?.[0]}
                        alt={boat.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5 pt-4">
                    {boat.boatTypeLabel && (
                      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-500">{boat.boatTypeLabel}</div>
                    )}
                    <div className="text-xl font-bold text-secondary-900 leading-tight">{boat.name}</div>
                    <div className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-secondary-500 min-h-[2.75rem]"
                      dangerouslySetInnerHTML={{ __html: boat.desc || "" }} />

                    {boat.fleetSize > 1 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-600">
                        <Ship className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                        {boat.fleetSize} identical boats — we assign the best available for your date
                      </div>
                    )}

                    {boat.bestFor && (
                      <div className="mt-2.5">
                        <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                          Best for: {boat.bestFor}
                        </span>
                      </div>
                    )}

                    {/* Features + Price anchored to bottom */}
                    <div className="mt-auto">
                      {/* Features grid */}
                      <div className="border-t border-neutral-100 pt-3 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          <div className="flex items-center gap-2 px-2 text-xs font-medium text-secondary-900">
                            <Users className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
                            Up to {boat.people}
                          </div>
                          {boatFeatures.map(({ label, present, Icon }) => (
                            <div key={label} className={cn("flex items-center gap-2 px-2 text-xs", present ? "font-medium text-secondary-900" : "text-secondary-300")}>
                              <Icon className={cn("h-3.5 w-3.5 shrink-0", present ? "text-secondary-400" : "text-neutral-300")} />
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price + button */}
                      <div className="border-t border-neutral-100 pt-5">
                        <span className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition group-hover:bg-primary-500 shadow-[0_2px_10px_rgba(37,99,235,0.2)]">
                          Select
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
                </div>
              );
            })
        }
        </div>
      </div>
    </Section>
  );
}

export default function MainTest01() {
  useSEO({
    title: "Nusa Penida Day Tours from Bali | Bluuu Tours",
    description: "Award-winning private yacht & shared speedboat tours from Bali to Nusa Penida. Manta rays, snorkeling, diving & land tour — all-inclusive from IDR 1,300,000.",
  });
  const TOUR_OPTIONS = useTourOptions();
  const [activeTourId, setActiveTourId] = useState(TOUR_OPTIONS[1]?.id ?? TOUR_OPTIONS[0].id);

  return (
    <div
      className="min-h-screen bg-neutral-100 text-secondary-900"
      style={{
        "--accent": ACCENT,
        "--accent-dark": ACCENT_DARK,
        "--page-bg": PAGE_BG,
        "--ink": "#1f2632",
        "--ink-muted": "#4f5f75",
        "--ink-subtle": "#7a889c",
        "--line": "rgba(31,38,48,0.12)",
        "--line-soft": "rgba(31,38,48,0.08)",
        "--surface": "#ffffff",
        "--surface-muted": "#f7fafc",
        "--surface-soft": "#f2f6ff",
        "--surface-soft-border": "rgba(147, 176, 211, 0.35)",
      }}
    >
      <CurrencyBridge />
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "#book" }}
      />
      <Hero />
      <TourTypeCards />
      <SharedTiersBlock />
      <RouteBlocks />
      <BoatsHomeBlock />
      <GalleryBlock />
      <Included />
      <DayPlan />
      <SocialProof />
      <LogoSlider title="Trusted on top travel platforms" />
      <WhyBluuu />
      <FAQ />
      <Footer />
    </div>
  );
}
