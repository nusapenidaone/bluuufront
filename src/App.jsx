import "./index.css";
import Home from "./home.jsx";
import Home1 from "./home1.jsx";
import Private from "./private.jsx";
import Shared from "./shared.jsx";
import Checkout from "./Checkout.jsx";
import Payment from "./Payment.jsx";
import PolicyPage from "./PolicyPage.jsx";
import ReviewsPage from "./ReviewsPage.jsx";
import GalleryPage from "./GalleryPage.jsx";
import AboutPage from "./AboutPage.jsx";
import FaqPage from "./FaqPage.jsx";
import BlogPage from "./BlogPage.jsx";
import BlogPostPage from "./BlogPostPage.jsx";
import GlobalImagePreloader from "./components/common/GlobalImagePreloader.jsx";

import { CurrencyProvider } from "./CurrencyContext.jsx";
import { ToursProvider } from "./ToursContext.jsx";
import { ExtrasProvider } from "./contexts/ExtrasContext.jsx";
import { RulesProvider } from "./contexts/RulesContext.jsx";
import UnifiedSwitcher from "./components/UnifiedSwitcher.jsx";
import WelcomeModal from "./components/WelcomeModal.jsx";

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

const BASE_PATH = "/new";

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

    if (href.startsWith("/") && !href.startsWith(BASE_PATH)) {
      e.preventDefault();
      window.location.href = BASE_PATH + href;
    }
  }, true);
}

export default function App() {
  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  // Strip any subfolder prefix (e.g. /test, /staging) so routing works regardless of deploy path
  const path = rawPath.replace(/\/+$/, "").replace(/^\/[^/]+(?=\/)/, "") || "/";
  const policyMatch = path.match(/^\/policy\/([^/]+)$/i);
  const policyKeyFromPath = policyMatch?.[1] ? POLICY_PATH_MAP[policyMatch[1].toLowerCase()] : null;

  const content = (() => {
    if (policyKeyFromPath) {
      return <PolicyPage policyKey={policyKeyFromPath} />;
    }

    if (path === "/private") {
      return <Private />;
    }

    if (path === "/shared") {
      return <Shared />;
    }

    if (path === "/checkout") {
      return <Checkout />;
    }

    if (path === "/payment") {
      return <Payment />;
    }

    if (path === "/reviews") {
      return <ReviewsPage />;
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

    if (path === "/home1") {
      return <Home1 />;
    }

    return <Home />;
  })();

  return (
    <CurrencyProvider>
      <ToursProvider>
        <ExtrasProvider>
          <RulesProvider>
            <GlobalImagePreloader />
            <UnifiedSwitcher showFloatingButton={false} />
            {content}
          </RulesProvider>
        </ExtrasProvider>
      </ToursProvider>
    </CurrencyProvider>
  );
}
