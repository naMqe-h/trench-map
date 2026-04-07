import { PerformanceTracker } from '../PerformanceTracker'
import { useMapManager } from '@/hooks/useMapManager'
import { Village } from '@/types/token'
import { WorldCamera } from '../world/WorldCamera'
import { WorldEnvironment } from '../world/WorldEnvironment'
import { WorldVegetation } from '../world/WorldVegetation'
import { WorldTerrain } from '../world/WorldTerrain'
import { WorldStructures } from '../world/WorldStructures'
import { DevPanel } from '@/components/dev/DevPanel'

type VoxelWorldProps = {
    villages: Village[]
    onReady?: () => void
    onCountChange?: (count: number) => void
    controlsRef?: React.RefObject<any>
    newVillage?: { village: Village, trigger: number, isNew: boolean } | null
    onFlyToStart?: () => void
    coordsRef: React.RefObject<HTMLSpanElement | null> | null
}

export const VoxelWorld = ({ 
    villages, 
    onReady, 
    onCountChange, 
    controlsRef, 
    newVillage, 
    onFlyToStart, 
    coordsRef 
}: VoxelWorldProps) => {
    
    const { loadMoreVillages, addLiveToken } = useMapManager(villages)
    const isDev = process.env.NODE_ENV === 'development'

    return (
        <>
            {isDev && <DevPanel loadMoreVillages={loadMoreVillages} />}
            <PerformanceTracker />
            
            <WorldCamera 
                controlsRef={controlsRef}
                coordsRef={coordsRef}
                newVillage={newVillage}
                onFlyToStart={onFlyToStart}
                loadMoreVillages={loadMoreVillages}
                addLiveToken={addLiveToken}
            />

            <WorldEnvironment />

            <WorldTerrain />

            <WorldStructures 
                onReady={onReady} 
                onCountChange={onCountChange} 
            />

            <WorldVegetation />
        </>
    )
}
