import React from "react";
import { useSEO } from "./hooks/useSEO";
import { ArrowRight, ChevronLeft, ShieldCheck, Star, Globe, Anchor } from "lucide-react";
import Footer from "./components/common/Footer";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import LogoSlider from "./components/common/LogoSlider";

const AWARDS = [
  {
    id: "viator",
    src: "https://bluuu.tours/themes/bluuu/assets/img/winner-11.webp",
    alt: "Viator Experience Award",
  },
  {
    id: "tripadvisor",
    src: "https://bluuu.tours/themes/bluuu/assets/img/winner-21-dark.webp",
    alt: "TripAdvisor Award",
  },
];

const LOGO_SRC = "https://bluuu.tours/themes/bluuu/assets/img/logo.svg";

const TEAM = [
  {
    id: "budi",
    name: "Budi",
    img: "https://bluuu.tours/storage/app/uploads/public/685/117/f5a/685117f5a10c6764752521.jpg",
    bio: "A Level 4 Master Freediver with 8 years of experience, he brings a strong background in Bali's tourism industry. Since joining our team in 2017, he has been passionate about connecting with people from around the world and sharing the beauty of marine life.",
  },
  {
    id: "nyoman",
    name: "Nyoman",
    img: "https://bluuu.tours/storage/app/uploads/public/685/118/262/68511826287e1508962052.jpg",
    bio: "A PADI IDC Staff Instructor since 2007 and a certified lifeguard, he also spent two years working on cruise lines, traveling the world while strengthening his passion for the ocean and commitment to guest safety.",
  },
  {
    id: "vicky",
    name: "Vicky",
    img: "https://bluuu.tours/storage/app/uploads/public/685/118/514/6851185140d18489776918.jpg",
    bio: "A seasoned PADI Divemaster with 7 years of experience at 5-star dive centers, he specializes in snorkeling and tours, ensuring safe, fun, and unforgettable underwater journeys.",
  },
  {
    id: "tim",
    name: "Tim",
    img: "https://bluuu.tours/storage/app/uploads/public/685/118/6f1/6851186f1ec77479711427.jpg",
    bio: "An APNEA-certified professional freediver and Advanced Scuba Diver, he has extensive experience exploring underwater realms through both freediving and scuba.",
  },
  {
    id: "jena",
    name: "Jena",
    img: "https://bluuu.tours/storage/app/uploads/public/685/118/880/6851188804589576885152.jpg",
    bio: "A PADI Divemaster since 2007, as well as a certified Lifeguard and Boat Captain, he brings 11 years of experience working on cruise lines, having dived and traveled all around the world.",
  },
];
const STATS = [
  { id: "years", value: "8+", label: "Years on the market" },
  { id: "rating", value: "4.9", label: "Average rating" },
  { id: "reviews", value: "8,500+", label: "Guest reviews" },
];

export default function AboutPage() {
  useSEO({
    title: "About Bluuu Tours | Nusa Penida Yacht Experts",
    description: "Bluuu is Bali's #1 yacht tour company. Award-winning private and shared tours to Nusa Penida with 8,500+ five-star reviews on TripAdvisor, Viator, and Klook.",
  });
  return (
    <div className="min-h-screen bg-neutral-100 text-secondary-900">
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private#booking" }}
      />

      <div className="mx-auto w-full max-w-7xl px-6 pt-8 sm:pt-12 lg:px-8">

        {/* Back link */}
        <a
          href="/private"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to private tour
        </a>

        {/* Page title — Reviews/Gallery style */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
            <Anchor className="h-3.5 w-3.5" />
            About Bluuu
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Bali's #1 Yacht Tour Company
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-500 sm:text-base">
            Award-winning private and shared tours to Nusa Penida since 2016.
          </p>
        </div>

        {/* Single unified card */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">

          {/* Features + Awards */}
          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="divide-y divide-neutral-100">
              {[
                { icon: ShieldCheck, title: "Safety first", text: "Certified crew, licensed vessels, and comprehensive safety protocols on every trip." },
                { icon: Star, title: "Award-winning", text: "Viator Experience Award & TripAdvisor Travelers' Choice 2025." },
                { icon: Globe, title: "Local expertise", text: "8+ years of island knowledge with expert local captains and guides." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4 px-8 py-5 sm:px-10">
                  <div className="shrink-0 rounded-xl bg-primary-50 p-3">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-secondary-900">{title}</div>
                    <div className="mt-0.5 text-sm leading-relaxed text-secondary-500">{text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Awards */}
            <div className="flex flex-col items-center justify-center gap-5 border-t border-neutral-100 px-8 py-8 lg:border-l lg:border-t-0 lg:px-10">
              <div className="text-xs font-semibold uppercase tracking-wider text-secondary-400">Recognition</div>
              {AWARDS.map((award) => (
                <img key={award.id} src={award.src} alt={award.alt} loading="lazy" decoding="async" className="h-16 w-36 object-contain" />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 bg-neutral-50">
            {STATS.map((stat) => (
              <div key={stat.id} className="px-8 py-6 sm:px-10">
                <div className="text-3xl font-bold text-secondary-900 sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-secondary-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Description + Logo slider */}
          <div className="border-t border-neutral-100 px-8 py-6 sm:px-10">
            <p className="text-sm leading-relaxed text-secondary-600 sm:text-base">
              For over 8 years, we have delivered premium day tours to Nusa Penida with a strong focus on
              service quality, clear communication, and safety-first operations — trusted by guests via:
            </p>
            <LogoSlider title="" />
          </div>
        </section>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pb-8 sm:pb-12 lg:px-8">
        <section className="mt-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="border-b border-neutral-200 pb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Our team</div>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-secondary-900 sm:text-3xl">
              Your guides on the water
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary-600 sm:text-base">
              Discover Bali's hidden coves and vibrant culture aboard a luxury yacht, guided by
              handpicked local captains and storytellers who know every secret of these pristine waters.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <div className="relative">
                  <img
                    src={member.img}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="h-56 w-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 w-full">
                    <div className="text-base font-bold text-white">{member.name}</div>
                    <div className="text-xs text-white/80">English, Indonesian</div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-relaxed text-secondary-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-2xl font-bold leading-tight text-secondary-900">Your adventure awaits</div>
              <p className="mt-2 text-sm leading-relaxed text-secondary-600 sm:text-base">
                Don&apos;t just read about it - live it. Book your yacht tour now and get ready
                for an unforgettable day on the water.
              </p>
            </div>
            <div>
              <a
                href="/private#booking"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Book now
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
