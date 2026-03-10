import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Maximize, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export default function PhotoCarousel({
    images,
    alt,
    className,
    onOpenGallery,
    isLocked = false,
    startIndex = 0,
    alwaysShowControls = false,
}) {
    const slides = images?.length ? images : [];
    const total = slides.length;
    const safeStart = Math.min(Math.max(startIndex || 0, 0), Math.max(total - 1, 0));

    const [index, setIndex] = useState(safeStart);
    const [loaded, setLoaded] = useState(() => {
        const s = new Set();
        s.add(safeStart);
        if (safeStart > 0) s.add(safeStart - 1);
        if (safeStart < total - 1) s.add(safeStart + 1);
        return s;
    });

    const scrollRef = useRef(null);
    const lastIdx = useRef(safeStart);
    const pointerDown = useRef(null);
    const hasDragged = useRef(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (el && safeStart > 0) {
            el.scrollLeft = safeStart * el.offsetWidth;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadNeighbors = useCallback((i) => {
        setLoaded((prev) => {
            const next = new Set(prev);
            next.add(i);
            if (i > 0) next.add(i - 1);
            if (i < total - 1) next.add(i + 1);
            return next;
        });
    }, [total]);

    const go = useCallback((delta) => {
        const el = scrollRef.current;
        if (!el || total <= 1) return;
        const target = Math.max(0, Math.min(total - 1, index + delta));
        if (target === index) return;
        el.scrollTo({ left: target * el.offsetWidth, behavior: "smooth" });
        loadNeighbors(target);
    }, [index, total, loadNeighbors]);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const newIdx = Math.round(el.scrollLeft / el.offsetWidth);
        if (newIdx !== lastIdx.current && newIdx >= 0 && newIdx < total) {
            lastIdx.current = newIdx;
            setIndex(newIdx);
            loadNeighbors(newIdx);
        }
    }, [total, loadNeighbors]);

    if (!total) {
        return (
            <div className={cn("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400", className)}>
                <Camera className="h-8 w-8 opacity-40" />
                <span className="text-sm font-medium">No photos yet</span>
            </div>
        );
    }

    const arrowCls = alwaysShowControls
        ? "absolute top-1/2 z-20 flex -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30"
        : "absolute top-1/2 z-20 hidden -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm transition hover:bg-white/30 sm:flex opacity-0 group-hover:opacity-100";

    const maximizeCls = alwaysShowControls
        ? "absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60"
        : "absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-sm transition hover:bg-black/60 opacity-0 group-hover:opacity-100";

    const renderIndicator = () => {
        if (total <= 1) return null;
        if (total > 12) {
            return (
                <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 w-20 h-0.5 rounded-full bg-white/30">
                    <div
                        className="h-full rounded-full bg-white transition-all duration-300"
                        style={{ width: `${((index + 1) / total) * 100}%` }}
                    />
                </div>
            );
        }
        return (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
                        )}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            className={cn("group relative w-full rounded-xl", !isLocked && "cursor-pointer")}
            onPointerDown={(e) => {
                pointerDown.current = { x: e.clientX };
                hasDragged.current = false;
            }}
            onPointerMove={(e) => {
                if (!pointerDown.current) return;
                if (Math.abs(e.clientX - pointerDown.current.x) > 8) hasDragged.current = true;
            }}
            onClick={() => {
                if (!isLocked && !hasDragged.current) onOpenGallery?.(index);
            }}
        >
            {/* Native scroll snap — no library needed */}
            <div
                ref={scrollRef}
                className={cn("flex snap-x snap-mandatory rounded-xl", className)}
                style={{ overflowX: "scroll", scrollbarWidth: "none", msOverflowStyle: "none" }}
                onScroll={isLocked ? undefined : handleScroll}
            >
                {slides.map((slide, i) => {
                    const src = slide?.thumb || slide?.path || slide;
                    return (
                        <div key={i} className="flex-[0_0_100%] snap-center relative shrink-0 overflow-hidden">
                            {loaded.has(i) ? (
                                <img
                                    src={src}
                                    alt={i === index ? alt : ""}
                                    className={cn(
                                        "absolute inset-0 h-full w-full object-cover transition-transform duration-500",
                                        i === index && "group-hover:scale-[1.03]"
                                    )}
                                    decoding="async"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10 rounded-xl" />

            {!isLocked && (
                <>
                    {/* Maximize button */}
                    <button
                        type="button"
                        className={maximizeCls}
                        onClick={(e) => { e.stopPropagation(); onOpenGallery?.(index); }}
                        aria-label="Expand Gallery"
                    >
                        <Maximize className="h-4 w-4" />
                    </button>

                    {total > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); go(-1); }}
                                className={cn(arrowCls, "left-2")}
                                aria-label="Previous photo"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); go(1); }}
                                className={cn(arrowCls, "right-2")}
                                aria-label="Next photo"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {renderIndicator()}
                </>
            )}
        </div>
    );
}
