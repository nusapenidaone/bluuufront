import React from "react";
import { X, Utensils } from "lucide-react";
import { Fancybox } from "@fancyapps/ui";
import Modal from "../common/Modal";
import PhotoCarousel from "../common/PhotoCarousel";

export default function RestaurantModal({ restaurantData, onClose }) {
  const r = restaurantData;
  const rName = r?.name || r?.title || r?.restaurant_name || "";
  const rImages = r?.images_with_thumbs?.length
    ? r.images_with_thumbs.map((img) => ({
        thumb: img.hero || img.thumb,
        thumb_small: img.thumb_small,
        path: img.original || img.hero || img.thumb,
      }))
    : r?.image
    ? [{ thumb: r.image, path: r.image }]
    : [];
  const rDescription = r?.description || "";
  const rMenu = r?.menu || "";

  return (
    <Modal
      open={!!restaurantData}
      onClose={onClose}
      maxWidth="max-w-2xl"
      showClose={false}
      title={null}
      bodyClassName="p-0"
    >
      {/* Hero image carousel with glass close button */}
      <div className="relative">
        {rImages.length ? (
          <div className="relative w-full overflow-hidden rounded-t-2xl">
            <PhotoCarousel
              images={rImages}
              alt={rName || "Restaurant"}
              className="h-48 sm:h-56"
              alwaysShowControls
              maximizeLeft
              onOpenGallery={(idx) => {
                Fancybox.show(rImages.map((img) => ({ src: img.path, type: "image" })), {
                  startIndex: idx || 0,
                });
              }}
            />
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6">
              <h3 className="text-xl font-bold text-white sm:text-2xl">{rName}</h3>
              <div className="mt-1 flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-white/70" />
                <span className="text-sm font-medium text-white/80">Included lunch</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <h3 className="text-xl font-bold text-secondary-900">{rName}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-secondary-400">
              <Utensils className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">Included lunch</span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition hover:bg-white/40"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {rDescription && (
          <p
            className="text-sm leading-relaxed text-secondary-500"
            dangerouslySetInnerHTML={{ __html: rDescription }}
          />
        )}

        {rMenu && (
          <div
            className="restaurant-menu"
            dangerouslySetInnerHTML={{ __html: rMenu }}
          />
        )}
      </div>
    </Modal>
  );
}
