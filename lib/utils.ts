export const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1_000_000_000) {
        return `$${(marketCap / 1_000_000_000).toFixed(1)}B`
    }
    if (marketCap >= 1_000_000) {
        return `$${(marketCap / 1_000_000).toFixed(1)}M`
    }
    if (marketCap >= 1_000) {
        return `$${(marketCap / 1_000).toFixed(1)}k`
    }
    return `$${marketCap}`
}
