export const SITE_NAV_LINKS = [
  { id: "private", label: "Private tours", href: "/new/private" },
  { id: "shared", label: "Shared tours", href: "/new/shared" },
  { id: "faq", label: "FAQ", href: "/new/faq" },
  { id: "reviews", label: "Reviews", href: "/new/reviews" },
];

export const COMPANY_LINKS = [
  { label: "Private tour", href: "/new/private" },
  { label: "Shared tour", href: "/new/shared" },
  { label: "FAQ", href: "/new/faq" },
  { label: "Reviews", href: "/new/reviews" },
  { label: "Gallery", href: "/new/gallery" },
  { label: "About", href: "/new/about" },
  { label: "Blog", href: "/new/blog" },
];

export const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/new/policy/privacy" },
  { label: "Payment Policy", href: "/new/policy/payment" },
  { label: "Cancellation Policy", href: "/new/policy/cancellation" },
  { label: "Health & Safety", href: "/new/policy/health" },
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
