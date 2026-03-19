import { Clock, MapPin, Ship, Waves, UtensilsCrossed, Anchor, Camera } from "lucide-react";

const decodeBasicEntities = (value = "") =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;|&#38;/gi, "&")
    .replace(/&quot;|&#34;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, "-")
    .replace(/&mdash;|&#8212;/gi, "-")
    .replace(/&bull;|&#8226;/gi, " - ");

export const sanitizeDisplayText = (value, { stripTrailingOne = false } = {}) => {
  if (typeof value !== "string") return "";
  const withoutTags = value.replace(/<[^>]*>/g, " ");
  const decoded = decodeBasicEntities(withoutTags);
  const normalized = decoded.replace(/\s+/g, " ").trim();
  const withSentenceSpacing = normalized.replace(/([.!?])([A-Z\u00C0-\u024F])/g, "$1 $2");
  if (!stripTrailingOne) return withSentenceSpacing;
  return withSentenceSpacing.replace(/\s+1$/, "").trim();
};

export const getRestaurantDisplayName = (restaurant) => {
  if (!restaurant || typeof restaurant !== "object") return "";
  return sanitizeDisplayText(
    restaurant.name || restaurant.title || restaurant.restaurant_name || restaurant.restaurantName || "",
    { stripTrailingOne: true }
  );
};

export const getRestaurantDisplayDescription = (restaurant) => {
  if (!restaurant || typeof restaurant !== "object") return "";
  return sanitizeDisplayText(
    restaurant.description || restaurant.short_description || restaurant.shortDescription ||
    restaurant.details || restaurant.menu || "",
    { stripTrailingOne: true }
  );
};

export const getLunchDisplayData = (item, restaurant = null, fallbackRestaurant = null) => {
  const detailsText = sanitizeDisplayText(item?.details, { stripTrailingOne: true });
  const primaryRestaurant = restaurant && typeof restaurant === "object" ? restaurant : null;
  const inferredRestaurant = fallbackRestaurant && typeof fallbackRestaurant === "object" ? fallbackRestaurant : null;
  const inferredNameFromDetails = detailsText
    ? (
      detailsText.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()
      || detailsText.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim()
      || ""
    )
    : "";
  const name =
    getRestaurantDisplayName(primaryRestaurant)
    || getRestaurantDisplayName(inferredRestaurant)
    || inferredNameFromDetails;
  const restaurantDescription =
    getRestaurantDisplayDescription(primaryRestaurant)
    || getRestaurantDisplayDescription(inferredRestaurant);
  const fallbackDescription =
    detailsText && detailsText !== String(item?.title || "").trim() && detailsText !== name
      ? detailsText
      : "";
  const description = restaurantDescription || fallbackDescription;
  const popupRestaurant = name || description
    ? { ...(primaryRestaurant || {}), ...(inferredRestaurant || {}), name, description }
    : null;
  return {
    title: name ? `Lunch at ${name}` : item?.title || "Lunch",
    description,
    popupRestaurant,
  };
};

export const resolveScheduleIcon = (title = "") => {
  const t = String(title).toLowerCase();
  if (t.includes("meet") || t.includes("pick")) return MapPin;
  if (t.includes("depart") || t.includes("boat")) return Ship;
  if (t.includes("snorkeling") || t.includes("swim") || t.includes("manta")) return Waves;
  if (t.includes("lunch") || t.includes("food")) return UtensilsCrossed;
  if (t.includes("return") || t.includes("back")) return Anchor;
  if (t.includes("photo")) return Camera;
  return Clock;
};
