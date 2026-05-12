import { MAP_SETTINGS } from '@/config/settings'
import { VegetationData, VegetationType } from '@/types/scene'
import { isSpaceFree, markOccupied } from './gridUtils'
import { isSafeDistanceFromHouses } from './villagePlacement'

/**
 * Evaluates a coordinate for potential tree placement.
 */
export function evaluateTreeSpot(
    x: number,
    z: number,
    waterNoise2D: (x: number, y: number) => number,
    waterExclusionZone: Set<string>,
    occupiedByVillages: Set<string>,
    treeEvaluatedCoordsCache: Set<string>,
    housesSpatialGrid: Map<string, Array<{ x: number; z: number; fx: number; fz: number }>>,
    occupiedCoordsCache: Set<string>
): [number, number, number] | null {
    const key = `${x},${z}`

    if (treeEvaluatedCoordsCache.has(key)) return null
    treeEvaluatedCoordsCache.add(key)

    if (occupiedByVillages.has(key)) return null

    if (Math.random() < 1 / MAP_SETTINGS.TREE_DENSITY_DIVISOR) {
        const wNoise = waterNoise2D(x / MAP_SETTINGS.WATER_NOISE_SCALE, z / MAP_SETTINGS.WATER_NOISE_SCALE)
        const isWaterCandidate = wNoise < MAP_SETTINGS.WATER_LAKE_THRESHOLD
        const isWater = isWaterCandidate && !waterExclusionZone.has(key)

        if (!isWater) {
            const isSafeFromHouses = isSafeDistanceFromHouses(x, z, MAP_SETTINGS.TREE_FOOTPRINT, MAP_SETTINGS.TREE_PADDING, housesSpatialGrid)
            if (isSafeFromHouses && isSpaceFree(x, z, MAP_SETTINGS.TREE_FOOTPRINT, MAP_SETTINGS.TREE_PADDING, occupiedCoordsCache)) {
                markOccupied(x, z, MAP_SETTINGS.TREE_FOOTPRINT, occupiedCoordsCache)
                return [x, 0.5, z]
            }
        }
    }

    return null
}

/**
 * Places vegetation (flowers or small grass) based on noise and probability.
 */
export function placeVegetation(
    x: number,
    z: number,
    noise2D: (x: number, y: number) => number,
    isOccupiedByObject: boolean,
    isOccupiedByHouse: boolean
): VegetationData | null {
    if (isOccupiedByObject || isOccupiedByHouse) return null

    const noiseValue = noise2D(x / MAP_SETTINGS.VEGETATION_NOISE_SCALE, z / MAP_SETTINGS.VEGETATION_NOISE_SCALE)

    if (MAP_SETTINGS.ENABLE_VEGETATION && noiseValue > MAP_SETTINGS.VEGETATION_THRESHOLD) {
        const flowerTypes: VegetationType[] = ['rose', 'tulip', 'dandelion']
        let type: VegetationType
        if (Math.random() > MAP_SETTINGS.GRASS_TO_FLOWER_RATIO) {
            type = 'smallGrass'
        } else {
            type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
        }
        return { position: [x, 0, z], type }
    }

    return null
}
