import "./index.css";
import { Suspense, lazy, useEffect } from "react";

const Home = lazy(() => import("./home.jsx"));
const Private = lazy(() => import("./private.jsx"));
const Shared = lazy(() => import("./shared.jsx"));
const Payment = lazy(() => import("./Payment.jsx"));
const PolicyPage = lazy(() => import("./PolicyPage.jsx"));
const ReviewsPage = lazy(() => import("./ReviewsPage.jsx"));
const GalleryPage = lazy(() => import("./GalleryPage.jsx"));
const AboutPage = lazy(() => import("./AboutPage.jsx"));
const FaqPage = lazy(() => import("./FaqPage.jsx"));
const BlogPage = lazy(() => import("./BlogPage.jsx"));
const BlogPostPage = lazy(() => import("./BlogPostPage.jsx"));
const SuccessPage = lazy(() => import("./SuccessPage.jsx"));
const AccountPage = lazy(() => import("./AccountPage.jsx"));
const GlobalImagePreloader = lazy(() => import("./components/common/GlobalImagePreloader.jsx"));

function NotFound() {
  return (
    <div style={{
      background: "#0a0a0a",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      textAlign: "center",
    }}>
      <div>
        <h1 style={{ fontSize: "8rem", fontWeight: 700, color: "#1a9fd4", lineHeight: 1 }}>404</h1>
        <p style={{ fontSize: "1.5rem", color: "#aaa", marginTop: "1rem" }}>Page not found</p>
        <a href="/private-tour-to-nusa-penida" style={{
          display: "inline-block",
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          background: "#1a9fd4",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "8px",
          fontSize: "1rem",
        }}>Go to booking</a>
      </div>
    </div>
  );
}

import { getUtmQueryString } from "./lib/analytics";
import { CurrencyProvider } from "./CurrencyContext.jsx";
import { ToursProvider } from "./ToursContext.jsx";
import { ExtrasProvider } from "./contexts/ExtrasContext.jsx";
import { RulesProvider } from "./contexts/RulesContext.jsx";
import UnifiedSwitcher from "./components/UnifiedSwitcher.jsx";
import { useSiteContacts } from "./hooks/useSiteContacts.js";

function WhatsAppButton() {
  const contacts = useSiteContacts();
  const link = contacts?.whatsapp?.link;
  if (!link) return null;
  return (
    <>
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-sticky-btn"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="wa-sticky-label">Chat with us</span>
    </a>
    <style>{`
      .wa-sticky-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9000;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #25D366;
        color: #fff;
        border-radius: 999px;
        padding: 10px 18px 10px 14px;
        box-shadow: 0 4px 18px #25d36673;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        line-height: 1;
      }
      @media (max-width: 639px) {
        .wa-sticky-btn { padding: 12px; }
        .wa-sticky-label { display: none; }
      }
    `}</style>
    </>
  );
}

const POLICY_PATH_MAP = {
  privacy: "privacy",
  cancellation: "cancellation",
  cancelation: "cancellation",
  "cancellation-policy": "cancellation",
  "cancelation-policy": "cancellation",
  payment: "payment",
  "payment-policy": "payment",
  health: "health",
  "health-safety": "health",
  "health-and-safety": "health",
  sustainability: "health",
  liability: "liability",
  release: "liability",
  "release-from-liability": "liability",
};

function appendUtm(url) {
  const qs = getUtmQueryString();
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

if (typeof window !== "undefined") {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";

    // GA: whatsapp_clicked
    if (href.includes("wa.me") || href.includes("whatsapp.com")) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "whatsapp_clicked" });
    }

    if (href.startsWith("/") && !href.startsWith("//")) {
      if (href.startsWith("#")) return;
      e.preventDefault();
      window.location.href = appendUtm(href);
    }
  }, true);
}

function removePreloader() {
  const el = document.getElementById("preloader");
  if (!el) return;
  el.style.opacity = "0";
  el.style.transition = "opacity 0.25s ease";
  setTimeout(() => el.remove(), 260);
}

export default function App() {
  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const path = rawPath.replace(/\/+$/, "") || "/";

  useEffect(() => { removePreloader(); }, []);

  // Prefetch private & shared chunks while user is on homepage
  useEffect(() => {
    if (path !== "/") return;
    const t = setTimeout(() => {
      import("./private.jsx");
      import("./shared.jsx");
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  const policyMatch = path.match(/^\/policy\/([^/]+)$/i);
  const policyKeyFromPath = policyMatch?.[1] ? POLICY_PATH_MAP[policyMatch[1].toLowerCase()] : null;

  const content = (() => {
    if (policyKeyFromPath) {
      return <PolicyPage policyKey={policyKeyFromPath} />;
    }

    if (path === "/nusa-penida" || path === "/nusa-penida/boats") {
      window.location.replace("/");
      return null;
    }

    if (path === "/nusa-penida/shared-tours" || path.startsWith("/nusa-penida/shared-tours/")) {
      window.location.replace("/shared-tour-to-nusa-penida");
      return null;
    }

    if (path === "/nusa-penida/private-tours" || path.startsWith("/nusa-penida/private-tours/") || path === "/nusa-penida/bundeled-tours" || path.startsWith("/nusa-penida/bundeled-tours/") || path === "/nusa-penida/bundled-tours" || path.startsWith("/nusa-penida/bundled-tours/")) {
      window.location.replace("/private-tour-to-nusa-penida");
      return null;
    }


    if (path === "/") {
      return <Home />;
    }



    if (path === "/private-tour-to-nusa-penida") {
      return <Private />;
    }

    if (path === "/shared-tour-to-nusa-penida") {
      return <Shared />;
    }

    if (path === "/payment") {
      return <Payment />;
    }

    if (path === "/success") {
      return <SuccessPage />;
    }

    if (path === "/account") {
      return <AccountPage />;
    }

    if (path === "/reviews") {
      return <ReviewsPage />;
    }

    if (path.startsWith("/reviews/")) {
      window.location.replace("/reviews");
      return null;
    }

    if (path === "/gallery") {
      return <GalleryPage />;
    }

    if (path === "/about") {
      return <AboutPage />;
    }

    if (path === "/faq") {
      return <FaqPage />;
    }

    if (path === "/blog") {
      return <BlogPage />;
    }

    const blogPostMatch = path.match(/^\/blog\/([^/]+)$/);
    if (blogPostMatch) {
      return <BlogPostPage slug={blogPostMatch[1]} />;
    }

    return <NotFound />;
  })();

  return (
    <CurrencyProvider>
      <ToursProvider>
        <ExtrasProvider>
          <RulesProvider>
          <GlobalImagePreloader />
          <UnifiedSwitcher showFloatingButton={false} />
          {path !== "/" && <WhatsAppButton />}
          <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fff" }} />}>
            {content}
          </Suspense>
          </RulesProvider>
        </ExtrasProvider>
      </ToursProvider>
    </CurrencyProvider>
  );
}
