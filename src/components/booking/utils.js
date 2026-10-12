import { useEffect, useState, useMemo } from "react";
import { apiUrl } from "../../api/base";

// Global formatter bridge
let _globalFormatPrice = (val, opts) => `${Number(val).toLocaleString()} IDR`;

export const setGlobalFormatPrice = (fn) => {
    _globalFormatPrice = fn;
};

export function formatIDR(value) {
    return _globalFormatPrice(value, { fromCurrency: "IDR" });
}

export function formatIDRShort(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return `${value} IDR`;
    return _globalFormatPrice(number, { fromCurrency: "IDR", short: true });
}

export function formatUSD(value) {
    return _globalFormatPrice(value, { fromCurrency: "USD" });
}

export function formatYachtPrice(yacht) {
    return yacht?.priceDisplayShort ? yacht.priceDisplayShort : formatIDR(yacht.priceValue);
}

export function formatShortDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRangeShort(start, end) {
    if (!start || !end) return "";
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

export function isDateAvailableForBoat(boatId, dateStr) {
    if (!dateStr) return false;
    const key = `${boatId}-${dateStr}`;
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
        hash = (hash * 31 + key.charCodeAt(i)) % 997;
    }
    return hash % 5 !== 0;
}

export function getAvailableDatesForRange(boatId, start, end) {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];
    if (endDate < startDate) return [];
    const dates = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate && dates.length < 6) {
        const iso = cursor.toISOString().slice(0, 10);
        if (isDateAvailableForBoat(boatId, iso)) {
            dates.push(iso);
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

function toDateStr(date) {
    if (date instanceof Date) return date.toISOString().split('T')[0];
    if (date && typeof date === 'object' && date.startDate) return new Date(date.startDate).toISOString().split('T')[0];
    return date ? String(date).slice(0, 10) : null;
}

/**
 * Low season rule (max percent) covering the date: {id, name, date_start, date_end, percent} or null.
 * tour.low_seasons comes from the API (only active + upcoming rules).
 */
export function getLowSeasonForDate(tour, date) {
    const dateStr = toDateStr(date);
    if (!dateStr || !tour?.low_seasons?.length) return null;
    let best = null;
    tour.low_seasons.forEach((ls) => {
        const pct = Number(ls.percent) || 0;
        if (pct > 0 && dateStr >= ls.date_start && dateStr <= ls.date_end && (!best || pct > Number(best.percent))) {
            best = ls;
        }
    });
    return best;
}

/** Max percent among upcoming low season rules of the tour (0 if none) — for "from" prices. */
export function maxLowSeasonPercent(tour) {
    if (!tour?.low_seasons?.length) return 0;
    return Math.min(90, Math.max(0, ...tour.low_seasons.map((ls) => Number(ls.percent) || 0)));
}

/** Same math as TourPricing::quote on the backend. */
export function applyLowSeason(tier, boat, percent) {
    const t = Number(tier) || 0;
    const b = Number(boat) || 0;
    const pct = Number(percent) || 0;
    const original = t + b;
    const discount = pct > 0 && original > 0 ? Math.round(original * pct / 100) : 0;
    const boatDiscount = pct > 0 && b > 0 ? Math.min(discount, Math.round(b * pct / 100)) : 0;
    return { original, discount, boatDiscount, tierDiscount: discount - boatDiscount, total: original - discount };
}

/**
 * Tour price for the date/members with low season applied.
 * {tier, boat, original, percent, discount, boatDiscount, total, lowSeason} or null.
 */
export function calculateBoatPriceDetailed(tourId, date, membersCount, privateTours) {
    if (!tourId || !privateTours?.length) return null;
    const tour = privateTours.find((t) => Number(t.id) === Number(tourId));
    if (!tour) return null;

    // Robust date comparison: convert date object to YYYY-MM-DD string
    const dateStr = toDateStr(date);

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
    if (!priceEntry) return null;

    // Shared tours (classes_id 9 or 10)
    const isShared = Number(tour.classes_id) === 9 || Number(tour.classes_id) === 10;

    const tier = Number(priceEntry.price) || 0;
    const boat = isShared ? 0 : boatPriceToAdd;
    const lowSeason = getLowSeasonForDate(tour, dateStr);
    const percent = lowSeason ? Number(lowSeason.percent) : 0;
    return { tier, boat, percent, lowSeason, ...applyLowSeason(tier, boat, percent) };
}

export function calculateBoatPrice(tourId, date, membersCount, privateTours) {
    return calculateBoatPriceDetailed(tourId, date, membersCount, privateTours)?.total ?? null;
}

/**
 * Boat/tour card with price for the date: priceValue (with low season), priceOriginal (null if no discount),
 * lowSeasonPercent. Returns the card unchanged if no price for the date.
 */
export function withBoatPrice(boat, date, membersCount, tours) {
    if (!boat) return boat;
    const d = calculateBoatPriceDetailed(boat.tourId, date, membersCount, tours);
    if (!d) return boat;
    if (!toDateStr(date)) {
        // No date yet → "from" price with the max upcoming low season discount
        const tour = tours?.find((t) => Number(t.id) === Number(boat.tourId));
        const max = maxLowSeasonPercent(tour);
        const ls = applyLowSeason(d.tier, d.boat, max);
        return {
            ...boat,
            priceValue: ls.total,
            priceOriginal: max > 0 ? ls.original : null,
            lowSeasonPercent: max,
            lowSeasonUpTo: true,
        };
    }
    return {
        ...boat,
        priceValue: d.total,
        priceOriginal: d.percent > 0 ? d.original : null,
        lowSeasonPercent: d.percent,
        lowSeasonUpTo: false,
    };
}

export function getFlashSaleForDate(tourId, date, privateTours) {
    if (!tourId || !date || !privateTours?.length) return false;
    const tour = privateTours.find((t) => Number(t.id) === Number(tourId));
    if (!tour?.pricesbydates?.length) return false;
    let dateStr = date;
    if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
    } else if (date && typeof date === 'object' && date.startDate) {
        dateStr = new Date(date.startDate).toISOString().split('T')[0];
    }
    return tour.pricesbydates.some((p) => p.flash_sale && dateStr >= p.date_start && dateStr <= p.date_end);
}

export function useBoatPricing(tourId, date, membersCount, privateTours) {
    return useMemo(() => calculateBoatPrice(tourId, date, membersCount, privateTours), [tourId, date, membersCount, privateTours]);
}

export function useBoatPricingDetailed(tourId, date, membersCount, privateTours) {
    return useMemo(() => calculateBoatPriceDetailed(tourId, date, membersCount, privateTours), [tourId, date, membersCount, privateTours]);
}

export function usePricing(date, initialPrice = 0) {
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

export function useImagePreload(urls, minDelay = 600) {
    const [ready, setReady] = useState(false);
    const key = Array.isArray(urls) ? urls.join(",") : "";
    useEffect(() => {
        if (!urls || !urls.length) { setReady(true); return; }
        let cancelled = false;
        const unique = [...new Set(urls.filter(Boolean))];
        let count = 0;
        let imagesLoaded = false;
        let delayPassed = false;
        const tryFinish = () => { if (!cancelled && imagesLoaded && delayPassed) setReady(true); };
        const check = () => { count += 1; if (count >= unique.length) { imagesLoaded = true; tryFinish(); } };
        unique.forEach((src) => { const img = new Image(); img.onload = check; img.onerror = check; img.src = src; });
        const minTimer = setTimeout(() => { delayPassed = true; tryFinish(); }, minDelay);
        const maxTimer = setTimeout(() => { if (!cancelled) setReady(true); }, 5000);
        return () => { cancelled = true; clearTimeout(minTimer); clearTimeout(maxTimer); };
    }, [key, minDelay]);
    return ready;
}
