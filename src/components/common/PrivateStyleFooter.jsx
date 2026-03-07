import React from "react";
import { ArrowRight, Globe } from "lucide-react";
import { useCurrency } from "../../CurrencyContext";
import { useSiteContacts } from "../../hooks/useSiteContacts";

export default function PrivateStyleFooter() {
  const { selectedCurrency } = useCurrency();
  const contacts = useSiteContacts();

  return (
    <footer className="overflow-hidden border-t border-neutral-100 bg-white pb-0 pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="flex flex-col gap-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-secondary-400">
              BLUUU INC. /
            </div>
            <div className="space-y-4">
              <a href={`mailto:${contacts.email}`} className="block text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                {contacts.email}
              </a>
              <div className="text-sm leading-relaxed text-secondary-500" dangerouslySetInnerHTML={{ __html: contacts.address }} />
            </div>

            <div className="mt-8">
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary-400">
                DISCLAIMER /
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-secondary-400">
                Some images on this website are digitally enhanced to illustrate potential experiences. Your actual tour may vary depending on weather and sea conditions.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary-400">
              COMPANY /
            </div>
            <ul className="space-y-4">
              <li><a href="/private" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Private tour</a></li>
              <li><a href="/shared" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Shared tour</a></li>
              <li><a href="/faq" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">FAQ</a></li>
              <li><a href="/reviews" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Reviews</a></li>
              <li><a href="/gallery" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Gallery</a></li>
              <li><a href="/about" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">About</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary-400">
              OTHERS /
            </div>
            <ul className="space-y-4">
              <li><a href="/policy/privacy" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Privacy Policy</a></li>
              <li><a href="/policy/payment" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Payment Policy</a></li>
              <li><a href="/policy/cancellation" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Cancellation Policy</a></li>
              <li><a href="/policy/health" className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">Health & Safety</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary-400">
              CONNECT /
            </div>
            <ul className="space-y-4">
              <li>
                <a href={contacts.instagram || "#"} target="_blank" rel="noreferrer" className="group flex items-center justify-between text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                  <span>Instagram</span>
                  <ArrowRight className="h-3 w-3 -translate-x-2 opacity-0 transition-transform duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a href={contacts.whatsapp?.link || "#"} target="_blank" rel="noreferrer" className="group flex items-center justify-between text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                  <span>WhatsApp</span>
                  <ArrowRight className="h-3 w-3 -translate-x-2 opacity-0 transition-transform duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a href={contacts.youtube || "#"} target="_blank" rel="noreferrer" className="group flex items-center justify-between text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                  <span>YouTube</span>
                  <ArrowRight className="h-3 w-3 -translate-x-2 opacity-0 transition-transform duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-0 mt-[-40px] flex w-full select-none justify-center overflow-hidden pb-0 pt-0 leading-[0.75] pointer-events-none">
        <div className="translate-y-[10%] scale-y-110 bg-gradient-to-r from-secondary-400 via-secondary-200 to-secondary-400 bg-clip-text text-[25vw] font-bold tracking-tighter text-transparent opacity-10 animate-gradient-flow">
          BLUUU
        </div>
      </div>

      <div className="relative z-10 border-t border-neutral-100 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row lg:px-8">
          <span className="text-xs text-secondary-400">&copy; 2026 Bluuu Inc. All rights reserved.</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-settings"))}
            className="flex items-center gap-2 text-xs font-semibold text-secondary-900 transition hover:text-primary-600"
          >
            <Globe className="h-3 w-3" />
            {selectedCurrency?.toUpperCase()}
          </button>
        </div>
      </div>
    </footer>
  );
}

