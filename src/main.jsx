import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./gtranslate.css";
import App from "./App.jsx";
import { captureUtm } from "./lib/analytics";
import { initWaUtm } from "./lib/waUtm";

captureUtm();
initWaUtm();

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.scrollTo(0, 0);

const Explore  = lazy(() => import("./Explore.jsx"));
const Discover = lazy(() => import("./Discover.jsx"));

function removePreloader() {
  const el = document.getElementById("preloader");
  if (el) el.remove();
}

const path = window.location.pathname;
let Root;
if (path.startsWith("/explore")) {
  removePreloader();
  Root = () => <Suspense fallback={null}><Explore /></Suspense>;
} else if (path.startsWith("/discover")) {
  removePreloader();
  Root = () => <Suspense fallback={null}><Discover /></Suspense>;
} else {
  Root = App;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
