import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { MapWorkerPayload, MapWorkerRequest, PlacedVillage, VegetationData } from '@/types/scene'
import { createNoise2D } from 'simplex-noise'
import { processVillageBatch } from './utils/villagePlacement'
import { generateWaterLayout, classifyTerrain, getWaterExclusionZone } from './utils/terrainUtils'
import { evaluateTreeSpot, placeVegetation } from './utils/scatteringUtils'

const placedVillagesCache: PlacedVillage[] = []
const villageHouseKeysCache = new Set<string>()
const boundsCache = new THREE.Box3()
const grassCoordsCache = new Set<string>()
const dirtCoordsCache = new Set<string>()
const waterCoordsCache = new Set<string>()
const occupiedCoordsCache = new Set<string>()
const treeEvaluatedCoordsCache = new Set<string>()
const allHousesCache: Array<{x: number, z: number, fx: number, fz: number}> = []

const housesSpatialGrid = new Map<string, Array<{x: number, z: number, fx: number, fz: number}>>()

const noise2D = createNoise2D()
const waterNoise2D = createNoise2D()

self.addEventListener('message', (event: MessageEvent<MapWorkerRequest>) => {
    switch (event.data.type) {
        case 'PROCESS_CHUNK': {
            const { newVillages, startIndex } = event.data

            const dummy = new THREE.Object3D()
            
            const { processedVillages, tempBounds } = processVillageBatch({
                newVillages,
                startIndex,
                placedVillagesCache,
                villageHouseKeysCache,
                housesSpatialGrid,
                allHousesCache
            })

            if (tempBounds.isEmpty()) break

            const occupiedByVillages = new Set<string>(villageHouseKeysCache)
            const expansionTotal = MAP_SETTINGS.BOUNDS_PADDING
            const gridMinX = Math.floor(tempBounds.min.x - expansionTotal)
            const gridMaxX = Math.ceil(tempBounds.max.x + expansionTotal)
            const gridMinZ = Math.floor(tempBounds.min.z - expansionTotal)
            const gridMaxZ = Math.ceil(tempBounds.max.z + expansionTotal)

            const waterExclusionZone = getWaterExclusionZone(
                placedVillagesCache, 
                gridMinX, gridMaxX, gridMinZ, gridMaxZ
            )

            const treeSpots: [number, number, number][] = []
            const treeMinX = Math.floor(tempBounds.min.x)
            const treeMaxX = Math.ceil(tempBounds.max.x)
            const treeMinZ = Math.floor(tempBounds.min.z)
            const treeMaxZ = Math.ceil(tempBounds.max.z)

            for (let x = treeMinX; x <= treeMaxX; x++) {
                for (let z = treeMinZ; z <= treeMaxZ; z++) {
                    const spot = evaluateTreeSpot(
                        x, z, 
                        waterNoise2D, 
                        waterExclusionZone, 
                        occupiedByVillages, 
                        treeEvaluatedCoordsCache, 
                        housesSpatialGrid, 
                        occupiedCoordsCache
                    )
                    if (spot) treeSpots.push(spot)
                }
            }

            boundsCache.union(tempBounds)

            const grassMatrixData: number[] = []
            const dirtMatrixData: number[] = []
            const waterMatrixData: number[] = []
            const newVegetationSpots: VegetationData[] = []

            const finalWaterCoords = generateWaterLayout(
                gridMinX, gridMaxX, gridMinZ, gridMaxZ,
                waterNoise2D,
                waterExclusionZone,
                occupiedByVillages,
                waterCoordsCache
            )

            for (let x = gridMinX; x <= gridMaxX; x++) {
                for (let z = gridMinZ; z <= gridMaxZ; z++) {
                    const key = `${x},${z}`
                    if (grassCoordsCache.has(key) || dirtCoordsCache.has(key) || waterCoordsCache.has(key)) continue

                    const { type, isInsideVillage } = classifyTerrain(x, z, placedVillagesCache, finalWaterCoords)
                    const isOccupiedByObject = occupiedCoordsCache.has(key)
                    const isOccupiedByHouse = occupiedByVillages.has(key)

                    if (type === 'dirt') {
                        dirtCoordsCache.add(key)
                        dummy.position.set(x, -0.48, z)
                    } else if (type === 'water') {
                        waterCoordsCache.add(key)
                        dummy.position.set(x, -0.5, z)
                    } else {
                        grassCoordsCache.add(key)
                        dummy.position.set(x, isInsideVillage ? -0.49 : -0.5, z)

                        const veg = placeVegetation(x, z, noise2D, isOccupiedByObject, isOccupiedByHouse)
                        if (veg) newVegetationSpots.push(veg)
                    }

                    dummy.updateMatrix()
                    const matrixElements = dummy.matrix.elements
                    if (type === 'dirt') dirtMatrixData.push(...matrixElements)
                    else if (type === 'water') waterMatrixData.push(...matrixElements)
                    else grassMatrixData.push(...matrixElements)
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
