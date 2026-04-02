"use server"

import { Village } from "@/types/token"
import { supabaseAdmin } from "../database/client"

export async function addToken(mint: string): Promise<Village> {
    const url = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAsset',
            params: {
                id: mint
            },
        }),
    })

    const { result: asset } = await response.json()

    const name = asset.content.metadata.name ?? 'Unknown'
    const ticker = asset.content.metadata.symbol ?? 'UNKNOWN'
    const image = asset.content.links?.image ?? ''

    const socials: Record<string, string> = {}
    if (asset.content.json_uri) {
        try {
            const metadataResponse = await fetch(asset.content.json_uri)
            const metadata = await metadataResponse.json()
            const extensions = metadata.extensions || metadata
            socials.twitter = extensions.twitter || ''
            socials.telegram = extensions.telegram || ''
            socials.website = extensions.website || ''
        } catch (e) {
            console.error("Could not fetch extended metadata:", e)
        }
    }


    const price = asset.token_info?.price_info?.price_per_token ?? 0
    const supply = (asset.token_info?.supply && +(asset.token_info?.supply / 1000000).toFixed(0)) ?? 1_000_000_000
    const marketCap = +(price * supply).toFixed(0)

    const houses = {
        'level-3': 0,
        'level-2': 0,
        'level-1': 0,
    }

    if (marketCap < 1_000_000) {
        houses['level-3'] = Math.max(1, Math.floor(marketCap / 100_000))
    } else if (marketCap < 10_000_000) {
        houses['level-3'] = 10
        houses['level-2'] = Math.max(1, Math.floor((marketCap - 1_000_000) / 1_000_000))
    } else {
        houses['level-3'] = 10
        houses['level-2'] = 10
        houses['level-1'] = Math.max(1, Math.floor((marketCap - 10_000_000) / 10_000_000))
    }

    const villageData = {
        ca: mint,
        name,
        ticker,
        image,
        market_cap: Number(marketCap.toFixed(0)),
        houses,
        socials,
        last_updated: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin.from('tokens').upsert(villageData)

    if (error) {
        throw new Error(`Supabase upsert error: ${error.message}`)
    }

    const newVillage: Village = {
        ca: mint,
        name,
        ticker,
        image,
        marketCap,
        houses,
        socials,
    }

    return newVillage
}
