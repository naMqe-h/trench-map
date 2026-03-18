"use client"

import { useMapStore } from "@/store/useMapStore"
import { X, Copy, Twitter, Send, Globe, Link as LinkIcon, Building2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { getTokenTradingData } from "@/actions/getTokenTradingData"

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

    const [tradingData, setTradingData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const socialKeys = selectedToken 
        ? (Array.isArray(selectedToken.socials) 
            ? selectedToken.socials 
            : selectedToken.socials ? Object.keys(selectedToken.socials) : [])
        : []

    const handleCopy = () => {
        if (selectedToken?.ca) {
            navigator.clipboard.writeText(selectedToken.ca)
        }
    }

    useEffect(() => {
        if (selectedToken?.ca) {
            let isMounted = true;
            setIsLoading(true);
            setTradingData(null);
            
            getTokenTradingData(selectedToken.ca).then(data => {
                if (isMounted) {
                    setTradingData(data);
                    setIsLoading(false);
                }
            });

            return () => { isMounted = false; };
        } else {
            setTradingData(null);
        }
    }, [selectedToken?.ca]);

    return (
        <AnimatePresence>
            {selectedToken && (
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-80 pointer-events-auto z-60 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-6 flex flex-col gap-6 text-white overflow-y-auto"
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
                        <span className="text-sm text-gray-400">Contract Address</span>
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3 border border-white/5">
                            <span className="font-mono text-sm text-gray-300 truncate w-full">
                                {selectedToken.ca}
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

                    {socialKeys.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-400">Links</span>
                            <div className="flex flex-row gap-3">
                                {socialKeys.map((social) => {
                                    let url = '#'
                                    if (!Array.isArray(selectedToken.socials) && selectedToken.socials) {
                                        url = selectedToken.socials[social as keyof typeof selectedToken.socials] || '#'
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
                        <span className="text-sm text-gray-400">Live Trading Data</span>
                        
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                                <Loader2 size={16} className="animate-spin" /> Fetching latest data...
                            </div>
                        )}
                        
                        {!isLoading && tradingData && (
                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex flex-col gap-1 bg-black/20 rounded-lg p-3 border border-white/5">
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Market Cap</span>
                                        <span className="text-sm font-semibold text-white">${tradingData.marketCap?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">Current Price</span>
                                        <span className="text-sm font-semibold text-green-400">${tradingData.priceUsd}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full py-1">
                                        <span className="text-sm text-gray-400">FDV</span>
                                        <span className="text-sm font-semibold text-white">${tradingData.fdv?.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-5 gap-y-3 gap-x-1 items-center bg-black/20 rounded-lg p-3 border border-white/5">
                                    <div></div>
                                    <div className="text-center text-xs text-gray-500">5m</div>
                                    <div className="text-center text-xs text-gray-500">1h</div>
                                    <div className="text-center text-xs text-gray-500">6h</div>
                                    <div className="text-center text-xs text-gray-500">24h</div>

                                    <div className="text-xs text-gray-400">Change</div>
                                    {['m5', 'h1', 'h6', 'h24'].map(tf => (
                                        <div key={`p-${tf}`} className={`text-center text-xs font-semibold ${tradingData.priceChange?.[tf] >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {tradingData.priceChange?.[tf] > 0 ? '+' : ''}{tradingData.priceChange?.[tf] || 0}%
                                        </div>
                                    ))}

                                    <div className="text-xs text-gray-400">Vol</div>
                                    {['m5', 'h1', 'h6', 'h24'].map(tf => (
                                        <div key={`v-${tf}`} className="text-center text-xs text-gray-300">
                                            ${tradingData.volume?.[tf] ? Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(tradingData.volume[tf]) : '0'}
                                        </div>
                                    ))}

                                    <div className="text-xs text-gray-400">Txns</div>
                                    {['m5', 'h1', 'h6', 'h24'].map(tf => {
                                        const txns = tradingData.txns?.[tf];
                                        const total = txns ? (txns.buys + txns.sells) : 0;
                                        return (
                                            <div key={`t-${tf}`} className="text-center text-xs text-gray-300">
                                                {total ? Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(total) : '0'}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {!isLoading && !tradingData && selectedToken && (
                            <span className="text-xs text-gray-500 mt-2">Trading data not found.</span>
                        )}
                    </div>
                    
                    {selectedToken.houses && (
                        <div className="flex flex-col gap-2 mt-auto">
                            <span className="text-sm text-gray-400 border-b border-white/10 pb-2">Village Composition</span>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {selectedToken.houses.singleStory > 0 && (
                                    <div className="flex flex-col bg-black/20 rounded-lg p-2 border border-white/5">
                                        <span className="text-xs text-gray-500">Single Story</span>
                                        <span className="text-sm font-semibold text-blue-400">{selectedToken.houses.singleStory}</span>
                                    </div>
                                )}
                                {selectedToken.houses.twoStory > 0 && (
                                    <div className="flex flex-col bg-black/20 rounded-lg p-2 border border-white/5">
                                        <span className="text-xs text-gray-500">Two Story</span>
                                        <span className="text-sm font-semibold text-blue-400">{selectedToken.houses.twoStory}</span>
                                    </div>
                                )}
                                {selectedToken.houses.tenement > 0 && (
                                    <div className="flex flex-col bg-black/20 rounded-lg p-2 border border-white/5">
                                        <span className="text-xs text-gray-500">Tenement</span>
                                        <span className="text-sm font-semibold text-blue-400">{selectedToken.houses.tenement}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedToken.lastRefreshed && (
                        <div className="text-xs text-gray-500 mt-2 border-t border-white/10 pt-2 text-center">
                            Last refreshed: {
                                selectedToken.lastRefreshed instanceof Date 
                                    ? selectedToken.lastRefreshed.toLocaleString() 
                                    : selectedToken.lastRefreshed
                            }
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
