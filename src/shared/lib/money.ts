export function monthlyAvailable(limitMinor: number, spentMinor: number): number {
  if (!Number.isSafeInteger(limitMinor) || limitMinor < 0) throw new RangeError('Invalid limit')
  if (!Number.isSafeInteger(spentMinor) || spentMinor < 0) throw new RangeError('Invalid spending')
  return limitMinor - spentMinor
}
