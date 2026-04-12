"use server"

import { Village } from "@/types/token"

export async function getVillageChunks(limit: number, offset: number): Promise<Village[]> {
    const apiUrl = process.env.API_URL

    if (!apiUrl) {
        throw new Error("API_URL environment variable is not defined")
    }

    try {
        const res = await fetch(`${apiUrl}/map/chunks?offset=${offset}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            next: {
                revalidate: 300,
                tags: ["villages"],
            },
        })

        if (!res.ok) {
            console.error(`getVillageChunks fetch failed: ${res.status} ${res.statusText}`)
            return []
        }

        const data = await res.json()

        if (!Array.isArray(data)) {
            console.error("getVillageChunks: Expected array response")
            return []
        }

        return data.map((v: any) => ({
            ...v,
            marketCap: v.market_cap,
            lastUpdated: v.last_updated,
        })) as Village[]
        
    } catch (error) {
        console.error("getVillageChunks error:", error)
        return []
    }
}
