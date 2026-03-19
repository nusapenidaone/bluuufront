import { getLunchDisplayData, sanitizeDisplayText, resolveScheduleIcon } from "../../utils/tourScheduleUtils";

export default function ScheduleItemCompact({ item }) {
  const Icon = resolveScheduleIcon(item.title);
  const detailsText = sanitizeDisplayText(item.details, { stripTrailingOne: true });
  const isLunch = /lunch/i.test(item.title);
  const lunchDisplay = isLunch ? getLunchDisplayData(item) : null;
  const displayTitle = lunchDisplay?.title || item.title;
  const descriptionText = isLunch ? lunchDisplay?.description : detailsText;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-base font-semibold text-secondary-900">
            {displayTitle}
          </div>
          <div className="text-sm font-semibold text-secondary-500">
            {item.time}{item.duration ? ` (${item.duration})` : ""}
          </div>
        </div>
        {descriptionText ? (
          <div className="mt-0.5 text-sm leading-relaxed text-secondary-600">
            {descriptionText}
          </div>
        ) : null}
      </div>
    </div>
  );
}
