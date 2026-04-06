import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { InstancedTerrain } from '../map/InstancedTerrain'

export const WorldTerrain = () => {
    const { grassMatrices, dirtMatrices } = useMapStore(
        useShallow((state) => ({
            grassMatrices: state.grassMatricesCache,
            dirtMatrices: state.dirtMatricesCache,
        }))
    )

    return (
        <InstancedTerrain 
            grassMatrices={grassMatrices} 
            dirtMatrices={dirtMatrices}
        />
    )
}
