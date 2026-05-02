export interface DexSocials {
    twitter: string
    website: string
    telegram: string
}

export interface DexDev {
    amount: number
    percentage: number
}

export interface DexPoolTxns {
    buys: number
    sells: number
    total: number
    volume: number
    volume24h: number
}

export interface DexPrice {
    usd: number
    quote: number
}

export interface DexSecurity {
    mintAuthority: string | null
    freezeAuthority: string | null
}

export interface DexLiquidity {
    usd: number
    quote: number
}

export interface DexMarketCap {
    usd: number
    quote: number
}

export interface DexShareholder {
    kind: string
    address: string
    shareBps: number
    sharePercent: number
}

export interface DexFeeSharingConfig {
    admin: string
    status: string
    address: string
    adminRevoked: boolean
    shareholders: DexShareholder[]
}

export interface DexPumpFunAmm {
    isMayhemMode: boolean
    tokenProgram: string
    isCashbackCoin: boolean
    feeSharingConfig: DexFeeSharingConfig
}

export interface DexPool {
    txns: DexPoolTxns
    price: DexPrice
    lpBurn: number
    market: string
    poolId: string
    decimals: number
    deployer: string
    security: DexSecurity
    createdAt: number
    liquidity: DexLiquidity
    marketCap: DexMarketCap
    quoteToken: string
    lastUpdated: number
    "pumpfun-amm"?: DexPumpFunAmm
    tokenSupply: number
    tokenAddress: string
}

export interface DexPools {
    pool: DexPool
    count: number
}

export interface DexEvent {
    priceChangePercentage: number
}

export interface DexEvents {
    "1m": DexEvent
    "5m": DexEvent
    "15m": DexEvent
    "30m": DexEvent
    "1h": DexEvent
    "2h": DexEvent
    "3h": DexEvent
    "4h": DexEvent
    "5h": DexEvent
    "6h": DexEvent
    "12h": DexEvent
    "24h": DexEvent
}

export interface DexWallet {
    wallet: string
    balance: number
    percentage: number
}

export interface DexWalletsInfo {
    count: number
    wallets: DexWallet[]
    totalBalance: number
    totalPercentage: number
}

export interface DexFees {
    [key: string]: number
    total: number
    totalTips: number
    totalTrading: number
}

export interface DexRisk {
    risks: any[]
    score: number
    rugged: boolean
    jupiterVerified: boolean
}

export interface DexTotalTxns {
    all: number
    buys: number
    sells: number
}

export interface DexVolume {
    m5: number
    h1: number
    h6: number
    h24: number
}

export interface DexPriceChange {
    m5?: number
    h1?: number
    h6?: number
    h24?: number
}

export interface DexTokenResponse {
    ca: string
    dev: DexDev
    pools: DexPools
    events: DexEvents
    snipers: DexWalletsInfo
    insiders: DexWalletsInfo
    top10_holders: number
    fees: DexFees
    risk: DexRisk
    txns: DexTotalTxns
    holders_count: number
    volume: DexVolume
    priceChange: DexPriceChange
}
