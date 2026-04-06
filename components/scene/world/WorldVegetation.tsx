import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMapStore } from '@/store/useMapStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useShallow } from 'zustand/react/shallow'
import { MAP_SETTINGS } from '@/config/settings'
import { InstancedTrees } from '../decorations/InstancedTrees'
import { InstancedVegetation } from '../decorations/InstancedVegetation'

const VegetationGroup = ({ children }: { children: React.ReactNode }) => {
    const groupRef = useRef<THREE.Group>(null!)
    useFrame(({ camera }) => {
        if (groupRef.current) {
            groupRef.current.visible = camera.position.y <= MAP_SETTINGS.LOD_VEGETATION_HIDE_HEIGHT
        }
    })
    return <group ref={groupRef}>{children}</group>
}

export const WorldVegetation = () => {
    const vegetationDensity = useSettingsStore((state) => state.vegetationDensity)
    const renderGrassAndFlowers = useSettingsStore((state) => state.renderGrassAndFlowers)

    const { vegetationSpots, treeSpotsCache } = useMapStore(
        useShallow((state) => ({
            vegetationSpots: state.vegetationSpotsCache,
            treeSpotsCache: state.treeSpotsCache,
        }))
    )

    const displayedVegetation = useMemo(() => {
        if (vegetationDensity === 'low') {
            return vegetationSpots.slice(0, Math.floor(vegetationSpots.length / 10))
        }
        if (vegetationDensity === 'medium') {
            return vegetationSpots.slice(0, Math.floor(vegetationSpots.length / 5))
        }
        return vegetationSpots
    }, [vegetationSpots, vegetationDensity])

    return (
        <>
            <InstancedTrees treeSpots={treeSpotsCache} />
            <VegetationGroup>
                {renderGrassAndFlowers && (
                    <InstancedVegetation vegetationData={displayedVegetation} />
                )}
            </VegetationGroup>
        </>
    )
}
