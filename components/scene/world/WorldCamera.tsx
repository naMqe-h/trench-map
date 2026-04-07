import * as THREE from 'three'
import { useRef, useEffect, useState, useMemo } from 'react'
import { PerspectiveCamera, CameraControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { MAP_SETTINGS } from '@/config/settings'
import { Village } from '@/types/token'
import { useDevStore } from '@/store/useDevStore'

type WorldCameraProps = {
    controlsRef?: React.RefObject<any>
    coordsRef: React.RefObject<HTMLSpanElement | null> | null
    newVillage?: { village: Village, trigger: number, isNew: boolean } | null
    onFlyToStart?: () => void
    loadMoreVillages: () => void
    addLiveToken: (village: Village, isNew: boolean) => void
}

const CameraTracker = ({ 
    loadMore, 
    hasMore, 
    isLoading, 
    offset, 
    coordsRef 
}: { 
    loadMore: () => void, 
    hasMore: boolean, 
    isLoading: boolean, 
    offset: number, 
    coordsRef: React.RefObject<HTMLSpanElement | null> | null 
}) => {
    if(!coordsRef) return null
    const loadDistance = useSettingsStore((state) => state.loadDistance)
    const maxChunks = useDevStore((state) => state.maxChunks)
    const freeCam = useDevStore((state) => state.freeCam)

    useFrame((state) => {
        if (coordsRef.current && (state.controls as any)) {
            const target = (state.controls as any).getTarget(new THREE.Vector3())
            coordsRef.current.innerText = `X: ${Math.round(target.x)} Z: ${Math.round(target.z)}`
        }

        if (!hasMore || isLoading || freeCam) return

        const currentChunks = offset / 20
        if (currentChunks >= maxChunks) return

        const cameraDistance = Math.sqrt(state.camera.position.x ** 2 + state.camera.position.z ** 2)
        const threshold = Math.sqrt(offset) * loadDistance

        if (cameraDistance > threshold) {
            loadMore()
        }
    })
    return null
}

export const WorldCamera = ({ 
    controlsRef, 
    coordsRef, 
    newVillage, 
    onFlyToStart,
    loadMoreVillages,
    addLiveToken
}: WorldCameraProps) => {
    const defaultCameraControlsRef = useRef<any>(null)
    const activeControlsRef = controlsRef || defaultCameraControlsRef
    const cameraDamping = useSettingsStore((state) => state.cameraDamping)
    const freeCam = useDevStore((state) => state.freeCam)
    
    const {
        villageGeometries,
        isLoading,
        hasMore,
        offset,
        isIntroPlaying
    } = useMapStore(useShallow(state => ({
        villageGeometries: state.villageGeometries,
        isLoading: state.isLoading,
        hasMore: state.hasMore,
        offset: state.offset,
        isIntroPlaying: state.isIntroPlaying
    })))

    const lastTrigger = useRef<number>(0)
    const [pendingFlyToCa, setPendingFlyToCa] = useState<string | null>(null)

    useEffect(() => {
        if (newVillage && newVillage.trigger !== lastTrigger.current) {
            lastTrigger.current = newVillage.trigger

            const existingVillage = villageGeometries.find(v => v.ca === newVillage.village.ca)

            if (existingVillage) {
                setPendingFlyToCa(newVillage.village.ca)
            } else {
                setPendingFlyToCa(newVillage.village.ca)
                addLiveToken(newVillage.village, newVillage.isNew)
            }
        }
    }, [newVillage, villageGeometries, addLiveToken])

    useEffect(() => {
        if (pendingFlyToCa) {
            const targetVillage = villageGeometries.find(v => v.ca === pendingFlyToCa)
            if (targetVillage) {
                const pos = targetVillage.position

                activeControlsRef.current?.setLookAt(
                    pos.x + 60, 50, pos.z + 60,
                    pos.x, 0.5, pos.z,
                    true
                )

                onFlyToStart?.()
                setPendingFlyToCa(null)
            }
        }
    }, [villageGeometries, pendingFlyToCa, activeControlsRef, onFlyToStart])

    const center = useMemo(() => new THREE.Vector3(), [])

    return (
        <>
            <CameraTracker 
                loadMore={loadMoreVillages} 
                hasMore={hasMore} 
                isLoading={isLoading} 
                offset={offset} 
                coordsRef={coordsRef} 
            />
            <PerspectiveCamera 
                makeDefault 
                position={[center.x + 10, 40, center.z + 60]} 
                fov={45} 
            />
            <CameraControls 
                ref={activeControlsRef} 
                makeDefault 
                enabled={!isIntroPlaying || freeCam}
                maxPolarAngle={freeCam ? Math.PI : MAP_SETTINGS.CAMERA_MAX_POLAR_ANGLE} 
                minDistance={freeCam ? 0 : MAP_SETTINGS.CAMERA_MIN_DISTANCE} 
                maxDistance={freeCam ? Infinity : MAP_SETTINGS.CAMERA_MAX_DISTANCE} 
                smoothTime={cameraDamping}
                draggingSmoothTime={cameraDamping}
            />
        </>
    )
}
