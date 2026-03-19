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
import PhotoCarousel from "./components/common/PhotoCarousel";

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
const HERO_BACKGROUND_IMAGE = "https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp";

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
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-secondary-900 shadow-[0_6px_16px_rgba(31,38,48,0.08)]">
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
      <div className="mx-auto max-w-[1280px] px-4">
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
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">

            {/* ── MOBILE: 1 large + 2 bottom ── */}
            <div className="grid h-[440px] grid-rows-[1.2fr_1fr] gap-[3px] sm:hidden">
              {/* Large image */}
              <button
                type="button"
                className="group relative overflow-hidden"
                onClick={() => openFancybox(0)}
              >
                <img
                  src={previewMob[0].thumb}
                  alt={previewMob[0].title || "Gallery"}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </button>

              {/* 2 small images in a row */}
              <div className="grid grid-cols-2 gap-[3px]">
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
            <div className="hidden h-[520px] grid-cols-2 gap-[3px] sm:grid">
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
              <div className="grid grid-cols-2 gap-[3px]">
                <div className="grid min-h-0 grid-rows-[1.35fr_0.75fr] gap-[3px]">
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
                <div className="grid min-h-0 grid-rows-[0.75fr_1.35fr] gap-[3px]">
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
    <Card className="rounded-3xl p-6">
      <div className="text-sm font-semibold text-secondary-900">Check availability</div>
      <div className="mt-5 space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-500">Tour option</span>
          <div className="relative">
            <select
              value={activeTourId}
              onChange={(e) => onSelectTour?.(e.target.value)}
              className="h-11 w-full appearance-none rounded-[18px] border border-neutral-200 bg-white px-4 pr-10 text-sm text-secondary-900 outline-none focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-primary-600/10"
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

function Hero() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
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
    <section className="relative overflow-hidden pt-12 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div style={{ height: 40, overflow: 'hidden' }}><div className="elfsight-app-59bf9aa3-92ce-4654-aa87-9f5050b2af3a" /></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary-600 sm:text-sm">
              Full day tour · Bali to Nusa Penida · All-inclusive
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-secondary-900 sm:text-6xl lg:text-7xl">
              Award-winning tours to <br className="sm:hidden" /><span className="text-primary-600">Nusa Penida</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm text-secondary-600 sm:text-xl">
              Manta rays, snorkeling, diving, and a land tour — all in one unforgettable day.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#tours"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-600 px-8 text-base font-bold text-white shadow-xl transition hover:bg-primary-700 hover:scale-105 active:scale-95 sm:h-14"
              >
                View tours <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm font-medium text-secondary-500">
              24/7 WhatsApp support · Full refund if bad weather · Free cancellation 24h
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-2xl sm:mt-16 md:rounded-3xl"
        >
          <div className="aspect-[16/9] sm:aspect-[21/9]">
            <video
              ref={videoRef}
              src="https://bluuu.tours/storage/app/media/video-xl.webm"
              poster="https://bluuu.tours/storage/app/media/image-30-1.jpg"
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

function TourTypeCards() {
  const TOUR_OPTIONS = useTourOptions();
  const { loading } = useTours();

  const privateTour = TOUR_OPTIONS.find((t) => t.id === "private");
  const sharedTour = TOUR_OPTIONS.find((t) => t.id === "shared");

  const cards = [
      {
        id: "shared",
        tour: sharedTour,
        label: "Group tour",
        badge: "Best value",
        badgeIcon: Trophy,
        title: "Nusa Penida Full-Day Adventure",
        description: "Small groups, big highlights, all in one day.",
        highlights: [
          "Best snorkel spots + swim with mantas",
          "Lunch with ocean view included",
          "Kelingking Cliff & more",
        ],
        image: "https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp",
        href: "/new/shared",
        cta: "See Tour Details",
        priceNote: "/ person",
        featured: false,
      },
      {
        id: "private",
        tour: privateTour,
        label: "Private",
        badge: "Most popular for groups",
        badgeIcon: Users,
        title: "Nusa Penida - Just Your Group",
        description: "Same stunning spots, but on your own boat, your schedule, your pace.",
        highlights: [
          "No strangers on your boat",
          "Choose from 10+ boats for your group",
          "Add drone photos, diving & more",
        ],
        image: "https://bluuu.tours/storage/app/media/image-30-1.jpg",
        href: "/new/private",
        cta: "Choose Your Boat",
        priceNote: "/ boat",
        featured: true,
      },
  ];

  return (
    <section id="tours" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="mb-10 text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Choose your tour
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-secondary-600">
            Same stunning destination — pick what fits your group best.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <a
              key={card.id}
              href={card.href}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1",
                card.featured
                  ? "border-primary-300 bg-white shadow-[0_4px_24px_rgba(37,99,235,0.12)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.2)]"
                  : "border-neutral-200 bg-white shadow-sm hover:shadow-lg"
              )}
            >
              {/* Featured accent bar */}
              {card.featured && (
                <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-primary-500 to-primary-700" />
              )}

              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                {/* Badge top-left */}
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest shadow text-secondary-900">
                  {card.badgeIcon && <card.badgeIcon className="h-3.5 w-3.5 text-primary-600" />}
                  {card.badge}
                </span>
                {/* Featured label top-right */}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                {/* Title row + price */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      card.featured ? "text-primary-600" : "text-secondary-400"
                    )}>{card.label}</div>
                    <h3 className="mt-0.5 text-xl font-bold text-secondary-900">{card.title}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    {loading ? (
                      <div className="h-6 w-28 animate-pulse rounded-lg bg-neutral-200" />
                    ) : (
                      <>
                        <div className="text-lg font-bold text-secondary-900">
                          <span className="text-sm font-medium text-secondary-500 mr-1">from</span>
                          {formatIDR(card.tour?.priceValue ?? 0)}
                        </div>
                        <div className="text-xs text-secondary-400">{card.priceNote}</div>
                      </>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-secondary-500 line-clamp-2 min-h-[3rem]">{card.description}</p>

                <div className="mt-4 space-y-2.5">
                  {card.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2.5 text-sm text-secondary-700">
                      <span className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        card.featured ? "bg-primary-100" : "bg-primary-50"
                      )}>
                        <Check className={cn("h-3 w-3", card.featured ? "text-primary-600" : "text-primary-500")} />
                      </span>
                      {h}
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <span className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition",
                    card.featured
                      ? "bg-primary-600 text-white group-hover:bg-primary-700"
                      : "bg-primary-600 text-white group-hover:bg-primary-700"
                  )}>
                    {card.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


function RouteCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white">
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
  const chips = (route.highlights || []).slice(0, 4);
  const detailHref = bookHref;

  const tourImages = (route.tour_images || []).map(img => img.thumb1 || img.original).filter(Boolean);
  const displayImages = tourImages.length ? tourImages : (route.photos || []);

  const openGallery = () => {
    if (!displayImages.length) return;
    const slides = typeof displayImages[0] === "string"
      ? displayImages.map(src => ({ src, thumb: src, caption: route.title }))
      : displayImages.map(p => ({ src: p.path, thumb: p.thumb || p.path, caption: route.title }));
    Fancybox.show(slides);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <PhotoCarousel
        images={displayImages}
        alt={route.title}
        onOpenGallery={openGallery}
        className="aspect-[16/10]"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-secondary-900">{route.title}</span>
          {route.badge && (
            <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-600">
              {typeof route.badge === "string" ? route.badge : "Add-on"}
            </span>
          )}
        </div>
        {route.description && (
          <div className="text-sm leading-6 text-secondary-500"
            dangerouslySetInnerHTML={{ __html: route.description }}
          />
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((item) => {
              const Icon = typeof item.icon === "string"
                ? (ROUTE_ICON_MAP[item.icon] || MapPin)
                : (item.icon || MapPin);
              return (
                <span key={item.label} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-secondary-600">
                  <Icon className="h-3 w-3 text-primary-600" />
                  {item.label}
                </span>
              );
            })}
          </div>
        )}
        <a
          href={detailHref}
          className="mt-auto inline-flex items-center gap-2 self-end text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline"
        >
          View details <ArrowRight className="h-4 w-4" />
        </a>
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
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
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
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[180px_repeat(4,1fr)] border-b border-neutral-200 px-4 py-4">
              <div className="text-xs font-black uppercase tracking-widest text-primary-600">Tour</div>
              {TOUR_OPTIONS.map((tour) => (
                <div key={tour.id} className="px-3">
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left",
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
      <div className="overflow-hidden rounded-3xl bg-white p-4 sm:p-6">
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
      className=""
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 auto-rows-fr">
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

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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
                      className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5"
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
            className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
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

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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

          <div className="relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
              <img src="https://bluuu.tours/storage/app/media/images/manager.webp" alt="Expert" className="h-full w-full object-cover" />
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
            "inline-flex w-full items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
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
            "inline-flex w-full items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
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
        "inline-flex items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
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
        "rounded-[24px] border border-neutral-200 bg-white p-5 transition-all hover:border-primary-300",
        className
      )}
    >
      {children}
    </div>
  );
}

function Section({ id, kicker, title, subtitle, children, titleAddon, className }) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-24", className)}>
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="mb-10 text-center">
          {kicker ? (
            <div className="text-xs font-black uppercase tracking-widest text-primary-600">
              {kicker}
            </div>
          ) : null}
          {title ? (
            <>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
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
  const [isMobile, setIsMobile] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const carouselRef = useRef(null);
  const hasSwipedRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;
    const track = carouselRef.current;
    const handleScroll = () => {
      const card = track.querySelector("[data-route-card]");
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      if (!cardWidth) return;
      const next = Math.round(track.scrollLeft / cardWidth);
      setCarouselIndex(Math.min(Math.max(next, 0), routes.length - 1));
      if (!hasSwipedRef.current && track.scrollLeft > 4) {
        hasSwipedRef.current = true;
        setHasSwiped(true);
      }
    };
    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [isMobile, routes.length]);

  useEffect(() => { hasSwipedRef.current = hasSwiped; }, [hasSwiped]);

  const skeletonItems = Array.from({ length: 3 });

  return (
    <Section id={id} kicker={kicker} title={title} subtitle={subtitle}>
      {loading ? (
        <div
          className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-0 overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory sm:grid sm:gap-3 sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {skeletonItems.map((_, i) => (
            <div key={i} className="w-[calc(100vw-2rem)] shrink-0 snap-center pr-4 sm:w-auto sm:pr-0">
              <RouteCardSkeleton />
            </div>
          ))}
        </div>
      ) : routes.length > 0 ? (
        <>
          <div
            ref={carouselRef}
            className={cn(
              "no-scrollbar flex gap-0 overflow-x-auto pb-4 scroll-smooth [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "-mx-4 px-4 sm:mx-0 sm:px-0",
              "sm:grid sm:gap-3 sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-3",
              !showAllRoutes ? "snap-x snap-mandatory" : "flex-col overflow-visible"
            )}
          >
            {routes.map((route) => (
              <div
                key={route.id}
                data-route-card
                className={cn(
                  "w-[calc(100vw-2rem)] shrink-0 sm:w-auto",
                  !showAllRoutes && "snap-center snap-always pr-4 sm:pr-0",
                  showAllRoutes && "mb-4 sm:mb-0"
                )}
              >
                <RouteCard route={route} bookHref={bookHref} />
              </div>
            ))}
          </div>

          {/* Dots */}
          {isMobile && routes.length > 1 && !showAllRoutes && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(7, routes.length) }, (_, i) => {
                const maxDots = Math.min(7, routes.length);
                const start = Math.max(0, Math.min(carouselIndex - Math.floor(maxDots / 2), routes.length - maxDots));
                const dotIndex = start + i;
                const isActive = dotIndex === carouselIndex;
                return (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => {
                      const track = carouselRef.current;
                      const card = track?.querySelector("[data-route-card]");
                      if (!track || !card) return;
                      track.scrollTo({ left: dotIndex * card.getBoundingClientRect().width, behavior: "smooth" });
                      setHasSwiped(true);
                    }}
                    className={cn("h-1.5 w-1.5 rounded-full transition", isActive ? "bg-secondary-900" : "bg-secondary-300")}
                    aria-label={`Go to route ${dotIndex + 1}`}
                  />
                );
              })}
            </div>
          )}

          {/* Swipe hint */}
          {isMobile && !hasSwiped && routes.length > 1 && !showAllRoutes && (
            <div className="mt-2 flex items-center justify-center gap-1 text-sm text-secondary-300">
              <ChevronLeft className="h-3 w-3" /><span>Swipe</span><ChevronRight className="h-3 w-3" />
            </div>
          )}

          {/* View all / Back */}
          {isMobile && !showAllRoutes && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllRoutes(true)}
                className="rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-bold text-secondary-900 hover:bg-neutral-50 transition"
              >
                View all routes
              </button>
            </div>
          )}
          {isMobile && showAllRoutes && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => { setShowAllRoutes(false); setHasSwiped(false); hasSwipedRef.current = false; }}
                className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                <ChevronUp className="h-4 w-4" />
                Back to slider
              </button>
            </div>
          )}

          {/* Desktop CTA */}
          {!isMobile && (
            <div className="mt-6 flex justify-center">
              <a href={bookHref} className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700">
                {bookLabel} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </>
      ) : null}
    </Section>
  );
}

function RouteBlocks() {
  const { privateRoutes, sharedRoutes, loading } = useExtras();
  return (
    <>
      <RoutesBlock
        id="private-group"
        kicker="Private routes"
        title="Pick your private tour route"
        subtitle="Your own yacht, your own pace — select the route for your group."
        routes={privateRoutes}
        bookHref="/private"
        bookLabel="Book Private Tour"
        loading={loading}
      />
      <RoutesBlock
        id="shared-group"
        kicker="Shared routes"
        title="Pick your shared tour option"
        subtitle="Small groups, same boat — choose the itinerary that fits your day."
        routes={sharedRoutes}
        bookHref="/shared"
        bookLabel="Book Shared Tour"
        loading={loading}
      />
    </>
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
      <RouteBlocks />
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
