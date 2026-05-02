"use server"

import { DexTokenResponse } from "@/types/api";
import { Houses, Village } from "@/types/token"


interface Token extends DexTokenResponse {
    name: string
    image: string
    market_cap: number
    houses: Houses
    socials: Record<string, string>
    last_updated: string | Date
    ticker: string
}

export async function addToken(ca: string): Promise<{ success: boolean; village?: Village; error?: string }> {
    try {
        const res = await fetch(`${process.env.API_URL}/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ca })
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.error || "Failed to add token"
            }
        }

        const data = await res.json() as Token

        const newVillage: Village = {
            ca: data.ca,
            name: data.name,
            ticker: data.ticker,
            image: data.image,
            marketCap: data.market_cap,
            lastUpdated: data.last_updated,
            houses: data.houses,
            socials: data.socials
        }

        return {
            success: true,
            village: newVillage
        }
    } catch (e) {
        return {
            success: false,
            error: "Network error occurred"
        }
    }
}
