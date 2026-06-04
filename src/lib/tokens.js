// Design tokens — single source of truth for UI consistency

// Card styles
export const CARD = {
  radius: "rounded-2xl sm:rounded-3xl",
  border: "border border-neutral-200",
  shadow: "shadow-[0_2px_16px_rgba(0,0,0,0.07)]",
  bg: "bg-white",
};

// Button base styles
export const BUTTON = {
  primary: "inline-flex items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition",
  secondary: "inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-secondary-900 hover:border-neutral-300 transition",
  option: "rounded-2xl border p-3.5 transition-all",
  optionActive: "border-primary-600 bg-primary-50/50 ring-1 ring-primary-600/20",
  optionInactive: "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
};

// Text hierarchy
export const TEXT = {
  h2: "text-2xl font-bold text-secondary-900 sm:text-3xl",
  h3: "text-lg font-semibold text-secondary-900",
  body: "text-sm text-secondary-500",
  label: "text-base font-semibold text-secondary-900",
  value: "text-sm text-secondary-600",
  caption: "text-xs text-secondary-400",
};

// Pill/Badge styles
export const PILL = {
  base: "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
};

// Trust card colors (Safety, Cancellation, Weather)
export const TRUST_COLORS = {
  safety: { color: "text-emerald-600", bg: "bg-emerald-50" },
  cancellation: { color: "text-primary-600", bg: "bg-primary-50" },
  weather: { color: "text-amber-600", bg: "bg-amber-50" },
};

// Modal footer
export const MODAL_FOOTER = "shrink-0 border-t border-neutral-100 bg-white px-6 py-4";
