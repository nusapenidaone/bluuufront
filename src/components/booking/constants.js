import {
    Star,
    MapPin,
    BadgeCheck,
    LifeBuoy,
} from "lucide-react";
import sharedData from "../../data/shared.json";

const ICON_MAP = {
    Star, MapPin, BadgeCheck, LifeBuoy,
};

export const BRAND = {
    ...sharedData.brand,
    badges: sharedData.brand.badges.map((b) => ({ ...b, icon: ICON_MAP[b.icon] })),
};

export const GUEST_FEE_IDR = 350000;
export const MAX_GUESTS = 13;
export const GROUP_TRANSFER_THRESHOLD = 4;

export const REVIEW_COUNT_VALUE = parseInt(String(BRAND.reviewCount).replace(/[^0-9]/g, ""), 10) || 0;
export const REVIEW_COUNT_SHORT = REVIEW_COUNT_VALUE ? `${Math.floor(REVIEW_COUNT_VALUE / 500) * 500}+` : BRAND.reviewCount;

export const LINKS = sharedData.links;
export const REVIEW_SOURCES = [];
export const INFO_REVIEWS = [];
export const REVIEW_SOURCE_ICON_MAP = {
    tripadvisor: "https://cdn.simpleicons.org/tripadvisor/34e0a1",
    airbnb: "https://cdn.simpleicons.org/airbnb/FF5A5F",
    klook: "https://cdn.simpleicons.org/klook/FF5B00",
    google: "https://cdn.simpleicons.org/googlemaps/1a73e8",
};
export const TRUST_INCLUDED_SHORT = sharedData.trustIncludedShort;
export const INFO_DRAWER_TABS = sharedData.infoDrawerTabs;
export const SECTIONS = sharedData.sections;
export const SECTION_BACKGROUNDS = sharedData.sectionBackgrounds ?? {
    white: "bg-transparent",
    highlight: "bg-transparent",
    ocean: "bg-transparent",
    lagoon: "bg-transparent",
    sunset: "bg-transparent",
    mist: "bg-transparent",
};

export const INPUT_BASE =
    "h-11 w-full rounded-full border border-neutral-200 bg-white text-base text-secondary-900 shadow-none outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

export const Q_THEME = {
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
        h1: "md:text-6xl text-4xl font-bold tracking-tight text-slate-900 leading-tight md:leading-tight",
        h2: "text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl",
        h3: "text-xl font-bold tracking-tight text-secondary-900 sm:text-2xl",
        body: "mt-2 text-lg text-secondary-600",
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
