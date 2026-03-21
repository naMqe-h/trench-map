import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
import { HouseData, MapWorkerPayload, MapWorkerRequest, ProcessedVillageData, VillageData } from '@/types/scene'
import { useShallow } from 'zustand/react/shallow'

export const useMapData = (initialVillages: Village[], setGenerationStep?: (step: string | null) => void) => {
    const [rawVillages, setRawVillages] = useState<Village[]>(initialVillages)
    const [offset, setOffset] = useState(initialVillages.length)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const { appendChunkData, addVillageGeometries, setLastProcessedIndex, resetMap } = useMapStore.getState()

    const { lastProcessedIndex, grassMatrices, dirtMatrices, vegetationSpots, housesCache, villageGeometries } = useMapStore(
        useShallow(state => ({
            lastProcessedIndex: state.lastProcessedIndex,
            grassMatrices: state.grassMatricesCache,
            dirtMatrices: state.dirtMatricesCache,
            vegetationSpots: state.vegetationSpotsCache,
            housesCache: state.housesCache,
            villageGeometries: state.villageGeometries,
        }))
    )

    const addLiveToken = useCallback((newVillage: Village, isNew: boolean = true) => {
        setRawVillages(prev => {
            if (prev.some(v => v.ca === newVillage.ca)) return prev
            return [...prev, newVillage]
        })
        if (isNew) {
            setOffset(prev => prev + 1)
        }
    }, [])

    const loadMoreVillages = useCallback(async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)
        const newVillages = await getVillageChunks(MAP_SETTINGS.CHUNK_SIZE, offset)

        if (newVillages.length < MAP_SETTINGS.CHUNK_SIZE) {
            setHasMore(false)
        }

        setRawVillages(prev => {
            const added = newVillages.filter(nv => !prev.some(pv => pv.ca === nv.ca))
            return [...prev, ...added]
        })
        setOffset(prev => prev + newVillages.length)
        setIsLoading(false)
    }, [isLoading, hasMore, offset])

    const workerRef = useRef<Worker | null>(null)
    const [center, setCenter] = useState<THREE.Vector3>(new THREE.Vector3())

    useEffect(() => {
        resetMap()

        workerRef.current = new Worker(new URL('@/components/scene/map/workers/mapWorker.ts', import.meta.url))

        workerRef.current.onmessage = (event: MessageEvent<MapWorkerPayload>) => {
            setGenerationStep?.('building')
            const data = event.data

            setTimeout(() => {
                const { processedVillages, newGrassMatrices, newDirtMatrices, newVegetationSpots, center: centerArr } = data

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

                    const localHouseGeometries: Record<string, THREE.BufferGeometry[]> = {
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
                            if (localHouseGeometries[type] && geos.length > 0) {
                                localHouseGeometries[type].push(...geos)
                            }
                        }
                    })

                    vData.treeSpots.forEach((spot) => {
                        const { trunk, leaves } = createTreeGeometries(spot as THREE.Vector3Tuple)
                        localTreeGeometries.trunk.push(...trunk)
                        localTreeGeometries.leaves.push(...leaves)
                    })

                    const mergedVillageGeometries: Record<string, THREE.BufferGeometry | null> = {}
                    for (const type in localHouseGeometries) {
                        const geos = localHouseGeometries[type]
                        mergedVillageGeometries[type] = geos.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(geos) : null
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
                        geometries: mergedVillageGeometries,
                        treeGeometries: mergedVillageTreeGeometries
                    }
                })

                appendChunkData({
                    houses: allNewHouses,
                    grassMatrices: newGrassMatrices.map(arr => new THREE.Matrix4().fromArray(arr)),
                    dirtMatrices: newDirtMatrices.map(arr => new THREE.Matrix4().fromArray(arr)),
                    vegetation: newVegetationSpots,
                })
                
                addVillageGeometries(newVillageGeometries)
                setCenter(new THREE.Vector3().fromArray(centerArr))
                setGenerationStep?.(null)
            }, 0)
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [setGenerationStep, resetMap, appendChunkData, addVillageGeometries])

    useEffect(() => {
        if (rawVillages.length <= lastProcessedIndex) return

        const newVillages = rawVillages.slice(lastProcessedIndex)

        const request: MapWorkerRequest = {
            newVillages,
            startIndex: lastProcessedIndex
        }
        workerRef.current?.postMessage(request)
        setLastProcessedIndex(rawVillages.length)

    }, [rawVillages, lastProcessedIndex, setLastProcessedIndex, setGenerationStep])

    const instancedTerrain = useMemo(() => ({
        grassMatrices,
        dirtMatrices,
    }), [grassMatrices, dirtMatrices])

    const memoizedVegetationSpots = useMemo(() => vegetationSpots, [vegetationSpots])

    const hasData = useMemo(() => housesCache.length > 0, [housesCache])
    
    const memoizedVillageGeometries = useMemo(() => villageGeometries, [villageGeometries])

    return {
        villageGeometries: memoizedVillageGeometries,
        instancedTerrain,
        vegetationSpots: memoizedVegetationSpots,
        center,
        hasData,
        loadMoreVillages,
        isLoading,
        hasMore,
        offset,
        addLiveToken
    }
}

