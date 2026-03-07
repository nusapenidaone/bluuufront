import React from "react";

const LOGOS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  src: `https://bluuu.tours/themes/bluuu/assets/images/logo${String(i + 1).padStart(2, "0")}.webp`,
  alt: `Partner ${i + 1}`,
}));

export default function LogoSlider({ title = "Trusted on top travel platforms", dark = false }) {
  return (
    <div className={`py-6 ${dark ? "" : ""}`}>
      {title && (
        <p className={`mb-5 text-center text-xs font-bold uppercase tracking-widest ${dark ? "text-white/40" : "text-secondary-400"}`}>
          {title}
        </p>
      )}

      {/* Marquee container */}
      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-20 ${dark ? "bg-gradient-to-r from-neutral-900" : "bg-gradient-to-r from-white"}`} />
        {/* Right fade */}
        <div className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-20 ${dark ? "bg-gradient-to-l from-neutral-900" : "bg-gradient-to-l from-white"}`} />

        <div className="flex animate-marquee gap-12 hover:[animation-play-state:paused]">
          {/* Duplicate for seamless loop */}
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center justify-center px-2"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className={`h-8 w-auto object-contain transition-all duration-300 ${dark ? "opacity-40 hover:opacity-80 brightness-0 invert" : "opacity-50 hover:opacity-90 grayscale hover:grayscale-0"}`}
                style={{ maxWidth: 120 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
