import React from "react";
import { useSEO } from "./hooks/useSEO";
import { ChevronLeft, Star } from "lucide-react";
import Footer from "./components/common/Footer";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";

export default function ReviewsPage() {
  useSEO({
    title: "Guest Reviews | Bluuu Tours",
    description: "Read thousands of verified reviews from guests who experienced our Nusa Penida tours. Rated 4.9/5 across TripAdvisor, Viator, Klook, and Google.",
  });
  return (
    <div className="min-h-screen bg-neutral-100 text-secondary-900">
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/new/private#booking" }}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 sm:py-12 lg:px-8">
        <a
          href="/new/private"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to private tour
        </a>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
            <Star className="h-3.5 w-3.5" />
            Guest Reviews
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Real feedback from recent guests
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-500 sm:text-base">
            Verified platform reviews from travelers who joined Bluuu tours.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div className="elfsight-app-dc207859-e523-4551-bf17-1b6df3428bae" data-elfsight-app-lazy />
        </section>
      </main>

      <Footer />
    </div>
  );
}

