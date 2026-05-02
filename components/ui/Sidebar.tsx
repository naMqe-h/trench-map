"use client"

import { useMapStore } from "@/store/useMapStore"
import { X, Copy, Twitter, Send, Globe, Link as LinkIcon, Building2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { DexTokenResponse } from "@/types/api"
import { HOUSE_NAMES } from "../../constants/houses"
import { fetchTokenData } from "@/actions/tokenActions"
import { formatCompactNumber, formatMarketCap, formatTokenPrice, shortenAddress } from "@/lib/utils"

const SocialIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
        case 'twitter': return <Twitter size={16} />
        case 'telegram': return <Send size={16} />
        case 'website': return <Globe size={16} />
        default: return <LinkIcon size={16} />
    }
}

export function Sidebar() {
    const selectedToken = useMapStore((state) => state.selectedToken)
    const setSelectedToken = useMapStore((state) => state.setSelectedToken)

    const [tradingData, setTradingData] = useState<DexTokenResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const socialKeys = selectedToken?.socials
        ? (Array.isArray(selectedToken.socials)
            ? (selectedToken.socials as string[]).filter(s => !!s)
            : Object.keys(selectedToken.socials).filter(key => {
                const value = (selectedToken.socials as Record<string, string>)[key]
                return value !== undefined && value !== null && value !== ""
            }))
        : []

    const handleCopy = () => {
        if (selectedToken?.ca) {
            navigator.clipboard.writeText(selectedToken.ca)
        }
    }

    const handleCopyPool = () => {
        const poolId = tradingData?.pools?.pool?.poolId
        if (poolId) {
            navigator.clipboard.writeText(poolId)
        }
    }

    useEffect(() => {
        if (selectedToken?.ca) {
            let isMounted = true
            setIsLoading(true)
            setTradingData(null)
            
            fetchTokenData(selectedToken.ca).then(data => {
                if (isMounted) {
                    setTradingData(data)
                    setIsLoading(false)
                }
            })

            return () => { isMounted = false }
        } else {
            setTradingData(null)
        }
    }, [selectedToken?.ca])

    const timeframes = ['m5', 'h1', 'h6', 'h24'] as const

    return (
        <AnimatePresence>
            {selectedToken && (
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-80 pointer-events-auto z-60 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-6 flex flex-col gap-4 text-white overflow-y-auto"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            {selectedToken.image ? (
                                <img 
                                    src={selectedToken.image} 
                                    alt={selectedToken.name} 
                                    className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-lg"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg">
                                    <Building2 size={20} className="text-gray-400" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold leading-tight">${selectedToken.ticker}</h2>
                                <span className="text-sm text-gray-400 font-medium">{selectedToken.name}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedToken(null)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-400">Contract Address</span>
                            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                                <span className="font-mono text-sm text-gray-300 truncate w-full">
                                    {shortenAddress(selectedToken.ca)}
                                </span>
                                <button 
                                    onClick={handleCopy}
                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer"
                                    title="Copy Address"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        {tradingData?.pools?.pool?.poolId && (
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-gray-400">Pool Address</span>
                                <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2 border border-white/5">
                                    <span className="font-mono text-sm text-gray-300 truncate w-full">
                                        {shortenAddress(tradingData.pools.pool.poolId)}
                                    </span>
                                    <button 
                                        onClick={handleCopyPool}
                                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer"
                                        title="Copy Pool Address"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {socialKeys.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-400">Links</span>
                            <div className="flex flex-row gap-4">
                                {socialKeys.map((social) => {
                                    let url = '#'
                                    if (!Array.isArray(selectedToken.socials) && selectedToken.socials) {
                                        url = (selectedToken.socials as Record<string, string>)[social] || '#'
                                    }
                                    return (
                                        <a 
                                            key={social} 
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                                            title={social}
                                        >
                                            <SocialIcon type={social} />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                        <span className="text-sm text-gray-400">Trading Data</span>
                        
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                                <Loader2 size={16} className="animate-spin" /> Fetching latest data...
                            </div>
                        )}
                        
                        {!isLoading && tradingData && (
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col bg-black/20 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Market Cap</span>
                                        <span className="text-sm font-semibold text-white">{formatMarketCap(selectedToken.marketCap)}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Price</span>
                                        <span className="text-sm font-semibold text-green-400">
                                            ${tradingData?.pools?.pool?.price?.usd ? formatTokenPrice(tradingData.pools.pool.price.usd) : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Liquidity</span>
                                        <span className="text-sm font-semibold text-white">{formatMarketCap(tradingData?.pools?.pool?.liquidity?.usd ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Supply</span>
                                        <span className="text-sm font-semibold text-white">{formatCompactNumber(tradingData?.pools?.pool?.tokenSupply ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Total Fees</span>
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                                            <span>{formatCompactNumber(tradingData?.fees?.total ?? 0, 1)}</span>
                                            <img src="/icons/crypto/solana.png" alt="SOL" className="w-3.5 h-3.5 object-contain" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-5 gap-y-3 gap-x-1 items-center bg-black/20 rounded-lg p-3 border border-white/5">
                                    <div></div>
                                    <div className="text-center text-xs text-gray-500">5m</div>
                                    <div className="text-center text-xs text-gray-500">1h</div>
                                    <div className="text-center text-xs text-gray-500">6h</div>
                                    <div className="text-center text-xs text-gray-500">24h</div>

                                    <div className="text-xs text-gray-400">Change</div>
                                    {timeframes.map(tf => {
                                        const change = tradingData.priceChange[tf] ?? 0
                                        return (
                                            <div key={`p-${tf}`} className={`text-center text-xs font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {change > 0 ? '+' : ''}{change}%
                                            </div>
                                        )
                                    })}

                                    <div className="text-xs text-gray-400">Vol</div>
                                    {timeframes.map(tf => (
                                        <div key={`v-${tf}`} className="text-center text-xs text-gray-300">
                                            ${formatCompactNumber(tradingData.volume[tf], 1)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {!isLoading && !tradingData && selectedToken && (
                            <span className="text-xs text-gray-500 mt-2">Trading data not found.</span>
                        )}
                    </div>
                    
                    {selectedToken.houses && (
                        <div className="flex flex-col mt-auto">
                            <span className="text-sm text-gray-400 border-b border-white/10 pb-2">Village Composition</span>
                            <div className="rounded-lg flex flex-col">
                                {Object.entries(selectedToken.houses)
                                    .filter(([_, count]) => count > 0)
                                    .map(([levelKey, count]) => {
                                        const label = HOUSE_NAMES[levelKey]?.label || levelKey
                                        return (
                                            <div 
                                                key={levelKey} 
                                                className={`flex justify-between items-center py-1`}
                                            >
                                                <span className="text-sm text-gray-400">{label}</span>
                                                <span className="text-sm font-semibold text-blue-400">{count}</span>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
