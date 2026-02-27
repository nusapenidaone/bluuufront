/**
 * Utility function to merge class names.
 * Simple version of clsx/tailwind-merge.
 */
export function cn(...inputs) {
    return inputs.filter(Boolean).join(" ");
}
