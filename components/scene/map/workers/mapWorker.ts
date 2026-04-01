import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { generateHousePositions, calculateSpiralPosition } from '@/lib/generation/mapGeneration'
import { MapWorkerPayload, MapWorkerRequest, PlacedVillage, ProcessedVillageData, VegetationData, VegetationType } from '@/types/scene'
import { Village } from '@/types/token'
import { createNoise2D } from 'simplex-noise'

const placedVillagesCache: PlacedVillage[] = []
const boundsCache = new THREE.Box3()
const grassCoordsCache = new Set<string>()
const dirtCoordsCache = new Set<string>()
const occupiedCoordsCache = new Set<string>()
const noise2D = createNoise2D()

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
                    const footprint = h.type === 'tenement' ? MAP_SETTINGS.TENEMENT_FOOTPRINT : MAP_SETTINGS.DEFAULT_HOUSE_FOOTPRINT
                    for (let i = -footprint; i <= footprint; i++) {
                        for (let j = -footprint; j <= footprint; j++) {
                            occupiedCoordsCache.add(`${house_x + i},${house_z + j}`)
                        }
                    }
                })

                const localBounds = new THREE.Box3().setFromPoints(villageHouses.map(h => h.position))
                tempBounds.union(localBounds)

                const villageMinX = Math.floor(localBounds.min.x - MAP_SETTINGS.VILLAGE_PADDING);
                const villageMaxX = Math.ceil(localBounds.max.x + MAP_SETTINGS.VILLAGE_PADDING);
                const villageMinZ = Math.floor(localBounds.min.z - MAP_SETTINGS.VILLAGE_PADDING);
                const villageMaxZ = Math.ceil(localBounds.max.z + MAP_SETTINGS.VILLAGE_PADDING);

                const treeSpots: [number, number, number][] = []

                for (let x = villageMinX; x <= villageMaxX; x++) {
                    for (let z = villageMinZ; z <= villageMaxZ; z++) {
                        const key = `${x},${z}`
                        if (occupiedCoordsCache.has(key)) continue;

                        if (Math.random() < 1 / MAP_SETTINGS.TREE_DENSITY_DIVISOR) {
                            treeSpots.push([x, 0.5, z])
                        }
                    }
                }

                processedVillages.push({
                    village,
                    position: position.toArray(),
                    radius,
                    villageHouses: villageHouses.map(h => ({
                        position: h.position.toArray(),
                        type: h.type
                    })),
                    treeSpots
                })
            })

            boundsCache.union(tempBounds)

            const newGrassMatrices: number[][] = []
            const newDirtMatrices: number[][] = []
            const newVegetationSpots: VegetationData[] = []

            if (!boundsCache.isEmpty()) {
                const maxRadius = Math.max(...processedVillages.map(v => v.radius), 0)
                const expansion = maxRadius + 8
                const minX = Math.floor(boundsCache.min.x - expansion)
                const maxX = Math.ceil(boundsCache.max.x + expansion)
                const minZ = Math.floor(boundsCache.min.z - expansion)
                const maxZ = Math.ceil(boundsCache.max.z + expansion)

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
                                newDirtMatrices.push([...dummy.matrix.elements])
                            }
                        } else {
                            if (!grassCoordsCache.has(key)) {
                                grassCoordsCache.add(key)
                                dummy.position.set(x, -0.5, z)
                                dummy.updateMatrix()
                                newGrassMatrices.push([...dummy.matrix.elements])

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

            const payload: MapWorkerPayload = {
                processedVillages,
                newGrassMatrices,
                newDirtMatrices,
                newVegetationSpots,
                center: center.toArray(),
                type: 'CHUNK_PROCESSED'
            }

            self.postMessage(payload)
            break
        }
        default:
            console.error('Unknown message type in map worker:', event.data)
            break
    }
})
