import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { generateHousePositions, calculateSpiralPosition } from '@/lib/generation/mapGeneration'
import { MapWorkerPayload, MapWorkerRequest, PlacedVillage, ProcessedVillageData, VegetationData, VegetationType } from '@/types/scene'
import { Village } from '@/types/token'
import { createNoise2D } from 'simplex-noise'
import { HOUSE_TIERS } from '@/constants/houses'

const placedVillagesCache: PlacedVillage[] = []
const boundsCache = new THREE.Box3()
const grassCoordsCache = new Set<string>()
const dirtCoordsCache = new Set<string>()
const occupiedCoordsCache = new Set<string>()
const noise2D = createNoise2D()

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
                const position = calculateSpiralPosition(spiralIndex, radius, placedVillagesCache, MAP_SETTINGS.VILLAGE_PADDING)

                placedVillagesCache.push({ position, radius })

                villageHouses.forEach(h => {
                    h.position.add(position)

                    const house_x = Math.round(h.position.x)
                    const house_z = Math.round(h.position.z)
                    
                    const tier = Object.values(HOUSE_TIERS).find(t => t.modelType === h.type)
                    if (tier) {
                        const halfFootprintX = Math.floor(tier.footprint.x / 2)
                        const halfFootprintZ = Math.floor(tier.footprint.z / 2)

                        for (let i = -halfFootprintX; i <= halfFootprintX; i++) {
                            for (let j = -halfFootprintZ; j <= halfFootprintZ; j++) {
                                occupiedCoordsCache.add(`${house_x + i},${house_z + j}`)
                            }
                        }
                    } else {
                        const footprint = MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                        for (let i = -footprint; i <= footprint; i++) {
                            for (let j = -footprint; j <= footprint; j++) {
                                occupiedCoordsCache.add(`${house_x + i},${house_z + j}`)
                            }
                        }
                    }
                })

                const localBounds = new THREE.Box3().setFromPoints(villageHouses.map(h => h.position))
                tempBounds.union(localBounds)

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

            const treeSpots: [number, number, number][] = []
            if (!tempBounds.isEmpty()) {
                const treeMinX = Math.floor(tempBounds.min.x - MAP_SETTINGS.VILLAGE_PADDING * 2);
                const treeMaxX = Math.ceil(tempBounds.max.x + MAP_SETTINGS.VILLAGE_PADDING * 2);
                const treeMinZ = Math.floor(tempBounds.min.z - MAP_SETTINGS.VILLAGE_PADDING * 2);
                const treeMaxZ = Math.ceil(tempBounds.max.z + MAP_SETTINGS.VILLAGE_PADDING * 2);

                for (let x = treeMinX; x <= treeMaxX; x++) {
                    for (let z = treeMinZ; z <= treeMaxZ; z++) {
                        if (Math.random() < 1 / MAP_SETTINGS.TREE_DENSITY_DIVISOR) {
                            if (isSpaceFree(x, z, MAP_SETTINGS.TREE_FOOTPRINT, MAP_SETTINGS.TREE_PADDING, occupiedCoordsCache)) {
                                treeSpots.push([x, 0.5, z])
                                markOccupied(x, z, MAP_SETTINGS.TREE_FOOTPRINT, occupiedCoordsCache)
                            }
                        }
                    }
                }
            }

            boundsCache.union(tempBounds)

            const grassMatrixData: number[] = []
            const dirtMatrixData: number[] = []
            const newVegetationSpots: VegetationData[] = []

            if (!tempBounds.isEmpty()) {
                const maxRadius = Math.max(...processedVillages.map(v => v.radius), 0)
                const expansion = maxRadius + 8
                const minX = Math.floor(tempBounds.min.x - expansion)
                const maxX = Math.ceil(tempBounds.max.x + expansion)
                const minZ = Math.floor(tempBounds.min.z - expansion)
                const maxZ = Math.ceil(tempBounds.max.z + expansion)

                const flowerTypes: VegetationType[] = ['rose', 'tulip', 'dandelion']

                for (let x = minX; x <= maxX; x++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        const key = `${x},${z}`

                        let isPath = false
                        for (const village of placedVillagesCache) {
                            const distance = Math.sqrt(Math.pow(x - village.position.x, 2) + Math.pow(z - village.position.z, 2))
                            if (Math.abs(distance - village.radius) < MAP_SETTINGS.PATH_WIDTH) {
                                isPath = true
                                break
                            }
                        }

                        if (isPath) {
                            if (!dirtCoordsCache.has(key)) {
                                dirtCoordsCache.add(key)
                                dummy.position.set(x, -0.5, z)
                                dummy.updateMatrix()
                                dirtMatrixData.push(...dummy.matrix.elements)
                            }
                        } else {
                            if (!grassCoordsCache.has(key)) {
                                grassCoordsCache.add(key)
                                dummy.position.set(x, -0.5, z)
                                dummy.updateMatrix()
                                grassMatrixData.push(...dummy.matrix.elements)

                                if (occupiedCoordsCache.has(key)) continue

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
                    }
                }
            }

            const center = new THREE.Vector3()
            boundsCache.getCenter(center)

            const grassMatrices = new Float32Array(grassMatrixData)
            const dirtMatrices = new Float32Array(dirtMatrixData)

            const payload: MapWorkerPayload = {
                processedVillages,
                newGrassMatrices: grassMatrices,
                newDirtMatrices: dirtMatrices,
                newVegetationSpots,
                treeSpots,
                center: center.toArray(),
                type: 'CHUNK_PROCESSED'
            }

            const workerScope = self as unknown as DedicatedWorkerGlobalScope
            workerScope.postMessage(payload, [grassMatrices.buffer, dirtMatrices.buffer])
            break
        }
        default:
            console.error('Unknown message type in map worker:', event.data)
            break
    }
})
