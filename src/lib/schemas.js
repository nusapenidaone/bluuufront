const LOGO = "https://bluuu.tours/themes/bluuu/assets/img/logo.svg";
const BASE_URL = "https://bluuu.tours";

export const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Bluuu Tours",
  "url": BASE_URL,
};

export const schemaLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Bluuu Tours",
  "url": BASE_URL,
  "logo": LOGO,
  "image": "https://bluuu.tours/storage/app/media/poster.webp",
  "description": "Award-winning private and shared yacht tours to Nusa Penida from Bali, Indonesia.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sanur",
    "addressRegion": "Bali",
    "addressCountry": "ID",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "reviewCount": "8500",
  },
  "priceRange": "$$",
  "sameAs": [
    "https://www.tripadvisor.com/Attraction_Review-g6359820-d8169741",
    "https://www.viator.com/Bali/d334-ttd",
  ],
};

export function schemaArticle(post, slug) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.seo_title || post.title || "",
    "description": post.seo_description || post.description || "",
    "image": post.cover || "https://bluuu.tours/storage/app/media/poster.webp",
    "datePublished": post.created_at || "",
    "dateModified": post.updated_at || post.created_at || "",
    "author": {
      "@type": "Organization",
      "name": "Bluuu Tours",
      "url": BASE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bluuu Tours",
      "logo": {
        "@type": "ImageObject",
        "url": LOGO,
      },
    },
    "mainEntityOfPage": `${BASE_URL}/blog/${slug}`,
  };
}
