export const TRANSFER_DETAILS_FALLBACK_IMAGE =
  "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg";
export const INSURANCE_DETAILS_FALLBACK_IMAGE =
  "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";

export const decodeBasicEntities = (value = "") =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;|&#38;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
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
    restaurant.name ||
      restaurant.title ||
      restaurant.restaurant_name ||
      restaurant.restaurantName ||
      "",
    { stripTrailingOne: true }
  );
};

export const getRestaurantDisplayDescription = (restaurant) => {
  if (!restaurant || typeof restaurant !== "object") return "";
  return sanitizeDisplayText(
    restaurant.description ||
      restaurant.short_description ||
      restaurant.shortDescription ||
      restaurant.details ||
      restaurant.menu ||
      "",
    { stripTrailingOne: true }
  );
};

export const getLunchDisplayData = (item, restaurant = null, fallbackRestaurant = null) => {
  const detailsText = sanitizeDisplayText(item?.details, { stripTrailingOne: true });
  const primaryRestaurant = restaurant && typeof restaurant === "object" ? restaurant : null;
  const inferredRestaurant =
    fallbackRestaurant && typeof fallbackRestaurant === "object" ? fallbackRestaurant : null;
  const inferredNameFromDetails = detailsText
    ? detailsText.match(/^([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim() ||
      detailsText.match(/(?:at|served at)\s+([^()]+?(?:restaurant|beach ?club))/i)?.[1]?.trim() ||
      ""
    : "";
  const name =
    getRestaurantDisplayName(primaryRestaurant) ||
    getRestaurantDisplayName(inferredRestaurant) ||
    inferredNameFromDetails;
  const restaurantDescription =
    getRestaurantDisplayDescription(primaryRestaurant) ||
    getRestaurantDisplayDescription(inferredRestaurant);
  const fallbackDescription =
    detailsText && detailsText !== String(item?.title || "").trim() && detailsText !== name
      ? detailsText
      : "";
  const description = restaurantDescription || fallbackDescription;
  const popupRestaurant =
    name || description
      ? {
          ...(primaryRestaurant || {}),
          ...(inferredRestaurant || {}),
          name,
          description,
        }
      : null;
  return {
    title: name ? `Lunch at ${name}` : item?.title || "Lunch",
    description,
    popupRestaurant,
  };
};

export const getOptionDescription = (option) => {
  if (!option || typeof option !== "object") return "";
  const rawDescription =
    option.description ||
    option.short_description ||
    option.shortDescription ||
    option.description_text ||
    option.descriptionText ||
    option.subtitle ||
    option.helper ||
    option.note ||
    option.notes ||
    option.details ||
    option.desc ||
    option.text ||
    "";
  return sanitizeDisplayText(rawDescription, { stripTrailingOne: true });
};

export const getOptionImage = (option) => {
  if (!option || typeof option !== "object") return "";
  const firstImageWithThumbs = option.images_with_thumbs?.[0] || {};
  const candidates = [
    option.image,
    option.image_url,
    option.imageUrl,
    option.thumb,
    option.thumbnail,
    option.cover,
    option.photo,
    firstImageWithThumbs.thumb1,
    firstImageWithThumbs.thumb,
    firstImageWithThumbs.original,
    option.images?.[0],
    option.gallery?.[0],
  ];
  const resolved = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0
  );
  return resolved ? resolved.trim() : "";
};

export const buildOptionDetails = (
  option,
  {
    extraDescription = "",
    fallbackDescription = "Detailed information is available on request.",
    fallbackImage = "",
  } = {}
) => {
  const baseDescription = getOptionDescription(option);
  const combinedDescription = [baseDescription, extraDescription].filter(Boolean).join("\n\n").trim();
  return {
    description: combinedDescription || fallbackDescription,
    image: getOptionImage(option) || fallbackImage,
  };
};

export const getBoatLength = (tour) => {
  if (tour.size) return tour.size;
  if (tour.length) return tour.length;
  return "";
};
