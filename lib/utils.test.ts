import { describe, it, expect } from 'vitest'
import { formatMarketCap } from './utils'

describe('formatMarketCap', () => {
    it('should return a string with "B" and one decimal for values over 1 billion', () => {
        expect(formatMarketCap(1_500_000_000)).toBe('$1.5B')
        expect(formatMarketCap(2_000_000_000)).toBe('$2.0B')
    })

    it('should return a string with "M" for values over 1 million', () => {
        expect(formatMarketCap(1_500_000)).toBe('$1.5M')
        expect(formatMarketCap(10_000_000)).toBe('$10.0M')
    })

    it('should return the raw string for values under 1 thousand', () => {
        expect(formatMarketCap(500)).toBe('$500')
        expect(formatMarketCap(999)).toBe('$999')
    })
})
