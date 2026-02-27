import React, { useState } from "react";
import { UtensilsCrossed, Waves, Sun } from "lucide-react";
import Modal from "../ui/Modal";

export function LunchHighlight() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <section className="pb-12 sm:pb-16">
            <div className="mx-auto max-w-7xl px-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white sm:w-80">
                            <img
                                src="https://bluuu.tours/storage/app/uploads/public/688/e37/924/thumb_504_400_400_0_0_crop.webp"
                                alt="La Rossa restaurant"
                                loading="lazy"
                                decoding="async"
                                className="h-52 w-full object-cover sm:h-48"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold uppercase tracking-wide text-secondary-600">Lunch</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <div className="text-lg font-semibold text-secondary-900">La Rossa lunch break</div>
                                <button
                                    onClick={() => setMenuOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-secondary-600 transition hover:bg-neutral-100"
                                >
                                    <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-600" />
                                    Show menu
                                </button>
                            </div>
                            <div className="mt-3 text-base leading-7 text-secondary-600">
                                Included lunch with a calm pool setting to recharge before the land tour.
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {[
                                    { label: "Included lunch", icon: UtensilsCrossed },
                                    { label: "Pool access", icon: Waves },
                                    { label: "Daybeds", icon: Sun },
                                ].map((tag) => {
                                    const Icon = tag.icon;
                                    return (
                                        <span
                                            key={tag.label}
                                            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-600"
                                        >
                                            <Icon className="h-3.5 w-3.5 text-secondary-500" />
                                            {tag.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                title="La Rossa menu"
                subtitle="A quick look at the included lunch options."
                maxWidth="max-w-3xl"
            >
                <div className="space-y-5 text-base leading-7 text-secondary-600">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold uppercase tracking-wider text-secondary-500">
                            <UtensilsCrossed className="h-3.5 w-3.5 text-secondary-500" />
                            Starter
                        </div>
                        <div className="mt-3">
                            <div className="font-semibold text-secondary-900">Chicken Taco</div>
                            <div className="mt-1 text-secondary-600">
                                Slice of taco, salad, fried chicken in Spanish flour, spicy mix, avocado
                            </div>
                        </div>
                        <div className="mt-3 inline-flex items-center rounded-xl border border-neutral-200 bg-white px-2 py-0.5 text-sm font-semibold uppercase tracking-wider text-secondary-400">
                            or
                        </div>
                        <div className="mt-3">
                            <div className="font-semibold text-secondary-900">Calamari Taco</div>
                            <div className="mt-1 text-secondary-600">
                                Slice of taco, salad, fried calamari in Spanish flour, spicy mix, avocado
                            </div>
                        </div>
                    </div>
                    {/* Add more menu items if needed */}
                </div>
            </Modal>
        </section>
    );
}
