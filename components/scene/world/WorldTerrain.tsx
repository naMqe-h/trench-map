import { memo } from 'react'
import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { InstancedTerrain } from '../map/InstancedTerrain'

export const WorldTerrain = memo(function WorldTerrain() {
    const { grassMatricesChunks, dirtMatricesChunks, waterMatricesChunks } = useMapStore(
        useShallow((state) => ({
            grassMatricesChunks: state.grassMatricesChunks,
            dirtMatricesChunks: state.dirtMatricesChunks,
            waterMatricesChunks: state.waterMatricesChunks,
        }))
    )

    return (
        <InstancedTerrain 
            grassMatrices={grassMatricesChunks} 
            dirtMatrices={dirtMatricesChunks}
            waterMatrices={waterMatricesChunks}
        />
    )
})
