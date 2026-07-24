export function LowStockBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
  const isLow = quantity <= threshold
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{isLow ? 'Low stock' : 'In stock'}</span>
}
