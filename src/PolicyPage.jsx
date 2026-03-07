import React from "react";
import { useSEO } from "./hooks/useSEO";
import { useRules } from "./contexts/RulesContext";
import { ChevronLeft } from "lucide-react";
import Navbar from "./components/common/Navbar";
import PrivateStyleFooter from "./components/common/PrivateStyleFooter";
import { PRIVATE_STATIC_NAV_LINKS } from "./components/common/privateNavLinks";

const POLICY_SEO = {
  privacy: { title: "Privacy Policy | Bluuu Tours", description: "Learn how Bluuu Tours collects, uses, and protects your personal data when you book a tour with us." },
  cancellation: { title: "Cancellation Policy | Bluuu Tours", description: "Free cancellation up to 24 hours before departure. Read our full cancellation and refund policy." },
  payment: { title: "Payment Policy | Bluuu Tours", description: "Accepted payment methods, deposit requirements, and secure checkout information for Bluuu Tours bookings." },
  health: { title: "Health & Safety Policy | Bluuu Tours", description: "Our commitment to guest safety, sea conditions guidelines, and health requirements for Nusa Penida tours." },
  liability: { title: "Liability Release | Bluuu Tours", description: "Liability release and waiver information for Bluuu Tours guests." },
};

export default function PolicyPage({ policyKey }) {
  const seo = POLICY_SEO[policyKey] || { title: "Policy | Bluuu Tours", description: "" };
  useSEO(seo);
  const { getPolicy, loading } = useRules();
  const policy = getPolicy(policyKey);
  const hasPolicyContent = Boolean(policy?.html?.trim());

  return (
    <div className="min-h-screen bg-neutral-100 text-secondary-900">
      <Navbar
        variant="fullbar"
        links={PRIVATE_STATIC_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private#booking" }}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8 sm:py-12">
        <a
          href="/private"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to private tour
        </a>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-8 w-2/3 rounded-lg bg-neutral-200" />
              <div className="h-4 w-1/3 rounded-lg bg-neutral-100" />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="h-4 rounded bg-neutral-100" style={{ width: `${97 - (idx % 4) * 11}%` }} />
                ))}
              </div>
            </div>
          </div>
        ) : hasPolicyContent ? (
          <>
            <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
              {policy.title}
            </h1>
            <p className="mt-1 text-sm text-secondary-500">{policy.subtitle}</p>
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
              <div
                className="policy-rich-content"
                dangerouslySetInnerHTML={{ __html: policy.html }}
              />
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-secondary-500">
            Policy not found.
          </div>
        )}
      </main>
      <PrivateStyleFooter />
    </div>
  );
}
