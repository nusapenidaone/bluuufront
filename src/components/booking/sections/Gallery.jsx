import React, { useRef, useEffect } from "react";
import {
    Check,
    Sun,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function HeroGallery({ images = [] }) {
    if (!images || images.length === 0) return null;

    const items = images.slice(0, 5).map((img, i) => ({
        label: `Gallery image ${i + 1}`,
        src:      typeof img === 'string' ? img : (img.thumb1 || img.original || ""),
        srcSmall: typeof img === 'string' ? null : (img.thumb1_small || null),
        srcLarge: typeof img === 'string' ? img : (img.thumb2 || img.thumb1 || img.original || ""),
        original: typeof img === 'string' ? img : (img.original || img.thumb2 || img.thumb1 || ""),
    })).filter(item => item.src);

    if (items.length === 0) return null;

    return (
        <>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:hidden">
                {items.map((it) => (
                    <div
                        key={it.label}
                        className="relative min-w-[82%] snap-start overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card"
                    >
                        <img
                            src={it.src}
                            srcSet={it.srcSmall ? `${it.srcSmall} 300w, ${it.src} 600w` : undefined}
                            sizes="82vw"
                            alt={it.label}
                            loading="lazy"
                            decoding="async"
                            className="h-48 w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-secondary-900">
                            {it.label}
                        </div>
                    </div>
                ))}
            </div>
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[180px]">
                <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card sm:col-span-2 sm:row-span-2">
                    <img
                        src={items[0].srcLarge || items[0].src}
                        srcSet={items[0].srcSmall ? `${items[0].srcSmall} 300w, ${items[0].src} 600w, ${items[0].srcLarge} 900w` : undefined}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        alt={items[0].label}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-secondary-900">
                        {items[0].label}
                    </div>
                </div>
                {items.slice(1).map((it) => (
                    <div
                        key={it.label}
                        className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card"
                    >
                        <div className="h-full min-h-[180px] bg-neutral-50 lg:min-h-0">
                            <img
                                src={it.src}
                                srcSet={it.srcSmall ? `${it.srcSmall} 300w, ${it.src} 600w` : undefined}
                                sizes="(max-width: 1024px) 50vw, 25vw"
                                alt={it.label}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-secondary-900">
                            {it.label}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export function GalleryHeroGrid({ vibes = [], onOpenGallery }) {
    const trackRef = useRef(null);
    const stepRef = useRef(0);

    const measureStep = () => {
        const track = trackRef.current;
        if (!track) return 0;
        const card = track.querySelector("[data-vibe-card]");
        if (!card) return 0;
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || "0");
        const step = card.getBoundingClientRect().width + gap;
        stepRef.current = step;
        return step;
    };

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;
        measureStep();
        const handleResize = () => measureStep();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePrev = () => {
        const track = trackRef.current;
        if (!track) return;
        const step = stepRef.current || measureStep();
        track.scrollBy({ left: -(step || 320), behavior: "smooth" });
    };

    const handleNext = () => {
        const track = trackRef.current;
        if (!track) return;
        const step = stepRef.current || measureStep();
        track.scrollBy({ left: step || 320, behavior: "smooth" });
    };

    return (
        <div>
            <div
                ref={trackRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
            >
                {vibes.map((vibe) => (
                    <button
                        key={vibe.id}
                        data-vibe-card
                        type="button"
                        onClick={() => onOpenGallery(vibe.id)}
                        className="group flex min-w-[72%] snap-start flex-col overflow-hidden rounded-full border border-neutral-200 bg-white text-left shadow-none transition hover:border-neutral-300 sm:min-w-[46%] lg:min-w-[30%]"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                                src={vibe.hero}
                                alt={vibe.title}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                            <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/70 backdrop-blur-sm px-2 py-0.5 text-sm font-semibold text-secondary-600 backdrop-blur">
                                {vibe.id === "classic" ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Check className="h-2.5 w-2.5 text-success" />
                                        Included
                                    </span>
                                ) : (
                                    <span>{vibe.badge}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex min-h-[150px] flex-1 flex-col p-4">
                            <div className="mt-2 line-clamp-1 min-h-[1.25rem] text-sm font-semibold text-secondary-900">
                                {vibe.title}
                            </div>
                            <div className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-secondary-600">
                                {vibe.description}
                            </div>
                            <div className="mt-2 inline-flex min-h-[1.25rem] items-center gap-1.5 text-sm text-secondary-500 whitespace-nowrap">
                                <Sun className="h-3 w-3 text-secondary-400" />
                                <span className="text-secondary-400">Afternoon stop:</span>
                                <span className="font-semibold text-secondary-600">{vibe.afterLunch}</span>
                            </div>
                            <div className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-secondary-600 transition group-hover:text-secondary-900">
                                {vibe.cta}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-3 hidden items-center justify-end gap-2 sm:flex">
                <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-transparent p-2 text-secondary-500 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-secondary-900"
                    aria-label="Previous"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-transparent p-2 text-secondary-500 transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-secondary-900"
                    aria-label="Next"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
