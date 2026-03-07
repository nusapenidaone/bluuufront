import React from "react";
import { Star, ExternalLink } from "lucide-react";
import { PremiumSection, PremiumContainer } from "../ui/Section";
import { SecondaryLink } from "../ui/Links";
import { LINKS, REVIEW_SOURCES, REVIEW_SOURCE_ICON_MAP } from "../constants";

export function SocialProof() {
    const reviewSources = REVIEW_SOURCES.map((source) => ({
        ...source,
        iconSrc: REVIEW_SOURCE_ICON_MAP[source.id] || "",
    }));

    const guestPhotos = [
        "https://bluuu.tours/resize/3dbd5b63d137007364cbd61f35a12728-1",
        "https://bluuu.tours/resize/ce66ae66894677d7792f666bf1905677-1",
        "https://bluuu.tours/resize/5098ca3cb0fbe4a9e7e852c6131232c3-1",
        "https://bluuu.tours/resize/bc8368588432315c0fb1e60152383c32-1",
        "https://bluuu.tours/resize/dfa4a954daf9bcf683e36f60fd8a6819-1",
        "https://bluuu.tours/resize/a37ac9163a82140ac7af190b6d417ee5-1",
        "https://bluuu.tours/resize/c9f603b7a80c83bbd25db9551c41bf72-1",
        "https://bluuu.tours/resize/eded3fe3ad3d3feb79caeff2bbc2b255-1",
        "https://bluuu.tours/resize/d11e1c9884a10ab723cae4ab29bb2589-1",
    ];

    return (
        <PremiumSection id="social" backgroundClassName="bg-neutral-50/50">
            <PremiumContainer>
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                    <div>
                        <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">GUEST FEEDBACK</div>
                        <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">Trusted by thousands of travelers</h2>
                        <p className="mt-4 text-lg text-secondary-600">
                            We take pride in our service. See what our guests say about their experience on the water with us.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            {reviewSources.map((source) => (
                                <a
                                    key={source.id}
                                    href={source.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 pr-4 transition-all hover:border-primary-200 hover:shadow-sm"
                                >
                                    <img src={source.iconSrc} alt="" className="h-5 w-5 grayscale transition group-hover:grayscale-0" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-secondary-900">{source.label}</span>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-2.5 w-2.5 fill-primary-600 text-primary-600" />
                                            ))}
                                        </div>
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-secondary-300 transition group-hover:text-primary-600" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-3 gap-3">
                            {guestPhotos.map((photo, i) => (
                                <div key={i} className="aspect-square overflow-hidden rounded-xl border border-neutral-100 bg-neutral-200 shadow-sm">
                                    <img src={photo} alt="Guest" className="h-full w-full object-cover transition duration-500 hover:scale-110" loading="lazy" />
                                </div>
                            ))}
                        </div>
                        <div className="absolute -bottom-4 -right-4 rounded-2xl bg-primary-600 p-4 font-bold text-white shadow-xl shadow-primary-600/20">
                            <div className="text-2xl leading-none">8,500+</div>
                            <div className="text-[10px] uppercase tracking-wider text-primary-100">Reviews across Bali</div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-12 w-12 rounded-full border-2 border-white bg-neutral-200">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="h-full w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-secondary-900">Joined by 50,000+ happy guests</div>
                            <div className="text-xs text-secondary-500">Since 2021, providing the best yacht tours in Bali.</div>
                        </div>
                    </div>
                    <SecondaryLink href={LINKS.reviews[1].href} targetBlank className="w-full sm:w-auto">
                        Read all reviews
                    </SecondaryLink>
                </div>
            </PremiumContainer>
        </PremiumSection>
    );
}
