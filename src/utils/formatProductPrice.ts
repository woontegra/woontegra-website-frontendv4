export function saasTotalForYears(unitPrice: number, years: number): number {
  const y = Math.min(10, Math.max(1, Math.floor(Number(years)) || 1))
  return unitPrice * y
}
