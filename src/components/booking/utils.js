import { useEffect, useState, useMemo } from "react";
import { apiUrl } from "../../api/base";

// Global formatter bridge
let _globalFormatPrice = (val, opts) => `IDR ${Number(val).toLocaleString()}`;

export const setGlobalFormatPrice = (fn) => {
    _globalFormatPrice = fn;
};

export function formatIDR(value) {
    return _globalFormatPrice(value, { fromCurrency: "IDR" });
}

export function formatIDRShort(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return `IDR ${value}`;
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
    const date = new Date(dateStr);
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

export function calculateBoatPrice(tourId, date, membersCount, privateTours) {
    if (!tourId || !privateTours?.length) return null;
    const tour = privateTours.find((t) => Number(t.id) === Number(tourId));
    if (!tour) return null;

    // Robust date comparison: convert date object to YYYY-MM-DD string
    let dateStr = date;
    if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
    } else if (date && typeof date === 'object' && date.startDate) {
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

    // Shared tours (classes_id 9 or 10)
    const isShared = Number(tour.classes_id) === 9 || Number(tour.classes_id) === 10;

    return priceEntry ? Number(priceEntry.price) + (isShared ? 0 : boatPriceToAdd) : null;
}

export function useBoatPricing(tourId, date, membersCount, privateTours) {
    return useMemo(() => calculateBoatPrice(tourId, date, membersCount, privateTours), [tourId, date, membersCount, privateTours]);
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
