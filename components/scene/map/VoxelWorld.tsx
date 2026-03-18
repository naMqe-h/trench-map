import * as THREE from 'three'
import { CameraControls, PerspectiveCamera, Stats, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { DynamicSunLight } from './DynamicSunLight'
import { Clouds } from '../decorations/Clouds'
import { InstancedTerrain } from './InstancedTerrain'
import { MergedStructures } from './MergedStructures'
import { useMapData } from '@/hooks/useMapData'
import { Sprite } from '../decorations/Sprite'
import { useRef, useEffect, useState, useMemo } from 'react'
import { MAP_SETTINGS } from '@/config/settings'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Village } from '@/types/token'

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
    const loadDistance = useSettingsStore((state) => state.loadDistance)
    
    useFrame((state) => {
        const coordsEl = document.getElementById('coords-display')
        if (coordsEl && (state.controls as any)) {
            const target = (state.controls as any).getTarget(new THREE.Vector3())
            coordsEl.innerText = `X: ${Math.round(target.x)} Z: ${Math.round(target.z)}`
        }

        if (!hasMore || isLoading) return

        const cameraDistance = Math.sqrt(state.camera.position.x ** 2 + state.camera.position.z ** 2)
        const threshold = Math.sqrt(offset) * loadDistance

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
    const vegetationDensity = useSettingsStore((state) => state.vegetationDensity)
    const renderGrassAndFlowers = useSettingsStore((state) => state.renderGrassAndFlowers)
    const cameraDamping = useSettingsStore((state) => state.cameraDamping)

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

    const displayedVegetation = useMemo(() => {
        if (vegetationDensity === 'low') {
            return vegetationSpots.slice(0, Math.floor(vegetationSpots.length / 10))
        }
        if (vegetationDensity === 'medium') {
            return vegetationSpots.slice(0, Math.floor(vegetationSpots.length / 5))
        }
        return vegetationSpots
    }, [vegetationSpots, vegetationDensity])


    const lastTrigger = useRef<number>(0)
    const [pendingFlyToCa, setPendingFlyToCa] = useState<string | null>(null)
    const timeOfDay = useTimeOfDay()

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
                smoothTime={cameraDamping}
                draggingSmoothTime={cameraDamping}
            />

            <ambientLight 
                color={timeOfDay.ambientColor}
                intensity={timeOfDay.ambientIntensity}
            />
            <DynamicSunLight 
                color={timeOfDay.directionalColor}
                intensity={timeOfDay.directionalIntensity}
            />
            {timeOfDay.isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
            <Clouds />

            {instancedTerrain && (
                <InstancedTerrain 
                    grassMatrices={instancedTerrain.grassMatrices} 
                    dirtMatrices={instancedTerrain.dirtMatrices}
                />
            )}

            <MergedStructures 
                villageGeometries={villageGeometries}
            />

            {renderGrassAndFlowers && (
                <VegetationGroup>
                    {displayedVegetation.map((spot, i) => (
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