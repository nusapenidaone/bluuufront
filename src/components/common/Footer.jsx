import React from "react";
import { ArrowRight, Globe } from "lucide-react";
import { useCurrency } from "../../CurrencyContext";
import { useSiteContacts } from "../../hooks/useSiteContacts";
import {
  COMPANY_LINKS,
  POLICY_LINKS,
  SOCIAL_LINKS,
  resolveSocialHref,
} from "./siteNavigation";

export default function Footer() {
  const { selectedCurrency } = useCurrency();
  const contacts = useSiteContacts();

  return (
    <footer className="overflow-hidden border-t border-neutral-100 bg-white pb-0 pt-20">
      <div className="container">
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <a href={`mailto:${contacts.email}`} className="block text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                {contacts.email}
              </a>
              <div className="text-sm leading-relaxed text-secondary-500" dangerouslySetInnerHTML={{ __html: contacts.address }} />
            </div>

          </div>

          <div>
            <ul className="space-y-4">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ul className="space-y-4">
              {POLICY_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ul className="space-y-4">
              {SOCIAL_LINKS.map((link) => {
                const href = resolveSocialHref(contacts, link.key);
                if (!href || href === "#") return null;

                return (
                  <li key={link.label}>
                    <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between text-sm font-medium text-secondary-900 transition-colors hover:text-primary-600">
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 -translate-x-2 opacity-0 transition-transform duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-0 -mt-10 flex w-full select-none justify-center overflow-hidden pb-0 pt-0 leading-[0.75] pointer-events-none">
        <div className="translate-y-[10%] scale-y-110 bg-gradient-to-r from-secondary-400 via-secondary-200 to-secondary-400 bg-clip-text text-[25vw] font-bold tracking-tighter text-transparent opacity-10 animate-gradient-flow">
          BLUUU
        </div>
      </div>

      <div className="relative z-10 border-t border-neutral-100 bg-white py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
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
