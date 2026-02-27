import React, { useState } from "react";
import { Shield, BadgeCheck, Anchor, Waves, Sparkles, Users, ExternalLink, ChevronDown, ShieldCheck } from "lucide-react";
import Modal from "../ui/Modal";
import { PremiumSection as Section } from "../ui/Section";
import { SECTION_BACKGROUNDS } from "../constants";
import Button from "../../common/Button";
import { cn } from "../../../lib/utils";

export function SafetySection() {
    const [activeModal, setActiveModal] = useState(null);
    const [policyExpanded, setPolicyExpanded] = useState(false);
    const [proofExpanded, setProofExpanded] = useState(false);
    const policyItems = [
        "It is possible to cancel a reservation and receive a full refund, provided that the cancellation occurs at least 24 hours prior to the scheduled start time of the experience. This policy applies to all reservations.",
        "The Cars Transportation service is non-refundable if guests have already utilized it and the tour is canceled due to inclement weather conditions.",
        "In order to receive a full refund, cancellation of a reservation must be made at least 24 hours prior to the scheduled start time of the experience.",
        "If a cancellation occurs less than 24 hours prior to the scheduled start time of the experience, no refund or rescheduling will be granted, regardless of the reason for the cancellation, including but not limited to health conditions, incorrect booking date, or the inability of one member of the group to participate in the tour.",
        "Requests for changes to a reservation made less than 24 hours prior to the scheduled start time of the experience will not be accommodated.",
        "Cut-off times are based on the experiences local time.",
        "This experience is weather dependent and if it's canceled due to unfavorable conditions, alternative dates or a full refund will be provided.",
        "This experience requires a minimum number of travelers. If its canceled because the minimum isnt met, youll be offered a different date/experience or a full refund.",
        "Individuals under the age of 18 cannot join the tour without being accompanied by a parent or another adult aged 18 or older who is also included in the same booking. If you are under 18 and planning to join the tour on your own, we wont be able to confirm your booking or check you in before the trip.",
        "For private tour bookings, if guests do not show up before 12:00, we reserve the right to cancel the trip.",
        "The occurrence of this experience is contingent upon the approval of the Port Authority regarding the weather conditions. In the event that the Port Authority denies permission to commence the tour due to unfavorable weather conditions, such as significant waves or strong winds, alternative dates or a full refund shall be offered to the affected parties.",
        "Tours booked with DAY TRIP BALI PT may be subject to cancellation for various reasons, such as inclement weather, operational issues, or low enrollment. In such cases, DAY TRIP BALI PT reserves the right to cancel the tour and will make every effort to provide alternative arrangements or offer a full refund to affected guests.",
    ];
    const visiblePolicyItems = policyExpanded ? policyItems : policyItems.slice(0, 4);
    const closeModal = () => {
        setActiveModal(null);
        setPolicyExpanded(false);
    };
    const coreItems = [
        {
            title: "Passenger insurance coverage",
            text: "Up to IDR 200 million per passenger - ages 8-75 covered automatically.",
        },
        {
            title: "Certified guides + quarterly training",
            text: "First aid, water rescue, equipment checks, emergency communication.",
        },
        {
            title: "Small groups, strong supervision",
            text: "Max 14 guests - minimum two certified guides (1 per 7 guests).",
        },
    ];
    const proofItems = [
        { icon: Shield, title: "Zero incidents - 8+ years of safe tours" },
        { icon: BadgeCheck, title: "Licensed operator - Port Authority compliant" },
        { icon: Anchor, title: "Full safety equipment onboard" },
        { icon: Waves, title: "In-water safety protocols" },
        { icon: Sparkles, title: "Hygiene & environmental care" },
        { icon: Users, title: "40,000+ guests annually - 8+ years operating" },
    ];
    const visibleProofItems = proofExpanded ? proofItems : proofItems.slice(0, 3);

    return (
        <Section
            id="safety"
            kicker="Health & safety"
            title="Safety standards & guest protections"
            subtitle="Clear, measurable safety practices and transparent policies so you can book with confidence."
            backgroundClassName={SECTION_BACKGROUNDS.mist}
        >
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <div className="text-sm font-semibold text-secondary-900">Core protections</div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            {coreItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-card"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-600 shadow-card">
                                            {item.title === "Passenger insurance coverage" ? (
                                                <Shield className="h-4 w-4" />
                                            ) : item.title === "Certified guides + quarterly training" ? (
                                                <BadgeCheck className="h-4 w-4" />
                                            ) : (
                                                <Users className="h-4 w-4" />
                                            )}
                                        </span>
                                        <div className="text-sm font-semibold text-secondary-900">{item.title}</div>
                                    </div>
                                    <div className="mt-2 text-sm text-secondary-600">{item.text}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                            <div className="text-sm font-semibold uppercase tracking-wider text-secondary-500">Policy links</div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {[
                                    { id: "standards", label: "Safety standards" },
                                    { id: "insurance", label: "Insurance coverage" },
                                    { id: "equipment", label: "Onboard equipment" },
                                    { id: "diving", label: "Diving & snorkeling safety" },
                                    { id: "cancellation", label: "Cancellation policy" },
                                ].map((btn) => (
                                    <button
                                        key={btn.id}
                                        type="button"
                                        onClick={() => setActiveModal(btn.id)}
                                        className="inline-flex items-center justify-between gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-semibold text-secondary-600 transition hover:border-neutral-300 hover:text-secondary-900"
                                    >
                                        <span>{btn.label}</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="text-sm font-semibold text-secondary-900">Proof points</div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {visibleProofItems.map((item) => (
                                <div key={item.title} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm text-secondary-600">
                                    <div className="flex items-start gap-2">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
                                            <item.icon className="h-4 w-4 text-secondary-500" />
                                        </span>
                                        <span className="pt-1">{item.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {proofItems.length > 3 ? (
                            <button
                                type="button"
                                onClick={() => setProofExpanded((prev) => !prev)}
                                className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-secondary-600 shadow-card transition hover:border-neutral-300 hover:text-secondary-900 sm:hidden"
                            >
                                {proofExpanded ? "See less" : "See all"}
                                <ChevronDown className={cn("h-4 w-4 transition", proofExpanded ? "rotate-180" : "")} />
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
            <Modal
                open={activeModal === "standards"}
                onClose={closeModal}
                title="Safety standards"
                subtitle="How we keep the day smooth and safe."
                maxWidth="max-w-3xl"
            >
                <div className="space-y-3 text-base leading-7 text-secondary-600">
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        Safety-first operations with continuous SOP updates and mandatory quarterly guide training.
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        Emergency procedures include pre-departure briefings, evacuation protocols, and incident reporting.
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        Compliance with Indonesian maritime regulations and applicable international standards.
                    </div>
                </div>
            </Modal>
            <Modal
                open={activeModal === "insurance"}
                onClose={closeModal}
                title="Passenger insurance coverage"
                subtitle="Coverage details for every guest."
                maxWidth="max-w-3xl"
            >
                <div className="space-y-3 text-base leading-7 text-secondary-600">
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        Insurance Provider: PT Jasa Raharja Putera insurance company.
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        Coverage: Up to IDR 200 million per passenger.
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                        Eligibility: All passengers aged 8 to 75 years old are automatically covered.
                    </div>
                </div>
            </Modal>
            <Modal
                open={activeModal === "equipment"}
                onClose={closeModal}
                title="Onboard safety equipment"
                subtitle="Key safety items available on every trip."
                maxWidth="max-w-3xl"
            >
                <div className="grid gap-3 text-base leading-7 text-secondary-600 sm:grid-cols-2">
                    {[
                        "Life jackets (all sizes)",
                        "First aid kits",
                        "Oxygen tanks",
                        "Marine radios / communication devices",
                        "Fire extinguishers",
                        "Emergency flares / signals",
                        "Navigation systems",
                    ].map((item) => (
                        <div key={item} className="rounded-xl border border-neutral-200 bg-white p-3">
                            {item}
                        </div>
                    ))}
                </div>
            </Modal>
            <Modal
                open={activeModal === "diving"}
                onClose={closeModal}
                title="Diving & snorkeling safety"
                subtitle="Protocols for in-water activities."
                maxWidth="max-w-3xl"
            >
                <div className="space-y-3 text-base leading-7 text-secondary-600">
                    {[
                        "Certified dive professionals lead and supervise all diving activities (PADI/SSI or equivalent).",
                        "Pre-dive briefings cover signals, equipment use, and marine life interaction.",
                        "Equipment is inspected before each use; buddy system enforced for divers.",
                        "Extra supervision for beginners and emergency protocols for DCS and evacuation.",
                    ].map((item) => (
                        <div key={item} className="rounded-xl border border-neutral-200 bg-white p-3">
                            {item}
                        </div>
                    ))}
                </div>
            </Modal>
            <Modal
                open={activeModal === "cancellation"}
                onClose={closeModal}
                title="Cancellation policy"
                subtitle="Clear terms, no surprises."
                maxWidth="max-w-3xl"
            >
                <div className="space-y-3 text-base leading-7 text-secondary-600">
                    {visiblePolicyItems.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-neutral-200 bg-white p-3">
                            {item}
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-secondary-500">Compact view</div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setPolicyExpanded((v) => !v)}
                        size="sm"
                    >
                        {policyExpanded ? "See less" : "See more"}
                        <ChevronDown className={cn("h-4 w-4 transition", policyExpanded ? "rotate-180" : "rotate-0")} />
                    </Button>
                </div>
            </Modal>
        </Section>
    );
}
