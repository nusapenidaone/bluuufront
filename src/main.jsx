import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./gtranslate.css";
import App from "./App.jsx";
import { captureUtm } from "./lib/analytics";

captureUtm();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
