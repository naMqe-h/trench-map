"use client"

import { useRef, useEffect } from "react"
import { useMapStore } from "@/lib/store/useMapStore"
import { Twitter, Send, Globe, Link as LinkIcon } from "lucide-react"

const SocialIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
        case 'twitter': return <Twitter size={14} />
        case 'telegram': return <Send size={14} />
        case 'website': return <Globe size={14} />
        default: return <LinkIcon size={14} />
    }
}

export function Tooltip() {
    const hoveredToken = useMapStore((state) => state.hoveredToken)
    const tooltipRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (tooltipRef.current) {
                tooltipRef.current.style.left = `${e.clientX + 15}px`
                tooltipRef.current.style.top = `${e.clientY + 15}px`
            }
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    if (!hoveredToken) return null

    const socialKeys = Array.isArray(hoveredToken.socials) 
        ? hoveredToken.socials 
        : hoveredToken.socials ? Object.keys(hoveredToken.socials) : []

    return (
        <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-50 bg-gray-900/90 backdrop-blur-md rounded-xl p-4 text-white shadow-2xl flex flex-col gap-3 border border-white/10"
        >
            <div className="flex flex-col">
                <div className="font-bold text-lg">{hoveredToken.name}</div>
                <div className="text-sm text-gray-300 font-medium">
                    ${hoveredToken.ticker}
                </div>
                {hoveredToken.marketCap !== undefined && (
                    <div className="text-sm mt-1">
                        MCap: <span className="font-semibold text-green-400">${hoveredToken.marketCap.toLocaleString()}</span>
                    </div>
                )}
            </div>

            {hoveredToken.villageStats && (
                <div className="flex flex-row gap-3 border-t border-white/10 pt-2">
                    {Object.entries(hoveredToken.villageStats).map(([key, value]) => (
                        <div key={key} className="flex gap-1 items-center">
                            <span className="text-xs text-gray-400 capitalize">{key}:</span>
                            <span className="text-sm font-semibold text-blue-400">{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {socialKeys.length > 0 && (
                <div className="flex flex-row gap-2">
                    {socialKeys.map((social) => (
                        <span key={social} className="p-1.5 bg-white/5 rounded-md text-gray-300">
                            <SocialIcon type={social} />
                        </span>
                    ))}
                </div>
            )}

            {hoveredToken.lastRefreshed && (
                <div className="text-xs text-gray-500 mt-1">
                    Last refreshed: {
                        hoveredToken.lastRefreshed instanceof Date 
                            ? hoveredToken.lastRefreshed.toLocaleString() 
                            : hoveredToken.lastRefreshed
                    }
                </div>
            )}
        </div>
    )
}
