
import { describe, it, expect, vi } from 'vitest'
import { getTokenTradingData } from './getTokenTradingData'

describe('getTokenTradingData', () => {
    it('should return null if no token address is provided', async () => {
        const result = await getTokenTradingData('')
        expect(result).toBeNull()
    })

    it('should return null if the token has no pump.fun pair', async () => {
        const mockResponse = {
            pairs: [
                {
                    dexId: 'not_pumpswap',
                    priceUsd: '100',
                    marketCap: 10000,
                    priceChange: { h24: 10 },
                    volume: { h24: 5000 },
                    txns: { h24: { buys: 10, sells: 5 } },
                },
            ],
        }
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        } as Response)

        const result = await getTokenTradingData('test_token_address')
        expect(result).toBeNull()
    })

    it('should correctly parse and return trading data for a valid token', async () => {
        const mockResponse = {
            pairs: [
                {
                    dexId: 'pumpswap',
                    priceUsd: '123.45',
                    marketCap: 1234567,
                    priceChange: { h24: 5.5, h6: -2.1, h1: 0.5, m5: 0.1 },
                    volume: { h24: 100000, h6: 50000, h1: 10000, m5: 1000 },
                    txns: {
                        h24: { buys: 100, sells: 50 },
                        h6: { buys: 60, sells: 30 },
                        h1: { buys: 20, sells: 10 },
                        m5: { buys: 5, sells: 2 },
                    },
                },
            ],
        }
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        } as Response)

        const result = await getTokenTradingData('test_token_address')

        expect(result).toEqual({
            priceUsd: '123.45',
            marketCap: 1234567,
            fdv: undefined,
            volume: { h24: 100000, h6: 50000, h1: 10000, m5: 1000 },
            txns: {
                h24: { buys: 100, sells: 50 },
                h6: { buys: 60, sells: 30 },
                h1: { buys: 20, sells: 10 },
                m5: { buys: 5, sells: 2 },
            },
            priceChange: {
                h24: 5.5,
                h6: -2.1,
                h1: 0.5,
                m5: 0.1,
            },
        })
    })

    it('should return null if the fetch call fails', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
        } as Response)

        const result = await getTokenTradingData('test_token_address')
        expect(result).toBeNull()
    })
})
