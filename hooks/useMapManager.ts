import { useCallback, useRef, useEffect } from 'react'
import { getVillageChunks } from '@/actions/getVillageChunks'
import { MAP_SETTINGS } from '@/config/settings'
import { useMapStore } from '@/store/useMapStore'
import { Village } from '@/types/token'
import { HouseData, MapWorkerPayload, MapWorkerRequest, ProcessedVillageData, VillageData } from '@/types/scene'
import { useShallow } from 'zustand/react/shallow'

export const useMapManager = (initialVillages: Village[]) => {
    const workerRef = useRef<Worker | null>(null)
    const store = useMapStore.getState()

    const {
        villages,
        lastProcessedIndex,
        isLoading,
        hasMore,
        offset
    } = useMapStore(useShallow(state => ({
        villages: state.villages,
        lastProcessedIndex: state.lastProcessedIndex,
        isLoading: state.isLoading,
        hasMore: state.hasMore,
        offset: state.offset,
    })))

    useEffect(() => {
        useMapStore.getState().initializeVillages(initialVillages)

        workerRef.current = new Worker(new URL('@/components/scene/map/workers/mapWorker.ts', import.meta.url))

        workerRef.current.onmessage = (event: MessageEvent<MapWorkerPayload>) => {
            const data = event.data

            const { processedVillages, newGrassMatrices, newDirtMatrices, newWaterMatrices, newVegetationSpots, treeSpots: newTreeSpots } = data

            const allNewHouses: HouseData[] = []

            const newVillageGeometries: VillageData[] = processedVillages.map((vData: ProcessedVillageData) => {
                const village = vData.village
                const position = vData.position
                const radius = vData.radius

                const villageHouses = vData.villageHouses.map((h) => ({
                    position: h.position,
                    type: h.type,
                    rotation: h.rotation
                }))

                allNewHouses.push(...villageHouses)

                return {
                    ...village,
                    position,
                    radius,
                    placedHouses: villageHouses,
                }
            })

            useMapStore.getState().finalizeChunkProcessing({
                houses: allNewHouses,
                grassMatrices: newGrassMatrices,
                dirtMatrices: newDirtMatrices,
                waterMatrices: newWaterMatrices,
                vegetation: newVegetationSpots,
                treeSpots: newTreeSpots,
            }, newVillageGeometries)
        }

        return () => {
            workerRef.current?.terminate()
            useMapStore.getState().resetMap()
        }
    }, [])

    useEffect(() => {
        if (villages.length <= lastProcessedIndex) return

        store.setGenerating(true)
        store.setGenerationStep('processing')
        const newVillages = villages.slice(lastProcessedIndex)

        const request: MapWorkerRequest = {
            type: 'PROCESS_CHUNK',
            newVillages,
            startIndex: lastProcessedIndex
        }
        workerRef.current?.postMessage(request)
        store.setLastProcessedIndex(villages.length)

    }, [villages, lastProcessedIndex, store])


    const loadMoreVillages = useCallback(async () => {
        if (isLoading || !hasMore) return

        store.setLoading(true)
        try {
            const newVillages = await getVillageChunks(MAP_SETTINGS.CHUNK_SIZE, offset)
            const hasNewMore = newVillages.length >= MAP_SETTINGS.CHUNK_SIZE
            store.addVillages(newVillages, hasNewMore)
        } catch (e) {
            store.setError('Failed to fetch new villages.')
        } finally {
            store.setLoading(false)
        }
    }, [isLoading, hasMore, offset, store])

    const addLiveToken = useCallback((newVillage: Village, isNew: boolean = true) => {
        store.addLiveVillage(newVillage, isNew)
    }, [store])

    return {
        loadMoreVillages,
        addLiveToken
    }
}
