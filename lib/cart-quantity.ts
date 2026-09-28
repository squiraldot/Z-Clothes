export function addQuantities(existingQuantity: number, requestedQuantity: number) {
  const requested = Math.max(1, Math.floor(requestedQuantity || 1));
  return Math.min(20, existingQuantity + requested);
}
