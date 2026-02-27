import React from "react";
import { PremiumSection, PremiumContainer } from "../ui/Section";
import { PremiumCard as Card } from "../ui/Card";
import { PrimaryLink } from "../ui/Links";
import { SECTION_BACKGROUNDS, Q_THEME } from "../constants";

export function WhyBluuu() {
    const cards = [
        {
            iconUrl: "https://bluuu.tours/storage/app/media/icons%20from%20upwork/l1.svg",
            title: "Premium Boat",
            text: "Premium seating, smoother ride, and attentive service all day.",
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
            title: "Free cancellation",
            text: "Free cancellation up to 24 hours before your tour. Bad weather? Well reschedule or refund. Support is available anytime.",
        },
    ];

    return (
        <PremiumSection
            id="why"
            backgroundClassName={SECTION_BACKGROUNDS.ocean}
        >
            <PremiumContainer>
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">Why book this tour</div>
                    <h2 className={Q_THEME.text.h2}>The premium way to do Nusa Penida in one day</h2>
                    <p className={Q_THEME.text.body}>Elevated comfort, upgraded service, and a longer, more curated day - all with smooth premium logistics.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {cards.map((c, i) => (
                        <Card key={i} className="h-full">
                            <div className="flex items-center justify-center">
                                <img src={c.iconUrl} alt="" className="h-24 w-24" />
                            </div>
                            <div className="mt-4 text-sm font-semibold text-secondary-900">{c.title}</div>
                            <div className="mt-2 hidden text-sm leading-6 text-secondary-600 sm:block">{c.text}</div>
                        </Card>
                    ))}
                </div>
                <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
                    <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-8">
                            <div className="text-sm font-semibold text-secondary-900">
                                Designed to feel smooth, safe, and premium even on a shared tour.
                            </div>
                            <div className="mt-2 text-sm leading-6 text-secondary-600">
                                Clear schedule, small-group vibe, and a team that runs the day end-to-end with our own fleet.
                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <PrimaryLink href="#booking" className="w-full">
                                Check availability
                            </PrimaryLink>
                        </div>
                    </div>
                </div>
            </PremiumContainer>
        </PremiumSection>
    );
}
