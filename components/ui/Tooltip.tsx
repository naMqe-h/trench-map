"use client"

import { useRef, useEffect } from "react"
import { useMapStore } from "@/store/useMapStore"
import moment from "moment"
import { TooltipInfo } from "./tooltips/TooltipInfo"
import { TooltipHolders } from "./tooltips/TooltipHolders"

export function Tooltip() {
    const hoveredToken = useMapStore((state) => state.hoveredToken)
    const hoveredHouseType = useMapStore((state) => state.hoveredHouseType)
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

    return (
        <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-50 bg-gray-900/90 backdrop-blur-md rounded-xl p-4 text-white shadow-2xl flex flex-col gap-3 border border-white/10"
        >
            <div className="flex flex-col">
                <div className="font-bold text-lg leading-tight">{hoveredToken.name}</div>
                <div className="text-sm text-gray-400 font-medium">
                    ${hoveredToken.ticker}
                </div>
            </div>

            {hoveredHouseType === 'library' ? (
                <TooltipHolders token={hoveredToken} />
            ) : (
                <TooltipInfo token={hoveredToken} />
            )}

            {(hoveredToken.lastUpdated) && (
                <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-white/5">
                    Updated {moment(hoveredToken.lastUpdated).fromNow()}
                </div>
            )}
        </div>
    )
}

