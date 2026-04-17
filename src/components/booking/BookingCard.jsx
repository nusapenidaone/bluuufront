import React, { useState, useMemo, useEffect } from "react";
import { getUtmQueryString } from "../../lib/analytics";
import {
    Star,
    Users,
    BadgeCheck,
    Calendar,
    ChevronDown,
    Clock,
    ArrowRight,
    MessageCircle,
    Shield,
    CloudRain,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "../common/Button";
import { PremiumCard as Card } from "./ui/Card";
import {
    MAX_GUESTS,
    BRAND,
    GROUP_TRANSFER_THRESHOLD,
    INPUT_BASE,
} from "./constants";
import {
    usePricing,
    formatIDR,
    formatUSD,
    formatYachtPrice,
} from "./utils";

export default function BookingCard({
    compact = false,
    selectedYacht,
    cartItems,
    extrasTotalUSD,
    selectedVibe,
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

    const safeCartItems = cartItems ?? [];
    const extrasTotal = Math.round(extrasTotalUSD ?? 0);

    const onReserve = () => {
        if (reserveDisabled) return;
        const params = new URLSearchParams({ date, adults: String(adults), kids: String(kids) });
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
        const utmQs = getUtmQueryString();
        const checkoutUrl = `/new/checkout?${params.toString()}${utmQs ? `&${utmQs}` : ""}`;
        window.location.href = checkoutUrl;
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
                    <span>All-inclusive (taxes, tickets, lunch)</span>
                    <a
                        href="#social"
                        className="inline-flex items-center gap-1 font-semibold text-secondary-600 hover:text-secondary-900"
                    >
                        <Star className="h-4 w-4 text-primary-600" fill="currentColor" />
                        {BRAND.rating} • {BRAND.reviewCount} {BRAND.reviewLabel}
                    </a>
                </div>

                <div className="mt-2 text-sm font-semibold text-secondary-600">
                    Lounge check-in + premium boat + La Rossa lunch + pro photographer
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
                        Popular date • limited seats
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
                                {safeCartItems.map((item) => item.title).join(" • ")}
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
                        Adults: {adults} • Kids 7+: {kids}
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
                        className={cn("w-full rounded-full h-12 text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98]", reserveDisabled && "cursor-not-allowed opacity-60")}
                        disabled={reserveDisabled}
                    >
                        Reserve now <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="text-center text-sm text-secondary-500">
                        You'll see the full total before confirming.
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-secondary-600">
                        <div className="min-w-0">
                            <div className="font-semibold text-secondary-900">Questions?</div>
                            <div className="text-sm text-secondary-500">Avg response time: 5 min</div>
                        </div>
                        <Button variant="secondary" onClick={() => alert("WhatsApp demo action")} size="sm" className="rounded-full">
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </Button>
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
                    <span className="inline-flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-secondary-600" /> Free cancellation 24h
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <CloudRain className="h-3.5 w-3.5 text-secondary-600" /> Weather guarantee
                    </span>
                </div>
            </div>
        </Card>
    );
}
