import React from "react";
import {
  ExternalLink,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import { useCurrency } from "../../CurrencyContext";

const DEFAULT_SECTIONS = [
  { id: "tours", label: "Tours" },
  { id: "plan", label: "Day plan" },
  { id: "social", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "booking", label: "Book" },
];

function normalizeSections(sections) {
  return (sections || [])
    .map((section, index) => {
      if (typeof section === "string") {
        return { id: section, label: section, href: `#${section}`, key: `${section}-${index}` };
      }
      if (!section || typeof section !== "object") return null;
      const id = section.id || `section-${index}`;
      const label = section.label || section.id || "Section";
      const href = section.href || (section.id ? `#${section.id}` : "#");
      return { id, label, href, key: `${id}-${index}` };
    })
    .filter(Boolean);
}

export default function UnifiedFooter({ links = DEFAULT_SECTIONS }) {
  const currency = useCurrency();
  const selectedCurrency = currency?.selectedCurrency;
  const sections = normalizeSections(links);
  const currencyLabel = selectedCurrency ? selectedCurrency.toUpperCase() : "IDR";

  const openSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-settings"));
    }
  };

  return (
    <footer className="border-t border-neutral-200 bg-neutral-100 px-4 pb-12 pt-10 text-secondary-900">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.9fr_1fr]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start gap-2">
                <img
                  src="https://bluuu.tours/themes/bluuu/assets/img/logo.svg"
                  alt="Bluuu"
                  className="w-40"
                  loading="lazy"
                  decoding="async"
                />
                <div className="text-sm text-secondary-600">Bali&apos;s N1 Yacht Experience</div>
              </div>
              <div className="text-sm text-secondary-600">
                Premium shared and private tours, curated day plans, and seamless logistics for Bali to Nusa Penida.
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-secondary-500">Navigation</div>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-secondary-900">
                {sections.map((section) => (
                  <a key={section.key} href={section.href} className="transition hover:text-primary-600">
                    {section.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-secondary-500">Contacts</div>
              <div className="mt-4 space-y-4 text-sm text-secondary-600">
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 text-secondary-600" />
                  <div>
                    <div className="text-xs text-secondary-500">For chats</div>
                    <div className="text-base font-semibold text-secondary-900">+62 815-4748-3381</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-secondary-600" />
                  <div>
                    <div className="text-xs text-secondary-500">For calls</div>
                    <div className="text-base font-semibold text-secondary-900">+62 813-7026-2777</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-secondary-600" />
                  <div>
                    <div className="text-xs text-secondary-500">Write us</div>
                    <div className="text-base font-semibold text-secondary-900">info@bluuu.tours</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-600 transition hover:text-primary-600"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://wa.me/6281547483381"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-600 transition hover:text-primary-600"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-600 transition hover:text-primary-600"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.35fr] lg:items-center">
              <div>
                <div className="text-xs uppercase tracking-wide text-secondary-500">Our location</div>
                <div className="mt-3 flex items-start gap-3 text-sm text-secondary-600">
                  <MapPin className="mt-0.5 h-4 w-4 text-secondary-600" />
                  <span>
                    Jl. Tukad Punggawa No.238, Serangan,
                    <br />
                    Denpasar Selatan, Kota Denpasar, Bali 80228
                  </span>
                </div>
              </div>
              <div className="lg:flex lg:justify-end">
                <a
                  href="https://maps.google.com/?q=Jl.+Tukad+Punggawa+No.238,+Serangan,+Denpasar+Selatan,+Bali+80228"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-secondary-900 transition hover:text-primary-600"
                >
                  Open map
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-5">
            <div className="flex flex-col gap-4 text-xs text-secondary-500 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-600">
                <span className="text-base font-semibold text-secondary-900">VISA</span>
                <span className="rounded-xl bg-neutral-50 px-3 py-1 text-xs font-semibold text-secondary-600">PayPal</span>
                <span className="text-base font-semibold text-secondary-900">AMEX</span>
                <span className="mx-2 hidden h-5 w-px bg-neutral-200 sm:inline-block" />
                <button
                  onClick={openSettings}
                  className="inline-flex items-center gap-2 text-sm text-secondary-600 transition hover:text-primary-600"
                >
                  <Globe className="h-4 w-4" />
                  EN | {currencyLabel}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600">
                <span>©2026 All Rights Reserved</span>
                <a href="#" className="transition hover:text-primary-600">
                  Safety &amp; Sustainability Policy
                </a>
                <a href="#" className="transition hover:text-primary-600">
                  Privacy policy
                </a>
                <a href="#" className="transition hover:text-primary-600">
                  Cancelation Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
