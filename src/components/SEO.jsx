import { Helmet } from "react-helmet-async";

const DEFAULT_IMAGE = "https://bluuu.tours/storage/app/media/poster.webp";
const BASE_URL = "https://bluuu.tours";

export default function SEO({ title, description, image, canonical, type = "website", schema, noindex = false }) {
  const img = image || DEFAULT_IMAGE;
  const url = canonical || (BASE_URL + (typeof window !== "undefined" ? window.location.pathname : "/"));

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Bluuu Tours" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
