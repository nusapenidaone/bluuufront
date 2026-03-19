import { useState } from "react";
import { ChevronLeft, ArrowRight } from "lucide-react";
import ScheduleItemCompact from "./ScheduleItemCompact";
import RestaurantCard from "./RestaurantCard";
import RestaurantModal from "./RestaurantModal";
import Button from "../common/Button";
import { sanitizeDisplayText } from "../../utils/tourScheduleUtils";

export default function TourDetailsCard({
  style,
  schedule,
  note,
  restaurant,
  onAnotherRoute,
  onContinue,
  continueLabel = "Choose your boat",
  anotherRouteLabel = "Another route",
}) {
  const [restaurantPopup, setRestaurantPopup] = useState(null);

  if (!style || !schedule) return null;

  return (
    <>
      <div className="space-y-8">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:h-[800px]">
            <div className="relative h-80 sm:h-96 lg:h-full w-full lg:w-[38%] shrink-0 overflow-hidden pt-4 lg:pt-0">
              <img
                src={style.map || "https://bluuu.tours/themes/bluuu/assets/images/map.webp"}
                alt={style.title || "Route map"}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1 flex flex-col lg:overflow-hidden p-5 sm:p-8 lg:p-10">
              <div className="shrink-0">
                <h3 className="text-lg font-bold text-secondary-900 sm:text-xl">{style.title}</h3>
                <p className="mt-1 text-sm text-secondary-600">
                  {sanitizeDisplayText(style.description, { stripTrailingOne: true })}
                </p>
                <p className="mt-1 text-sm text-secondary-600">
                  Times are approximate and may adjust due to sea conditions (safety-first routing).
                </p>
                {note ? (
                  <div className="mt-3 rounded-full border border-primary-200 bg-neutral-100 px-3 py-2 text-sm font-medium text-primary-600">
                    {note}
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex-1 min-h-0 overflow-y-auto grid gap-3 grid-cols-1">
                <div className="rounded-xl">
                  <div className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300">
                    Morning
                  </div>
                  <div className="divide-y divide-neutral-100 border-t border-neutral-100">
                    {schedule.beforeLunch.map((item, idx) => (
                      <ScheduleItemCompact key={`morning-${idx}`} item={item} />
                    ))}
                  </div>
                     {(restaurant || style.restaurant) && (
                <div className="mt-3">
                  <RestaurantCard restaurant={restaurant || style.restaurant} onClick={setRestaurantPopup} />
                </div>
              )}
                </div>
                
                <div className="rounded-xl">
                  <div className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300">
                    Midday & Afternoon
                  </div>
                  <div className="divide-y divide-neutral-100 border-t border-neutral-100">
                    {schedule.afterLunch.map((item, idx) => (
                      <ScheduleItemCompact key={`afternoon-${idx}`} item={item} />
                    ))}
                  </div>
                </div>
                {(schedule.footerNotes || []).length ? (
                  <div className="border-t border-neutral-200 pt-3 space-y-1.5">
                    {schedule.footerNotes.map((n, i) => (
                      <p key={i} className="text-sm italic text-secondary-400">{n}</p>
                    ))}
                  </div>
                ) : null}
              </div>
           
              <div className="shrink-0 mt-4 flex items-center justify-end gap-4 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={onAnotherRoute}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-400 transition hover:text-secondary-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {anotherRouteLabel}
                </button>
                <Button onClick={onContinue} className="rounded-full px-3 sm:px-6 text-sm whitespace-nowrap">
                  {continueLabel} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RestaurantModal restaurantData={restaurantPopup} onClose={() => setRestaurantPopup(null)} />
    </>
  );
}
