"use server"

import { unstable_cache } from "next/cache"

export const getTokenTradingData = unstable_cache(
    async (ca: string) => {
        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`)
            if (!response.ok) return null

            const data = await response.json()
            if (!data || !Array.isArray(data.pairs)) return null

            const pair = data.pairs.find((p: any) => p.dexId === "pumpswap")
            if (!pair) return null

            return {
                priceUsd: pair.priceUsd,
                marketCap: pair.marketCap,
                fdv: pair.fdv,
                volume: pair.volume,
                txns: pair.txns,
                priceChange: pair.priceChange,
            }
        } catch (error) {
            return null
        }
    },
    ["getTokenTradingData"],
    {
        revalidate: 300,
        tags: ["token-data"],
    },
)