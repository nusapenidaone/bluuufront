import React from "react";
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
      title={rName || "Restaurant"}
      subtitle="Included lunch"
      maxWidth="max-w-3xl"
    >
      <div className="pb-4">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {rImage ? (
            <div className="w-full shrink-0 sm:w-2/5">
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200">
                <img
                  src={rImage}
                  alt={rName || "Restaurant"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
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
