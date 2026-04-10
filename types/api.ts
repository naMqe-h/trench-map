export interface DexToken {
    address: string
    name: string
    symbol: string
}

export interface DexTxns {
    buys: number
    sells: number
}

export interface DexVolume {
    h24: number
    h6: number
    h1: number
    m5: number
}

export interface DexLiquidity {
    usd: number
    base: number
    quote: number
}

export interface DexWebsite {
    url: string
    label: string
}

export interface DexSocial {
    url: string
    type: string
}

export interface DexInfo {
    imageUrl: string
    header: string
    openGraph: string
    websites: DexWebsite[]
    socials: DexSocial[]
}

export interface DexTokenResponse {
    chainId: string
    dexId: string
    url: string
    pairAddress: string
    baseToken: DexToken
    quoteToken: DexToken
    priceNative: string
    priceUsd: string
    txns: {
        m5: DexTxns
        h1: DexTxns
        h6: DexTxns
        h24: DexTxns
    }
    volume: DexVolume
    priceChange: {
        m5: number
        h1: number
        h6: number
        h24: number
    }
    liquidity: DexLiquidity
    fdv: number
    marketCap: number
    pairCreatedAt: number
    info: DexInfo
}