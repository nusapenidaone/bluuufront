import React, { useState, useEffect, useMemo, useCallback } from "react";
import { faqs } from "./data/shared.json";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrency } from "./CurrencyContext";
import { useTours } from "./ToursContext";
import Modal from "./components/common/Modal";
import Skeleton, { CardSkeleton, GallerySkeleton } from "./components/common/Skeleton";
import { cn } from "./lib/utils";

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
  ArrowRight,
  BadgeCheck,
  Calendar,
  Car,
  Camera,
  Check,
  ChevronDown,
  Plus,
  Coffee,
  Trophy,
  ExternalLink,
  Globe,
  LifeBuoy,
  MapPin,
  MessageCircle,
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
} from "lucide-react";

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

const ACCENT = "#FF8F00";
const ACCENT_DARK = "#E67F00";
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
    summary: "Classic shared speedboat day tour with all the highlights.",
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

function Navbar() {
  return (
    <div className="sticky top-4 z-50">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 rounded-[45px] border border-neutral-200 bg-white px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src="https://bluuu.tours/themes/bluuu/assets/img/logo.svg"
            alt={`${BRAND.name} logo`}
            className="h-6 w-auto"
          />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {SECTIONS.filter((s) => s.id !== "book").map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-[24px] px-3 py-2 text-sm text-secondary-600 transition hover:bg-neutral-50 hover:text-secondary-900 font-semibold"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-settings"))}
            className="flex items-center gap-2 rounded-[24px] px-2 py-2 text-sm font-medium text-secondary-600 transition hover:bg-neutral-50 hover:text-secondary-900 sm:px-3"
          >
            <Globe className="h-5 w-5 text-primary-600 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <a
            href="#book"
            className={cn(
              "hidden xs:inline-flex items-center justify-center gap-2 rounded-[45px] bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 active:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
            )}
          >
            <span className="hidden sm:inline">Check</span> availability <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}






function HeroGallery({ images = [] }) {
  // If no images provided, render nothing or a fallback
  if (!images || images.length === 0) return null;

  // Create an array format expected by the gallery, defaulting labels
  const items = images.slice(0, 5).map((img, i) => ({
    label: `Gallery image ${i + 1}`,
    src: typeof img === 'string' ? img : (img.original || img.thumb1 || ""),
  })).filter(item => item.src);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[180px]">
      <div className="relative col-span-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm sm:col-span-2 sm:row-span-2">
        <img
          src={items[0].src}
          alt={items[0].label}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] h-full w-full scale-[1.4] origin-center object-cover sm:aspect-auto"
        />
        <div className="absolute inset-x-0 bottom-0 bg-white px-3 py-2 text-xs font-semibold text-secondary-900 backdrop-blur">
          {items[0].label}
        </div>
      </div>

      {items.slice(1).map((it) => (
        <div
          key={it.src}
          className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className="h-full bg-white">
            <img
              src={it.src}
              alt={it.label}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-white px-3 py-2 text-xs font-semibold text-secondary-900 backdrop-blur">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryBlock() {
  const { loading, privateTours } = useTours();
  const [videoOpen, setVideoOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <section id="gallery" className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-500">
              Gallery
            </div>
            <div className="mt-2 text-2xl font-bold leading-[1.08] text-secondary-900 sm:text-3xl">
              A quick look at the day
            </div>
            <div className="mt-2 max-w-3xl text-sm leading-6 text-secondary-600 sm:text-base">
              Browse highlights: lounge, yacht comfort, snorkeling, Kelingking, mantas, and post-tour moments.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="text-sm font-semibold text-secondary-600 transition hover:text-secondary-900"
              onClick={() => setGalleryOpen(true)}
            >
              View all photos
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-secondary-900"
              onClick={() => setVideoOpen(true)}
            >
              <Play className="h-4 w-4 text-primary-600" fill="currentColor" />
              Watch video
            </button>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <GallerySkeleton />
          ) : (
            <HeroGallery images={(privateTours || []).flatMap((t) => t.images_with_thumbs || [])} />
          )}
        </div>
      </div>

      {galleryOpen ? (
        <Modal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          title="All photos"
          maxWidth="max-w-6xl"
          className="border-neutral-300 bg-white"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(privateTours || []).flatMap(t => t.images_with_thumbs || []).map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-neutral-200">
                <img
                  src={img.original || img.thumb1}
                  alt="Tour gallery"
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full object-cover sm:h-56"
                />
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
      {videoOpen ? (
        <Modal
          isOpen={videoOpen}
          onClose={() => setVideoOpen(false)}
          title="Bluuu tour video"
          maxWidth="max-w-5xl"
          bodyClassName="p-0"
          className="border-neutral-300 bg-black"
        >
          <div className="aspect-video w-full">
            <iframe
              title="Bluuu tour video"
              src="https://www.youtube.com/embed/KUL8f7Z6d7Q?autoplay=1&rel=0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </Modal>
      ) : null}
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
          <div className="text-lg font-semibold text-secondary-900">{formatIDR(selectedTour.priceValue)}</div>
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
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:py-20">
        <div
          className="relative overflow-hidden rounded-[36px] border border-white/20 bg-cover bg-center shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(12, 16, 24, 0.42) 0%, rgba(12, 16, 24, 0.28) 45%, rgba(12, 16, 24, 0.08) 100%), url('${HERO_BACKGROUND_IMAGE}')`,
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-full bg-gradient-to-r from-[#0b0f18]/55 via-[#0b0f18]/40 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-28 z-0 h-80 w-80 rounded-full bg-[#ffd7b0]/25 blur-[80px]" />

          <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <motion.div
                className="lg:col-span-7"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-wrap gap-2">
                  {TOUR_HIGHLIGHT_BADGES.map((badge) => (
                    <span
                      key={badge.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                    >
                      <badge.icon className="h-3.5 w-3.5 text-white" />
                      {badge.label}
                    </span>
                  ))}
                </div>
                <h1 className="mt-6 tracking-tight font-bold text-4xl leading-[1.05] text-white sm:text-6xl">
                  <span className="block">Award-winning</span>
                  <span className="block">Bali to Nusa Penida</span>
                  <span className="block">full day tours</span>
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                  Experience the Ultimate Day Trip: Manta Rays, Snorkeling, Diving and Land Tour – All in One Unforgettable
                  Day
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <PrimaryLink href="#book" className="px-7 py-3.5 text-base">
                    View Tours
                  </PrimaryLink>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-sm font-semibold text-white/90 transition hover:text-white"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
                      <Play className="h-4 w-4 text-white" />
                    </span>
                    Watch video
                  </a>
                </div>

              </motion.div>

              <motion.div
                className="lg:col-span-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                <div className="relative mx-auto max-w-xs origin-top scale-[0.98] [--review-bottom:7rem] [--review-left:1.25rem] [--reviews-right:-0.5rem] [--reviews-top:-1.5rem]">
                  <div className="absolute -right-10 -top-6 h-28 w-28 rounded-3xl bg-[#ffd6b0] opacity-70 blur-2xl" />
                  <div className="relative rounded-[28px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                    <div className="relative z-20 mb-3 hidden inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary-900 shadow md:absolute md:mb-0 md:left-5 md:top-5">
                      <BadgeCheck className="h-3.5 w-3.5 text-primary-600" />
                      Award winner
                    </div>
                    <div className="relative overflow-hidden rounded-3xl">
                      <div className="absolute inset-2 rounded-[18px] border border-white/25 bg-white/10 backdrop-blur-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" />
                      <img
                        src="https://bluuu.tours/themes/bluuu/assets/img/winner-2.webp"
                        alt="Bluuu award winner"
                        className="relative z-10 h-[376px] w-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="mt-3 w-full max-w-[240px] rounded-2xl bg-white px-3.5 py-2.5 text-sm font-semibold text-secondary-900 shadow-[0_12px_24px_rgba(31,38,48,0.18)] md:absolute md:bottom-[var(--review-bottom)] md:left-[var(--review-left)] md:mt-0 md:w-auto md:max-w-[240px] md:z-20 md:-translate-y-[230px] md:-translate-x-[50px]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-secondary-600">
                      Guest review
                      <div className="flex items-center gap-0.5 text-primary-600">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className="h-3 w-3 fill-[var(--accent)] text-primary-600" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 text-base font-semibold leading-6 text-secondary-900">
                      "Best day of our vacation"
                    </div>
                  </div>

                  <div className="mt-3 w-full max-w-[220px] rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-secondary-900 shadow-[0_12px_24px_rgba(31,38,48,0.16)] md:absolute md:right-[var(--reviews-right)] md:top-[var(--reviews-top)] md:mt-0 md:w-auto md:max-w-[210px] md:z-20 md:translate-y-[15px] md:translate-x-[25px]">
                    <span className="text-primary-600">8,500+</span> reviews
                    <div className="mt-1 text-xs font-medium text-secondary-600">TripAdvisor, Airbnb, Klook</div>
                  </div>

                  <div className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs text-secondary-600 shadow-[0_14px_30px_rgba(31,38,48,0.18)] md:absolute md:bottom-[-40px] md:-translate-y-1/2 md:translate-x-[10px] md:left-[calc(1.5rem+20px)] md:right-[calc(1.5rem+20px)] md:mt-0 md:w-auto md:z-20">
                    <div className="space-y-0.5">
                      <div className="text-base font-semibold leading-5 text-secondary-900">
                        Bali’s <span className="text-primary-600">#1</span> yacht experience
                      </div>
                      <div className="text-xs leading-4 text-secondary-600">
                        Based on verified guest feedback
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
      id: "shared-group",
      kicker: "Shared tours",
      title: "A shared tour that feels premium",
      subtitle: "Shared boats, small groups (max 13 guests), and a smooth, curated path.",
      tourIds: ["shared", "premium-shared"],
    },
    {
      id: "private-group",
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
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-500">Tour</div>
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
  const reviews = [
    {
      name: "Sophie - UK",
      text: "Smooth boarding from the pier, great crew, and Crystal Bay was unreal. The lounge made the morning so easy.",
    },
    {
      name: "Max - Germany",
      text: "Mantas were the highlight. Loved the post-tour showers and snacks - felt premium even on a shared tour.",
    },
    {
      name: "Aisha - UAE",
      text: "No chaos, well organized, and the snorkeling spots were perfect. Would book again.",
    },
  ];

  const sources = [
    { label: "TripAdvisor", href: "https://www.tripadvisor.com/" },
    { label: "Google", href: "https://www.google.com/search" },
    { label: "Airbnb", href: "https://www.airbnb.com/" },
  ];

  const StarsRow = ({ size = 4 }) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star key={idx} className={cn("text-primary-600", size === 5 ? "h-5 w-5" : "h-4 w-4")} fill="currentColor" />
      ))}
    </div>
  );

  return (
    <Section
      id="social"
      kicker="Trusted by travelers"
      title="A premium tour with seamless flow"
      subtitle="Real guest quotes that highlight comfort, crew, and smooth logistics - the things that matter on the day."
    >
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary-600" fill="currentColor" />
                <div className="text-lg font-semibold text-secondary-900">{BRAND.reviewCount}</div>
                <div className="text-sm text-secondary-600">{BRAND.reviewLabel}</div>
              </div>
              <div className="mt-3 max-w-xl text-sm leading-6 text-secondary-600">
                Top mentions in reviews: it feels premium for a shared tour, the group stays small, and the team runs the
                day smoothly from start to finish.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-[#eef6ff] to-[#f7fbff] p-5 shadow-sm"
              >
                <StarsRow />
                <div className="mt-3 text-sm leading-6 text-secondary-600">"{r.text}"</div>
                <div className="mt-4 text-xs font-semibold text-secondary-500">{r.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-gradient-to-r from-[#eef6ff] to-[#f7fbff] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-secondary-900">More reviews from real guests</div>
                <div className="mt-1 text-sm text-secondary-600">
                  See what travelers say about comfort, group size, and the overall flow of the day.
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-secondary-600">
                  <span className="text-secondary-500">Review sources:</span>
                  {sources.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-secondary-900"
                    >
                      {s.label} <ExternalLink className="h-3.5 w-3.5 text-secondary-500" />
                    </a>
                  ))}
                </div>
              </div>
              <SecondaryLink href="https://www.tripadvisor.com/" targetBlank className="px-4 py-2 text-sm">
                See all reviews <ArrowRight className="h-4 w-4 text-secondary-500" />
              </SecondaryLink>
            </div>
          </div>
        </div>
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
            <PrimaryLink href="#book" className="w-full">
              Check availability
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
      subtitle="A smooth full-day flow with snorkeling, lunch, land highlights, and manta time (conditions permitting)."
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="space-y-3">
            {groups.map((g) => (
              <div
                key={g.label}
                className={cn("rounded-2xl border border-neutral-200 p-4 shadow-sm", BLOCK_BACKGROUND)}
              >
                <div className="text-sm font-semibold text-secondary-900">{g.label}</div>
                <div
                  className={cn(
                    "mt-3",
                    "space-y-3"
                  )}
                >
                  {g.items.map((s) => (
                    <div
                      key={`${g.label}-${s.title}`}
                      className={cn(
                        "flex items-start gap-4 rounded-2xl border border-neutral-200 bg-gradient-to-r px-3 py-3 first:mt-0 last:mb-0",
                        s.tint
                      )}
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", s.iconTone)}>
                        <s.icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-secondary-900">{s.title}</div>
                        <div className="mt-1 text-sm leading-6 text-secondary-600">{s.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden bg-white p-0">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-normal text-secondary-500">Route overview</div>
                    <div className="text-lg font-semibold text-secondary-900">Bali - Nusa Penida</div>
                  </div>
                  <div />
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

  const extras = ["Drinking water", "Certified guides", "Basic insurance", "Towels"];

  return (
    <Section
      id="included"
      kicker="Included"
      title="Everything you want is already covered"
      subtitle="Simple, transparent inclusions — so you can focus on the day, not the fine print."
    >
      <Card className="rounded-3xl p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-[0_10px_24px_rgba(31,38,48,0.06)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-transparent">
                <h.icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-secondary-900">{h.title}</div>
                <div className="mt-1 text-sm text-secondary-600">{h.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {extras.map((x) => (
            <span
              key={x}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-secondary-600"
            >
              <Check className="h-3.5 w-3.5 text-primary-600" />
              {x}
            </span>
          ))}
        </div>
      </Card>
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
            <div className="px-6 pb-5 pr-16 text-sm leading-relaxed text-secondary-500">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [showAll, setShowAll] = useState(false);
  const primaryFaqs = faqs.slice(0, 5);

  return (
    <Section
      id="faq"
      backgroundClassName="bg-gradient-to-b from-[#f0f6ff] via-white to-[#f5f9ff]"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">FAQ</div>
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {(showAll ? faqs : primaryFaqs).map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              See all questions
            </button>
          )}

          <div className="relative flex w-full flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold text-secondary-900">Have a special request?</div>
              <div className="mt-1 text-sm text-secondary-500">Everything else is covered above. For unusual requests, message us.</div>
            </div>
            <button
              onClick={() => alert("WhatsApp demo action")}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </button>
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

function FinalCTA({ activeTourId, onSelectTour }) {
  const TOUR_OPTIONS = useTourOptions();
  return (
    <section className="py-14 sm:py-16" id="book">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-[#f1f6fb] via-[#f7fbff] to-[var(--accent)]/15 p-8 shadow-sm">
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-28 -bottom-28 h-80 w-80 rounded-full bg-primary-600/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Ready to book</div>
              <h3 className="mt-2 text-2xl font-semibold text-secondary-900 sm:text-3xl">
                Reserve your Nusa Penida day - organized, comfortable, and memorable
              </h3>
              <p className="mt-3 text-sm leading-6 text-secondary-600 sm:text-base">
                Choose your tour, date, and group size. Free cancellation up to 24 hours and a weather guarantee mean you
                can book early without risk.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {BRAND.badges.map((b, i) => (
                  <Pill key={i} icon={b.icon}>
                    {b.label}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <BookingMini activeTourId={activeTourId} onSelectTour={onSelectTour} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { selectedCurrency } = useCurrency();
  return (
    <footer className="border-t border-neutral-100 bg-white pt-20 pb-0 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24">
          <div className="flex flex-col gap-6">
            <div className="text-xs font-semibold tracking-widest text-secondary-400 uppercase">
              BLUUU INC. /
            </div>
            <div className="space-y-4">
              <a href="mailto:support@bluuu.tours" className="block text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">
                support@bluuu.tours
              </a>
              <div className="text-sm text-secondary-500 leading-relaxed">
                Jl. Tukad Punggawa No.238, Serangan,<br />
                Denpasar Selatan, Bali 80228
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs font-semibold tracking-widest text-secondary-400 uppercase mb-4">
                DISCLAIMER /
              </div>
              <p className="text-xs leading-relaxed text-secondary-400 max-w-xs">
                Some images on this website are digitally enhanced to illustrate potential experiences. Your actual tour may vary depending on weather and sea conditions.
              </p>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary-400 uppercase mb-6">
              COMPANY /
            </div>
            <ul className="space-y-4">
              <li><a href="#tours" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Tours</a></li>
              <li><a href="#why" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">About</a></li>
              <li><a href="#gallery" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Gallery</a></li>
              <li><a href="#social" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Reviews</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary-400 uppercase mb-6">
              OTHERS /
            </div>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">Sustainability</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-widest text-secondary-400 uppercase mb-6">
              CONNECT /
            </div>
            <ul className="space-y-4">
              <li>
                <a href="#" className="group flex items-center justify-between text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">
                  <span>Instagram</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-transform duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center justify-between text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">
                  <span>WhatsApp</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-transform duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center justify-between text-sm font-medium text-secondary-900 hover:text-primary-600 transition-colors">
                  <span>YouTube</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-transform duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden leading-[0.75] select-none pt-0 pb-0 flex justify-center mt-[-40px] pointer-events-none relative z-0">
        <div className="text-[25vw] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 via-secondary-200 to-secondary-400 opacity-10 transform scale-y-110 translate-y-[10%] animate-gradient-flow">
          BLUUU
        </div>
      </div>

      <div className="border-t border-neutral-100 py-6 bg-white relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center justify-between md:flex-row gap-4">
          <span className="text-xs text-secondary-400">© 2026 Bluuu Inc. All rights reserved.</span>
          <button onClick={() => window.dispatchEvent(new CustomEvent("open-settings"))} className="flex items-center gap-2 text-xs font-semibold text-secondary-900 transition hover:text-primary-600">
            <Globe className="h-3 w-3" />
            {selectedCurrency?.toUpperCase()}
          </button>
        </div>
      </div>
    </footer>
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
        "rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_10px_24px_rgba(31,38,48,0.06)] transition-all hover:border-primary-100",
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
        <div className="mb-8">
          {kicker ? (
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-secondary-500">
              {kicker}
            </div>
          ) : null}
          {title ? (
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="break-words font-sans text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
                {title}
              </h2>
              {titleAddon ? titleAddon : null}
            </div>
          ) : null}
          {subtitle ? (
            <p className="mt-2 max-w-3xl break-words text-lg leading-relaxed text-secondary-600">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function MainTest01() {
  const TOUR_OPTIONS = useTourOptions();
  const [activeTourId, setActiveTourId] = useState(TOUR_OPTIONS[1]?.id ?? TOUR_OPTIONS[0].id);

  return (
    <div
      className="min-h-screen bg-white tracking-tight font-bold text-secondary-900"
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
      <Navbar />
      <Hero />
      <TourOptions activeTourId={activeTourId} onSelectTour={setActiveTourId} />
      <GalleryBlock />
      <Included />
      <OverviewSection activeTourId={activeTourId} onSelectTour={setActiveTourId} />
      <DayPlan />
      <SocialProof />
      <WhyBluuu />
      <FAQ />
      <FinalCTA activeTourId={activeTourId} onSelectTour={setActiveTourId} />
      <Footer />
      <MobileStickyCTA />
      <div className="h-24 sm:hidden" />
    </div>
  );
}
