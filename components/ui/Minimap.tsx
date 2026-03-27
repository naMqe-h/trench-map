'use client'

import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'

const MINIMAP_SIZE = 200
const MAP_SCALE = 0.5
const VIEW_RADIUS = MINIMAP_SIZE / 2

export function Minimap() {
    const { villages, cameraPosition, cameraRotation } = useMapStore(
        useShallow((state) => ({
            villages: state.villageGeometries,
            cameraPosition: state.cameraPosition,
            cameraRotation: state.cameraRotation,
        }))
    )

    const rotationDegrees = cameraRotation * (180 / Math.PI)

    const villageDots = useMemo(() => {
        if (!villages || villages.length === 0) {
            return null
        }

        const marketCaps = villages.map(v => v.marketCap).filter(mc => mc > 0)
        if (marketCaps.length === 0) return null

        const minMarketCap = Math.min(...marketCaps)
        const maxMarketCap = Math.max(...marketCaps)

        const minRadius = 2
        const maxRadius = 12

        const logMin = Math.log(minMarketCap)
        const logMax = Math.log(maxMarketCap)
        const logRange = logMax - logMin

        const scaleRadius = (mc: number) => {
            if (logRange === 0) {
                return (minRadius + maxRadius) / 2
            }
            const scaled = minRadius + (maxRadius - minRadius) * (Math.log(mc) - logMin) / logRange
            return Math.max(minRadius, Math.min(maxRadius, scaled))
        }

        return villages.map((village) => {
            if (!cameraPosition || village.marketCap <= 0) return null

            const dx = village.position.x - cameraPosition.x
            const dz = village.position.z - cameraPosition.z

            const mapX = dx * MAP_SCALE + VIEW_RADIUS
            const mapY = dz * MAP_SCALE + VIEW_RADIUS
            
            const dist = Math.hypot(mapX - VIEW_RADIUS, mapY - VIEW_RADIUS)

            if (dist > VIEW_RADIUS) {
                return null
            }

            const radius = scaleRadius(village.marketCap)

            return (
                <circle
                    key={village.id}
                    cx={mapX}
                    cy={mapY}
                    r={radius}
                    fill="#f59e0b"
                />
            )
        })
    }, [villages, cameraPosition])

    return (
        <div
            className="fixed hidden md:block bottom-12 right-8 bg-gray-900 bg-opacity-60 rounded-full border-2 border-gray-700 shadow-lg backdrop-blur-sm cursor-pointer"
            style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
        >
            <svg width={MINIMAP_SIZE} height={MINIMAP_SIZE} viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}>
                <defs>
                    <clipPath id="circleClip">
                        <circle cx={VIEW_RADIUS} cy={VIEW_RADIUS} r={VIEW_RADIUS} />
                    </clipPath>
                </defs>

                <g clipPath="url(#circleClip)">
                    <circle cx={VIEW_RADIUS} cy={VIEW_RADIUS} r={VIEW_RADIUS} fill="rgba(17, 24, 39, 0.7)" />
                    {villageDots}
                </g>

                <g transform={`translate(${VIEW_RADIUS}, ${VIEW_RADIUS}) rotate(${rotationDegrees})`}>
                    <path d="M 0 -10 L 6 6 L 0 2 L -6 6 Z" fill="#3b82f6" />
                </g>
                
                <circle
                    cx={VIEW_RADIUS}
                    cy={VIEW_RADIUS}
                    r={VIEW_RADIUS - 1}
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="2"
                />
            </svg>
        </div>
    )
}
