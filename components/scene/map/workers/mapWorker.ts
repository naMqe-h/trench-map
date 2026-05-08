import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { generateHousePositions, calculateSpiralPosition } from '@/lib/generation/mapGeneration'
import { MapWorkerPayload, MapWorkerRequest, PlacedVillage, ProcessedVillageData, VegetationData, VegetationType } from '@/types/scene'
import { Village } from '@/types/token'
import { createNoise2D } from 'simplex-noise'
import { HOUSE_TIERS } from '@/constants/houses'

const placedVillagesCache: PlacedVillage[] = []
const villageHouseKeysCache = new Set<string>()
const boundsCache = new THREE.Box3()
const grassCoordsCache = new Set<string>()
const dirtCoordsCache = new Set<string>()
const waterCoordsCache = new Set<string>()
const occupiedCoordsCache = new Set<string>()
const treeEvaluatedCoordsCache = new Set<string>()
const allHousesCache: Array<{x: number, z: number, fx: number, fz: number}> = []

const GRID_CELL_SIZE = 50
const housesSpatialGrid = new Map<string, Array<{x: number, z: number, fx: number, fz: number}>>()
const getCellKey = (x: number, z: number) => `${Math.floor(x / GRID_CELL_SIZE)},${Math.floor(z / GRID_CELL_SIZE)}`

const noise2D = createNoise2D()
const waterNoise2D = createNoise2D()

function isSpaceFree(x: number, z: number, size: number, padding: number, occupiedSet: Set<string>): boolean {
    const halfExclusion = Math.floor((size + 2 * padding) / 2)
    for (let dx = -halfExclusion; dx <= halfExclusion; dx++) {
        for (let dz = -halfExclusion; dz <= halfExclusion; dz++) {
            if (occupiedSet.has(`${x + dx},${z + dz}`)) {
                return false
            }
        }
    }
    return true
}

function markOccupied(x: number, z: number, size: number, occupiedSet: Set<string>) {
    const halfSize = Math.floor(size / 2)
    for (let dx = -halfSize; dx <= halfSize; dx++) {
        for (let dz = -halfSize; dz <= halfSize; dz++) {
            occupiedSet.add(`${x + dx},${z + dz}`)
        }
    }
}

function isSafeDistanceFromHouses(x: number, z: number, treeFootprint: number, treePadding: number, spatialGrid: Map<string, Array<{x: number, z: number, fx: number, fz: number}>>): boolean {
    const treeRadius = treeFootprint / 2
    const cellX = Math.floor(x / GRID_CELL_SIZE)
    const cellZ = Math.floor(z / GRID_CELL_SIZE)

    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            const key = `${cellX + dx},${cellZ + dz}`
            const houses = spatialGrid.get(key)
            if (!houses) continue

            for (const h of houses) {
                const houseDx = x - h.x
                const houseDz = z - h.z
                const dist = Math.hypot(houseDx, houseDz)

                const houseRadius = Math.max(h.fx, h.fz) / 2

                if (dist < (treeRadius + houseRadius + treePadding)) {
                    return false
                }
            }
        }
    }
    return true
}

self.addEventListener('message', (event: MessageEvent<MapWorkerRequest>) => {
    switch (event.data.type) {
        case 'PROCESS_CHUNK': {
            const { newVillages, startIndex } = event.data

            const dummy = new THREE.Object3D()
            const tempBounds = new THREE.Box3()

            const processedVillages: ProcessedVillageData[] = []

            newVillages.forEach((village: Village, index: number) => {
                const villageHouses = generateHousePositions(village.houses, [0, 0, 0], [])
                let maxDist = 0
                villageHouses.forEach(h => {
                    const [hx, hy, hz] = h.position
                    const dist = Math.hypot(hx, hz)
                    if (dist > maxDist) maxDist = dist
                })
                const radius = maxDist + MAP_SETTINGS.VILLAGE_RADIUS_PADDING

                const spiralIndex = village.forcedIndex !== undefined ? village.forcedIndex : startIndex + index
                const position = calculateSpiralPosition(
                    spiralIndex, 
                    radius, 
                    placedVillagesCache, 
                    MAP_SETTINGS.VILLAGE_PADDING
                )

                placedVillagesCache.push({ position: position.toArray(), radius })

                villageHouses.forEach(h => {
                    const worldPos = new THREE.Vector3().fromArray(h.position).add(position)
                    const exactX = worldPos.x
                    const exactZ = worldPos.z
                    
                    const tier: any = Object.values(HOUSE_TIERS).find((t: any) => t.modelType === h.type)
                    const fx = tier ? tier.footprint.x : MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                    const fz = tier ? tier.footprint.z : MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                    
                    const houseData = { x: exactX, z: exactZ, fx, fz }
                    allHousesCache.push(houseData)
                    
                    const cellKey = getCellKey(exactX, exactZ)
                    if (!housesSpatialGrid.has(cellKey)) {
                        housesSpatialGrid.set(cellKey, [])
                    }
                    housesSpatialGrid.get(cellKey)!.push(houseData)

                    const halfX = Math.floor(fx / 2)
                    const halfZ = Math.floor(fz / 2)
                    const minX = Math.round(exactX) - halfX
                    const maxX = Math.round(exactX) + halfX
                    const minZ = Math.round(exactZ) - halfZ
                    const maxZ = Math.round(exactZ) + halfZ

                    for (let i = minX; i <= maxX; i++) {
                        for (let j = minZ; j <= maxZ; j++) {
                            const key = `${i},${j}`
                            villageHouseKeysCache.add(key)
                        }
                    }

                    h.position = worldPos.toArray()
                })

                const localBounds = new THREE.Box3().setFromPoints(villageHouses.map(h => new THREE.Vector3().fromArray(h.position)))
                tempBounds.union(localBounds)

                const circleBounds = new THREE.Box3().setFromCenterAndSize(
                    position,
                    new THREE.Vector3(radius * 2 + 4, 0, radius * 2 + 4)
                )
                tempBounds.union(circleBounds)

                processedVillages.push({
                    village,
                    position: position.toArray(),
                    radius,
                    villageHouses: villageHouses.map(h => ({
                        position: h.position,
                        type: h.type,
                        rotation: h.rotation || 0
                    })),
                    treeSpots: []
                })
            })

            const occupiedByVillages = new Set<string>(villageHouseKeysCache)
            const waterExclusionZone = new Set<string>()

            const expansionTotal = MAP_SETTINGS.BOUNDS_PADDING
            const gridMinX = Math.floor(tempBounds.min.x - expansionTotal)
            const gridMaxX = Math.ceil(tempBounds.max.x + expansionTotal)
            const gridMinZ = Math.floor(tempBounds.min.z - expansionTotal)
            const gridMaxZ = Math.ceil(tempBounds.max.z + expansionTotal)

            for (const v of placedVillagesCache) {
                const vRadius = v.radius + 2
                const [vx, vy, vz] = v.position
                const vMinX = Math.floor(vx - vRadius)
                const vMaxX = Math.ceil(vx + vRadius)
                const vMinZ = Math.floor(vz - vRadius)
                const vMaxZ = Math.ceil(vz + vRadius)

                const startX = Math.max(vMinX, gridMinX)
                const endX = Math.min(vMaxX, gridMaxX)
                const startZ = Math.max(vMinZ, gridMinZ)
                const endZ = Math.min(vMaxZ, gridMaxZ)

                for (let x = startX; x <= endX; x++) {
                    for (let z = startZ; z <= endZ; z++) {
                        const dx = x - vx
                        const dz = z - vz
                        if (dx * dx + dz * dz <= vRadius * vRadius) {
                            waterExclusionZone.add(`${x},${z}`)
                        }
                    }
                }
            }

            const treeSpots: [number, number, number][] = []
            if (!tempBounds.isEmpty()) {
                const treeMinX = Math.floor(tempBounds.min.x)
                const treeMaxX = Math.ceil(tempBounds.max.x)
                const treeMinZ = Math.floor(tempBounds.min.z)
                const treeMaxZ = Math.ceil(tempBounds.max.z)

                for (let x = treeMinX; x <= treeMaxX; x++) {
                    for (let z = treeMinZ; z <= treeMaxZ; z++) {
                        const key = `${x},${z}`
                        
                        if (treeEvaluatedCoordsCache.has(key)) continue
                        treeEvaluatedCoordsCache.add(key)

                        if (occupiedByVillages.has(key)) continue

                        if (Math.random() < 1 / MAP_SETTINGS.TREE_DENSITY_DIVISOR) {
                            const wNoise = waterNoise2D(x / MAP_SETTINGS.WATER_NOISE_SCALE, z / MAP_SETTINGS.WATER_NOISE_SCALE)
                            const isWaterCandidate = wNoise < MAP_SETTINGS.WATER_LAKE_THRESHOLD
                            
                            const isWater = isWaterCandidate && !waterExclusionZone.has(key)

                            if (!isWater) {
                                const isSafeFromHouses = isSafeDistanceFromHouses(x, z, MAP_SETTINGS.TREE_FOOTPRINT, MAP_SETTINGS.TREE_PADDING, housesSpatialGrid)
                                if (isSafeFromHouses && isSpaceFree(x, z, MAP_SETTINGS.TREE_FOOTPRINT, MAP_SETTINGS.TREE_PADDING, occupiedCoordsCache)) {
                                    treeSpots.push([x, 0.5, z])
                                    markOccupied(x, z, MAP_SETTINGS.TREE_FOOTPRINT, occupiedCoordsCache)
                                }
                            }
                        }
                    }
                }
            }

            boundsCache.union(tempBounds)

            const grassMatrixData: number[] = []
            const dirtMatrixData: number[] = []
            const waterMatrixData: number[] = []
            const newVegetationSpots: VegetationData[] = []

            if (!tempBounds.isEmpty()) {
                const flowerTypes: VegetationType[] = ['rose', 'tulip', 'dandelion']
                const waterCandidates = new Set<string>()
                const gridCoords: string[] = []

                for (let x = gridMinX; x <= gridMaxX; x++) {
                    for (let z = gridMinZ; z <= gridMaxZ; z++) {
                        const key = `${x},${z}`
                        
                        gridCoords.push(key)

                        if (grassCoordsCache.has(key) || dirtCoordsCache.has(key) || waterCoordsCache.has(key)) continue

                        const isOccupiedByHouse = occupiedByVillages.has(key)
                        const isExcludedFromWater = waterExclusionZone.has(key)
                        const wNoise = waterNoise2D(x / MAP_SETTINGS.WATER_NOISE_SCALE, z / MAP_SETTINGS.WATER_NOISE_SCALE)
                        const isWaterCandidate = !isExcludedFromWater && wNoise < MAP_SETTINGS.WATER_LAKE_THRESHOLD

                        if (isWaterCandidate && !isOccupiedByHouse) {
                            waterCandidates.add(key)
                        }
                    }
                }

                const finalWaterCoords = new Set<string>()
                const visited = new Set<string>()

                for (const coord of Array.from(waterCandidates)) {
                    if (visited.has(coord)) continue

                    const group: string[] = []
                    const queue = [coord]
                    visited.add(coord)
                    let head = 0
                    let connectsToExisting = false

                    while (head < queue.length) {
                        const current = queue[head++]
                        group.push(current)

                        const [cx, cz] = current.split(',').map(Number)
                        const neighbors = [
                            `${cx + 1},${cz}`,
                            `${cx - 1},${cz}`,
                            `${cx},${cz + 1}`,
                            `${cx},${cz - 1}`
                        ]

                        for (const n of neighbors) {
                            if (waterCandidates.has(n) && !visited.has(n)) {
                                visited.add(n)
                                queue.push(n)
                            } else if (waterCoordsCache.has(n)) {
                                connectsToExisting = true
                            }
                        }
                    }

                    if (group.length >= 15 || connectsToExisting) {
                        group.forEach(c => finalWaterCoords.add(c))
                    }
                }

                for (const key of gridCoords) {
                    const [x, z] = key.split(',').map(Number)
                    const isOccupiedByObject = occupiedCoordsCache.has(key)
                    const isOccupiedByHouse = occupiedByVillages.has(key)

                    let isBorder = false
                    let isInsideVillage = false

                    for (const v of placedVillagesCache) {
                        const [vx, vy, vz] = v.position
                        const dx = x - vx
                        const dz = z - vz
                        const distSq = dx * dx + dz * dz
                        const inner = (v.radius - MAP_SETTINGS.PATH_WIDTH) ** 2
                        const outer = (v.radius + MAP_SETTINGS.PATH_WIDTH) ** 2
                        
                        if (distSq >= inner && distSq <= outer) {
                            isBorder = true
                            break
                        } else if (distSq < inner) {
                            isInsideVillage = true
                        }
                    }

                    if (isBorder) {
                        if (!dirtCoordsCache.has(key)) {
                            dirtCoordsCache.add(key)
                            dummy.position.set(x, -0.48, z)
                            dummy.updateMatrix()
                            dirtMatrixData.push(...dummy.matrix.elements)
                        }
                        continue
                    }

                    if (isInsideVillage) {
                        if (!grassCoordsCache.has(key)) {
                            grassCoordsCache.add(key)
                            dummy.position.set(x, -0.49, z)
                            dummy.updateMatrix()
                            grassMatrixData.push(...dummy.matrix.elements)

                            if (!isOccupiedByObject && !isOccupiedByHouse) {
                                const noiseValue = noise2D(x / MAP_SETTINGS.VEGETATION_NOISE_SCALE, z / MAP_SETTINGS.VEGETATION_NOISE_SCALE)
                                if (MAP_SETTINGS.ENABLE_VEGETATION && noiseValue > MAP_SETTINGS.VEGETATION_THRESHOLD) {
                                    let type: VegetationType
                                    if (Math.random() > MAP_SETTINGS.GRASS_TO_FLOWER_RATIO) {
                                        type = 'smallGrass'
                                    } else {
                                        type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
                                    }
                                    newVegetationSpots.push({ position: [x, 0, z], type })
                                }
                            }
                        }
                        continue
                    }

                    if (grassCoordsCache.has(key) || dirtCoordsCache.has(key) || waterCoordsCache.has(key)) continue

                    if (finalWaterCoords.has(key)) {
                        waterCoordsCache.add(key)
                        dummy.position.set(x, -0.5, z)
                        dummy.updateMatrix()
                        waterMatrixData.push(...dummy.matrix.elements)
                        continue
                    }

                    grassCoordsCache.add(key)
                    dummy.position.set(x, -0.5, z)
                    dummy.updateMatrix()
                    grassMatrixData.push(...dummy.matrix.elements)

                    if (isOccupiedByObject || isOccupiedByHouse) continue

                    const noiseValue = noise2D(x / MAP_SETTINGS.VEGETATION_NOISE_SCALE, z / MAP_SETTINGS.VEGETATION_NOISE_SCALE)

                    if (MAP_SETTINGS.ENABLE_VEGETATION && noiseValue > MAP_SETTINGS.VEGETATION_THRESHOLD) {
                        let type: VegetationType
                        if (Math.random() > MAP_SETTINGS.GRASS_TO_FLOWER_RATIO) {
                            type = 'smallGrass'
                        } else {
                            type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
                        }
                        newVegetationSpots.push({ position: [x, 0, z], type })
                    }
                }
            }

            const center = new THREE.Vector3()
            boundsCache.getCenter(center)

            const grassMatrices = new Float32Array(grassMatrixData)
            const dirtMatrices = new Float32Array(dirtMatrixData)
            const waterMatrices = new Float32Array(waterMatrixData)

            const payload: MapWorkerPayload = {
                processedVillages,
                newGrassMatrices: grassMatrices,
                newDirtMatrices: dirtMatrices,
                newWaterMatrices: waterMatrices,
                newVegetationSpots,
                treeSpots,
                center: center.toArray(),
                type: 'CHUNK_PROCESSED'
            }

            const workerScope = self as unknown as DedicatedWorkerGlobalScope
            workerScope.postMessage(payload, [grassMatrices.buffer, dirtMatrices.buffer, waterMatrices.buffer])
            break
        }
        default:
            console.error('Unknown message type in map worker:', event.data)
            break
    }
})
