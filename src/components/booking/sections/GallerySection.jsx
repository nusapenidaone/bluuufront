import React from "react";
import { useTours } from "../../../ToursContext";
import { PremiumSection, PremiumContainer } from "../ui/Section";
import { HeroGallery } from "./Gallery";
import { PrimaryLink } from "../ui/Links";
import { SECTION_BACKGROUNDS } from "../constants";

export function GallerySection() {
    const { privateTours } = useTours();

    return (
        <PremiumSection
            id="step-route"
            backgroundClassName={SECTION_BACKGROUNDS.ocean}
        >
            <PremiumContainer>
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600">STEP 3 OF 4</div>
                    <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">Customize your route</h2>
                    <p className="mt-2 text-lg text-secondary-600">Choose your vibe. We'll maximize your time.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-secondary-500">Curated highlights from real Bluuu tours</div>
                    <div className="flex flex-wrap items-center gap-3">
                        <a href="#booking" className="text-sm font-semibold text-secondary-600 hover:text-secondary-900">
                            Check availability
                        </a>
                        <PrimaryLink href="#booking" className="px-5 py-2.5">
                            Check availability
                        </PrimaryLink>
                    </div>
                </div>
                <div className="mt-5">
                    <HeroGallery images={(privateTours || []).flatMap(t => t.images_with_thumbs || [])} />
                </div>
            </PremiumContainer>
        </PremiumSection>
    );
}
