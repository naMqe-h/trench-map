import * as THREE from 'three'
import { CameraControls, PerspectiveCamera, useTexture, Stats } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Village } from '@/lib/types'
// import { VillageMarker } from './VillageMarker'
import { DynamicSunLight } from './DynamicSunLight'
import { InstancedTerrain } from './InstancedTerrain'
import { MergedStructures } from './MergedStructures'
import { useMapData } from '@/hooks/useMapData'
import { Sprite } from '../decorations/Sprite'
import { useRef, useEffect, useState } from 'react'
import { MAP_SETTINGS } from '@/config/settings'

type VoxelWorldProps = {
    villages: Village[]
    onReady?: () => void
    onCountChange?: (count: number) => void
    controlsRef?: React.RefObject<any>
    newVillage?: { village: Village, trigger: number, isNew: boolean } | null
    setGenerationStep?: (step: string | null) => void
    onFlyToStart?: () => void
}

const CameraTracker = ({ loadMore, hasMore, isLoading, offset }: { loadMore: () => void, hasMore: boolean, isLoading: boolean, offset: number }) => {
    useFrame((state) => {
        const coordsEl = document.getElementById('coords-display')
        if (coordsEl && (state.controls as any)) {
            const target = (state.controls as any).getTarget(new THREE.Vector3())
            coordsEl.innerText = `X: ${Math.round(target.x)} Z: ${Math.round(target.z)}`
        }

        if (!hasMore || isLoading) return

        const cameraDistance = Math.sqrt(state.camera.position.x ** 2 + state.camera.position.z ** 2)
        const threshold = Math.sqrt(offset) * MAP_SETTINGS.CAMERA_LOAD_THRESHOLD_MULTIPLIER

        if (cameraDistance > threshold) {
            loadMore()
        }
    })
    return null
}

const VegetationGroup = ({ children }: { children: React.ReactNode }) => {
    const groupRef = useRef<THREE.Group>(null!)
    useFrame(({ camera }) => {
        if (groupRef.current) {
            groupRef.current.visible = camera.position.y <= MAP_SETTINGS.LOD_VEGETATION_HIDE_HEIGHT
        }
    })
    return <group ref={groupRef}>{children}</group>
}

export const VoxelWorld = ({ villages, onReady, onCountChange, controlsRef, newVillage, setGenerationStep, onFlyToStart }: VoxelWorldProps) => {
    const defaultCameraControlsRef = useRef<any>(null)
    const activeControlsRef = controlsRef || defaultCameraControlsRef

    const { 
        villageGeometries,
        instancedTerrain, 
        vegetationSpots, 
        center, 
        hasData,
        loadMoreVillages,
        isLoading,
        hasMore,
        offset,
        addLiveToken
    } = useMapData(villages, setGenerationStep)

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
                    pos.x, 0, pos.z,
                    true
                )

                onFlyToStart?.()

                setPendingFlyToCa(null)
            }
        }
    }, [villageGeometries, pendingFlyToCa, activeControlsRef, onFlyToStart])

    useEffect(() => {
        if (villageGeometries && villageGeometries.length > 0) {
            onReady?.()
            onCountChange?.(villageGeometries.length)
        }
    }, [villageGeometries, onReady, onCountChange])

    return (
        <>
            <Stats />
            <CameraTracker loadMore={loadMoreVillages} hasMore={hasMore} isLoading={isLoading} offset={offset} />
            <PerspectiveCamera makeDefault position={[center.x + 10, 40, center.z + 60]} fov={45} />
            <CameraControls 
                ref={activeControlsRef} 
                makeDefault 
                maxPolarAngle={MAP_SETTINGS.CAMERA_MAX_POLAR_ANGLE} 
                minDistance={MAP_SETTINGS.CAMERA_MIN_DISTANCE} 
                maxDistance={MAP_SETTINGS.CAMERA_MAX_DISTANCE} 
            />

            {/* {villageData.map((village) => (
                <VillageMarker key={village.ca} village={village} />
            ))} */}

            <DynamicSunLight />

            {instancedTerrain && (
                <InstancedTerrain 
                    grassMatrices={instancedTerrain.grassMatrices} 
                    dirtMatrices={instancedTerrain.dirtMatrices}
                />
            )}

            <MergedStructures 
                villageGeometries={villageGeometries}
            />

            {MAP_SETTINGS.ENABLE_VEGETATION && (
                <VegetationGroup>
                    {vegetationSpots.map((spot, i) => (
                        <Sprite 
                            key={`veg-${i}`} 
                            position={spot.position} 
                            type={spot.type} 
                        />
                    ))}
                </VegetationGroup>
            )}
        </>
    )
}