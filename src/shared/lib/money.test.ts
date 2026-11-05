import { describe, expect, it } from 'vitest'
import { monthlyAvailable } from './money'

describe('monthlyAvailable', () => {
  it('keeps minor units exact and shows overspending', () => {
    expect(monthlyAvailable(10001, 10000)).toBe(1)
    expect(monthlyAvailable(10001, 12000)).toBe(-1999)
  })

  it('rejects invalid monetary values', () => {
    expect(() => monthlyAvailable(100, 1.5)).toThrow(RangeError)
    expect(() => monthlyAvailable(-1, 0)).toThrow(RangeError)
  })
})
