"use client"

import { useRef, useEffect } from "react"
import { useMapStore } from "@/store/useMapStore"
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

    const socialKeys = hoveredToken.socials
        ? (Array.isArray(hoveredToken.socials)
            ? (hoveredToken.socials as string[]).filter(s => !!s)
            : Object.keys(hoveredToken.socials).filter(key => {
                const value = (hoveredToken.socials as Record<string, string>)[key]
                return value !== undefined && value !== null && value !== ""
            }))
        : []

    const marketCapValue = (hoveredToken as any).market_cap ?? hoveredToken.marketCap

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
                {marketCapValue !== undefined && (
                    <div className="text-sm mt-1">
                        MCap: <span className="font-semibold text-green-400">${marketCapValue.toLocaleString()}</span>
                    </div>
                )}
            </div>

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
