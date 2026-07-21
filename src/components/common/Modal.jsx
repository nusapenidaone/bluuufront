import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

// Tailwind needs each full class string to appear literally somewhere for JIT to generate it,
// so maxWidth is mapped to its sm:-prefixed form here rather than concatenated at runtime.
const SM_MAX_WIDTH = {
  "max-w-md": "sm:max-w-md",
  "max-w-lg": "sm:max-w-lg",
  "max-w-xl": "sm:max-w-xl",
  "max-w-2xl": "sm:max-w-2xl",
  "max-w-3xl": "sm:max-w-3xl",
  "max-w-4xl": "sm:max-w-4xl",
  "max-w-5xl": "sm:max-w-5xl",
  "max-w-screen-sm": "sm:max-w-screen-sm",
  "max-w-[720px]": "sm:max-w-[720px]",
};

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
  backdropClassName,
}) => {
  const isModalOpen = isOpen ?? open;
  const modalSubtitle = subTitle ?? subtitle;
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

  // On some pages the content behind the modal changes shape the instant it
  // opens (e.g. private.jsx/shared.jsx swap the boat grid for a "tour details"
  // section on selection), shrinking scrollHeight below the current scroll
  // offset in the very same commit that opens this modal. By the time the
  // lock effect below runs, the browser has already clamped scrollY to fit —
  // reading window.scrollY there would capture the clamped value, not the
  // real pre-open position. So track the last known scroll offset here,
  // continuously, only while the modal is closed — that way it always holds
  // whatever the page's true position was right before this open.
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    if (isModalOpen || typeof window === "undefined") return undefined;
    const onScroll = () => { lastScrollYRef.current = window.scrollY; };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isModalOpen]);

  useLayoutEffect(() => {
    if (!isModalOpen || typeof document === "undefined") return undefined;
    // Plain overflow:hidden lock on <html> — NOT position:fixed+top on <body>.
    // That trick was tried to dodge a Google Translate banner-watcher interval
    // that fought a naive lock (see UnifiedSwitcher.jsx, now guarded separately),
    // but it introduced a worse bug: Chrome's backdrop-filter fails to sample
    // body content once body is position:fixed with a large negative top offset,
    // rendering the backdrop as a blank gradient instead of the blurred page.
    // document.documentElement (confirmed via document.scrollingElement) is the
    // element that actually scrolls on this page, so locking it in place with
    // overflow:hidden freezes the page exactly where it is — nothing moves.
    const html = document.documentElement;
    const body = document.body;
    // Remember the pre-open offset and put it back on close, so that if the
    // content collapse above clamps scrollY while the modal is open, it
    // doesn't stick once the modal closes and the content is restored.
    const scrollY = lastScrollYRef.current;
    // The vertical scrollbar disappears the instant scroll gets locked, which
    // widens the viewport by its track width and visibly shifts/jumps
    // everything behind the backdrop. Pad it back out so nothing moves.
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const original = {
      overflow: html.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
    return () => {
      html.style.overflow = original.overflow;
      body.style.paddingRight = original.paddingRight;
      if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
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
            className={cn("absolute inset-0", backdropClassName || "bg-black/15 backdrop-blur-[2px]")}
            style={{ opacity: backdropOpacity }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            className={cn(
              "relative flex w-full flex-col overflow-hidden shadow-2xl",
              dark ? "bg-[#111d35] border border-white/10" : "bg-white",
              "rounded-t-3xl rounded-b-none max-h-[92dvh]",
              "sm:rounded-3xl sm:max-h-[calc(100dvh-48px)]",
              SM_MAX_WIDTH[maxWidth] || maxWidth,
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
                "min-h-0 flex-1 overflow-y-auto modal-scrollbar",
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
