import React from "react";
import { Car, Clock, ShieldCheck, BadgeCheck } from "lucide-react";
import { PremiumSection as Section } from "../ui/Section";
import { SECTION_BACKGROUNDS } from "../constants";

export function TransferShowcase() {
    const perks = [
        {
            title: "Private vehicle",
            text: "Your group only. No shared shuttle waiting times.",
            icon: Car,
        },
        {
            title: "Flexible timing",
            text: "Slight delays? We wait for you. No stress.",
            icon: Clock,
        },
        {
            title: "Safe & Insured",
            text: "Certified drivers and fully insured vehicles.",
            icon: ShieldCheck,
        },
    ];
    const options = [
        {
            title: "Pickup + Drop-off",
            tag: "Round trip",
            text: "Door-to-door service before and after your tour day.",
        },
        {
            title: "Private minivan",
            tag: "Large groups",
            text: "For large groups, we arrange minivans for the whole party.",
        },
    ];
    return (
        <Section
            id="transfer"
            kicker="Private transfer"
            title="Arrive relaxed, board fast"
            subtitle="Private transfer is an optional add-on available at checkout."
            backgroundClassName={SECTION_BACKGROUNDS.sunset}
        >
            <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
                <div className="order-2 lg:order-1 lg:col-span-7">
                    <div className="h-full rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-secondary-900">Transfer options</div>
                            <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Add at checkout</div>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {options.map((option) => (
                                <div
                                    key={option.title}
                                    className="rounded-xl"
                                >
                                    <div className="h-full rounded-xl border border-neutral-200 bg-neutral-100 p-5 shadow-card">
                                        {option.tag ? (
                                            <span className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-semibold text-secondary-600">
                                                {option.tag}
                                            </span>
                                        ) : null}
                                        <div className="mt-3 text-base font-semibold text-secondary-900">{option.title}</div>
                                        <div className="mt-2 text-sm text-secondary-600">{option.text}</div>
                                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary-500">
                                            <BadgeCheck className="h-4 w-4 text-secondary-600" />
                                            Add at checkout
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 rounded-xl border border-neutral-200 p-4 text-sm text-secondary-600">
                            Add transfer on the next step after choosing your date and yacht. We will confirm route and timing by WhatsApp.
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 lg:col-span-5">
                    <div className="h-full rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
                        <div className="text-sm font-semibold text-secondary-900">Why travelers choose private transfer</div>
                        <div className="mt-3 grid gap-2">
                            {perks.map((perk) => (
                                <div
                                    key={perk.title}
                                    className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-2"
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200">
                                        <perk.icon className="h-3.5 w-3.5 text-secondary-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-secondary-900">{perk.title}</div>
                                        <div className="mt-0.5 text-sm leading-5 text-secondary-600">{perk.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
