/**
 * Format number into Indian comma separated currency format (e.g. 12,83,218.00)
 */
export function formatCurrency(amount) {
  const val = Number(amount) || 0;
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
