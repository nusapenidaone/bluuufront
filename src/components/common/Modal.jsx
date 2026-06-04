import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
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
  dark = false,
  hideDragHandle = false,
  footer,
}) => {
  const isModalOpen = isOpen ?? open;
  const modalSubtitle = subTitle ?? subtitle;
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

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
          className="fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            style={{ opacity: backdropOpacity }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            className={cn(
              "relative flex w-full flex-col overflow-hidden shadow-2xl",
              dark ? "bg-[#111d35] border border-white/10" : "bg-white",
              "rounded-t-3xl rounded-b-none max-h-[92dvh]",
              "sm:rounded-3xl sm:max-h-[calc(100dvh-48px)]",
              maxWidth,
              className
            )}
            style={{ y: dragY }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            dragListener={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) {
                onClose?.();
              } else {
                dragY.set(0);
              }
            }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          >
            {/* Drag handle — mobile only */}
            <motion.div
              className={cn("flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden", hideDragHandle && "hidden")}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              style={{ y: dragY, touchAction: "none" }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 500) {
                  onClose?.();
                } else {
                  dragY.set(0);
                }
              }}
            >
              <div className={cn("h-1 w-10 rounded-full", dark ? "bg-white/20" : "bg-neutral-300")} />
            </motion.div>

            {title || modalSubtitle || showClose ? (
              <div className={cn("flex shrink-0 items-center justify-between gap-4 px-6 py-4 border-b", dark ? "bg-transparent border-white/10" : "bg-white border-neutral-100")}>
                <div className="min-w-0 flex-1">
                  {title ? (
                    <h3 className={cn("text-xl font-bold leading-tight", dark ? "text-white" : "text-secondary-900")}>{title}</h3>
                  ) : null}
                  {modalSubtitle ? (
                    <p className={cn("mt-1 text-sm font-medium", dark ? "text-white/50" : "text-secondary-500")}>{modalSubtitle}</p>
                  ) : null}
                </div>
                {showClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn("ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all", dark ? "border-white/10 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white" : "border-neutral-200/60 bg-white/90 text-secondary-500 hover:bg-white hover:text-secondary-900")}
                    aria-label="Close modal"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <div
              className={cn(
                "overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",
                bodyClassName || "p-6"
              )}
            >
              {children}
            </div>
            {footer && <div className={cn("shrink-0 border-t px-6 py-4", dark ? "border-white/10 bg-[#111d35]" : "border-neutral-100 bg-white")}>{footer}</div>}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
