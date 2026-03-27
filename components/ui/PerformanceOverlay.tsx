'use client'

import { useEffect, useRef } from 'react'
import { useMapStore } from '../../store/useMapStore'
import { useSettingsStore } from '../../store/useSettingsStore'

export const PerformanceOverlay = () => {
    const showFpsCounter = useSettingsStore((state) => state.showFpsCounter)
    const fps = useMapStore((state) => state.fps)
    const fpsHistory = useMapStore((state) => state.fpsHistory)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const getThresholdColor = (value: number) => {
        if (value >= 55) return '#4ade80'
        if (value >= 30) return '#facc15'
        return '#f87171'
    }

    useEffect(() => {
        if (!showFpsCounter) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height
        const padding = 2
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2

        ctx.clearRect(0, 0, width, height)

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(0, 0, width, height)

        if (fpsHistory.length < 2) return

        ctx.beginPath()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = getThresholdColor(fps)

        const maxFps = 150
        const step = chartWidth / 100

        fpsHistory.forEach((value, index) => {
            const x = padding + (index * step) + (chartWidth - (fpsHistory.length - 1) * step)
            const y = height - padding - (Math.min(value, maxFps) / maxFps) * chartHeight

            if (index === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.stroke()
    }, [fps, fpsHistory, showFpsCounter])

    if (!showFpsCounter) return null

    return (
        <div className="fixed md:top-4 md:left-4 bottom-20 left-4 z-50 flex flex-col items-start pointer-events-none font-mono">
            <div 
                className="text-xs font-bold mb-0.5 drop-shadow-md"
                style={{ color: getThresholdColor(fps) }}
            >
                {fps} FPS
            </div>
            <canvas
                ref={canvasRef}
                width={100}
                height={30}
                className="rounded border border-white/5"
            />
        </div>
    )
}
