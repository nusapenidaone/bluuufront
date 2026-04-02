import React, { useMemo } from "react";
import { useSEO } from "./hooks/useSEO";
import { ChevronLeft, Images } from "lucide-react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { useTours } from "./ToursContext";
import Footer from "./components/common/Footer";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";

function normalizeGalleryItems(apiGallery, privateTours) {
  const fromApi = (apiGallery || [])
    .map((item, index) => ({
      id: item.id ?? `api-${index}`,
      src: item.url || "",
      thumb: item.thumb || item.url || "",
      title: item.title || "",
    }))
    .filter((item) => item.src);

  if (fromApi.length > 0) return fromApi;

  const fromTours = (privateTours || [])
    .flatMap((tour) => tour.images_with_thumbs || [])
    .map((image, index) => ({
      id: `tour-${index}`,
      src: image?.original || image?.thumb1 || "",
      thumb: image?.thumb1 || image?.original || "",
      title: "",
    }))
    .filter((item) => item.src);

  const bySrc = new Map();
  for (const item of fromTours) {
    if (!bySrc.has(item.src)) bySrc.set(item.src, item);
  }

  return Array.from(bySrc.values());
}

export default function GalleryPage() {
  useSEO({
    title: "Tour Gallery | Bluuu Tours",
    description: "Browse photos and videos from our Nusa Penida day tours — manta rays, crystal-clear waters, cliffs, and unforgettable moments.",
  });
  const { gallery, privateTours, loading } = useTours();

  const galleryItems = useMemo(
    () => normalizeGalleryItems(gallery, privateTours),
    [gallery, privateTours]
  );

  const openLightbox = (startIndex = 0) => {
    if (!galleryItems.length) return;
    Fancybox.show(
      galleryItems.map((item) => ({
        src: item.src,
        thumb: item.thumb,
        caption: item.title || undefined,
      })),
      { startIndex }
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-secondary-900">
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/new/private#booking" }}
      />

      <main className="container flex-1 py-8 sm:py-12">
        <a
          href="/new/private"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition hover:text-primary-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to private tour
        </a>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
            <Images className="h-3.5 w-3.5" />
            Gallery
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Moments from recent tours
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary-500 sm:text-base">
            Browse photos from departures, island stops, snorkeling and onboard highlights.
          </p>
        </div>

        {loading && !galleryItems.length ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={`gallery-skeleton-${index}`} className="aspect-square animate-pulse rounded-2xl bg-neutral-200" />
            ))}
          </div>
        ) : galleryItems.length ? (
          <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openLightbox(index)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                aria-label={`Open gallery image ${index + 1}`}
              >
                <img
                  src={item.thumb || item.src}
                  alt={item.title || `Gallery image ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </button>
            ))}
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-secondary-500">
            Gallery is currently empty.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

