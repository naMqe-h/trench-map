import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { HOUSE_TIERS } from '@/constants/houses'
import { Village } from '@/types/token'
import { PlacedVillage, ProcessedVillageData } from '@/types/scene'
import { generateHousePositions, calculateSpiralPosition } from '@/lib/generation/mapGeneration'
import { getCellKey, GRID_CELL_SIZE } from './gridUtils'

export interface VillageBatchParams {
    newVillages: Village[]
    startIndex: number
    placedVillagesCache: PlacedVillage[]
    villageHouseKeysCache: Set<string>
    housesSpatialGrid: Map<string, Array<{ x: number; z: number; fx: number; fz: number }>>
    allHousesCache: Array<{ x: number; z: number; fx: number; fz: number }>
}

/**
 * Processes a batch of villages, calculating their positions, projecting houses, 
 * and updating spatial indexes for collision detection.
 */
export function processVillageBatch({
    newVillages,
    startIndex,
    placedVillagesCache,
    villageHouseKeysCache,
    housesSpatialGrid,
    allHousesCache
}: VillageBatchParams) {
    const tempBounds = new THREE.Box3()
    const processedVillages: ProcessedVillageData[] = []

    newVillages.forEach((village, index) => {
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

    return { processedVillages, tempBounds }
}

/**
 * Checks if a position is at a safe distance from all placed houses.
 */
export function isSafeDistanceFromHouses(
    x: number, 
    z: number, 
    treeFootprint: number, 
    treePadding: number, 
    spatialGrid: Map<string, Array<{ x: number; z: number; fx: number; fz: number }>>
): boolean {
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
