import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { usePerformanceStore } from '../../store/usePerformanceStore'

export const PerformanceTracker = () => {
    const updatePerformanceMetrics = usePerformanceStore((state) => state.updatePerformanceMetrics)
    const frameCount = useRef(0)
    const lastTime = useRef(performance.now())
    const updateInterval = 500

    useFrame(() => {
        frameCount.current++
        const currentTime = performance.now()
        const elapsed = currentTime - lastTime.current

        if (elapsed >= updateInterval) {
            const fps = Math.round((frameCount.current * 1000) / elapsed)
            updatePerformanceMetrics(fps)
            
            frameCount.current = 0
            lastTime.current = currentTime
        }
    })

    return null
}
