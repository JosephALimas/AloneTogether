import { describe, expect, it } from 'vitest'
import { parseAmount, summarizeBudget } from './budget'

describe('budget calculations', () => {
  it('parses exact cents and rejects invalid or ambiguous amounts', () => {
    expect(parseAmount('1234,56')).toBe(123456)
    expect(parseAmount('0.10')).toBe(10)
    for (const amount of [
      '',
      '-1',
      '1.234',
      '1e3',
      'Infinity',
      '1,000.00',
      '1000000000',
    ])
      expect(parseAmount(amount)).toBeNull()
  })
  it('groups categories and preserves a deficit instead of clamping it', () => {
    const result = summarizeBudget(
      10000,
      [
        { category: 'Vivienda', amount: 7000 },
        { category: 'Vivienda', amount: 2000 },
      ],
      2000,
    )
    expect(result.breakdown).toEqual([{ category: 'Vivienda', amount: 9000 }])
    expect(result.available).toBe(-1000)
  })
})
