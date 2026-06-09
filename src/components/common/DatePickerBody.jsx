import React, { useMemo } from "react";
import CustomDatePicker from "./CustomDatePicker";
import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Reusable date picker body — exact single date or flexible range.
 * Used in both private1.jsx (hero bar dropdown, inline) and shared.jsx (card section).
 *
 * Props:
 *   dateMode          "exact" | "flex"
 *   exactDate         ISO string
 *   onExactDateChange (iso: string) => void
 *   rangeStart        ISO string
 *   rangeEnd          ISO string
 *   onRangeStartChange (iso: string) => void
 *   onRangeEndChange   (iso: string) => void
 *   onDateComplete    () => void  — called when selection is done (auto-open guests etc.)
 *   filterDate        (date: Date) => boolean
 *   onMonthChange     (date: Date) => void
 *   globalAvailabilityMap  { [iso]: boolean }
 *   inline            boolean — render calendar inline vs. input+popup
 *   todayISO          ISO string (optional, computed if omitted)
 *   maxRangeDays      number (optional, caps range length)
 *   className         string
 */
export default function DatePickerBody({
  dateMode,
  exactDate,
  onExactDateChange,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  onDateComplete,
  filterDate,
  onMonthChange,
  globalAvailabilityMap,
  inline = false,
  todayISO: todayISOProp,
  maxRangeDays,
  className,
}) {
  const todayISO = useMemo(() => {
    if (todayISOProp) return todayISOProp;
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }, [todayISOProp]);

  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const s = new Date(rangeStart);
    const e = new Date(rangeEnd);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [rangeStart, rangeEnd]);

  const calendarClassName = inline
    ? "w-full rounded-2xl border-0 bg-transparent shadow-none"
    : "w-full rounded-xl border border-neutral-200 bg-white shadow-none";

  if (dateMode === "exact") {
    return (
      <div className={cn("space-y-3", className)}>
        <div id="step1-exact-date">
          <CustomDatePicker
            mode="single"
            inline={inline}
            selected={exactDate ? new Date(exactDate) : undefined}
            onSelect={(date) => {
              if (date) {
                const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 10);
                onExactDateChange(iso);
                onDateComplete?.();
              }
            }}
            filterDate={filterDate}
            onMonthChange={onMonthChange}
            className={calendarClassName}
          />
        </div>
        {exactDate && globalAvailabilityMap && globalAvailabilityMap[exactDate] === false && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-3 text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <div className="text-sm">
              <p className="font-semibold">Sold out for this date</p>
              <p className="text-xs text-red-600">Try flexible dates or chat with our team on WhatsApp.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", inline && "max-sm:space-y-2", className)}>
      {maxRangeDays > 0 && (
        <p className="text-xs text-secondary-400 text-center">Max {maxRangeDays} days</p>
      )}
      <div className={cn("flex gap-2", inline && "max-sm:w-full sm:justify-center")}>
        {[7, 10, 14].map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => {
              const base = rangeStart || todayISO;
              const startDate = new Date(`${base}T00:00:00`);
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + days - 1);
              const endIso = endDate.toISOString().slice(0, 10);
              onRangeStartChange(base);
              onRangeEndChange(endIso);
              onDateComplete?.();
            }}
            className={cn(
              "flex-1 sm:flex-none rounded-full px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap text-center",
              inline && "max-sm:py-1.5",
              rangeDays === days
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-neutral-100 text-secondary-500 hover:bg-neutral-200"
            )}
          >
            {days} Days
          </button>
        ))}
      </div>
      <div id="step1-range-start">
        <CustomDatePicker
          mode="range"
          inline={inline}
          selected={{
            from: rangeStart ? new Date(`${rangeStart}T12:00:00`) : undefined,
            to: rangeEnd ? new Date(`${rangeEnd}T12:00:00`) : undefined,
          }}
          fixedRangeDays={0}
          maxRangeDays={maxRangeDays || 0}
          onSelect={(range) => {
            if (range?.from) {
              const fromIso = new Date(range.from.getTime() - range.from.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 10);
              onRangeStartChange(fromIso);
              if (range.to) {
                let toDate = range.to;
                if (maxRangeDays) {
                  const maxTo = new Date(range.from.getTime() + (maxRangeDays - 1) * 24 * 60 * 60 * 1000);
                  if (toDate > maxTo) toDate = maxTo;
                }
                const toIso = new Date(toDate.getTime() - toDate.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 10);
                onRangeEndChange(toIso);
                onDateComplete?.();
              } else {
                onRangeEndChange("");
              }
            } else {
              onRangeStartChange("");
              onRangeEndChange("");
            }
          }}
          className={calendarClassName}
        />
      </div>
    </div>
  );
}
