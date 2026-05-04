"use client"

import { useMapStore } from "@/store/useMapStore"
import { useEffect, useMemo, useState } from "react"
import { TokenHoldersResponse } from "@/types/api"
import { fetchTokenHolders } from "@/actions/tokenActions"
import { shortenAddress, formatCompactNumber, formatMarketCap } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function SidebarHolders() {
    const selectedToken = useMapStore((state) => state.selectedToken)
    const [holdersData, setHoldersData] = useState<TokenHoldersResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (selectedToken?.ca) {
            let isMounted = true
            setIsLoading(true)
            setError(null)
            
            fetchTokenHolders(selectedToken.ca).then(data => {
                if (isMounted) {
                    if (data) {
                        setHoldersData(data)
                    } else {
                        setError("Failed to fetch holder data")
                    }
                    setIsLoading(false)
                }
            })

            return () => { isMounted = false }
        } else {
            setHoldersData(null)
        }
    }, [selectedToken?.ca])

    const stats = useMemo(() => {
        if (!holdersData?.accounts) return null
        
        const calculateSum = (limit: number) => {
            return holdersData.accounts
                .slice(0, limit)
                .reduce((acc: any, curr: any) => acc + curr.percentage, 0)
        }

        return {
            top10: calculateSum(10),
            top20: calculateSum(20),
            top50: calculateSum(50),
            top100: calculateSum(100)
        }
    }, [holdersData])

    if (!selectedToken) return null

    return (
        <div className="flex flex-col gap-4 border-t border-white/10 pt-4 mt-2 h-full min-h-0">
            <div className="flex flex-col gap-3">
                <span className="text-sm text-gray-400">Holders Overview</span>
                
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                        <Loader2 size={16} className="animate-spin" /> Fetching holder data...
                    </div>
                )}
                
                {!isLoading && error && (
                    <span className="text-xs text-red-400 py-2">{error}</span>
                )}

                {!isLoading && holdersData && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2 bg-black/20 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-wider text-white/60">Total Holders</span>
                                <span className="text-sm font-bold text-white">
                                    {new Intl.NumberFormat('en-US').format(holdersData.total)}
                                </span>
                            </div>

                            {stats && (
                                <>
                                    <div className="bg-black/20 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-wider text-white/60">Top 10</span>
                                        <span className="text-sm font-bold text-white">{stats.top10.toFixed(2)}%</span>
                                    </div>
                                    <div className="bg-black/20 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-wider text-white/60">Top 20</span>
                                        <span className="text-sm font-bold text-white">{stats.top20.toFixed(2)}%</span>
                                    </div>
                                    <div className="bg-black/20 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-wider text-white/60">Top 50</span>
                                        <span className="text-sm font-bold text-white">{stats.top50.toFixed(2)}%</span>
                                    </div>
                                    <div className="bg-black/20 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-wider text-white/60">Top 100</span>
                                        <span className="text-sm font-bold text-white">{stats.top100.toFixed(2)}%</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {!isLoading && holdersData && holdersData?.accounts?.length > 0 && (
                <div className="flex flex-col flex-1 min-h-0">
                    <span className="text-sm text-gray-400 mb-3">Top Holders List</span>
                    <div className="flex flex-col bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                        <div className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr] gap-x-2 items-center px-3 py-2 border-b border-white/5 bg-white/5">
                            <div className="text-[10px] uppercase tracking-wider text-white/40">Address</div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 text-right">%</div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 text-right">USD</div>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 text-right">SOL</div>
                        </div>
                        
                        <div className="flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {holdersData.accounts.slice(0,10).map((holder) => (
                                <div key={holder.wallet} className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr] gap-x-2 items-center px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                    <div className="font-mono text-[12px] text-gray-300 truncate">
                                        {shortenAddress(holder.wallet)}
                                    </div>
                                    <div className="text-right text-[12px] font-semibold text-blue-400">
                                        {holder.percentage.toFixed(2)}%
                                    </div>
                                    <div className="text-right text-[12px] font-medium text-white">
                                        {formatMarketCap(holder.value.usd)}
                                    </div>
                                    <div className="flex items-center justify-end gap-1 text-[12px] font-medium text-white">
                                        <span>{formatCompactNumber(holder.value.quote)}</span>
                                        <img src="/icons/crypto/solana.png" alt="SOL" className="w-3 h-3 object-contain opacity-80" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && (!holdersData || holdersData?.accounts?.length === 0) && (
                <span className="text-xs text-gray-500 mt-2 text-center">No holder data found.</span>
            )}
        </div>
    )
}
