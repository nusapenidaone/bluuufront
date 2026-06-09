export const SITE_NAV_LINKS = [
  { id: "private", label: "Private tours", href: "/private-tour-to-nusa-penida" },
  { id: "shared", label: "Shared tours", href: "/shared-tour-to-nusa-penida" },
  { id: "faq", label: "FAQ", href: "/faq" },
  { id: "reviews", label: "Reviews", href: "/reviews" },
];

export const COMPANY_LINKS = [
  { label: "Private tour", href: "/private-tour-to-nusa-penida" },
  { label: "Shared tour", href: "/shared-tour-to-nusa-penida" },
  { label: "FAQ", href: "/faq" },
  { label: "Reviews", href: "/reviews" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/policy/privacy" },
  { label: "Payment Policy", href: "/policy/payment" },
  { label: "Cancellation Policy", href: "/policy/cancellation" },
  { label: "Health & Safety", href: "/policy/health" },
];

export const SOCIAL_LINKS = [
  { label: "Instagram", key: "instagram" },
  { label: "WhatsApp", key: "whatsapp" },
  { label: "YouTube", key: "youtube" },
];

export function resolveSocialHref(contacts, key) {
  if (!contacts || typeof contacts !== "object") return "#";

  if (key === "instagram") return contacts.instagram || "#";
  if (key === "whatsapp") return contacts.whatsapp?.link || "#";
  if (key === "youtube") return contacts.youtube || "#";

  return "#";
}
