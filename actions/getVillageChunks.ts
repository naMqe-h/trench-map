"use server"

import { Houses, Village } from "@/types/token";
import { supabaseAdmin } from "../database/client"

interface TokenRow {
    ca: string;
    name: string;
    ticker: string;
    image: string;
    market_cap: number;
    houses: Houses;
    socials: Record<string, string>;
}

export async function getVillageChunks(limit: number, offset: number): Promise<Village[]> {
    const { data, error } = await supabaseAdmin
        .from('tokens')
        .select('*')
        .order('market_cap', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        throw new Error(`Supabase select error: ${error.message}`)
    }

    if (!data) {
        return []
    }

    const villages: Village[] = data.map((row: TokenRow) => ({
        id: row.ca,
        ca: row.ca,
        name: row.name,
        ticker: row.ticker,
        image: row.image,
        marketCap: row.market_cap,
        houses: row.houses,
        socials: row.socials,
    }))

    return villages
}
