import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three-stdlib'
import { Village, VillageData } from '@/lib/types'
import { generateHousePositions, HouseData, calculateSpiralPosition, PlacedVillage } from '@/components/scene/map/utils/mapGeneration'
import { createTenementGeometries } from '@/components/scene/houses/Tenement'
import { createTwoStoryHouseGeometries } from '@/components/scene/houses/TwoStoryHouse'
import { createBasicHouseGeometries } from '@/components/scene/houses/BasicHouse'
import { createTreeGeometries } from '@/components/scene/decorations/Tree'
import { getVillageChunks } from '@/actions/getVillageChunks'
import { MAP_SETTINGS } from '@/config/settings'

export const useMapData = (initialVillages: Village[]) => {
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
    const placedVillagesCache = useRef<PlacedVillage[]>([])
    const housesCache = useRef<HouseData[]>([])
    const boundsCache = useRef(new THREE.Box3())
    const grassCoordsCache = useRef(new Set<string>())
    const dirtCoordsCache = useRef(new Set<string>())
    const grassMatricesCache = useRef<THREE.Matrix4[]>([])
    const dirtMatricesCache = useRef<THREE.Matrix4[]>([])
    const vegetationSpotsCache = useRef<{ position: THREE.Vector3Tuple, type: 'rose' | 'smallGrass' }[]>([])
    const occupiedCoordsCache = useRef(new Set<string>())
    
    useEffect(() => {
        if (rawVillages.length <= lastProcessedIndex.current) return

        const newVillages = rawVillages.slice(lastProcessedIndex.current)
        const dummy = new THREE.Object3D()
        const tempBounds = new THREE.Box3()

        const newVillageGeometries: VillageData[] = []

        newVillages.forEach((village, index) => {
            const villageHouses = generateHousePositions(village.houses, [0, 0, 0], [], MAP_SETTINGS.MIN_HOUSE_DISTANCE)
            let maxDist = 0
            villageHouses.forEach(h => {
                const dist = h.position.length()
                if (dist > maxDist) maxDist = dist
            })
            const radius = maxDist + MAP_SETTINGS.VILLAGE_RADIUS_PADDING

            const spiralIndex = (village as any).forcedIndex !== undefined ? (village as any).forcedIndex : lastProcessedIndex.current + index
            const position = calculateSpiralPosition(spiralIndex, radius, placedVillagesCache.current, MAP_SETTINGS.VILLAGE_PADDING)

            placedVillagesCache.current.push({ position, radius })

            villageHouses.forEach(h => {
                h.position.add(position)

                const house_x = Math.round(h.position.x)
                const house_z = Math.round(h.position.z)
                const footprint = h.type === 'tenement' ? MAP_SETTINGS.TENEMENT_FOOTPRINT : MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                for (let i = -footprint; i <= footprint; i++) {
                    for (let j = -footprint; j <= footprint; j++) {
                        occupiedCoordsCache.current.add(`${house_x + i},${house_z + j}`)
                    }
                }
            })

            housesCache.current.push(...villageHouses)

            const localHouseGeometries: Record<string, THREE.BufferGeometry[]> = {
                cobble: [], plank: [], glass: [], brick: [], stoneBrick: []
            }
            const localTreeGeometries: { trunk: THREE.BufferGeometry[], leaves: THREE.BufferGeometry[] } = {
                trunk: [], leaves: []
            }

            villageHouses.forEach(house => {
                let houseGeos
                if (house.type === 'tenement') {
                    houseGeos = createTenementGeometries(house.position.toArray() as THREE.Vector3Tuple)
                } else if (house.type === 'twoStory') {
                    houseGeos = createTwoStoryHouseGeometries(house.position.toArray() as THREE.Vector3Tuple)
                } else {
                    houseGeos = createBasicHouseGeometries(house.position.toArray() as THREE.Vector3Tuple)
                }

                for (const [type, geos] of Object.entries(houseGeos)) {
                    if (localHouseGeometries[type] && geos.length > 0) {
                        localHouseGeometries[type].push(...(geos as THREE.BufferGeometry[]))
                    }
                }
            })

            const localBounds = new THREE.Box3().setFromPoints(villageHouses.map(h => h.position))
            tempBounds.union(localBounds)
            
            const villageMinX = Math.floor(localBounds.min.x - MAP_SETTINGS.VILLAGE_PADDING);
            const villageMaxX = Math.ceil(localBounds.max.x + MAP_SETTINGS.VILLAGE_PADDING);
            const villageMinZ = Math.floor(localBounds.min.z - MAP_SETTINGS.VILLAGE_PADDING);
            const villageMaxZ = Math.ceil(localBounds.max.z + MAP_SETTINGS.VILLAGE_PADDING);

            for (let x = villageMinX; x <= villageMaxX; x++) {
                for (let z = villageMinZ; z <= villageMaxZ; z++) {
                    const key = `${x},${z}`
                    if (occupiedCoordsCache.current.has(key)) continue;

                    if (Math.random() < 1 / MAP_SETTINGS.TREE_DENSITY_DIVISOR) {
                        const { trunk, leaves } = createTreeGeometries([x, 0, z] as THREE.Vector3Tuple)
                        localTreeGeometries.trunk.push(...trunk)
                        localTreeGeometries.leaves.push(...leaves)
                    }
                }
            }
            
            const mergedVillageGeometries: Record<string, THREE.BufferGeometry | null> = {}
            for (const type in localHouseGeometries) {
                const geos = localHouseGeometries[type]
                mergedVillageGeometries[type] = geos.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(geos) : null
            }
            
            const mergedVillageTreeGeometries = {
                trunk: localTreeGeometries.trunk.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(localTreeGeometries.trunk) : null,
                leaves: localTreeGeometries.leaves.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(localTreeGeometries.leaves) : null,
            }

            newVillageGeometries.push({
                ...village,
                position,
                radius,
                placedHouses: villageHouses,
                geometries: mergedVillageGeometries,
                treeGeometries: mergedVillageTreeGeometries
            })
        })

        boundsCache.current.union(tempBounds)

        if (!boundsCache.current.isEmpty()) {
            const maxRadius = Math.max(...newVillageGeometries.map(v => v.radius), 0)
            const expansion = maxRadius + 8
            const minX = Math.floor(boundsCache.current.min.x - expansion)
            const maxX = Math.ceil(boundsCache.current.max.x + expansion)
            const minZ = Math.floor(boundsCache.current.min.z - expansion)
            const maxZ = Math.ceil(boundsCache.current.max.z + expansion)

            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const key = `${x},${z}`

                    let isPath = false
                    for (const village of placedVillagesCache.current) {
                        const distance = Math.sqrt(Math.pow(x - village.position.x, 2) + Math.pow(z - village.position.z, 2))
                        if (Math.abs(distance - village.radius) < MAP_SETTINGS.PATH_WIDTH) {
                            isPath = true
                            break
                        }
                    }

                    if (isPath) {
                        if (!dirtCoordsCache.current.has(key)) {
                            dirtCoordsCache.current.add(key)
                            dummy.position.set(x, -0.85, z)
                            dummy.updateMatrix()
                            dirtMatricesCache.current.push(dummy.matrix.clone())
                        }
                    } else {
                        if (!grassCoordsCache.current.has(key)) {
                            grassCoordsCache.current.add(key)
                            dummy.position.set(x, -1, z)
                            dummy.updateMatrix()
                            grassMatricesCache.current.push(dummy.matrix.clone())

                            if (occupiedCoordsCache.current.has(key)) continue

                            if (MAP_SETTINGS.ENABLE_VEGETATION && Math.random() < MAP_SETTINGS.VEGETATION_DENSITY) {
                                const type = Math.random() > MAP_SETTINGS.ROSE_TO_GRASS_RATIO ? 'rose' : 'smallGrass'
                                vegetationSpotsCache.current.push({ position: [x, -0.5, z], type })
                            }
                        }
                    }
                }
            }
        }

        lastProcessedIndex.current = rawVillages.length
        setVillageGeometries(prev => [...prev, ...newVillageGeometries])

    }, [rawVillages])

    const center = useMemo(() => {
        return boundsCache.current.getCenter(new THREE.Vector3())
    }, [villageGeometries])


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