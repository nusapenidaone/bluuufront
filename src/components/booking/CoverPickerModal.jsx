import { useEffect, useState } from "react";
import { Check, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { formatIDR } from "./utils";
import { getOptionDescription } from "../../utils/displayUtils";

// Единая точка расчёта количества (qty) для цены cover — совпадает с тем, как
// это уходит в Odoo (см. CLAUDE.md): per_boat=true → qty=1 (цена за всю
// группу), per_boat=false → qty=totalGuests (цена за каждого человека).
// cover.price сам по себе не меняется — умножается только количество.
export function resolveCoverQuantity(cover, totalGuests) {
  if (!cover) return 1;
  return cover.per_boat ? 1 : Math.max(1, Number(totalGuests) || 1);
}

// Единый попап выбора страховки (Flexible Ticket) — используется на всех 4
// страницах бронирования, аналогично TransferPickerModal. Выбор — черновик в
// локальном стейте; в реальный заказ попадает только по кнопке Confirm.
export default function CoverPickerModal({
  open,
  onClose,
  covers,
  totalGuests,
  selectedCoverId,
  onConfirm,
}) {
  const [draftCoverId, setDraftCoverId] = useState(selectedCoverId);
  const [expandedDetailId, setExpandedDetailId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setDraftCoverId(selectedCoverId);
    setExpandedDetailId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const draftCover = covers?.find((c) => String(c.id) === String(draftCoverId));

  const handleConfirm = () => {
    onConfirm({ coverId: draftCoverId });
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Trip Protection"
      maxWidth="max-w-2xl"
      bodyClassName="px-6 pb-6 pt-3"
      footer={
        <div className="space-y-3">
          <div className="text-sm text-secondary-500">
            Selected: <b className="text-secondary-900">{draftCoverId ? (draftCover?.name || "—") : "No coverage"}</b>
          </div>
          <Button className="h-12 w-full text-sm !font-black" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      }
    >
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setDraftCoverId(null)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
            !draftCoverId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300"
          )}
        >
          <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", !draftCoverId ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
            {!draftCoverId && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-secondary-900">No coverage</div>
            <div className="text-xs text-secondary-500 mt-0.5">I have my own insurance</div>
          </div>
          <span className="text-sm font-semibold text-emerald-600 shrink-0">Free</span>
        </button>

        {covers?.map((c) => {
          const isSel = String(draftCoverId) === String(c.id);
          const quantity = resolveCoverQuantity(c, totalGuests);
          const rowTotalPrice = Number(c.price || 0) * quantity;
          const description = getOptionDescription(c);

          return (
            <div key={c.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setDraftCoverId(c.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDraftCoverId(c.id); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                  isSel ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", isSel ? "bg-primary-600" : "border-[1.5px] border-neutral-300 bg-white")}>
                  {isSel && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-secondary-900">{c.name}</div>
                  {description && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedDetailId((prev) => (prev === c.id ? null : c.id)); }}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                    >
                      <Info className="h-3.5 w-3.5" />
                      {expandedDetailId === c.id ? "Hide description" : "See full description"}
                      {expandedDetailId === c.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  {expandedDetailId === c.id && description && (
                    <div className="mt-2 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-xs leading-relaxed text-secondary-600">
                      {description}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-sm font-semibold text-primary-700">{formatIDR(rowTotalPrice)}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-secondary-400">{c.per_boat ? "per boat" : "per person"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
