import React from "react";
import {
    BadgeCheck,
    Users,
    CloudRain,
    Clock,
    Sparkles,
    Waves,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function BookingMiniFAQ({ className }) {
    const items = [
        {
            icon: BadgeCheck,
            q: "Whats included",
            a: "Premium boat, lunch, land tour, snorkel gear, tickets, photographer + Prosecco moment.",
        },
        {
            icon: Users,
            q: "Kids?",
            a: "Private tours are perfect for families with children, including younger kids.",
        },
        {
            icon: CloudRain,
            q: "Rain?",
            a: "Weather guarantee: if we cancel due to unsafe conditions, reschedule or receive a full refund.",
        },
        {
            icon: Clock,
            q: "Start/finish time",
            a: "Private tours let guests choose the start time – any time between 08:00 and 11:00. Exact timing confirmed after booking.",
        },
        {
            icon: Sparkles,
            q: "Showers",
            a: "Post-tour showers are available.",
        },
        {
            icon: Waves,
            q: "Seasickness?",
            a: "Upgraded comfort yacht for a smoother ride. If you're prone, bring motion-sickness tablets.",
        },
    ];

    return (
        <div className={cn("grid gap-3 sm:gap-4 sm:grid-cols-2", className)}>
            {items.map((it) => (
                <div key={it.q} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary-600 sm:h-8 sm:w-8 sm:rounded-full">
                        <it.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-secondary-900">{it.q}</div>
                        <div className="mt-0.5 text-xs leading-relaxed text-secondary-600 sm:mt-1 sm:text-xs">
                            {it.a}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
