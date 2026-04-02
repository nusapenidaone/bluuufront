import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "../../common/Button";

export default function HeroDetails({
    selectedYacht,
    onAddExtra,
    onRemoveExtra,
    selectedVibe,
    showConfigBadge,
    onEditConfig,
}) {
    const lead = "All-inclusive day with zero logistics — everything essential is covered.";
    return (
        <section className="py-6 sm:py-10">
            <div className="container">
                <div className="flex flex-col gap-8">
                    <div>
                        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                            <div className="lg:col-span-12">
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                    <p className="text-sm font-semibold uppercase tracking-wide-3xl text-secondary-400">Value proof</p>
                                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-secondary-900 sm:text-4xl">
                                        Why Premium Private
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-base leading-7 text-secondary-600 sm:text-base">{lead}</p>
                                    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-card sm:p-7">
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            {[
                                                {
                                                    title: "Max 13 guests",
                                                    sub: "Smaller group, more space.",
                                                },
                                                {
                                                    title: "Seamless day",
                                                    sub: "Boat + land tour coordinated.",
                                                },
                                                {
                                                    title: "No surprise fees",
                                                    sub: "Tickets + lunch covered.",
                                                },
                                            ].map((item) => (
                                                <div key={item.title} className="space-y-1">
                                                    <div className="text-sm font-semibold text-secondary-900">{item.title}</div>
                                                    <div className="text-sm text-secondary-500">{item.sub}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 border-t border-neutral-200 pt-5">
                                            <div className="text-sm font-semibold text-secondary-900">Included at a glance</div>
                                            <div className="mt-3 grid gap-x-6 gap-y-2 text-sm text-secondary-600 sm:grid-cols-2">
                                                {[
                                                    "Comfort boat (up to 13)",
                                                    "Lunch at Amarta",
                                                    "Land tour to Kelingking",
                                                    "All entrance tickets",
                                                    "Underwater GoPro clips",
                                                    "Essentials (water, guides, gear, towels)",
                                                ].map((item) => (
                                                    <div key={item} className="flex items-start gap-2">
                                                        <Check className="mt-1 h-4 w-4 text-secondary-400" />
                                                        <span className="leading-6">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                                            <a href="#booking" className="font-semibold text-secondary-900 transition hover:text-secondary-600">
                                                See available dates
                                            </a>
                                            <a href="#included" className="font-medium text-secondary-500 transition hover:text-secondary-600">
                                                See full inclusions
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => alert("WhatsApp demo action")}
                                                className="font-medium text-secondary-500 transition hover:text-secondary-600"
                                            >
                                                WhatsApp questions
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
