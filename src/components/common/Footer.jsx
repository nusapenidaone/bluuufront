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
    <footer className="overflow-hidden pb-0 pt-20" style={{ background: 'var(--h2-dark-bg3, #070F1F)' }}>
      <div className="container">
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <a href={`mailto:${contacts.email}`} className="block text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--h2-text-body, rgba(255,255,255,0.78))' }}>
                {contacts.email}
              </a>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--h2-text-muted, rgba(255,255,255,0.5))' }} dangerouslySetInnerHTML={{ __html: contacts.address }} />
            </div>
          </div>

          <div>
            <ul className="space-y-4">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--h2-text-body, rgba(255,255,255,0.78))' }}>
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
                  <a href={link.href} className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--h2-text-body, rgba(255,255,255,0.78))' }}>
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
                    <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--h2-text-body, rgba(255,255,255,0.78))' }}>
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
        <div className="translate-y-[10%] scale-y-110 text-[25vw] font-bold tracking-tighter opacity-[0.06] text-white">
          BLUUU
        </div>
      </div>

      <div className="relative z-10 py-6" style={{ borderTop: '1px solid var(--h2-divider-bot, rgba(255,255,255,0.06))' }}>
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-xs" style={{ color: 'var(--h2-text-subtle, rgba(255,255,255,0.3))' }}>&copy; 2026 Bluuu Inc. All rights reserved.</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-settings"))}
            className="flex items-center gap-2 text-xs font-semibold transition hover:text-white"
            style={{ color: 'var(--h2-text-body, rgba(255,255,255,0.78))' }}
          >
            <Globe className="h-3 w-3" />
            {selectedCurrency?.toUpperCase()}
          </button>
        </div>
      </div>
    </footer>
  );
}
