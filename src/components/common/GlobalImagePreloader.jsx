import { useEffect } from "react";

function bindImageState(img) {
  if (!(img instanceof HTMLImageElement)) return;
  if (img.dataset.imagePreloadBound === "true") return;

  img.dataset.imagePreloadBound = "true";

  const markLoaded = () => {
    img.dataset.imageLoaded = "true";
  };

  const markPending = () => {
    img.dataset.imageLoaded = "false";
  };

  if (img.complete && img.naturalWidth > 0) {
    markLoaded();
    return;
  }

  markPending();
  img.addEventListener("load", markLoaded, { once: true });
  img.addEventListener("error", markLoaded, { once: true });
}

function bindFromNode(node) {
  if (!node || !(node instanceof Element)) return;
  if (node.tagName === "IMG") {
    bindImageState(node);
    return;
  }
  node.querySelectorAll?.("img").forEach(bindImageState);
}

export default function GlobalImagePreloader() {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.querySelectorAll("img").forEach(bindImageState);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => bindFromNode(node));
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

