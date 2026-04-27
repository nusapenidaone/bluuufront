import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../common/Modal";

export default function RestaurantModal({ restaurantData, onClose }) {
  const r = restaurantData;
  const rName = r?.name || r?.title || r?.restaurant_name || "";
  const rImages = r?.images_with_thumbs?.length
    ? r.images_with_thumbs
    : r?.image
    ? [{ thumb: r.image, thumb_small: r.image }]
    : [];
  const rDescription = r?.description || "";
  const rMenu = r?.menu || "";

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [restaurantData]);

  const total = rImages.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const current = rImages[idx] || null;

  return (
    <Modal
      open={!!restaurantData}
      onClose={onClose}
      title={rName || "Restaurant"}
      subtitle="Included lunch"
      maxWidth="max-w-3xl"
    >
      <div className="pb-4">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {total > 0 ? (
            <div className="w-full shrink-0 sm:w-2/5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                <img
                  key={idx}
                  src={current.thumb}
                  srcSet={current.thumb_small ? `${current.thumb_small} 200w, ${current.thumb} 400w` : undefined}
                  sizes="(max-width: 640px) 100vw, 280px"
                  alt={`${rName} ${idx + 1}`}
                  className="h-full w-full object-cover transition-opacity duration-200"
                  loading="lazy"
                  decoding="async"
                />
                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {idx + 1} / {total}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}
          <div className="flex-1 space-y-3 overflow-y-auto">
            {rDescription ? (
              <div
                className="text-sm leading-relaxed text-secondary-600"
                dangerouslySetInnerHTML={{ __html: rDescription }}
              />
            ) : null}
            {rMenu ? (
              <div
                className="prose prose-sm max-w-none text-secondary-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1"
                dangerouslySetInnerHTML={{ __html: rMenu }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}
