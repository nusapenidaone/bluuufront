import { getLunchDisplayData, sanitizeDisplayText, resolveScheduleIcon } from "../../utils/tourScheduleUtils";

export default function ScheduleItemCompact({ item, onRestaurantClick, restaurant }) {
  const Icon = resolveScheduleIcon(item.title);
  const detailsText = sanitizeDisplayText(item.details, { stripTrailingOne: true });
  const isLunch = /lunch/i.test(item.title);
  const lunchDisplay = isLunch ? getLunchDisplayData(item) : null;
  const displayTitle = lunchDisplay?.title || item.title;
  const descriptionText = isLunch ? lunchDisplay?.description : detailsText;

  const displayTime = item.time ? item.time.replace(/\./g, ":") : "";

  return (
    <div className="flex items-center gap-3 py-2.5 sm:py-3 min-h-[56px]">
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-primary-600">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-secondary-900">
          {displayTitle}
        </div>
        {descriptionText && (
          <div className="text-xs leading-normal text-secondary-500">{descriptionText}</div>
        )}
        {isLunch && restaurant && onRestaurantClick && (
          <button
            type="button"
            onClick={() => onRestaurantClick(restaurant)}
            className="mt-0.5 text-xs font-semibold text-primary-600 transition hover:text-primary-700 hover:underline underline-offset-2"
          >
            View menu
          </button>
        )}
      </div>
      {displayTime && (
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold tabular-nums text-secondary-700">{displayTime}</div>
        </div>
      )}
    </div>
  );
}
