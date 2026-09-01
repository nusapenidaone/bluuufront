export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export function getExtraConflict(extra, selectedMap, extrasById) {
  const ids = extra?.conflictIds || extra?.conflict_ids || [];
  const qtyOf = (v) => Number(v?.qty ?? v ?? 0);
  const blockingId = ids.find((id) => qtyOf(selectedMap?.[id]) > 0);
  if (blockingId == null) return null;
  return { id: blockingId, name: extrasById?.[blockingId]?.name || "another extra" };
}
