import React from "react";
import { UtensilsCrossed, ExternalLink } from "lucide-react";

export default function RestaurantCard({ restaurant, onClick }) {
  const name = restaurant?.name || restaurant?.title || restaurant?.restaurant_name || restaurant?.restaurantName || "";
  if (!name) return null;
  const img = restaurant.image || restaurant.images_with_thumbs?.[0]?.thumb || null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(restaurant)}
      className="w-full min-h-[64px] flex items-center gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-left transition hover:border-neutral-300 hover:bg-white"
    >
      {img ? (
        <div className="h-16 w-16 shrink-0">
          <img src={img} alt={restaurant.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-16 w-16 shrink-0 bg-primary-50 flex items-center justify-center">
          <UtensilsCrossed className="h-5 w-5 text-primary-300" />
        </div>
      )}
      <div className="flex-1 min-w-0 px-3 py-2">
        <div className="text-sm font-bold text-secondary-900 truncate">{name}</div>
      </div>
      <div className="shrink-0 pr-3 text-sm font-semibold text-primary-600 flex items-center gap-1">
        View menu
        <ExternalLink className="h-3.5 w-3.5 text-primary-400" />
      </div>
    </button>
  );
}
