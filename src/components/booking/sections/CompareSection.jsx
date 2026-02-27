import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { PremiumSection as Section } from "../ui/Section";
import { PremiumCard } from "../ui/Card";
import { SECTION_BACKGROUNDS } from "../constants";
import Button from "../../common/Button";
import { cn } from "../../../lib/utils";

export function CompareSection({ isPrivate = false }) {
    const tiers = [
        {
            name: "Premium Shared",
            variant: "shared",
            badge: "Best value",
            price: `from $35`,
            highlights: [
                "Upgraded premium yacht",
                "La Rossa beachclub lunch",
                "Land Tour to Kelingking Cliff",
                "1 extra sunset secret spot + Champagne",
                "Showers, towels, drinks & ice cream",
            ],
            cta: "Choose Premium Shared",
            primary: false,
            toBook: true,
            href: "#booking",
        },
        {
            name: "Premium Private",
            variant: "premiumPrivate",
            badge: "Ultimate Choice",
            price: "$1200+",
            highlights: [
                "Everything in Premium Shared included",
                "Private boat - only your group onboard",
                "You choose the route and pace",
                "Add extras on request (diving, photographer, jet ski)",
            ],
            cta: "Get more info",
            primary: true,
            toBook: true,
            href: "/premiumprivate",
        },
        {
            name: "Private",
            variant: "private",
            badge: "For families & groups",
            price: "from $799",
            highlights: [
                "Choose your yacht model",
                "Private boat - only your group onboard",
                "Flexible pace and timing (within route)",
                "Add extras: diving, pro photographer, jet ski & more (optional)",
            ],
            cta: "See private options",
            primary: false,
            toBook: true,
            href: "/private",
        },
    ];

    return (
        <Section
            id="compare"
            kicker="Choose your option"
            title="Compare tours"
            subtitle="Want a more elevated experience? Upgrade anytime and enjoy extra comfort and premium touches on the same iconic route."
            backgroundClassName={SECTION_BACKGROUNDS.ocean}
            containerClassName="max-w-7xl"
        >
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] lg:grid lg:grid-cols-3">
                {tiers.map((t, i) => {
                    const isFeatured = t.variant === "premiumPrivate";
                    const cardVariant = isFeatured ? "qoves-featured" : "default";

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
                                "min-w-[85%] snap-start lg:min-w-0 flex flex-col p-6",
                            )}
                        >
                            {isFeatured ? (
                                <>
                                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-xl bg-primary-50 blur-3xl" />
                                    <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-xl bg-primary-50 blur-3xl" />
                                </>
                            ) : null}
                            {isPrivate && t.variant === "private" ? (
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
                                    <div className="text-3xl font-bold text-white">$1200+</div>
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
                <div className="text-sm font-semibold text-secondary-900">Premium vs Standard Private (another operator)</div>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2">
                    <div className="min-w-[80%] snap-start rounded-xl border border-neutral-200 bg-white p-4 sm:min-w-0">
                        <div className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Bluuu Premium</div>
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
                    <div className="min-w-[80%] snap-start rounded-xl border border-neutral-200 bg-white p-4 sm:min-w-0">
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
                            Pick a date and see your all-inclusive total instantly - free cancellation up to 24 hours and a weather safety guarantee mean you can book early without risk.
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
