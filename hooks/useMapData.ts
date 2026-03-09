import { useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three-stdlib'
import { Village, VillageData, HouseData, MapWorkerPayload, ProcessedVillageData, VegetationData, MapWorkerRequest } from '@/lib/types'
import { createTenementGeometries } from '@/components/scene/houses/Tenement'
import { createTwoStoryHouseGeometries } from '@/components/scene/houses/TwoStoryHouse'
import { createBasicHouseGeometries } from '@/components/scene/houses/BasicHouse'
import { createTreeGeometries } from '@/components/scene/decorations/Tree'
import { getVillageChunks } from '@/actions/getVillageChunks'
import { MAP_SETTINGS } from '@/config/settings'

export const useMapData = (initialVillages: Village[], setGenerationStep?: (step: string | null) => void) => {
    const [rawVillages, setRawVillages] = useState<Village[]>(initialVillages)
    const [offset, setOffset] = useState(initialVillages.length)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [villageGeometries, setVillageGeometries] = useState<VillageData[]>([])

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

    const lastProcessedIndex = useRef(0)
    const housesCache = useRef<HouseData[]>([])
    const grassMatricesCache = useRef<THREE.Matrix4[]>([])
    const dirtMatricesCache = useRef<THREE.Matrix4[]>([])
    const vegetationSpotsCache = useRef<VegetationData[]>([])

    const workerRef = useRef<Worker | null>(null)
    const [center, setCenter] = useState<THREE.Vector3>(new THREE.Vector3())

    useEffect(() => {
        lastProcessedIndex.current = 0
        housesCache.current = []
        grassMatricesCache.current = []
        dirtMatricesCache.current = []
        vegetationSpotsCache.current = []

        setVillageGeometries([])

        workerRef.current = new Worker(new URL('@/components/scene/map/workers/mapWorker.ts', import.meta.url))

        workerRef.current.onmessage = (event: MessageEvent<MapWorkerPayload>) => {
            setGenerationStep?.('building')
            const data = event.data

            setTimeout(() => {
                const { processedVillages, newGrassMatrices, newDirtMatrices, newVegetationSpots, center: centerArr } = data

                const newVillageGeometries: VillageData[] = processedVillages.map((vData: ProcessedVillageData) => {
                    const village = vData.village
                    const position = new THREE.Vector3().fromArray(vData.position)
                    const radius = vData.radius

                    const villageHouses = vData.villageHouses.map((h) => ({
                        position: new THREE.Vector3().fromArray(h.position),
                        type: h.type
                    }))

                    housesCache.current.push(...villageHouses)

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

                newGrassMatrices.forEach((arr: number[]) => {
                    grassMatricesCache.current.push(new THREE.Matrix4().fromArray(arr))
                })
                newDirtMatrices.forEach((arr: number[]) => {
                    dirtMatricesCache.current.push(new THREE.Matrix4().fromArray(arr))
                })

                vegetationSpotsCache.current.push(...newVegetationSpots)

                setCenter(new THREE.Vector3().fromArray(centerArr))
                setVillageGeometries(prev => [...prev, ...newVillageGeometries])
                setGenerationStep?.(null)
            }, 0)
        }

        return () => {
            workerRef.current?.terminate()
        }
    }, [setGenerationStep])

    useEffect(() => {
        if (rawVillages.length <= lastProcessedIndex.current) return

        const newVillages = rawVillages.slice(lastProcessedIndex.current)

        const request: MapWorkerRequest = {
            newVillages,
            startIndex: lastProcessedIndex.current
        }
        workerRef.current?.postMessage(request)

        lastProcessedIndex.current = rawVillages.length
    }, [rawVillages, setGenerationStep])

    return {
        villageGeometries,
        instancedTerrain: {
            grassMatrices: grassMatricesCache.current,
            dirtMatrices: dirtMatricesCache.current,
        },
        vegetationSpots: vegetationSpotsCache.current,
        center,
        hasData: housesCache.current.length > 0,
        loadMoreVillages,
        isLoading,
        hasMore,
        offset,
        addLiveToken
    }
}