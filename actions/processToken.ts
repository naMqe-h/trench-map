"use server"

import { Village } from "@/types/token";
import { supabaseAdmin } from "../database/client"
import { addToken } from "./addToken"

export async function processToken(contractAddress: string): Promise<{ success: boolean; village: Village; index: number; isNew: boolean }> {
    const { data: existingToken, error: selectError } = await supabaseAdmin
        .from('tokens')
        .select('*')
        .eq('ca', contractAddress)
        .single()

    let village: Village;
    let isNew = false;

    if (existingToken) {
        village = {
            ca: existingToken.ca,
            name: existingToken.name,
            ticker: existingToken.ticker,
            image: existingToken.image,
            marketCap: existingToken.market_cap,
            houses: existingToken.houses,
            socials: existingToken.socials || {},
        };
    } else {
        village = await addToken(contractAddress);
        isNew = true;
    }

    const { count, error: countError } = await supabaseAdmin
        .from('tokens')
        .select('*', { count: 'exact', head: true })
        .gte('market_cap', village.marketCap)

    const index = count ? count - 1 : 0;

    return { success: true, village, index, isNew }
}
