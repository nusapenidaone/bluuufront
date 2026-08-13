import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import "./gtranslate.css";
import App from "./App.jsx";
import { captureUtm } from "./lib/analytics";
import { initWaUtm } from "./lib/waUtm";

captureUtm();
initWaUtm();

// Google Translate rewrites text nodes directly in the DOM. When React later
// reconciles those same nodes (e.g. after a re-render), removeChild/insertBefore
// can be called on a node that's no longer where React expects it, crashing the
// whole render tree with "Failed to execute 'removeChild' on 'Node'". Guard both
// so a stale reference is a no-op instead of an uncaught error.
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      console.warn("Cannot remove a child from a different parent", child, this);
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn("Cannot insert before a reference node from a different parent", referenceNode, this);
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

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
    <HelmetProvider>
      <Root />
    </HelmetProvider>
  </StrictMode>
);
