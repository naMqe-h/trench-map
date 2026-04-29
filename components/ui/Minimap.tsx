'use client'

import { useMapStore } from '@/store/useMapStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useShallow } from 'zustand/react/shallow'
import { useMemo, useState, memo, useEffect, useCallback } from 'react'
import { VillageData } from '@/types/scene'

const MINIMAP_SIZE = 200
const MAP_SCALE = 0.5
const VIEW_RADIUS = MINIMAP_SIZE / 2

const MinimapMarker = memo(({ 
    village, 
    radius 
}: { 
    village: VillageData, 
    radius: number 
}) => {
    const [imageError, setImageError] = useState(false)
    const setCameraFlightRequest = useMapStore((state) => state.setCameraFlightRequest)
    const fallbackColor = "#f59e0b"

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setCameraFlightRequest({
            village,
            trigger: Date.now(),
            isNew: false
        })
    }, [village, setCameraFlightRequest])

    const x = village.position.x * MAP_SCALE
    const y = village.position.z * MAP_SCALE

    return (
        <g 
            transform={`translate(${x}, ${y})`}
            onClick={handleClick}
            className="cursor-pointer"
        >
            <circle
                r={radius}
                fill={fallbackColor}
            />
            {village.image && !imageError && (
                <image
                    href={village.image}
                    x={-radius}
                    y={-radius}
                    width={radius * 2}
                    height={radius * 2}
                    clipPath="url(#markerClip)"
                    preserveAspectRatio="xMidYMid slice"
                    onError={() => setImageError(true)}
                />
            )}
        </g>
    )
})

MinimapMarker.displayName = 'MinimapMarker'

export function Minimap() {
    const showMinimap = useSettingsStore((state) => state.showMinimap)
    const { villages, cameraPosition, cameraRotation } = useMapStore(
        useShallow((state) => ({
            villages: state.villageGeometries,
            cameraPosition: state.cameraPosition,
            cameraRotation: state.cameraRotation,
        }))
    )

    useEffect(() => {
        if (!villages) return
        villages.forEach(v => {
            if (v.image) {
                const img = new Image()
                img.src = v.image
            }
        })
    }, [villages])

    const rotationDegrees = cameraRotation * (180 / Math.PI)

    const villageDataWithRadius = useMemo(() => {
        if (!villages || villages.length === 0) {
            return []
        }

        const marketCaps = villages.map(v => v.marketCap || 0).filter(mc => mc > 0)
        if (marketCaps.length === 0) return []

        const minMarketCap = Math.min(...marketCaps)
        const maxMarketCap = Math.max(...marketCaps)

        const minRadius = 2
        const maxRadius = 12

        const logMin = Math.log(minMarketCap)
        const logMax = Math.log(maxMarketCap)
        const logRange = logMax - logMin

        const getRadius = (mc: number) => {
            if (logRange === 0) {
                return (minRadius + maxRadius) / 2
            }
            const scaled = minRadius + (maxRadius - minRadius) * (Math.log(mc) - logMin) / logRange
            return Math.max(minRadius, Math.min(maxRadius, scaled))
        }

        return villages.map((village) => ({
            village,
            radius: getRadius(village.marketCap || 0)
        }))
    }, [villages])

    if (!showMinimap) {
        return null
    }

    const offsetX = -cameraPosition.x * MAP_SCALE
    const offsetY = -cameraPosition.z * MAP_SCALE

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
                    
                    <clipPath id="markerClip" clipPathUnits="objectBoundingBox">
                        <circle cx="0.5" cy="0.5" r="0.5" />
                    </clipPath>
                </defs>

                <g clipPath="url(#circleClip)">
                    <circle cx={VIEW_RADIUS} cy={VIEW_RADIUS} r={VIEW_RADIUS} fill="rgba(17, 24, 39, 0.7)" />
                    
                    <g transform={`translate(${VIEW_RADIUS}, ${VIEW_RADIUS})`}>
                        <g transform={`translate(${offsetX}, ${offsetY})`}>
                            {villageDataWithRadius.map((data) => (
                                <MinimapMarker
                                    key={data.village.ca}
                                    village={data.village}
                                    radius={data.radius}
                                />
                            ))}
                        </g>
                    </g>
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
