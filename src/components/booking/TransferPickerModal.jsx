import { useEffect, useState } from "react";
import { Check, Info, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { apiUrl } from "../../api/base";
import Modal from "../common/Modal";
import Button from "../common/Button";
import AddressAutocomplete from "../common/AddressAutocomplete";
import { formatIDR } from "./utils";
import { getOptionDescription } from "../../utils/displayUtils";

// Единая точка расчёта цены трансфера по тарифу дистанции — используется
// везде, где показывается или суммируется цена pickup-трансфера (Private и
// Shared). tier: null/'short' → базовая price, 'long' → long_distance_price.
export function resolveTransferUnitPrice(transfer, tier) {
  if (!transfer) return 0;
  return tier === "long" ? Number(transfer.long_distance_price || 0) : Number(transfer.price || 0);
}

function DistanceStatus({ distance, blockedNotice, price }) {
  if (blockedNotice) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{blockedNotice}</span>
      </div>
    );
  }
  if (distance.status === "loading") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-secondary-600">
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-neutral-300 border-t-secondary-500" />
        <span>Calculating distance…</span>
      </div>
    );
  }
  if (distance.status === "ready" && distance.tier !== "blocked") {
    const isLong = distance.tier === "long";
    return (
      <div className={cn(
        "mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs",
        isLong ? "border-amber-200 bg-amber-50 text-amber-700" : "border-green-200 bg-green-50 text-green-700"
      )}>
        <span className="flex items-center gap-2">
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span><b>{distance.km} km</b> from our pier — {isLong ? "long-distance rate applies." : "standard rate."}</span>
        </span>
        {price && <span className="shrink-0 font-bold">{price}</span>}
      </div>
    );
  }
  if (distance.status === "error") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
        <span>Couldn't verify this address — please re-select it from the suggestions or the map.</span>
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-secondary-500">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>Transfer price depends on your pickup distance from the pier: up to 28 km — standard rate, 28–45 km — long-distance rate. Addresses over 45 km can't be picked up — select an address above to see your exact price.</span>
    </div>
  );
}

// Единый попап выбора трансфера — используется на всех 4 страницах бронирования
// (private.jsx, privatenew.jsx, shared.jsx, sharednew.jsx), чтобы вид и логика
// были одинаковыми. Всё, что клиент делает внутри, — черновик в локальном
// стейте; в реальный заказ (через onConfirm) трансфер попадает только по
// кнопке Confirm, и она недоступна, пока pickup-адрес (для transfer_id 1/2) не
// выбран из подсказок Google/карты и дистанция не посчитана (>45км — блок).
export default function TransferPickerModal({
  open,
  onClose,
  transfers,
  totalGuests,
  selectedTransferId,
  pickupAddress,
  onConfirm,
}) {
  const [draftTransferId, setDraftTransferId] = useState(selectedTransferId);
  const [draftPickupAddress, setDraftPickupAddress] = useState(pickupAddress);
  const [draftPickupLocation, setDraftPickupLocation] = useState(null);
  const [draftDistance, setDraftDistance] = useState({ status: "idle", km: null, tier: null });
  const [draftBlockedNotice, setDraftBlockedNotice] = useState(null);
  const [expandedDetailId, setExpandedDetailId] = useState(null);

  // Черновик пересоздаётся из уже подтверждённых значений при каждом открытии.
  useEffect(() => {
    if (!open) return;
    setDraftTransferId(selectedTransferId);
    setDraftPickupAddress(pickupAddress);
    setDraftPickupLocation(null);
    setDraftDistance({ status: "idle", km: null, tier: null });
    setDraftBlockedNotice(null);
    setExpandedDetailId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const draftTransfer = transfers?.find((t) => String(t.id) === String(draftTransferId));
  const draftNeedsPickup = String(draftTransferId) === "1" || String(draftTransferId) === "2";
  const draftNeedsDropoff = String(draftTransferId) === "2";

  useEffect(() => {
    if (!open) return;
    if (!draftNeedsPickup || !draftPickupLocation) {
      setDraftDistance({ status: "idle", km: null, tier: null });
      return;
    }
    let cancelled = false;
    setDraftDistance({ status: "loading", km: null, tier: null });
    setDraftBlockedNotice(null);
    fetch(apiUrl(`transfer/distance?lat=${draftPickupLocation.lat}&lng=${draftPickupLocation.lng}`))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.success) {
          setDraftDistance({ status: "error", km: null, tier: null });
          return;
        }
        setDraftDistance({ status: "ready", km: data.distance_km, tier: data.tier });
        if (data.tier === "blocked") {
          // Не сбрасываем draftTransferId здесь — блок с адресом/картой/этим
          // уведомлением рендерится только пока isSel истинен, так что сброс
          // тут же скрывал бы само объяснение. Confirm и так недоступен,
          // пока tier === "blocked" (resolvedTier остаётся null) — этого
          // достаточно, чтобы нельзя было подтвердить заблокированный адрес.
          setDraftBlockedNotice(`This address is ${data.distance_km} km away (exceeds our 45 km online transfer limit). Please select a closer address or choose "No, thanks" to proceed. For long-distance pickup, contact our booking manager right after booking for a tailored quote.`);
        }
      })
      .catch(() => {
        if (!cancelled) setDraftDistance({ status: "error", km: null, tier: null });
      });
    return () => { cancelled = true; };
  }, [draftPickupLocation, draftNeedsPickup, open]);

  const resolvedTier = draftDistance.status === "ready" && draftDistance.tier !== "blocked" ? draftDistance.tier : null;
  const canConfirm = !draftNeedsPickup || Boolean(resolvedTier);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      transferId: draftTransferId,
      pickupAddress: draftPickupAddress,
      // Дропофф всегда совпадает с pickup — если клиенту нужен другой адрес
      // высадки, ему нужно написать менеджерам напрямую (см. подсказку ниже).
      dropoffAddress: draftNeedsDropoff ? draftPickupAddress : "",
      pickupLocation: draftPickupLocation,
      tier: resolvedTier,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Transfer"
      maxWidth="max-w-2xl"
      bodyClassName="px-6 pb-6 pt-3"
      footer={
        <div className="space-y-3">
          <div className="text-sm text-secondary-500">
            Selected: <b className="text-secondary-900">{draftTransferId ? (draftTransfer?.name || "—") : "No, thanks"}</b>
          </div>
          <Button
            className="h-12 w-full text-sm !font-black disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      }
    >
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setDraftTransferId(null)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
            !draftTransferId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300"
          )}
        >
          <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", !draftTransferId ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
            {!draftTransferId && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-secondary-900">No, thanks. We'll meet you there.</div>
            <div className="text-xs text-secondary-500 mt-0.5">Self-arrival at the meeting point</div>
          </div>
          <span className="text-sm font-semibold text-emerald-600 shrink-0">Free</span>
        </button>

        {transfers?.map((t) => {
          const isSel = String(draftTransferId) === String(t.id);
          const needsPickupThis = String(t.id) === "1" || String(t.id) === "2";
          const tierForThis = isSel && needsPickupThis ? resolvedTier : null;
          const unitPrice = resolveTransferUnitPrice(t, tierForThis);
          const cars = unitPrice > 0 ? Math.ceil((totalGuests || 1) / 5) : 0;
          const rowTotalPrice = unitPrice * (cars || 1);
          const description = getOptionDescription(t);

          return (
            <div key={t.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setDraftTransferId(t.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDraftTransferId(t.id); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                  isSel ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", isSel ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                  {isSel && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-secondary-900">{t.name}</div>
                  {description && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedDetailId((prev) => (prev === t.id ? null : t.id)); }}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                    >
                      <Info className="h-3.5 w-3.5" />
                      {expandedDetailId === t.id ? "Hide description" : "See full description"}
                      {expandedDetailId === t.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  {expandedDetailId === t.id && description && (
                    <div className="mt-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-xs leading-relaxed text-secondary-600">
                      {description}
                    </div>
                  )}
                </div>
                <span className={cn("shrink-0 text-sm font-semibold", !unitPrice ? "text-emerald-600" : "text-primary-700")}>
                  {!unitPrice
                    ? "Free"
                    : needsPickupThis && !tierForThis
                      ? `From ${formatIDR(rowTotalPrice)}`
                      : formatIDR(rowTotalPrice)}
                </span>
              </div>

              {isSel && needsPickupThis && (
                <div className="mt-3 space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400">Pickup address</label>
                    <AddressAutocomplete
                      value={draftPickupAddress}
                      onChange={setDraftPickupAddress}
                      onLocationChange={setDraftPickupLocation}
                      defaultShowMap
                      placeholder="Enter your hotel or villa address"
                      className="mt-1 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                    <DistanceStatus distance={draftDistance} blockedNotice={draftBlockedNotice} price={formatIDR(rowTotalPrice)} />
                  </div>
                  {draftNeedsDropoff && (
                    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs text-secondary-500">
                      Drop-off is at the same address as pickup. If you need a different drop-off address, please contact our managers.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
