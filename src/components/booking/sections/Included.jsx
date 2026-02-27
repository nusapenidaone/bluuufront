import React, { useState } from "react";
import { Ship, UtensilsCrossed, Clock, Camera, Sparkles, Ticket, Check, ChevronDown } from "lucide-react";
import { PremiumSection as Section, PremiumContainer } from "../ui/Section";
import { PremiumCard as Card } from "../ui/Card";
import { SECTION_BACKGROUNDS } from "../constants";
import { cn } from "../../../lib/utils";

export function Included() {
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
            text: "La Rossa restaurant lunch - a premium midday reset.",
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
            text: "Allday coverage - you stay in the moment.",
            icon: Camera,
            tint: "from-neutral-100 to-white",
            iconTone: "text-secondary-600 bg-neutral-50",
        },
        {
            title: "Bottle of Prosecco",
            text: "Secret spot toast - the signature premium moment.",
            icon: Sparkles,
            tint: "from-neutral-100 to-white",
            iconTone: "text-secondary-600 bg-neutral-50",
        },
        {
            title: "All entrance tickets",
            text: "All tickets included - no queues, no surprise fees.",
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
            subtitle="Simple, transparent inclusions - so you can focus on the day, not the fine print"
            backgroundClassName={SECTION_BACKGROUNDS.sunset}
        >
            <PremiumContainer>
                <Card className="rounded-xl p-6 sm:p-8">
                    <div className={showAll ? "hidden" : "block"}>
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card sm:p-6">
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
                                    className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card"
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
                        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
                            <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Plus</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {extras.map((x) => (
                                    <span
                                        key={x}
                                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                                    >
                                        <Check className="h-3.5 w-3.5 text-secondary-600" />
                                        {x}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:mt-6 sm:grid-cols-2">
                            <div>
                                <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">No surprise fees</div>
                                <div className="mt-2 text-sm text-secondary-600">
                                    Tickets, lunch, and core tour logistics are included - your total is shown upfront.
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
            </PremiumContainer>
        </Section>
    );
}
