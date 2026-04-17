import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
}) {
    const isModalOpen = isOpen ?? open;
    const modalSubtitle = subTitle ?? subtitle;
    const hasHeader = Boolean(title || modalSubtitle || showClose);

    // Swipe-to-close
    const touchStartY = useRef(0);
    const [dragY, setDragY] = useState(0);
    const isDragging = useRef(false);

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

    const handleTouchStart = useCallback((e) => {
        touchStartY.current = e.touches[0].clientY;
        isDragging.current = true;
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging.current) return;
        const delta = Math.max(0, e.touches[0].clientY - touchStartY.current);
        setDragY(delta);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (dragY > 80) {
            onClose?.();
        }
        setDragY(0);
    }, [dragY, onClose]);

    if (typeof document === "undefined") return null;
    if (!isModalOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-6 anim-fade-in">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                style={{ opacity: Math.max(0, 1 - dragY / 300) }}
                onClick={closeOnBackdrop ? onClose : undefined}
            />
            <div
                className={cn(
                    "relative flex w-full flex-col overflow-hidden bg-white shadow-2xl",
                    "rounded-t-2xl rounded-b-none max-h-[92dvh]",
                    "sm:rounded-2xl sm:max-h-[calc(100dvh-48px)]",
                    maxWidth,
                    className,
                    "anim-slide-up-spring"
                )}
                style={{
                    transform: `translateY(${dragY}px)`,
                    transition: dragY === 0 ? "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" : "none",
                }}
            >
                {/* Drag handle — mobile only */}
                <div
                    className="flex shrink-0 cursor-grab justify-center pb-1 pt-3 sm:hidden touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="h-1 w-10 rounded-full bg-neutral-300" />
                </div>

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
                        "overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",
                        bodyClassName || "p-6"
                    )}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
