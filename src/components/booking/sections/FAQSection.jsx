import React, { useState } from "react";
import { Plus, Phone, Mail, MessageCircle } from "lucide-react";
import { PremiumSection as Section } from "../ui/Section";
import { cn } from "../../../lib/utils";
import { useTours } from "../../../ToursContext";
import { useSiteContacts } from "../../../hooks/useSiteContacts";

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
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    transition: "grid-template-rows 0.22s ease-out, opacity 0.22s ease-out",
                }}
            >
                <div style={{ overflow: "hidden" }}>
                    <div
                        className="px-6 pb-5 pr-16 text-sm leading-relaxed text-secondary-500 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-secondary-700 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:text-primary-600 [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: a }}
                    />
                </div>
            </div>
        </div>
    );
}

export function FAQSection() {
    const { faqs: dynamicFaqs } = useTours();
    const contacts = useSiteContacts();
    const [showAll, setShowAll] = useState(false);

    const displayFaqs = dynamicFaqs && dynamicFaqs.length > 0
        ? dynamicFaqs.map(f => ({ q: f.question, a: f.answer }))
        : [];

    const primaryFaqs = displayFaqs.slice(0, 5);

    return (
        <Section
            id="faq"
            backgroundClassName="bg-gradient-to-b from-[#f0f6ff] via-white to-[#f5f9ff]"
        >
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">FAQ</div>
                    <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    {(showAll ? displayFaqs : primaryFaqs).map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-6">
                    {!showAll && displayFaqs.length > 5 && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                        >
                            See all questions
                        </button>
                    )}

                    <div className="relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
                            <img src="https://bluuu.tours/storage/app/media/images/manager.webp" alt="Expert" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-black uppercase tracking-widest text-primary-600 mb-1">Ask an Expert</div>
                            <div className="text-sm text-secondary-500 mb-3">Our team is ready to help you plan the perfect trip.</div>
                            <div className="flex flex-wrap gap-4">
                                {contacts.phone?.link && (
                                    <a href={contacts.phone.link} className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                                        <Phone className="h-3.5 w-3.5 text-primary-500" />
                                        {contacts.phone.number}
                                    </a>
                                )}
                                {contacts.email && (
                                    <a href={`mailto:${contacts.email}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                                        <Mail className="h-3.5 w-3.5 text-primary-500" />
                                        {contacts.email}
                                    </a>
                                )}
                                {contacts.whatsapp?.link && (
                                    <a href={contacts.whatsapp.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                                        <MessageCircle className="h-3.5 w-3.5 text-primary-500" />
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
