export function formatCompactNumber(value: number, maximumFractionDigits: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: maximumFractionDigits,
    }).format(value)
}

export const formatMarketCap = (marketCap: number): string => {
    return `$${formatCompactNumber(marketCap, 1)}`
}

export function formatTokenPrice(price: number): string {
    if (price <= 0) return "0.00"
    if (price >= 1) return price.toFixed(4)
    
    const priceStr = price.toFixed(20)
    const match = priceStr.match(/^0\.(0+)/)
    const leadingZeros = match ? match[1].length : 0
    return price.toFixed(leadingZeros + 4)
}

export function shortenAddress(address: string, chars: number = 5): string {
    if (!address) return ""
    return `${address.substring(0, chars)}...${address.substring(address.length - 4)}`
}
