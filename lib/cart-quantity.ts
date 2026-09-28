export function addQuantities(existingQuantity: number, requestedQuantity: number) {
  return Math.min(20, existingQuantity + 1);
}
