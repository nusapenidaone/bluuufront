import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Check, Shield, CloudRain, Car, HelpCircle, Ship, Compass, Calendar, Clock, Users, Sun, Moon, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { resolveScheduleIcon, sanitizeDisplayText, getLunchDisplayData } from "../../utils/tourScheduleUtils";
import Modal from "../common/Modal";
import PhotoCarousel from "../common/PhotoCarousel";
import { Fancybox } from "@fancyapps/ui";

const _renderPrice = (str) => {
  if (!str) return str;
  return str;
};

const PREMIUM_KEYWORDS = ["prosecco", "secret spot", "photo stop", "gopro rental", "drone", "la rossa"];
const FIRST_CLASS_KEYWORDS = ["eldorado", "fortune yachts", "acropora", "secret spot"];

const getItemTier = (title, details, tourTier) => {
  const lower = ((title || "") + " " + (details || "")).toLowerCase();
  const isFC = FIRST_CLASS_KEYWORDS.some(k => lower.includes(k));
  const isPrem = PREMIUM_KEYWORDS.some(k => lower.includes(k));
  if (isFC || isPrem) return tourTier || (isFC ? "first-class" : "premium");
  return null;
};

const ACTIVITY_TO_CATEGORY = {
  meeting: ["comfort", "food"],
  snorkeling: ["snorkel", "photo"],
  swim: ["snorkel", "photo"],
  manta: ["snorkel", "photo"],
  watersport: ["watersport", "sport"],
  cruise: ["celebration", "drinks"],
  back: ["celebration", "drinks"],
  departure: [],
  kelingking: ["photo", "comfort"],
  cliff: ["photo", "comfort"],
  land: ["photo", "comfort"],
  flexible: ["snorkel", "photo", "watersport"],
  morning: ["snorkel", "photo", "comfort"],
  afternoon: ["celebration", "drinks", "photo"],
  chill: ["celebration", "drinks", "comfort"],
  relax: ["celebration", "drinks", "comfort"],
};

const ACTIVITY_PHOTOS = {
  meeting: "https://bluuu.tours/storage/app/uploads/public/69b/8eb/aa7/thumb_4732_800_500_0_0_crop.webp",
  departure: "https://bluuu.tours/storage/app/uploads/public/689/1c7/443/6891c7443ce71322934836.webp",
  snorkeling: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
  manta: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
  swim: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
  watersport: "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
  cruise: "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
  back: "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
  kelingking: "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
  cliff: "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
  land: "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
  flexible: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
  morning: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
  afternoon: "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
  chill: "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
  relax: "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
};

function getActivityPhoto(title) {
  if (!title) return null;
  const lower = title.toLowerCase();
  for (const [key, url] of Object.entries(ACTIVITY_PHOTOS)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

function parseItemImages(item) {
  if (!item) return [];
  if (Array.isArray(item.images)) return item.images.filter(Boolean);
  if (typeof item.images === "string" && item.images.trim()) {
    return item.images.split("\n").map(u => u.trim()).filter(Boolean);
  }
  if (item.image) return [item.image];
  return [];
}

function getItemExtras(item, extrasCatalog) {
  if (!extrasCatalog?.length || !item) return [];

  // taglist stores names or IDs — handle both
  if (item.extras && (Array.isArray(item.extras) ? item.extras.length : String(item.extras).trim())) {
    const values = Array.isArray(item.extras)
      ? item.extras.map(String)
      : String(item.extras).split(",").map(s => s.trim()).filter(Boolean);
    if (values.length) {
      const byId = extrasCatalog.filter(e => values.includes(String(e.id)));
      if (byId.length) return byId.slice(0, 3);
      const byName = extrasCatalog.filter(e => values.some(v => e.name?.toLowerCase() === v.toLowerCase()));
      if (byName.length) return byName.slice(0, 3);
    }
  }

  // legacy: extra_ids comma-separated or array
  if (item.extra_ids) {
    const ids = Array.isArray(item.extra_ids)
      ? item.extra_ids.map(String)
      : String(item.extra_ids).split(",").map(s => s.trim()).filter(Boolean);
    if (ids.length) return extrasCatalog.filter(e => ids.includes(String(e.id))).slice(0, 3);
  }

  // legacy: single extra_id
  if (item.extra_id) {
    return extrasCatalog.filter(e => String(e.id) === String(item.extra_id)).slice(0, 3);
  }

  return [];
}

function getExtrasForActivity(title, extrasCatalog) {
  if (!extrasCatalog?.length || !title) return [];
  const lower = title.toLowerCase();

  // For items mentioning kelingking/land tour — prioritize the land tour extra + photo extras
  if (lower.includes("kelingking") || (lower.includes("land") && lower.includes("tour"))) {
    const landTour = extrasCatalog.find(e => /kelingking|land.?tour/i.test(e.name));
    const photoExtras = extrasCatalog.filter(e =>
      (e.categoryName || "").toLowerCase().includes("photo") || (e.categoryIds || []).some(id => id.toLowerCase().includes("photo"))
    ).filter(e => e.id !== landTour?.id).slice(0, 2);
    return [landTour, ...photoExtras].filter(Boolean).slice(0, 3);
  }

  for (const [key, cats] of Object.entries(ACTIVITY_TO_CATEGORY)) {
    if (lower.includes(key) && cats.length > 0) {
      const matched = extrasCatalog.filter(e =>
        cats.some(cat => (e.categoryName || "").toLowerCase().includes(cat) || (e.categoryIds || []).some(id => id.toLowerCase().includes(cat)))
      );
      return matched.slice(0, 3);
    }
  }
  return [];
}

function computeAutoQty(qtyType, totalGuests) {
  if (qtyType === 'per_car') return Math.ceil(totalGuests / 5);
  if (qtyType === 'per_person') return totalGuests;
  if (qtyType === 'fixed') return 1;
  return null;
}

function ItineraryTimeline({ sections, restaurant, sectionTitle, isLightTheme, capacityLabel, extrasCatalog, allExtrasCatalog, selectedExtras, onChangeExtraQty, formatPrice, onOpenExtra, hideTierBadges, totalGuests = 1 }) {
  const tourTier = hideTierBadges ? null : /first.class/i.test(sectionTitle || "") ? "first-class" : /premium/i.test(sectionTitle || "") ? "premium" : null;
  const restaurantData = restaurant;
  const [activeItem, setActiveItem] = useState(0);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [desktopPhotoIdx, setDesktopPhotoIdx] = useState(0);

  const openRestaurantGallery = (startIndex) => {
    const fallback = restaurantData?.image || "https://bluuu.tours/storage/app/uploads/public/688/e36/55e/thumb_478_400_400_0_0_crop.webp";
    const slides = restaurantData?.images_with_thumbs?.length
      ? restaurantData.images_with_thumbs.map(img => ({ src: img.thumb, type: "image" }))
      : [{ src: fallback, type: "image" }];
    Fancybox.show(slides, { startIndex: startIndex || 0 });
  };
  const timerRef = useRef(null);

  const allItemsCount = sections.flatMap(s => s.items).length;

  useEffect(() => {
    if (!autoPlay || allItemsCount <= 1) return;
    const isMobile = window.innerWidth < 640;
    if (isMobile) return;
    timerRef.current = setInterval(() => {
      setActiveItem(prev => (prev + 1) % allItemsCount);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, allItemsCount]);

  const handleItemClick = (i) => {
    setAutoPlay(false);
    setActiveItem(i);
    setDetailsExpanded(false);
    setMenuExpanded(false);
  };

  if (!sections.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Ship className="h-12 w-12 text-neutral-300" strokeWidth={1} />
      <div className="text-center">
        <p className="text-sm font-semibold text-secondary-500">Itinerary not available yet</p>
        <p className="mt-1 text-xs text-secondary-400">Check back later</p>
      </div>
    </div>
  );

  const allItems = sections.flatMap(s => s.items);
  const items = allItems;
  const selected = items[activeItem];

  const isLunch = selected ? (
    selected.is_restaurant == 1 || selected.is_restaurant === true ||
    /lunch/i.test(selected.title) ||
    (restaurantData && new RegExp(restaurantData.name?.split(/\s+/)[0], 'i').test(selected.title))
  ) : false;
  const lunchDisplay = isLunch ? getLunchDisplayData(selected) : null;
  const isKelingkingItem = selected ? /kelingking|land\s*tour/i.test(selected.title) : false;
  const rawTitle = selected ? (lunchDisplay?.title || selected.title) : "";
  const displayTitle = isKelingkingItem && extrasCatalog != null ? "More Snorkeling or Kelingking Cliff Tour" : rawTitle;
  const detailsText = selected ? sanitizeDisplayText(isLunch ? lunchDisplay?.description : selected.details, { stripTrailingOne: true }) : "";
  const displayTime = selected?.time ? selected.time.replace(/\./g, ":") : "";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-white">Your day on the water</h3>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70"><Clock className="h-3.5 w-3.5 text-primary-500" />10 hours</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70"><Users className="h-3.5 w-3.5 text-primary-500" />{capacityLabel || "Shared · up to 14"}</span>
        </div>
      </div>
      <div className="mt-6 hidden sm:block">
        <div className="flex items-end">
          {items.map((item, i) => (
            <div key={i} className="flex-1 text-center">
              <span className={cn("text-sm font-bold tabular-nums transition-colors", activeItem === i ? "text-primary-500" : "text-white/40")}>{item.time ? item.time.replace(/\./g, ":") : ""}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-0.5 w-full bg-white/10 rounded-full">
          <div className="absolute top-0 left-0 h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${((activeItem + 1) / items.length) * 100}%` }} />
        </div>
        <div className="mt-5 flex items-start">
          {items.map((item, i) => {
            const Icon = resolveScheduleIcon(item.title);
            const isActive = activeItem === i;
            const tier = hideTierBadges ? null : getItemTier(item.title, item.details, tourTier);
            return (
              <button key={i} type="button" onClick={() => handleItemClick(i)} className="flex-1 flex flex-col items-center gap-1.5 transition-all relative">
                <div {...(isActive ? { "data-active-tier": tier || "classic" } : {})} className={cn("relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                  isActive ? (tier === "premium" ? "bg-indigo-500 text-white animate-[pop_0.4s_ease-out]" : tier === "first-class" ? "bg-emerald-500 text-white animate-[pop_0.4s_ease-out]" : "bg-primary-600 text-white animate-[pop_0.4s_ease-out]")
                    : (tier === "premium" ? "border-2 border-indigo-400/30 bg-white/5 text-indigo-400 hover:border-indigo-400/50" : tier === "first-class" ? "border-2 border-emerald-400/30 bg-white/5 text-emerald-400 hover:border-emerald-400/50" : "border-2 border-white/15 bg-white/5 text-primary-500 hover:border-white/30")
                )}>
                  <style>{`
                    @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.2); } 100% { transform: scale(1); } }
                    @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }
                  `}</style>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className={cn("text-xs font-medium text-center leading-tight max-w-[100px]", isActive ? "text-white" : "text-white/50")}>{/kelingking|land\s*tour/i.test(item.title) && extrasCatalog != null ? "More Snorkeling or Kelingking Cliff Tour" : item.title}</span>
                {tier && <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none", tier === "premium" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30")}><Sparkles className="h-2 w-2" />{tier === "premium" ? "Premium" : "First Class"}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {/* Mobile: expandable list */}
      <div className="mt-4 sm:hidden">
        {items.map((item, i) => {
          const isActive = activeItem === i;
          const itemTier = hideTierBadges ? null : getItemTier(item.title, item.details, tourTier);
          const isLunchItem = item.is_restaurant == 1 || item.is_restaurant === true || /lunch/i.test(item.title) || (restaurantData && new RegExp(restaurantData.name?.split(/\s+/)[0], 'i').test(item.title));
          const itemDetails = sanitizeDisplayText(isLunchItem ? getLunchDisplayData(item)?.description : item.details, { stripTrailingOne: true });
          const lunchData = isLunchItem ? getLunchDisplayData(item) : null;
          const isLast = i === items.length - 1;
          return (
            <div key={i}>
              <button type="button" onClick={() => handleItemClick(i)}
                className="w-full text-left">
                <div className="flex items-start gap-3 py-3.5">
                  <span className={cn("w-12 shrink-0 text-sm font-bold tabular-nums text-center mt-[3px]",
                    itemTier === "premium" ? "text-indigo-400"
                    : itemTier === "first-class" ? "text-[#d4a44a]"
                    : "text-primary-500"
                  )}>{item.time ? item.time.replace(/\./g, ":") : ""}</span>
                  <span className={cn("text-[15px] font-semibold flex-1", isActive ? "text-white" : "text-white/50")}>{lunchData?.title || item.title}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/25 mt-[3px] transition-transform", isActive && "rotate-180")} />
                </div>
              </button>
              {isActive && (
                <div className="pb-3 pl-[3.75rem] -mt-1 space-y-1.5">
                  {isLunchItem && restaurantData ? (
                    <p className="text-xs leading-relaxed text-white/40">
                      {restaurantData.name} — infinity pool and daybeds
                    </p>
                  ) : (
                    itemDetails && <p className="text-xs leading-relaxed text-white/40">{itemDetails}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {itemTier && (
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wider", itemTier === "premium" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30")}>
                        <Sparkles className="h-2 w-2" />{itemTier === "premium" ? "Premium" : "First Class"}
                      </span>
                    )}
                    {isLunchItem && restaurantData && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
                        className="text-xs font-semibold text-primary-500">
                        Menu →
                      </button>
                    )}
                    {!isLunchItem && extrasCatalog != null && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setActiveItem(i); setMobileDetailsOpen(true); }}
                        className="text-xs font-semibold text-primary-500">
                        Details →
                      </button>
                    )}
                  </div>
                </div>
              )}
              {!isLast && <div className="itinerary-sep border-b border-white/[0.08] ml-[3.75rem]" />}
            </div>
          );
        })}
      </div>
      {selected && (() => {
        const selectedTier = hideTierBadges ? null : getItemTier(selected.title, selected.details, tourTier);
        return (
          <div data-tier-detail className={cn("hidden sm:block mt-5 rounded-2xl backdrop-blur-md overflow-hidden transition-all",
            tourTier === "premium" ? "bg-indigo-500/[0.08] border border-indigo-400/20" : tourTier === "first-class" ? "bg-emerald-500/[0.08] border border-emerald-400/20" : "bg-primary-500/[0.06] border border-primary-400/15"
          )}>
            {/* Desktop: horizontal layout */}
            <AnimatePresence mode="wait">
            <motion.div
              key={activeItem}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden sm:flex px-5 py-4 items-center gap-4 min-h-[88px]">
              <button type="button" onClick={() => handleItemClick((activeItem - 1 + allItemsCount) % allItemsCount)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className={cn("text-3xl font-bold tabular-nums shrink-0 leading-none", selectedTier === "premium" ? "text-indigo-400" : selectedTier === "first-class" ? "text-emerald-400" : "text-primary-500")}>{displayTime}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{displayTitle}</span>
                  {isKelingkingItem && extrasCatalog != null && <span className="inline-flex items-center rounded-full border border-primary-200 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-primary-600">Add-on</span>}
                  {selectedTier && <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wider", selectedTier === "premium" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30")}><Sparkles className="h-2.5 w-2.5" />{selectedTier === "premium" ? "Premium" : "First Class"}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {isLunch && restaurantData?.name && <span className="text-sm text-white/50">{restaurantData.name} — infinity pool and daybeds</span>}
                  {isLunch && restaurantData && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setMenuExpanded(!menuExpanded); }} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-400">
                      {menuExpanded ? "Hide" : "Menu"}<ChevronDown className={cn("h-4 w-4 transition-transform", menuExpanded && "rotate-180")} />
                    </button>
                  )}
                  {!isLunch && detailsText && <p className="text-sm text-white/50 leading-relaxed">{detailsText}</p>}
                  {!isLunch && extrasCatalog != null && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setAutoPlay(false); setDetailsExpanded(!detailsExpanded); setMenuExpanded(false); }} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-400">
                      {detailsExpanded ? "Hide" : "Details"}<ChevronDown className={cn("h-4 w-4 transition-transform", detailsExpanded && "rotate-180")} />
                    </button>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => handleItemClick((activeItem + 1) % allItemsCount)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
            </AnimatePresence>
            {/* Mobile: vertical layout — time top-left, title, desc, menu bottom */}
            <div className="sm:hidden px-4 py-3.5">
              <span className={cn("text-xl font-bold tabular-nums leading-none", selectedTier === "premium" ? "text-indigo-400" : selectedTier === "first-class" ? "text-emerald-400" : "text-primary-500")}>{displayTime}</span>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{displayTitle}</span>
                {selectedTier && <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider", selectedTier === "premium" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30")}><Sparkles className="h-2 w-2" />{selectedTier === "premium" ? "Premium" : "First Class"}</span>}
              </div>
              {isLunch && restaurantData?.name && <p className="mt-1 text-xs text-white/50">{restaurantData.name} — infinity pool and daybeds</p>}
              {detailsText && !isLunch && <p className="mt-1 text-xs text-white/50 leading-relaxed">{detailsText}</p>}
              {isLunch && restaurantData && (
                <button type="button" onClick={() => setMenuExpanded(!menuExpanded)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-400">
                  {menuExpanded ? "Hide" : "Menu"}<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", menuExpanded && "rotate-180")} />
                </button>
              )}
              {!isLunch && extrasCatalog != null && (
                <button type="button" onClick={() => { setAutoPlay(false); setDetailsExpanded(!detailsExpanded); setMenuExpanded(false); }} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-400">
                  {detailsExpanded ? "Hide" : "Details"}<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", detailsExpanded && "rotate-180")} />
                </button>
              )}
            </div>
            {isLunch && restaurantData && menuExpanded && (
              <div className="border-t border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
                {/* Restaurant hero */}
                <div className="relative overflow-hidden rounded-b-2xl">
                  <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    {/* Photo — stretches to content height on desktop */}
                    <div className="relative sm:min-h-[280px]">
                      {(() => {
                        const fallback = restaurantData.image || "https://bluuu.tours/storage/app/uploads/public/688/e36/55e/thumb_478_400_400_0_0_crop.webp";
                        const photos = restaurantData.images_with_thumbs?.length
                          ? restaurantData.images_with_thumbs.map(img => ({ thumb: img.thumb, thumb_small: img.thumb_small, path: img.thumb }))
                          : [{ thumb: fallback, path: fallback }];
                        const mainSrc = photos[0]?.thumb || fallback;
                        return (
                          <>
                            {/* Mobile: carousel with aspect ratio */}
                            <div className="sm:hidden">
                              <PhotoCarousel
                                images={photos}
                                alt={restaurantData.name}
                                className="aspect-[16/9] !rounded-none"
                                onOpenGallery={(i) => openRestaurantGallery(i)}
                                alwaysShowControls
                              />
                            </div>
                            {/* Desktop: full-height image with arrows */}
                            <div className="hidden sm:block absolute inset-0 rounded-bl-2xl overflow-hidden cursor-pointer group/photo" onClick={() => openRestaurantGallery(desktopPhotoIdx)}>
                              <img src={photos[desktopPhotoIdx]?.thumb || mainSrc} alt={restaurantData.name} className="h-full w-full object-cover transition-all duration-500 group-hover/photo:scale-[1.03]" />
                              {photos.length > 1 && (
                                <>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setDesktopPhotoIdx((desktopPhotoIdx - 1 + photos.length) % photos.length); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white transition hover:bg-black/50">
                                    <ChevronLeft className="h-4 w-4" style={{ color: '#fff' }} />
                                  </button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setDesktopPhotoIdx((desktopPhotoIdx + 1) % photos.length); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white transition hover:bg-black/50">
                                    <ChevronRight className="h-4 w-4" style={{ color: '#fff' }} />
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 px-6 py-5 bg-white/[0.02] flex flex-col">
                      {restaurantData.description && (
                        <p className="text-sm text-white/50 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: restaurantData.description }} />
                      )}
                      {restaurantData.menu && (
                        <div className="mt-4 restaurant-menu text-sm text-white/90 [&_h4]:text-[10px] [&_h4]:font-bold [&_h4]:uppercase [&_h4]:tracking-widest [&_h4]:text-primary-500/70 [&_h4]:mb-1.5 [&_h4]:mt-3 [&_ul]:space-y-1 [&_li]:font-medium [&_p]:mb-1 [&_p]:font-medium"
                          dangerouslySetInnerHTML={{ __html: restaurantData.menu }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Details panel for non-lunch items */}
            {!isLunch && detailsExpanded && (
              <div className="border-t border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                  {/* Photo — left column like restaurant */}
                  {(() => {
                    const imgs = parseItemImages(selected);
                    const activityPhoto = imgs[0] || getActivityPhoto(selected.title);
                    return activityPhoto ? (
                      <div className="relative aspect-[4/3]">
                        <img src={activityPhoto} alt={displayTitle} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      </div>
                    ) : null;
                  })()}
                  {/* Description + Extras — right column */}
                  <div className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col">
                    {detailsText && <p className="text-sm text-secondary-600 leading-relaxed">{detailsText}</p>}
                    {(() => {
                      const recommendedExtras = getItemExtras(selected, allExtrasCatalog || extrasCatalog);
                      if (!recommendedExtras.length) return null;
                      return (
                        <div className="mt-auto pt-3">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-2">Recommended add-ons</div>
                          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                            {recommendedExtras.map((extra) => {
                              const autoQty = computeAutoQty(extra.qtyType, totalGuests);
                              const isAuto = autoQty !== null;
                              const qty = selectedExtras?.[extra.id] || 0;
                              const hasChildSelected = extra.hasChildren && extra.children?.some(c => (selectedExtras?.[c.id] || 0) > 0);
                              const isAdded = qty > 0 || hasChildSelected;
                              const imgSrc = extra.image || extra.images_with_thumbs?.[0]?.thumb || "";
                              return (
                                <div key={extra.id} data-addon-card className={cn("shrink-0 w-32 rounded-2xl border overflow-hidden transition-all", isAdded ? "border-primary-500 border-2 bg-white" : "border-neutral-200 bg-white")}>
                                  <div className="relative aspect-[4/3] overflow-hidden rounded-b-lg">
                                    {imgSrc ? <img src={imgSrc} alt={extra.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-neutral-100" />}
                                    {isAdded && (
                                      <>
                                        <div className="pointer-events-none absolute inset-0 bg-[#0d1b2e]/40" />
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_16px_rgba(37,99,235,0.5)]">
                                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div className="p-2">
                                    <div className="text-xs font-bold text-secondary-900 truncate">{extra.name}</div>
                                    {isAuto && (
                                      <div className="mt-0.5 text-[10px] text-secondary-400">
                                        {extra.qtyType === 'per_car' ? `×${autoQty} car${autoQty > 1 ? 's' : ''}` : extra.qtyType === 'per_person' ? `×${autoQty} guests` : `×1`}
                                      </div>
                                    )}
                                    <div className="mt-1 flex items-center justify-between gap-1">
                                      <span className="text-xs font-black text-secondary-900">{Number(extra.price) > 0 ? (formatPrice ? formatPrice(extra.price) : `$${extra.price}`) : "Free"}</span>
                                      {isAuto ? (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); onChangeExtraQty?.(extra.id, isAdded ? 0 : autoQty); }}
                                          className={cn("shrink-0 h-8 px-3.5 rounded-full text-xs font-bold transition",
                                            isAdded ? "border border-[#2563eb]/50 bg-[#2563eb]/10 text-[#2563eb]" : "bg-primary-600 text-white hover:bg-primary-700"
                                          )}
                                        >
                                          {isAdded ? "Remove" : "Add"}
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); onOpenExtra?.(extra.id); }}
                                          className={cn("shrink-0 h-8 px-3.5 rounded-full text-xs font-bold transition",
                                            isAdded ? "border border-[#2563eb]/50 bg-[#2563eb]/10 text-[#2563eb]" : "bg-primary-600 text-white hover:bg-primary-700"
                                          )}
                                        >
                                          {isAdded ? "Edit" : "Add"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
      {/* Mobile restaurant modal */}
      <Modal open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} maxWidth="max-w-lg" showClose={false} hideDragHandle dark={!isLightTheme} bodyClassName={cn("p-0 overflow-y-auto", isLightTheme && "tour-modal-light")}>
          {(() => {
            const fallback = restaurantData?.image || "https://bluuu.tours/storage/app/uploads/public/688/e36/55e/thumb_478_400_400_0_0_crop.webp";
            const photos = restaurantData?.images_with_thumbs?.length
              ? restaurantData.images_with_thumbs.map(img => ({ thumb: img.thumb, thumb_small: img.thumb_small, path: img.thumb }))
              : [{ thumb: fallback, path: fallback }];
            return (
              <div className="relative sticky top-0 z-10">
                <PhotoCarousel
                  images={photos}
                  alt={restaurantData?.name}
                  className="aspect-[16/10] !rounded-none"
                  onOpenGallery={(i) => openRestaurantGallery(i)}
                  alwaysShowControls
                />
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none" />
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#fff', textShadow: "0 2px 8px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.3)" }}>{restaurantData?.name || "Restaurant"}</h3>
                </div>
                {/* Close button overlay */}
                <button type="button" data-cta="close" onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white transition hover:bg-black/50"
                  aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })()}
          <div className="px-5 pt-4 pb-2">
          {restaurantData?.description && <p className={cn("text-sm leading-relaxed italic mb-3", isLightTheme ? "text-secondary-500" : "text-white/50")} dangerouslySetInnerHTML={{ __html: restaurantData.description }} />}
          {/* Menu from CMS */}
          {restaurantData?.menu && (
            <div className={cn("mt-4 restaurant-menu text-sm [&_h4]:text-[10px] [&_h4]:font-bold [&_h4]:uppercase [&_h4]:tracking-widest [&_h4]:mb-1.5 [&_h4]:mt-3 [&_ul]:space-y-1 [&_li]:font-medium [&_p]:mb-1 [&_p]:font-medium",
              isLightTheme ? "text-secondary-900 [&_h4]:text-primary-600" : "text-white/90 [&_h4]:text-primary-500/70")}
              dangerouslySetInnerHTML={{ __html: restaurantData.menu }} />
          )}
          </div>
      </Modal>
      {/* Mobile Details Modal — photo header with title overlay */}
      <Modal open={mobileDetailsOpen} onClose={() => setMobileDetailsOpen(false)} maxWidth="max-w-lg" showClose={false} hideDragHandle bodyClassName="p-0">
        {selected && (() => {
          const imgs = parseItemImages(selected);
          const activityPhoto = imgs[0] || getActivityPhoto(selected.title);
          const recommendedExtras = getItemExtras(selected, extrasCatalog);
          return (
            <div>
              {/* Sticky photo header with title + close */}
              <div className="relative sticky top-0 z-10">
                {activityPhoto ? (
                  <img src={activityPhoto} alt={displayTitle} className="w-full aspect-[16/10] object-cover" loading="lazy" />
                ) : (
                  <div className="w-full aspect-[16/10] bg-neutral-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4">
                  <h3 className="text-xl font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{displayTitle}</h3>
                </div>
                <button type="button" onClick={() => setMobileDetailsOpen(false)}
                  className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white transition hover:bg-black/50"
                  aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Scrollable content */}
              <div className="px-5 pt-4 pb-6 space-y-4">
                {detailsText && <p className="text-sm text-secondary-600 leading-relaxed">{detailsText}</p>}
              </div>
              {recommendedExtras.length > 0 && (
                <div className="pb-6">
                  <div className="px-5 text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-2">Recommended add-ons</div>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5">
                    {recommendedExtras.map((extra) => {
                      const qty = selectedExtras?.[extra.id] || 0;
                      const hasChildSelected = extra.hasChildren && extra.children?.some(c => (selectedExtras?.[c.id] || 0) > 0);
                      const isAdded = qty > 0 || hasChildSelected;
                      const imgSrc = extra.image || extra.images_with_thumbs?.[0]?.thumb || "";
                      return (
                        <div key={extra.id} className={cn("shrink-0 w-36 rounded-2xl border overflow-hidden transition-all", isAdded ? "border-primary-500 border-2 bg-white" : "border-neutral-200 bg-white")}>
                          <div className="relative aspect-[4/3] overflow-hidden rounded-b-lg">
                            {imgSrc ? <img src={imgSrc} alt={extra.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-neutral-100" />}
                            {isAdded && (
                              <>
                                <div className="pointer-events-none absolute inset-0 bg-black/40" />
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 shadow-lg">
                                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="text-xs font-bold text-secondary-900 truncate">{extra.name}</div>
                            <div className="mt-1 flex items-center justify-between gap-1">
                              <span className="text-xs font-black text-secondary-900">{Number(extra.price) > 0 ? (formatPrice ? formatPrice(extra.price) : `$${extra.price}`) : "Free"}</span>
                              <button type="button" onClick={() => onOpenExtra?.(extra.id)}
                                className={cn("shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition",
                                  isAdded ? "border border-primary-500/50 bg-primary-50 text-primary-600" : "bg-primary-600 text-white hover:bg-primary-700"
                                )}>
                                {isAdded ? "Edit" : "Add"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

const TABS = [
  { id: "itinerary", icon: Compass, label: "Itinerary" },
  { id: "included", icon: Check, label: "Included" },
  { id: "pickup", icon: Car, label: "Pickup" },
  { id: "faq", icon: HelpCircle, label: "FAQ" },
];

const TRUST_CARDS = [
  { id: "safety", icon: Shield, title: "Safety", summary: "Certified guides, safety-first routing, Port Authority checks.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "cancellation", icon: Check, title: "Cancellation", summary: "Free cancellation 24h+ before. No refund within 24h.", color: "text-primary-600", bg: "bg-primary-50" },
  { id: "weather", icon: CloudRain, title: "Weather", summary: "We reschedule or refund if we cancel for weather.", color: "text-amber-600", bg: "bg-amber-50" },
];

export default function TourDetailsCard({
  sectionTitle, style, schedule, note, restaurant,
  prevLabel, nextLabel, onPrev, onNext,
  infoTabs, infoContent, includedChips,
  isUnavailable, unavailableReason, onChangeParams, onReserve,
  priceDisplay, dateDisplay, guestsDisplay,
  capacityLabel, scheduleExtrasSlot, reserveLabel,
  extrasCatalog, allExtrasCatalog, selectedExtras, onChangeExtraQty, formatPrice, onOpenExtra,
  hideTierBadges, totalGuests = 1,
}) {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [mobileRestaurantModal, setMobileRestaurantModal] = useState(false);
  const isLightTheme = true;
  const tierClass = /first.class/i.test(sectionTitle || "") ? "tier-first-class" : /premium/i.test(sectionTitle || "") ? "tier-premium" : "tier-classic";

  useEffect(() => {
    const section = document.getElementById("tour-details-section");
    if (!section) return;
    section.classList.add("tour-section-light");
    section.classList.remove("tier-classic", "tier-premium", "tier-first-class");
    section.classList.add(tierClass);
    return () => {
      section.classList.remove("tour-section-light", "tier-classic", "tier-premium", "tier-first-class");
    };
  }, [tierClass]);

  if (!style) return null;

  const sections = schedule ? [
    { label: "Morning", items: schedule.beforeLunch || [] },
    { label: "Afternoon", items: schedule.afterLunch || [] },
  ].filter((s) => s.items.length > 0) : [];

  const hasNav = onPrev || onNext;

  return (
    <>
      {/* Theme overrides moved to Discover.css */}
      <div className={isLightTheme ? "tour-details-light transition-colors duration-300" : "transition-colors duration-300"}>
        <div>
          {/* Header + Tabs — animated on tour switch */}
          <AnimatePresence mode="wait">
          <motion.div
            key={sectionTitle}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
          <div className="pb-1 sm:pb-2">
            {/* Desktop: title + price top row, description + date badge + theme toggle below */}
            <div className="hidden sm:block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {sectionTitle && <h2 className="text-2xl font-bold text-white">{sectionTitle} Details</h2>}
                  {note && (
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full border border-primary-200 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-primary-600">{note}</span>
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className={cn("text-2xl font-black tracking-tight", isUnavailable ? "text-primary-500/50" : "text-primary-500")}>{_renderPrice(priceDisplay)}</span>
                  {isUnavailable ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5">
                      <p className="text-xs font-semibold text-red-400">Not available on selected date</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {dateDisplay && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white/70">
                          <Calendar className="h-3.5 w-3.5 text-primary-500" />
                          {dateDisplay}
                        </div>
                      )}
                      {guestsDisplay && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white/70">
                          <Users className="h-3.5 w-3.5 text-primary-500" />
                          {guestsDisplay}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Mobile: title top, date badge + note + price in one row below */}
            <div className="sm:hidden">
              {sectionTitle && <h2 className="text-xl font-bold text-white truncate">{sectionTitle}</h2>}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isUnavailable ? (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1">
                      <p className="text-2xs font-semibold text-red-400">Not available for selected dates</p>
                    </div>
                  ) : dateDisplay ? (
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-2xs font-semibold text-white/70">
                      <Calendar className="h-3 w-3 text-primary-500" />
                      {dateDisplay}
                    </div>
                  ) : null}
                  {guestsDisplay && (
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-2xs font-semibold text-white/70">
                      <Users className="h-3 w-3 text-primary-500" />
                      {guestsDisplay}
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className={cn("text-lg font-black tracking-tight", isUnavailable ? "text-primary-500/50" : "text-primary-500")}>{_renderPrice(priceDisplay)}</span>
                </div>
              </div>
              {note && <div className="mt-1 inline-flex items-center rounded-lg border border-primary-200 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-primary-600 leading-snug">{note}</div>}
            </div>
          </div>

          {/* Tabs + content in bordered block */}
          <div className="mt-2 sm:mt-1" data-tier-block>
            {/* File-folder tabs */}
            <div className="no-scrollbar flex items-end overflow-x-auto sm:justify-start justify-between w-full">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all rounded-t-2xl border border-b-0",
                      isActive
                        ? "border-neutral-200 bg-white text-primary-500 relative z-10"
                        : "border-transparent bg-transparent text-secondary-400 hover:text-secondary-600"
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4", isActive ? "text-primary-500" : "text-secondary-400")} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Content block — solid white */}
            <div className={cn("rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 -mt-px", activeTab === "itinerary" && "rounded-tl-none", activeTab === "faq" && "rounded-tr-none sm:rounded-tr-3xl")}>
              {activeTab === "itinerary" ? (
                <>
                  <ItineraryTimeline sections={sections} restaurant={restaurant} sectionTitle={sectionTitle} isLightTheme={isLightTheme} capacityLabel={capacityLabel} extrasCatalog={extrasCatalog} allExtrasCatalog={allExtrasCatalog} selectedExtras={selectedExtras} onChangeExtraQty={onChangeExtraQty} formatPrice={formatPrice} onOpenExtra={onOpenExtra} hideTierBadges={hideTierBadges} totalGuests={totalGuests} />
                  {scheduleExtrasSlot}
                </>
              ) : (
                infoContent?.(activeTab)
              )}
            </div>
          </div>
          </motion.div>
          </AnimatePresence>

          {/* Mobile nav — between content and trust band */}
          {hasNav && (
            <div className="sm:hidden flex items-center justify-between py-4">
              {onPrev ? <button type="button" onClick={onPrev} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors"><ChevronLeft className="h-4 w-4" />{prevLabel}</button> : <span />}
              {onNext ? <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors">{nextLabel}<ChevronRight className="h-4 w-4" /></button> : <span />}
            </div>
          )}

          {/* Trust band */}
          <div className="mt-6 sm:mt-6 pb-5 sm:pb-6 grid grid-cols-3 gap-2 sm:gap-3">
            {TRUST_CARDS.map((card) => (
              <button key={card.id} type="button" onClick={() => setActiveDrawer(card.id)}
                className="group flex flex-col items-center sm:items-start gap-1.5 sm:gap-2 rounded-2xl border border-neutral-200 bg-white px-2 sm:px-4 py-3 sm:py-3 text-center sm:text-left transition-all">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-2">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", card.bg, card.color)}><card.icon className="h-4 w-4" strokeWidth={1.5} /></span>
                  <span className="text-xs sm:text-base font-semibold text-secondary-900">{card.title}</span>
                </div>
                <p className="hidden sm:block text-sm text-secondary-500 leading-relaxed">{card.summary}</p>
                <span className="text-2xs sm:text-xs font-semibold text-primary-600 group-hover:text-primary-500 transition-colors">Read more →</span>
              </button>
            ))}
          </div>

          {/* Footer: nav (desktop only for arrows) */}
          <div className="py-5 hidden sm:flex items-center justify-between">
            {hasNav && onPrev ? <button type="button" onClick={onPrev} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors"><ChevronLeft className="h-4 w-4" />{prevLabel}</button> : <span />}
            {/* Desktop reserve */}
            {isUnavailable ? (
              onChangeParams && (
                <button type="button" onClick={onChangeParams}
                  className="hidden sm:inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-bold text-white/80 transition-all hover:bg-white/10 hover:border-white/20">
                  Try another date <ChevronRight className="h-4 w-4" />
                </button>
              )
            ) : onReserve && (
              <button type="button" onClick={onReserve} data-cta="primary"
                className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] hover:bg-primary-700 transition-all">
                {reserveLabel || `Reserve ${sectionTitle || "Tour"}`} <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {hasNav && onNext ? <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors">{nextLabel}<ChevronRight className="h-4 w-4" /></button> : <span />}
          </div>
          {/* Mobile reserve — full width, no icon */}
          <div className="sm:hidden pb-4 flex justify-center">
            {isUnavailable ? (
              onChangeParams && (
                <button type="button" onClick={onChangeParams}
                  className="w-full h-12 rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white/80 transition-all hover:bg-white/10">
                  Try another date
                </button>
              )
            ) : onReserve && (
              <button type="button" onClick={onReserve} data-cta="primary"
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] hover:shadow-[0_0_32px_rgba(37,99,235,0.55)] hover:bg-primary-700 transition-all">
                {reserveLabel || `Reserve ${sectionTitle || "Tour"}`} <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust detail popup */}
      <Modal open={!!activeDrawer} onClose={() => setActiveDrawer(null)} maxWidth="max-w-xl" showClose={true} hideDragHandle dark={!isLightTheme}
        title={activeDrawer === "safety" ? "Safety" : activeDrawer === "cancellation" ? "Cancellation" : "Weather Guarantee"}
        bodyClassName="px-5 pt-0 pb-6 sm:px-6">
        <div className={cn(isLightTheme && "tour-modal-light")}>{infoContent?.(activeDrawer)}</div>
      </Modal>

    </>
  );
}
