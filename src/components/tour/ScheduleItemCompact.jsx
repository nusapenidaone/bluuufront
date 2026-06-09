import { Sparkles } from "lucide-react";
import { getLunchDisplayData, sanitizeDisplayText, resolveScheduleIcon, resolveIconByName } from "../../utils/tourScheduleUtils";

export default function ScheduleItemCompact({ item, onRestaurantClick, restaurant }) {
  const Icon = (item.icon_name && resolveIconByName(item.icon_name)) || resolveScheduleIcon(item.title);
  const detailsText = sanitizeDisplayText(item.details, { stripTrailingOne: true });
  const isLunch = /lunch/i.test(item.title);
  const lunchDisplay = isLunch ? getLunchDisplayData(item) : null;
  const displayTitle = lunchDisplay?.title || item.title;
  const descriptionText = isLunch ? lunchDisplay?.description : detailsText;
  const tier = item.highlight === "premium" || item.highlight === "first-class"
    ? item.highlight
    : (item.is_premium == 1 || item.is_premium === true ? "premium" : null);
  const isPremium = tier === "premium";
  const isFirstClass = tier === "first-class";

  const displayTime = item.time ? item.time.replace(/\./g, ":") : "";

  return (
    <div className={`flex items-center gap-3 py-2.5 sm:py-3 min-h-[56px] ${isPremium ? "rounded-xl bg-indigo-50/60 px-2 -mx-2" : isFirstClass ? "rounded-xl bg-emerald-50/60 px-2 -mx-2" : ""}`}>
      <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full ${isPremium ? "bg-indigo-100 text-indigo-600" : isFirstClass ? "bg-emerald-100 text-emerald-600" : "bg-neutral-100 text-primary-600"}`}>
        {item.icon_svg
          ? <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current" dangerouslySetInnerHTML={{ __html: item.icon_svg }} />
          : <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base font-semibold text-secondary-900">{displayTitle}</span>
          {tier && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none border ${isPremium ? "bg-indigo-500/15 text-indigo-600 border-indigo-300/50" : "bg-emerald-500/15 text-emerald-600 border-emerald-300/50"}`}>
              <Sparkles className="h-2 w-2" />{isPremium ? "Premium" : "First Class"}
            </span>
          )}
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
          <div className={`text-sm font-bold tabular-nums ${isPremium ? "text-indigo-600" : isFirstClass ? "text-emerald-600" : "text-secondary-700"}`}>{displayTime}</div>
        </div>
      )}
    </div>
  );
}
