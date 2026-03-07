import React, { useState } from "react";
import { Car, MapPin, Shield, ShieldCheck, Check, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import Modal from "./ui/Modal";
import { formatIDR } from "./utils";

// --------------- Helpers ---------------

const decodeBasicEntities = (value = "") =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;|&#38;/gi, "&")
    .replace(/&quot;|&#34;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, "-")
    .replace(/&mdash;|&#8212;/gi, "-")
    .replace(/&bull;|&#8226;/gi, " - ");

const sanitizeText = (value, { stripTrailingOne = false } = {}) => {
  if (typeof value !== "string") return "";
  const withoutTags = value.replace(/<[^>]*>/g, " ");
  const decoded = decodeBasicEntities(withoutTags);
  const normalized = decoded.replace(/\s+/g, " ").trim();
  const spaced = normalized.replace(/([.!?])([A-Z?-??])/g, "$1 $2");
  if (!stripTrailingOne) return spaced;
  return spaced.replace(/\s+1$/, "").trim();
};

const getOptionDescription = (option) => {
  if (!option || typeof option !== "object") return "";
  const raw = (
    option.description ||
    option.short_description ||
    option.shortDescription ||
    option.description_text ||
    option.descriptionText ||
    option.subtitle ||
    option.helper ||
    option.note ||
    option.notes ||
    option.details ||
    option.desc ||
    option.text ||
    ""
  );
  return sanitizeText(raw, { stripTrailingOne: true });
};

const getOptionImage = (option) => {
  if (!option || typeof option !== "object") return "";
  const firstImageWithThumbs = option.images_with_thumbs?.[0] || {};
  const candidates = [
    option.image,
    option.image_url,
    option.imageUrl,
    option.thumb,
    option.thumbnail,
    option.cover,
    option.photo,
    firstImageWithThumbs.thumb1,
    firstImageWithThumbs.thumb,
    firstImageWithThumbs.original,
    option.images?.[0],
    option.gallery?.[0],
  ];
  const resolved = candidates.find((c) => typeof c === "string" && c.trim().length > 0);
  return resolved ? resolved.trim() : "";
};

const buildOptionDetails = (
  option,
  { extraDescription = "", fallbackDescription = "Detailed information is available on request.", fallbackImage = "" } = {}
) => {
  const baseDescription = getOptionDescription(option);
  const combined = [baseDescription, extraDescription].filter(Boolean).join("\n\n").trim();
  return {
    description: combined || fallbackDescription,
    image: getOptionImage(option) || fallbackImage,
  };
};

const TRANSFER_DETAILS_FALLBACK_IMAGE =
  "https://bluuu.tours/storage/app/uploads/public/68a/5fd/e10/68a5fde10e980917741317.jpg";
const INSURANCE_DETAILS_FALLBACK_IMAGE =
  "https://bluuu.tours/storage/app/uploads/public/68f/9ed/c1a/68f9edc1a9270720998215.jpg";

// --------------- TransfersCompact ---------------

export function TransfersCompact({
  transfers,
  selectedTransferId,
  onSelectTransferId,
  pickupAddress,
  setPickupAddress,
  dropoffAddress,
  setDropoffAddress,
  totalGuests,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTransferDetails, setActiveTransferDetails] = useState(null);
  const selectedTransfer = transfers?.find(t => String(t.id) === String(selectedTransferId));
  const selectedTransferDescription = getOptionDescription(selectedTransfer);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md">
      <div
        className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-neutral-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-secondary-600">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-secondary-900">Transfer</div>
            <div className="text-sm text-secondary-500">
              {selectedTransfer ? selectedTransfer.name : "Optional add pickup"}
            </div>
            {selectedTransferDescription && (
              <div className="mt-0.5 text-xs leading-relaxed text-secondary-400">
                {selectedTransferDescription}
              </div>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary-400">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200">
          <div className="flex flex-col divide-y divide-neutral-100">
            {/* Option: No thanks */}
            <label className={cn(
              "group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all",
              !selectedTransferId ? "bg-primary-50/30" : "hover:bg-neutral-50"
            )}>
              <input
                type="radio"
                name="transfer-selection-compact"
                className="hidden"
                checked={!selectedTransferId}
                onChange={() => onSelectTransferId(null)}
              />
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center">
                  <MapPin className={cn("h-6 w-6 transition-colors", !selectedTransferId ? "text-primary-600" : "text-secondary-400")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-secondary-900 sm:text-base">No, thanks. We'll meet you there.</div>
                  <div className="mt-1 text-sm font-medium text-secondary-500">Self-arrival at the meeting point</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-center">
                <div className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                  !selectedTransferId
                    ? "border-primary-600 bg-primary-600"
                    : "border-neutral-200 bg-white"
                )}>
                  {!selectedTransferId && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
            </label>

            {/* Transfer Options */}
            {transfers && transfers.map(transfer => {
              const isLargeGroup = totalGuests > 5;
              const unitPrice = (isLargeGroup && transfer.bus_price)
                ? Number(transfer.bus_price)
                : Number(transfer.price || 0);
              const isSelected = String(selectedTransferId) === String(transfer.id);
              const finalName = transfer.name;
              const transferDescription = getOptionDescription(transfer);

              return (
                <label key={transfer.id} className={cn(
                  "group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all",
                  isSelected ? "bg-primary-50/30" : "hover:bg-neutral-50"
                )}>
                  <input
                    type="radio"
                    name="transfer-selection-compact"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => onSelectTransferId(transfer.id)}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center">
                      <Car className={cn("h-6 w-6 transition-colors", isSelected ? "text-primary-600" : "text-secondary-400")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-secondary-900 sm:text-base">{finalName}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-secondary-900 tabular-nums sm:text-base">
                          {formatIDR(unitPrice)}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-600">group price</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {transferDescription && (
                          <div className="text-xs leading-relaxed text-secondary-400 line-clamp-1">
                            {transferDescription}
                          </div>
                        )}
                        {transferDescription && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTransferDetails({ title: finalName, description: transfer.description || transfer.short_description || transferDescription, image: transfer.image || null });
                            }}
                            className="text-secondary-400 hover:text-primary-600 transition-colors"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-center">
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary-600 bg-primary-600"
                        : "border-neutral-200 bg-white"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Address Input Section */}
          {selectedTransferId && (
            <div className="mt-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm">
              <div className="mb-3 text-sm font-bold text-secondary-900">Transfer Details</div>
              {(() => {
                const transfer = transfers.find(t => String(t.id) === String(selectedTransferId));
                const isShuttle = transfer?.name.toLowerCase().includes("shuttle") || transfer?.name.toLowerCase().includes("free");
                const needsDropoff = !isShuttle && (transfer?.name.toLowerCase().includes("drop off") || transfer?.name.toLowerCase().includes("drop-off"));
                if (isShuttle) return null;
                return (
                  <div className="flex flex-col gap-3">
                    <div className={cn("grid gap-3", needsDropoff ? "sm:grid-cols-2" : "grid-cols-1")}>
                      <div className="space-y-1">
                        <label className="block text-xs font-black uppercase tracking-wider text-secondary-500">Pickup Address</label>
                        <input
                          type="text"
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          placeholder="Hotel name or address"
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-600 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      {needsDropoff && (
                        <div className="space-y-1">
                          <label className="block text-xs font-black uppercase tracking-wider text-secondary-500">Dropoff Address</label>
                          <input
                            type="text"
                            value={dropoffAddress}
                            onChange={(e) => setDropoffAddress(e.target.value)}
                            placeholder="Hotel name or address"
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-600 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      )}
                    </div>
                    {needsDropoff && (
                      <button
                        type="button"
                        onClick={() => setDropoffAddress(pickupAddress)}
                        className="self-start inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 border border-neutral-200 text-xs font-black text-primary-600 hover:border-primary-50 hover:bg-neutral-100 transition-all active:scale-95"
                      >
                        Same address for both
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
      <Modal
        isOpen={Boolean(activeTransferDetails)}
        onClose={() => setActiveTransferDetails(null)}
        title={activeTransferDetails?.title || "Transfer details"}
        subtitle="Additional information"
        maxWidth="max-w-3xl"
        bodyClassName="px-6 py-4 sm:py-5"
      >
        <div className="pb-4 space-y-4">
          {activeTransferDetails?.image && (
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <img
                src={activeTransferDetails.image}
                alt={activeTransferDetails.title || "Transfer"}
                className="h-52 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {activeTransferDetails?.description ? (
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: activeTransferDetails.description }}
            />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

// --------------- CoversCompact ---------------

export function CoversCompact({
  covers,
  selectedCoverId,
  onSelectCoverId,
  priceLabel = "per person",
  formatPrice = (v) => `IDR ${Number(v).toLocaleString()}`,
}) {
  const selectedCover = covers?.find(c => String(c.id) === String(selectedCoverId));
  const [activeCoverDetails, setActiveCoverDetails] = useState(null);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <div className="text-base font-semibold text-secondary-900">Insurance</div>
          <div className="text-sm text-secondary-500">
            {selectedCover ? selectedCover.name : "Optional protect your trip"}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="flex flex-col divide-y divide-neutral-100">
          {/* Option: No coverage */}
          <label className={cn(
            "group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all",
            !selectedCoverId ? "bg-primary-50/30" : "hover:bg-neutral-50"
          )}>
            <input
              type="radio"
              name="cover-selection-compact"
              className="hidden"
              checked={!selectedCoverId}
              onChange={() => onSelectCoverId(null)}
            />
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center">
                <Shield className={cn("h-6 w-6 transition-colors", !selectedCoverId ? "text-primary-600" : "text-secondary-400")} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-secondary-900 sm:text-base">No coverage</div>
                <div className="mt-1 text-sm font-medium text-secondary-500">I have my own insurance</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                !selectedCoverId
                  ? "border-primary-600 bg-primary-600"
                  : "border-neutral-200 bg-white"
              )}>
                {!selectedCoverId && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          </label>

          {/* Cover Options */}
          {covers && covers.map(cover => {
            const isSelected = String(selectedCoverId) === String(cover.id);
            const price = Number(cover.price);
            const coverDetails = buildOptionDetails(cover, {
              fallbackDescription: "Insurance terms and conditions will be confirmed before checkout.",
              fallbackImage: INSURANCE_DETAILS_FALLBACK_IMAGE,
            });
            const hasCoverDetails = Boolean(coverDetails.description || coverDetails.image);
            return (
              <label key={cover.id} className={cn(
                "group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all",
                isSelected ? "bg-primary-50/30" : "hover:bg-neutral-50"
              )}>
                <input
                  type="radio"
                  name="cover-selection-compact"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => onSelectCoverId(cover.id)}
                />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center">
                    <ShieldCheck className={cn("h-6 w-6 transition-colors", isSelected ? "text-primary-600" : "text-secondary-400")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-secondary-900 sm:text-base">{cover.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-secondary-900 tabular-nums sm:text-base">
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary-600">{priceLabel}</span>
                    </div>
                    {hasCoverDetails && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveCoverDetails({
                            title: cover.name,
                            description: cover.description || cover.short_description || coverDetails.description,
                            image: coverDetails.image,
                          });
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span>See full description</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-center">
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary-600 bg-primary-600"
                      : "border-neutral-200 bg-white"
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
      <Modal
        open={Boolean(activeCoverDetails)}
        onClose={() => setActiveCoverDetails(null)}
        title={activeCoverDetails?.title || "Insurance details"}
        subtitle="Coverage information"
        maxWidth="max-w-3xl"
        bodyClassName="px-6 py-4 sm:py-5"
      >
        {activeCoverDetails?.description ? (
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: activeCoverDetails.description }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
