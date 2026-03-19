import React from "react";
import { X } from "lucide-react";
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
}) {
  const sections = [
    { label: sectionLabels.beforeLunch, items: schedule?.beforeLunch || [] },
    { label: sectionLabels.afterLunch, items: schedule?.afterLunch || [] },
  ].filter((s) => s.items.length > 0);
  const footerNotes = schedule?.footerNotes || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      bodyClassName="p-0"
      showClose={false}
    >
      <div className="flex w-full flex-col overflow-hidden bg-white p-0">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-5">
          <div>
            <div className="text-base font-semibold text-secondary-900">
              {title ? `${title} schedule` : "Schedule"}
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
        <div className="overflow-y-auto p-6">
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
                  {footerNotes.map((note, i) => (
                    <p key={i} className="text-sm italic text-secondary-400">{note}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
