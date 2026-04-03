"use client"

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useMapStore } from '@/store/useMapStore'
import gsap from 'gsap'
import * as THREE from 'three'

type CameraIntroProps = {
    isReady: boolean
}

export const CameraIntro = ({ isReady }: CameraIntroProps) => {
    const { camera, controls } = useThree()
    const isIntroPlaying = useMapStore((state) => state.isIntroPlaying)
    const setIsIntroPlaying = useMapStore((state) => state.setIsIntroPlaying)

    const timeline = useRef<gsap.core.Timeline | null>(null)

    useEffect(() => {
        if (isReady && isIntroPlaying && controls) {
            camera.position.set(0, 200, -200)
            camera.updateProjectionMatrix()
            
            const initialTarget = new THREE.Vector3(0, 0, 0)
            ;(controls as any).setLookAt(
                camera.position.x,
                camera.position.y,
                camera.position.z,
                initialTarget.x,
                initialTarget.y,
                initialTarget.z,
            )

            const target = new THREE.Vector3(0, 0, 0)

            timeline.current = gsap.timeline({
                onComplete: () => {
                    setIsIntroPlaying(false)
                },
            })

            timeline.current.to(
                camera.position,
                {
                    x: 60,
                    y: 60,
                    z: -60,
                    duration: 4,
                    ease: 'power3.inOut',
                    onUpdate: () => {
                        (controls as any).setLookAt(
                            camera.position.x,
                            camera.position.y,
                            camera.position.z,
                            target.x,
                            target.y,
                            target.z,
                        )
                    }
                },
                0
            )
        }

        return () => {
            timeline.current?.kill()
        }
    }, [isReady, isIntroPlaying, camera, controls, setIsIntroPlaying])

    return null
}
