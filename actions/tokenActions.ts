'use server'

import { DexTokenResponse } from "@/types/api"

export async function fetchTokenData(ca: string): Promise<DexTokenResponse | null> {
    if (!ca) return null

    const API_URL = process.env.API_URL as string

    try {
        const response = await fetch(`${API_URL}/dex/tokens/${ca}`, {
            next: { revalidate: 300 }
        })

        if (!response.ok) {
            return null
        }

        const data: DexTokenResponse = await response.json()
        return data
    } catch (error) {
        return null
    }
}
