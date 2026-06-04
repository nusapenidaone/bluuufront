import React from "react";
import { X, Utensils } from "lucide-react";
import Modal from "../common/Modal";

export default function RestaurantModal({ restaurantData, onClose }) {
  const r = restaurantData;
  const rName = r?.name || r?.title || r?.restaurant_name || "";
  const rImage = r?.image || r?.images_with_thumbs?.[0]?.thumb || null;
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
      {/* Hero image with glass close button */}
      <div className="relative">
        {rImage ? (
          <div className="relative h-52 sm:h-64 w-full overflow-hidden rounded-t-2xl">
            <img
              src={rImage}
              alt={rName || "Restaurant"}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
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
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition hover:bg-white/40"
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
