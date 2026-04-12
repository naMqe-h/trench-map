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
const allHousesCache: Array<{x: number, z: number, fx: number, fz: number}> = []
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

function isSafeDistanceFromHouses(x: number, z: number, treeFootprint: number, treePadding: number, houses: Array<{x: number, z: number, fx: number, fz: number}>): boolean {
    const tHalf = treeFootprint / 2
    for (const h of houses) {
        const dx = Math.abs(x - h.x)
        const dz = Math.abs(z - h.z)

        const distX = Math.max(0, dx - (tHalf + h.fx / 2))
        const distZ = Math.max(0, dz - (tHalf + h.fz / 2))

        const dist = Math.sqrt(distX * distX + distZ * distZ)

        if (dist < treePadding) {
            return false
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
                    const dist = h.position.length()
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

                placedVillagesCache.push({ position, radius })

                villageHouses.forEach(h => {
                    h.position.add(position)

                    const exactX = h.position.x
                    const exactZ = h.position.z
                    const house_x = Math.round(exactX)
                    const house_z = Math.round(exactZ)
                    
                    const tier = Object.values(HOUSE_TIERS).find(t => t.modelType === h.type)
                    const fx = tier ? tier.footprint.x : MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                    const fz = tier ? tier.footprint.z : MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                    
                    allHousesCache.push({ x: exactX, z: exactZ, fx, fz })

                    const halfX = Math.floor(fx / 2)
                    const halfZ = Math.floor(fz / 2)
                    const minX = house_x - halfX
                    const maxX = house_x + halfX
                    const minZ = house_z - halfZ
                    const maxZ = house_z + halfZ

                    for (let i = minX; i <= maxX; i++) {
                        for (let j = minZ; j <= maxZ; j++) {
                            const key = `${i},${j}`
                            villageHouseKeysCache.add(key)
                        }
                    }
                })

                const localBounds = new THREE.Box3().setFromPoints(villageHouses.map(h => h.position))
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
                        position: h.position.toArray(),
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
                const vMinX = Math.floor(v.position.x - vRadius)
                const vMaxX = Math.ceil(v.position.x + vRadius)
                const vMinZ = Math.floor(v.position.z - vRadius)
                const vMaxZ = Math.ceil(v.position.z + vRadius)

                const startX = Math.max(vMinX, gridMinX)
                const endX = Math.min(vMaxX, gridMaxX)
                const startZ = Math.max(vMinZ, gridMinZ)
                const endZ = Math.min(vMaxZ, gridMaxZ)

                for (let x = startX; x <= endX; x++) {
                    for (let z = startZ; z <= endZ; z++) {
                        const dx = x - v.position.x
                        const dz = z - v.position.z
                        if (dx * dx + dz * dz <= vRadius * vRadius) {
                            waterExclusionZone.add(`${x},${z}`)
                        }
                    }
                }
            }

            const treeSpots: [number, number, number][] = []
            if (!tempBounds.isEmpty()) {
                const treeMinX = gridMinX
                const treeMaxX = gridMaxX
                const treeMinZ = gridMinZ
                const treeMaxZ = gridMaxZ

                for (let x = treeMinX; x <= treeMaxX; x++) {
                    for (let z = treeMinZ; z <= treeMaxZ; z++) {
                        const key = `${x},${z}`
                        if (occupiedByVillages.has(key)) continue

                        if (Math.random() < 1 / MAP_SETTINGS.TREE_DENSITY_DIVISOR) {
                            const wNoise = waterNoise2D(x / MAP_SETTINGS.WATER_NOISE_SCALE, z / MAP_SETTINGS.WATER_NOISE_SCALE)
                            const isWaterCandidate = wNoise < MAP_SETTINGS.WATER_LAKE_THRESHOLD
                            
                            const isWater = isWaterCandidate && !waterExclusionZone.has(key)

                            if (!isWater) {
                                const isSafeFromHouses = isSafeDistanceFromHouses(x, z, MAP_SETTINGS.TREE_FOOTPRINT, MAP_SETTINGS.TREE_PADDING, allHousesCache)
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

                for (const coord of waterCandidates) {
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
                        const dx = x - v.position.x
                        const dz = z - v.position.z
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
