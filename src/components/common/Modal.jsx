import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const Modal = ({
  isOpen,
  open,
  onClose,
  children,
  title,
  subTitle,
  subtitle,
  className = "",
  maxWidth = "max-w-xl",
  bodyClassName = "",
  showClose = true,
}) => {
  const isModalOpen = isOpen ?? open;
  const modalSubtitle = subTitle ?? subtitle;
  const reactId = useId();
  const modalId = `codex-modal-${reactId.replace(/:/g, "")}`;
  const modalSelector = `#${modalId}`;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    if (!isModalOpen) {
      const instance = Fancybox.getInstance();
      const slide = instance?.getSlide();
      if (slide?.src === modalSelector) {
        instance.close();
      }
      return undefined;
    }

    const instance = Fancybox.getInstance();
    const slide = instance?.getSlide();

    if (slide?.src !== modalSelector) {
      Fancybox.show([{ src: modalSelector, type: "inline" }], {
        closeButton: false,
        dragToClose: false,
        hideScrollbar: false,
        autoFocus: false,
        trapFocus: false,
        placeFocusBack: false,
        Hash: false,
        on: {
          destroy: () => {
            onCloseRef.current?.();
          },
        },
      });
    }

    return () => {
      const active = Fancybox.getInstance();
      const activeSlide = active?.getSlide();
      if (activeSlide?.src === modalSelector) {
        active.close();
      }
    };
  }, [isModalOpen, modalSelector]);

  if (typeof document === "undefined" || !isModalOpen) return null;

  return createPortal(
    <div id={modalId} style={{ display: "none" }}>
      <div
        className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border-none bg-white shadow-none sm:border-2 sm:border-neutral-300 ${className}`}
      >
        {title || modalSubtitle || showClose ? (
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:p-5">
            <div className="min-w-0 flex-1">
              {title ? <h3 className="text-lg font-bold leading-tight text-secondary-900">{title}</h3> : null}
              {modalSubtitle ? (
                <p className="mt-0.5 text-xs text-secondary-600" dangerouslySetInnerHTML={{ __html: modalSubtitle }} />
              ) : null}
            </div>
            {showClose ? (
              <button
                type="button"
                onClick={() => Fancybox.close()}
                className="ml-3 rounded-full p-2 transition-colors hover:bg-neutral-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-secondary-600" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={`overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 sm:p-5 ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
