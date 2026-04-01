import { describe, it, expect } from 'vitest'
import { getNextPayPeriod } from '../payroll-dates'

describe('getNextPayPeriod', () => {
  it('returns period 2 pay date (last day of month) when date is between 11th and 25th', () => {
    // April 15 → Period 2 (Apr 11–25) → paid Apr 30
    const result = getNextPayPeriod(new Date('2026-04-15'))
    expect(result.periodLabel).toBe('Apr 11 – Apr 25, 2026')
    expect(result.payDate).toBe('Apr 30, 2026')
  })

  it('returns period 1 pay date (15th) when date is between 26th and 10th', () => {
    // April 28 → Period 1 (Apr 26–May 10) → paid May 15
    const result = getNextPayPeriod(new Date('2026-04-28'))
    expect(result.periodLabel).toBe('Apr 26 – May 10, 2026')
    expect(result.payDate).toBe('May 15, 2026')
  })

  it('returns days until payday correctly', () => {
    const result = getNextPayPeriod(new Date('2026-04-15'))
    expect(result.daysUntilPayday).toBe(15) // Apr 15 to Apr 30
  })
})
