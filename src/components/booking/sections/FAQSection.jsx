import React, { useState } from "react";
import { Plus, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PremiumSection as Section } from "../ui/Section";
import { cn } from "../../../lib/utils";
import { faqs } from "../../../data/shared.json";

function FAQItem({ q, a }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-100 last:border-0">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="group flex w-full items-center justify-between px-6 py-5 text-left"
            >
                <span className="pr-6 text-base font-semibold text-secondary-900">{q}</span>
                <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                    isOpen
                        ? "rotate-45 border-primary-200 bg-primary-50 text-primary-500"
                        : "border-neutral-200 bg-neutral-50 text-secondary-400"
                )}>
                    <Plus className="h-3.5 w-3.5" />
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-5 pr-16 text-sm leading-relaxed text-secondary-500">
                            {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FAQSection() {
    const [showAll, setShowAll] = useState(false);
    const primaryFaqs = faqs.slice(0, 5);

    return (
        <Section
            id="faq"
            backgroundClassName="bg-gradient-to-b from-[#f0f6ff] via-white to-[#f5f9ff]"
        >
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">FAQ</div>
                    <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    {(showAll ? faqs : primaryFaqs).map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-6">
                    {!showAll && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            See all questions
                        </button>
                    )}

                    <div className="relative flex w-full flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row">
                        <div className="text-center sm:text-left">
                            <div className="text-sm font-semibold text-secondary-900">Have a special request?</div>
                            <div className="mt-1 text-sm text-secondary-500">Everything else is covered above. For unusual requests, message us.</div>
                        </div>
                        <button
                            onClick={() => alert("WhatsApp demo action")}
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp us
                        </button>
                    </div>
                </div>
            </div>
        </Section>
    );
}
