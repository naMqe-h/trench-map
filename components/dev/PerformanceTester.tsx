"use client"

import { useEffect, useState, useRef, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSearchParams } from 'next/navigation'
import { performanceStats } from '../../lib/performanceStats'

const TEST_DURATION = 30
const WARMUP_TIME = 3
const ORBIT_RADIUS_START = 100
const ORBIT_RADIUS_END = 800
const ORBIT_SPEED = 0.5

function PerformanceTesterInner() {
    const searchParams = useSearchParams()
    const isEnabled = searchParams.get('perfTest') === 'true'
    const [status, setStatus] = useState<'idle' | 'warmup' | 'recording' | 'finished'>('idle')
    const startTimeRef = useRef<number>(0)
    const { camera } = useThree()

    useEffect(() => {
        if (isEnabled && status === 'idle') {
            console.log("Performance Test: Warmup starting (3s)...")
            setStatus('warmup')
            startTimeRef.current = performance.now()
        }
    }, [isEnabled, status])

    useFrame((_state, delta) => {
        if (!isEnabled || status === 'finished') return

        const now = performance.now()
        const elapsed = (now - startTimeRef.current) / 1000

        if (status === 'warmup') {
            if (elapsed >= WARMUP_TIME) {
                console.log("Performance Test: Recording started (30s)...")
                performanceStats.start()
                setStatus('recording')
                startTimeRef.current = now
            }
            return
        }

        if (status === 'recording') {
            if (elapsed >= TEST_DURATION) {
                performanceStats.stop()
                const results = performanceStats.getResults()
                console.log("Performance Test Finished:")
                console.table({
                    "Average FPS": results.avgFps,
                    "Min FPS": results.minFps,
                    "Max FPS": results.maxFps,
                    "1% Lows": results.onePercentLow,
                    "Total Frames": results.totalFrames
                })
                setStatus('finished')
                return
            }

            performanceStats.recordFrame(delta)

            const progress = elapsed / TEST_DURATION
            const radius = ORBIT_RADIUS_START + (ORBIT_RADIUS_END - ORBIT_RADIUS_START) * progress
            const angle = elapsed * ORBIT_SPEED

            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = 150 + progress * 150

            camera.position.set(x, y, z)
            camera.lookAt(0, 0, 0)
        }
    })

    return null
}

export function PerformanceTester() {
    return (
        <Suspense fallback={null}>
            <PerformanceTesterInner />
        </Suspense>
    )
}
