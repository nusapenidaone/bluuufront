import React, { useMemo, useState } from "react";
import { useSEO } from "./hooks/useSEO";
import { ChevronLeft, CircleHelp, Mail, MessageCircle, Phone, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "./components/common/Footer";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import { useTours } from "./ToursContext";
import { useSiteContacts } from "./hooks/useSiteContacts";

function normalizeFaqs(items) {
  return (items || [])
    .map((item, index) => {
      const question = item?.question || item?.q || "";
      const answer = item?.answer || item?.a || "";
      if (!question || !answer) return null;
      return {
        id: item?.id || `faq-${index}`,
        question,
        answer,
      };
    })
    .filter(Boolean);
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-secondary-900">{question}</span>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${open ? "rotate-45 border-primary-200 bg-primary-50 text-primary-600" : "border-neutral-200 text-secondary-500"}`}>
          <Plus className="h-3.5 w-3.5" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pr-12 text-sm leading-relaxed text-secondary-600">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  useSEO({
    title: "Frequently Asked Questions | Bluuu Tours",
    description: "Got questions about our Nusa Penida tours? Find answers about booking, cancellation, what's included, health requirements, and more.",
  });
  const { faqs, loading } = useTours();
  const contacts = useSiteContacts();
  const normalizedFaqs = useMemo(() => normalizeFaqs(faqs), [faqs]);

  return (
    <div className="min-h-screen bg-neutral-100 text-secondary-900">
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private#booking" }}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 sm:py-12 lg:px-8">
        <a
          href="/private"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to private tour
        </a>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
            <CircleHelp className="h-3.5 w-3.5" />
            FAQ
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-500 sm:text-base">
            Quick answers before booking your Bluuu tour.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={`faq-skeleton-${index}`} className="h-8 rounded-lg bg-neutral-100" />
              ))}
            </div>
          </div>
        ) : normalizedFaqs.length ? (
          <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {normalizedFaqs.map((item) => (
              <FaqItem key={item.id} question={item.question} answer={item.answer} />
            ))}
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-secondary-500">
            FAQ list is currently empty.
          </div>
        )}
        <div className="mt-8 relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary-100">
            <img src="https://bluuu.tours/storage/app/media/images/manager.webp" alt="Expert" className="h-full w-full object-cover" />
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
      </main>

      <Footer />
    </div>
  );
}
