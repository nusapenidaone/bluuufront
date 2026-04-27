import { useEffect, useMemo, useState } from "react";
import { X, ChevronDown, Minus, Plus, CheckCircle2 } from "lucide-react";
import Modal from "./ui/Modal";
import { cn } from "../../lib/utils";

const EXTRA_IMAGE_BY_ID = {
  photographer: "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg",
  "pro-photographer": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg",
  "gopro-rental": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bfa/68f9edbfa78c6752273466.jpg",
  "private-transfer": "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
  "underwater-photo": "https://bluuu.tours/storage/app/uploads/public/689/1c7/443/6891c7443ce71322934836.webp",
  "extra-towels": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
  "snack-box": "https://bluuu.tours/storage/app/uploads/public/688/ba4/a84/thumb_194_400_400_0_0_crop.webp",
  "floating-breakfast": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
  decorations: "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
  wetsuit: "https://bluuu.tours/storage/app/uploads/public/689/1c7/325/6891c7325c6f8615823954.jpg",
  "extra-snorkel-guide": "https://bluuu.tours/storage/app/uploads/public/689/1c7/443/6891c7443ce71322934836.webp",
  "towel-kit": "https://bluuu.tours/storage/app/uploads/public/68f/9ed/bd2/68f9edbd2250a542351768.jpg",
  "champagne-setup": "https://bluuu.tours/storage/app/uploads/public/689/1c7/34c/6891c734c563f236856085.webp",
  drone: "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg",
};
const EXTRA_FALLBACK_IMAGE = "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";

export default function ExtraPopup({ activeExtraId, setActiveExtraId, extrasCatalog, selectedExtras, onChangeExtraQty, formatIDR, totalGuests = 1 }) {
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [pickerQty, setPickerQty] = useState(1);
  const [justAddedId, setJustAddedId] = useState(null);
  const [draftQuantities, setDraftQuantities] = useState({});
  const [initialQuantities, setInitialQuantities] = useState({});
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const activeExtra = useMemo(
    () => (activeExtraId ? extrasCatalog.find((e) => e.id === activeExtraId) : null),
    [activeExtraId, extrasCatalog]
  );

  useEffect(() => {
    if (!activeExtra) {
      setSelectedChildId(null);
      setPickerQty(1);
      setJustAddedId(null);
      return;
    }
    setPickerQty(1);
    setJustAddedId(null);
    setDetailsExpanded(false);
    if (activeExtra.hasChildren && activeExtra.children?.length) {
      const currentSelected = activeExtra.children.find((c) => selectedExtras[c.id] > 0);
      setSelectedChildId(currentSelected ? currentSelected.id : activeExtra.children[0].id);
    } else {
      setSelectedChildId(null);
    }
    const init = {};
    if (activeExtra.hasChildren && activeExtra.children?.length) {
      activeExtra.children.forEach((child) => {
        const maxChildQty = child.available != null ? Math.max(1, Number(child.available)) : Infinity;
        init[child.id] = Math.min(Number(selectedExtras[child.id] || 0), maxChildQty);
      });
    } else {
      init[activeExtra.id] = Number(selectedExtras[activeExtra.id] || 0);
    }
    setInitialQuantities(init);
    setDraftQuantities((prev) => ({ ...prev, ...init }));
  }, [activeExtra]);

  const hasChildren = activeExtra?.hasChildren && activeExtra.children?.length > 0;

  const hasChanged = useMemo(() => {
    if (!activeExtra) return false;
    if (hasChildren) {
      return (activeExtra.children || []).some(
        (c) => Number(draftQuantities[c.id] || 0) !== Number(initialQuantities[c.id] || 0)
      );
    }
    return Number(draftQuantities[activeExtra.id] || 0) !== Number(initialQuantities[activeExtra.id] || 0);
  }, [draftQuantities, initialQuantities, activeExtra, hasChildren]);

  const currentItem = hasChildren
    ? activeExtra.children.find((c) => c.id === selectedChildId) || activeExtra.children[0]
    : activeExtra;
  const isSoldOut = currentItem?.available != null && Number(currentItem.available) <= 0;
  const maxQty = currentItem?.available != null ? Math.max(1, Number(currentItem.available)) : Infinity;
  const singleDraftQty = activeExtra && !hasChildren ? Math.max(0, Number(draftQuantities[currentItem?.id] || 0)) : 0;
  const cartTotal = hasChildren
    ? activeExtra.children.reduce((sum, c) => sum + Math.max(0, Number(draftQuantities[c.id] || 0)) * Number(c.price || 0), 0)
    : (currentItem?.price || 0) * singleDraftQty;
  const imgSrc = activeExtra
    ? (hasChildren && currentItem?.images_with_thumbs?.[0]?.thumb) ||
      activeExtra.images_with_thumbs?.[0]?.thumb ||
      EXTRA_IMAGE_BY_ID[activeExtra.id] ||
      EXTRA_IMAGE_BY_ID[activeExtra.name?.toLowerCase().replace(/\s+/g, "-")] ||
      EXTRA_FALLBACK_IMAGE
    : EXTRA_FALLBACK_IMAGE;
  const addedItems = hasChildren ? activeExtra.children.filter((c) => Number(draftQuantities[c.id] || 0) > 0) : [];
  const selectedSoldOut = hasChildren && currentItem?.available != null && Number(currentItem.available) <= 0;
  const selectedMaxQty = hasChildren
    ? currentItem?.available != null ? Math.max(1, Number(currentItem.available)) : 99
    : maxQty;
  const selectedChildDraft = hasChildren ? Number(draftQuantities[selectedChildId] || 0) : 0;
  const remainingForChild = selectedMaxQty === Infinity || selectedMaxQty === 99 ? 99 : Math.max(0, selectedMaxQty - selectedChildDraft);
  const remainingForSingle = maxQty === Infinity ? 99 : Math.max(0, maxQty - singleDraftQty);
  const carsQty = Math.ceil(totalGuests / 5) || 1;

  const confirmHandler = () => {
    if (hasChildren) {
      activeExtra.children.forEach((child) => {
        onChangeExtraQty(child.id, Math.max(0, draftQuantities[child.id] ?? 0));
      });
    } else if (activeExtra.per_car) {
      onChangeExtraQty(currentItem.id, singleDraftQty > 0 ? singleDraftQty : carsQty);
    } else {
      onChangeExtraQty(currentItem.id, singleDraftQty);
    }
    setActiveExtraId(null);
  };
  const skipHandler = () => setActiveExtraId(null);

  return (
    <Modal
      isOpen={!!activeExtraId && !!activeExtra}
      onClose={() => setActiveExtraId(null)}
      maxWidth="max-w-[720px]"
      className="border-0"
      bodyClassName="p-0 overflow-hidden"
      showClose={false}
    >
      {activeExtra ? (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white">

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-100 bg-white px-5 py-3">
            <h2 className="min-w-0 text-base font-bold leading-tight text-secondary-900">{activeExtra.name}</h2>
            <button
              onClick={() => setActiveExtraId(null)}
              className="group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-secondary-600 transition-all hover:bg-neutral-100 hover:text-secondary-900"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body: image left + right column (content + footer) */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0">

            {/* Image */}
            <div className="shrink-0 bg-neutral-50 md:w-52 md:flex md:items-start md:justify-center md:self-stretch p-4">
              <img
                src={imgSrc}
                srcSet={activeExtra?.images_with_thumbs?.[0]?.thumb_small
                  ? `${activeExtra.images_with_thumbs[0].thumb_small} 200w, ${imgSrc} 400w`
                  : undefined}
                sizes="(max-width: 768px) 100vw, 208px"
                alt={hasChildren ? (currentItem?.name || activeExtra.name) : activeExtra.name}
                className="h-44 w-full rounded-xl object-contain md:h-auto md:w-full"
              />
            </div>

            {/* Right column */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0 border-l border-neutral-100">

              {/* Scrollable content */}
              <div className="custom-scrollbar flex-1 overflow-y-auto">
                <div className="space-y-3 px-5 py-4">

                  {/* Description */}
                  {activeExtra.description && (
                    <div
                      className="text-sm leading-relaxed text-secondary-600"
                      dangerouslySetInnerHTML={{ __html: activeExtra.description }}
                    />
                  )}

                  {/* Details expandable */}
                  {activeExtra.details?.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setDetailsExpanded((v) => !v)}
                        className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", detailsExpanded && "rotate-180")} />
                        {detailsExpanded ? "Hide details" : "Show details"}
                      </button>
                      {detailsExpanded && (
                        <div className="mt-2 space-y-1">
                          {activeExtra.details.map((detail, i) => (
                            <div
                              key={i}
                              className="text-sm leading-relaxed text-secondary-600"
                              dangerouslySetInnerHTML={{ __html: detail }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Children multi-add */}
                  {hasChildren && (
                    <div className="space-y-3">
                      <div className="relative">
                        <select
                          value={selectedChildId || ""}
                          onChange={(e) => { setSelectedChildId(e.target.value); setPickerQty(1); }}
                          className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-secondary-900 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 transition"
                        >
                          {activeExtra.children.map((child) => {
                            const childSoldOut = child.available != null && Number(child.available) <= 0;
                            return (
                              <option key={child.id} value={child.id} disabled={childSoldOut}>
                                {child.name}{child.price ? ` — ${formatIDR(child.price)}` : ""}{childSoldOut ? " (Sold out)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      </div>
                      {!selectedSoldOut && (
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white">
                            <button
                              type="button"
                              onClick={() => setPickerQty((v) => Math.max(1, v - 1))}
                              disabled={pickerQty <= 1}
                              className="flex h-10 w-10 items-center justify-center text-secondary-500 hover:bg-neutral-50 disabled:opacity-30 transition rounded-l-full"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-secondary-900">{pickerQty}</span>
                            <button
                              type="button"
                              onClick={() => setPickerQty((v) => Math.min(remainingForChild, v + 1))}
                              disabled={pickerQty >= remainingForChild}
                              className="flex h-10 w-10 items-center justify-center text-secondary-500 hover:bg-neutral-50 disabled:opacity-30 transition rounded-r-full"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {currentItem?.price > 0 && (
                            <span className="text-sm font-bold text-secondary-900 tabular-nums">
                              {formatIDR(pickerQty * currentItem.price)}
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={remainingForChild <= 0}
                            onClick={() => {
                              setDraftQuantities((prev) => ({ ...prev, [selectedChildId]: Math.min(selectedMaxQty, (Number(prev[selectedChildId] || 0) + pickerQty)) }));
                              setPickerQty(1);
                              setJustAddedId(selectedChildId);
                              setTimeout(() => setJustAddedId(null), 1200);
                            }}
                            className={cn(
                              "ml-auto h-10 rounded-full px-5 text-sm font-bold transition",
                              remainingForChild <= 0
                                ? "cursor-not-allowed bg-neutral-100 text-neutral-300"
                                : justAddedId === selectedChildId
                                  ? "bg-green-500 text-white"
                                  : "bg-primary-500 text-white hover:bg-primary-600"
                            )}
                          >
                            {justAddedId === selectedChildId ? (
                              <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Added</>
                            ) : "+ Add"}
                          </button>
                        </div>
                      )}
                      {addedItems.length > 0 && (
                        <div className="border-t border-neutral-100 pt-1">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 py-2">Your selection</div>
                          {addedItems.map((child, idx) => (
                            <div key={child.id} className={cn("flex items-center gap-3 py-3", idx > 0 && "border-t border-neutral-100")}>
                              {child.images_with_thumbs?.[0]?.thumb ? (
                                <img
                  src={child.images_with_thumbs[0].thumb_small || child.images_with_thumbs[0].thumb}
                  srcSet={child.images_with_thumbs[0].thumb_small ? `${child.images_with_thumbs[0].thumb_small} 200w, ${child.images_with_thumbs[0].thumb} 400w` : undefined}
                  sizes="40px"
                  alt={child.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                              ) : child.emoji ? (
                                <span className="text-xl">{child.emoji}</span>
                              ) : null}
                              <span className="flex-1 truncate text-sm font-medium text-secondary-800">{child.name}</span>
                              <span className="text-sm text-secondary-400">× {draftQuantities[child.id]}</span>
                              <span className="text-sm font-bold text-secondary-900 min-w-[3rem] text-right">
                                {formatIDR(child.price * Number(draftQuantities[child.id] || 0))}
                              </span>
                              <button
                                type="button"
                                onClick={() => setDraftQuantities((prev) => ({ ...prev, [child.id]: 0 }))}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-400 hover:border-red-200 hover:text-red-500 transition"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Simple qty (no children) */}
                  {!hasChildren && (
                    <div className="space-y-3">
                      {isSoldOut ? (
                        <div className="rounded-xl border border-neutral-200 px-4 py-3 text-sm text-secondary-400 opacity-50">Sold out</div>
                      ) : activeExtra.per_car ? (
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4">
                            <span className="text-sm font-bold tabular-nums text-secondary-900">×{carsQty}</span>
                            <span className="text-xs text-secondary-400">car{carsQty !== 1 ? "s" : ""}</span>
                          </div>
                          {currentItem?.price > 0 && (
                            <span className="text-sm font-bold text-secondary-900 tabular-nums">
                              {formatIDR(carsQty * currentItem.price)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setDraftQuantities((prev) => ({ ...prev, [currentItem.id]: carsQty }));
                              setJustAddedId(currentItem.id);
                              setTimeout(() => setJustAddedId(null), 1200);
                            }}
                            className={cn(
                              "ml-auto h-10 rounded-full px-5 text-sm font-bold transition",
                              justAddedId === currentItem.id
                                ? "bg-green-500 text-white"
                                : "bg-primary-500 text-white hover:bg-primary-600"
                            )}
                          >
                            {justAddedId === currentItem.id ? (
                              <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Added</>
                            ) : "+ Add"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white">
                            <button
                              type="button"
                              onClick={() => setPickerQty((v) => Math.max(1, v - 1))}
                              disabled={pickerQty <= 1}
                              className="flex h-10 w-10 items-center justify-center text-secondary-500 hover:bg-neutral-50 disabled:opacity-30 transition rounded-l-full"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-secondary-900">{pickerQty}</span>
                            <button
                              type="button"
                              onClick={() => setPickerQty((v) => Math.min(remainingForSingle, v + 1))}
                              disabled={pickerQty >= remainingForSingle}
                              className="flex h-10 w-10 items-center justify-center text-secondary-500 hover:bg-neutral-50 disabled:opacity-30 transition rounded-r-full"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {currentItem?.price > 0 && (
                            <span className="text-sm font-bold text-secondary-900 tabular-nums">
                              {formatIDR(pickerQty * currentItem.price)}
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={remainingForSingle <= 0}
                            onClick={() => {
                              setDraftQuantities((prev) => ({ ...prev, [currentItem.id]: Math.min(maxQty, (Number(prev[currentItem.id] || 0) + pickerQty)) }));
                              setPickerQty(1);
                              setJustAddedId(currentItem.id);
                              setTimeout(() => setJustAddedId(null), 1200);
                            }}
                            className={cn(
                              "ml-auto h-10 rounded-full px-5 text-sm font-bold transition",
                              remainingForSingle <= 0
                                ? "cursor-not-allowed bg-neutral-100 text-neutral-300"
                                : justAddedId === currentItem.id
                                  ? "bg-green-500 text-white"
                                  : "bg-primary-500 text-white hover:bg-primary-600"
                            )}
                          >
                            {justAddedId === currentItem.id ? (
                              <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Added</>
                            ) : "+ Add"}
                          </button>
                        </div>
                      )}
                      {singleDraftQty > 0 && (
                        <div className="border-t border-neutral-100 pt-1">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 py-2">Your selection</div>
                          <div className="flex items-center gap-3 py-3">
                            {activeExtra.images_with_thumbs?.[0]?.thumb ? (
                              <img
                                src={activeExtra.images_with_thumbs[0].thumb_small || activeExtra.images_with_thumbs[0].thumb}
                                srcSet={activeExtra.images_with_thumbs[0].thumb_small ? `${activeExtra.images_with_thumbs[0].thumb_small} 200w, ${activeExtra.images_with_thumbs[0].thumb} 400w` : undefined}
                                sizes="40px"
                                alt={currentItem.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                            ) : null}
                            <span className="flex-1 truncate text-sm font-medium text-secondary-800">{currentItem.name}</span>
                            <span className="text-sm text-secondary-400">× {singleDraftQty}</span>
                            <span className="text-sm font-bold text-secondary-900 min-w-[3rem] text-right">
                              {formatIDR((currentItem.price || 0) * singleDraftQty)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDraftQuantities((prev) => ({ ...prev, [currentItem.id]: 0 }))}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-secondary-400 hover:border-red-200 hover:text-red-500 transition"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-neutral-100 bg-white px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-secondary-400">Add-on total</div>
                    <div className="text-base font-bold text-secondary-900">
                      {cartTotal > 0 ? formatIDR(cartTotal) : <span className="text-secondary-300 font-normal text-sm">—</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={skipHandler}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-secondary-500 hover:bg-neutral-50 hover:text-secondary-700 transition"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={confirmHandler}
                      disabled={!hasChanged}
                      className={cn(
                        "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-bold transition",
                        hasChanged
                          ? "bg-primary-500 text-white hover:bg-primary-600"
                          : "cursor-not-allowed bg-neutral-100 text-neutral-300"
                      )}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : null}
    </Modal>
  );
}
