import { useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
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
            useMapStore.getState().setGenerationStep('building')
            const data = event.data

            setTimeout(() => {
                const { processedVillages, newGrassMatrices, newDirtMatrices, newVegetationSpots, treeSpots: newTreeSpots } = data

                const allNewHouses: HouseData[] = []

                const newVillageGeometries: VillageData[] = processedVillages.map((vData: ProcessedVillageData) => {
                    const village = vData.village
                    const position = new THREE.Vector3().fromArray(vData.position)
                    const radius = vData.radius

                    const villageHouses = vData.villageHouses.map((h) => ({
                        position: new THREE.Vector3().fromArray(h.position),
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

                useMapStore.getState().appendChunkData({
                    houses: allNewHouses,
                    grassMatrices: newGrassMatrices.map(arr => new THREE.Matrix4().fromArray(arr)),
                    dirtMatrices: newDirtMatrices.map(arr => new THREE.Matrix4().fromArray(arr)),
                    vegetation: newVegetationSpots,
                    treeSpots: newTreeSpots,
                })

                useMapStore.getState().addVillageGeometries(newVillageGeometries)
                useMapStore.getState().setGenerationStep(null)
                useMapStore.getState().setGenerating(false)
            }, 0)
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

