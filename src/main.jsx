import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./gtranslate.css";
import App from "./App.jsx";
import { captureUtm } from "./lib/analytics";

captureUtm();

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Remove hash from URL on load so browser doesn't try to scroll to #booking etc.
if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.scrollTo(0, 0);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
