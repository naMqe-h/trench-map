import { memo } from 'react'
import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { InstancedTerrain } from '../map/InstancedTerrain'

export const WorldTerrain = memo(function WorldTerrain() {
    const { grassMatrices, dirtMatrices, waterMatrices } = useMapStore(
        useShallow((state) => ({
            grassMatrices: state.grassMatricesCache,
            dirtMatrices: state.dirtMatricesCache,
            waterMatrices: state.waterMatricesCache,
        }))
    )

    return (
        <InstancedTerrain 
            grassMatrices={grassMatrices} 
            dirtMatrices={dirtMatrices}
            waterMatrices={waterMatrices}
        />
    )
})
