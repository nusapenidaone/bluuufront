import React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../common/Modal";
import ScheduleItemCompact from "./ScheduleItemCompact";
import RestaurantCard from "./RestaurantCard";

export default function ScheduleModal({
  isOpen,
  onClose,
  title,
  subtitle = "Morning plan is similar for all styles. Afternoon changes by style.",
  note,
  schedule,
  isLoading = false,
  restaurantData = null,
  routeRestaurant = null,
  onRestaurantClick,
  sectionLabels = { beforeLunch: "Morning", afterLunch: "Afternoon" },
  allBoats = [],
  currentBoatId,
  onSwitchBoat,
}) {
  const sections = [
    { label: sectionLabels.beforeLunch, items: schedule?.beforeLunch || [] },
    { label: sectionLabels.afterLunch, items: schedule?.afterLunch || [] },
  ].filter((s) => s.items.length > 0);
  const footerNotes = schedule?.footerNotes || [];

  const currentIdx = allBoats.findIndex(b => b.id === currentBoatId);
  const prevBoat = allBoats.length > 1 ? allBoats[(currentIdx - 1 + allBoats.length) % allBoats.length] : null;
  const nextBoat = allBoats.length > 1 ? allBoats[(currentIdx + 1) % allBoats.length] : null;
  const hasNav = (prevBoat || nextBoat) && onSwitchBoat;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      bodyClassName="p-0"
      showClose={false}
    >
      <div className="flex w-full flex-col overflow-hidden bg-white p-0 max-h-[85vh]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5">
          <div>
            <div className="text-lg font-bold text-secondary-900">
              {title ? `${title} itinerary` : "Itinerary"}
            </div>
            {subtitle && (
              <div className="mt-1 text-sm text-secondary-500">{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors -mr-2 -mt-2"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1">
              {note && (
                <div className="mb-1 rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm text-primary-600 font-medium">
                  {note}
                </div>
              )}
              {sections.map((section, sectionIdx) => (
                <React.Fragment key={section.label}>
                  <div className="rounded-xl">
                    <div className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-secondary-300">
                      {section.label}
                    </div>
                    <div className="divide-y divide-neutral-100 border-t border-neutral-100">
                      {section.items.map((item, idx) => (
                        <ScheduleItemCompact
                          key={`${section.label}-${idx}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </div>
                  {sectionIdx === 0 && (
                    <RestaurantCard restaurant={restaurantData} onClick={onRestaurantClick} />
                  )}
                </React.Fragment>
              ))}
              {footerNotes.length > 0 && (
                <div className="border-t border-neutral-200 pt-3 space-y-1.5">
                  {footerNotes.map((n, i) => (
                    <p key={i} className="text-sm italic text-secondary-400">{n}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {hasNav && (
          <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/60 px-6 py-5 flex items-center justify-between">
            {prevBoat ? (
              <button type="button" onClick={() => onSwitchBoat(prevBoat)} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700">
                <ChevronLeft className="h-4 w-4" />{prevBoat.name}
              </button>
            ) : <span />}
            {nextBoat ? (
              <button type="button" onClick={() => onSwitchBoat(nextBoat)} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700">
                {nextBoat.name}<ChevronRight className="h-4 w-4" />
              </button>
            ) : <span />}
          </div>
        )}
      </div>
    </Modal>
  );
}
