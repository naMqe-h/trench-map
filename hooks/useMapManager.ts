import { useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three-stdlib'
import { createTenementGeometries } from '@/components/scene/houses/Tenement'
import { createTwoStoryHouseGeometries } from '@/components/scene/houses/TwoStoryHouse'
import { createBasicHouseGeometries } from '@/components/scene/houses/BasicHouse'
import { createTreeGeometries } from '@/components/scene/decorations/Tree'
import { getVillageChunks } from '@/actions/getVillageChunks'
import { MAP_SETTINGS } from '@/config/settings'
import { useMapStore } from '@/store/useMapStore'
import { Village } from '@/types/token'
import { HouseData, HouseMaterial, MapWorkerPayload, MapWorkerRequest, ProcessedVillageData, VillageData } from '@/types/scene'
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
                const { processedVillages, newGrassMatrices, newDirtMatrices, newVegetationSpots } = data

                const allNewHouses: HouseData[] = []
                const newVillageGeometries: VillageData[] = processedVillages.map((vData: ProcessedVillageData) => {
                    const village = vData.village
                    const position = new THREE.Vector3().fromArray(vData.position)
                    const radius = vData.radius

                    const villageHouses = vData.villageHouses.map((h) => ({
                        position: new THREE.Vector3().fromArray(h.position),
                        type: h.type
                    }))

                    allNewHouses.push(...villageHouses)

                    const localHouseGeometries: Record<HouseMaterial, THREE.BufferGeometry[]> = {
                        cobble: [], plank: [], glass: [], brick: [], stoneBrick: []
                    }
                    const localTreeGeometries: { trunk: THREE.BufferGeometry[], leaves: THREE.BufferGeometry[] } = {
                        trunk: [], leaves: []
                    }

                    villageHouses.forEach((house) => {
                        let houseGeos
                        const pos = house.position.toArray() as THREE.Vector3Tuple
                        if (house.type === 'tenement') {
                            houseGeos = createTenementGeometries(pos)
                        } else if (house.type === 'twoStory') {
                            houseGeos = createTwoStoryHouseGeometries(pos)
                        } else {
                            houseGeos = createBasicHouseGeometries(pos)
                        }

                        for (const [type, geos] of Object.entries(houseGeos)) {
                            const material = type as HouseMaterial
                            if (localHouseGeometries[material] && geos.length > 0) {
                                localHouseGeometries[material].push(...geos)
                            }
                        }
                    })

                    vData.treeSpots.forEach((spot) => {
                        const { trunk, leaves } = createTreeGeometries(spot as THREE.Vector3Tuple)
                        localTreeGeometries.trunk.push(...trunk)
                        localTreeGeometries.leaves.push(...leaves)
                    })

                    const mergedVillageGeometries: Partial<Record<HouseMaterial, THREE.BufferGeometry | null>> = {}
                    for (const type in localHouseGeometries) {
                        const material = type as HouseMaterial
                        const geos = localHouseGeometries[material]
                        mergedVillageGeometries[material] = geos.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(geos) : null
                        geos.forEach(geo => geo.dispose())
                    }

                    const mergedVillageTreeGeometries = {
                        trunk: localTreeGeometries.trunk.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(localTreeGeometries.trunk) : null,
                        leaves: localTreeGeometries.leaves.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(localTreeGeometries.leaves) : null,
                    }
                    localTreeGeometries.trunk.forEach(geo => geo.dispose())
                    localTreeGeometries.leaves.forEach(geo => geo.dispose())

                    return {
                        ...village,
                        position,
                        radius,
                        placedHouses: villageHouses,
                        geometries: mergedVillageGeometries as Record<HouseMaterial, THREE.BufferGeometry | null>,
                        treeGeometries: mergedVillageTreeGeometries
                    }
                })

                useMapStore.getState().appendChunkData({
                    houses: allNewHouses,
                    grassMatrices: newGrassMatrices.map(arr => new THREE.Matrix4().fromArray(arr)),
                    dirtMatrices: newDirtMatrices.map(arr => new THREE.Matrix4().fromArray(arr)),
                    vegetation: newVegetationSpots,
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
