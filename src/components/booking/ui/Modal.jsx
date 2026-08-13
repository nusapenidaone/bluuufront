import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function Modal({
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
    hideDragHandle = false,
    footer,
    backdropClassName,
    scrollRestoreRef,
}) {
    const isModalOpen = isOpen ?? open;
    const modalSubtitle = subTitle ?? subtitle;
    const hasHeader = Boolean(title || modalSubtitle || showClose);
    const dragY = useMotionValue(0);
    const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

    // On some pages (e.g. shared.jsx swapping the boat grid for a "tour details"
    // section on selection) the content behind the modal shrinks the instant it
    // opens, in the same commit — scrollHeight drops below the current scroll
    // offset and the browser clamps scrollY to fit. Track the last known scroll
    // offset continuously, only while the modal is closed, so the lock effect
    // below always has the real pre-open position to restore on close, not
    // whatever the clamp already snapped it to.
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
        const html = document.documentElement;
        const scrollY = lastScrollYRef.current;
        const originalOverflow = html.style.overflow;
        html.style.overflow = "hidden";
        document.body.classList.add("overlay-open");
        return () => {
            html.style.overflow = originalOverflow;
            document.body.classList.remove("overlay-open");
            // If the closer named a target element (via scrollRestoreRef), scroll
            // straight there instead of restoring the pre-open offset — this avoids
            // the "jump to the old position then scroll to the new one" flicker when
            // a close button wants to land somewhere other than where it opened.
            const targetId = scrollRestoreRef?.current;
            if (targetId) {
                scrollRestoreRef.current = null;
                const el = document.getElementById(targetId);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    return;
                }
            }
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
                        className={cn("absolute inset-0", backdropClassName || "bg-black/40 backdrop-blur-sm")}
                        style={{ opacity: backdropOpacity }}
                        onClick={closeOnBackdrop ? onClose : undefined}
                    />
                    <motion.div
                        className={cn(
                            "relative flex w-full flex-col overflow-hidden bg-white shadow-2xl",
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
                            <div className="h-1 w-10 rounded-full bg-neutral-300" />
                        </motion.div>

                        {hasHeader ? (
                            <div className="flex shrink-0 items-start justify-between gap-4 bg-neutral-50/60 px-6 py-4 sm:py-5">
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
                                "overflow-y-auto modal-scrollbar",
                                bodyClassName || "p-6"
                            )}
                        >
                            {children}
                        </div>
                        {footer && (
                            <div className="shrink-0 border-t border-neutral-100 bg-white px-6 py-4">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body
    );
}
