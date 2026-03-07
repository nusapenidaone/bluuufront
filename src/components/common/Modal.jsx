import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

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
  closeOnBackdrop = true,
}) => {
  const isModalOpen = isOpen ?? open;
  const modalSubtitle = subTitle ?? subtitle;

  useEffect(() => {
    if (!isModalOpen || typeof document === "undefined") return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isModalOpen ? (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-end justify-center px-0 py-0 sm:items-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            className={cn(
              "relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-none border border-neutral-100 bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:rounded-2xl",
              maxWidth,
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          >
            {title || modalSubtitle || showClose ? (
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-6 sm:px-6 sm:py-5">
                <div className="min-w-0 flex-1">
                  {title ? (
                    <h3 className="text-lg font-bold leading-tight text-secondary-900">{title}</h3>
                  ) : null}
                  {modalSubtitle ? (
                    <p className="mt-1 text-sm font-medium text-secondary-500" dangerouslySetInnerHTML={{ __html: modalSubtitle }} />
                  ) : null}
                </div>
                {showClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5 text-secondary-600" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <div
              className={cn(
                "flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 sm:p-6",
                bodyClassName
              )}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
