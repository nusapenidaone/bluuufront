import { cn } from "../../lib/utils";
import { formatIDR } from "./utils";

/** "Low season −20%" pill. upTo → "Up to −20%" (for "from" prices before a date is picked). */
export function LowSeasonBadge({ percent, upTo = false, compact = false, className }) {
  if (!percent || percent <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white",
        className
      )}
    >
      {compact ? `−${percent}%` : upTo ? `Low season up to −${percent}%` : `Low season −${percent}%`}
    </span>
  );
}

/** Struck-through full price shown next to the discounted one. */
export function OldPrice({ value, className }) {
  if (!value) return null;
  return (
    <span className={cn("whitespace-nowrap text-xs font-semibold text-secondary-400 line-through", className)}>
      {formatIDR(value)}
    </span>
  );
}

/**
 * Badge + struck-through full price for a priced card (fields set by withBoatPrice / yachtOptions:
 * priceOriginal, lowSeasonPercent, lowSeasonUpTo). Renders nothing without a discount.
 */
export function LowSeasonTag({ item, compact = false, className }) {
  if (!item?.priceOriginal || !item?.lowSeasonPercent) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0.5", className)}>
      <LowSeasonBadge percent={item.lowSeasonPercent} upTo={item.lowSeasonUpTo} compact={compact} />
      {!compact && <OldPrice value={item.priceOriginal} />}
    </div>
  );
}
