import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'
import { PlacedVillage } from '@/types/scene'

/**
 * Calculates a set of coordinates where water is forbidden (around villages).
 */
export function getWaterExclusionZone(
    placedVillages: PlacedVillage[],
    gridMinX: number,
    gridMaxX: number,
    gridMinZ: number,
    gridMaxZ: number
): Set<string> {
    const waterExclusionZone = new Set<string>()

    for (const v of placedVillages) {
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

    return waterExclusionZone
}

/**
 * Identifies water candidates and filters them using BFS to remove small puddles.
 */
export function generateWaterLayout(
    gridMinX: number,
    gridMaxX: number,
    gridMinZ: number,
    gridMaxZ: number,
    waterNoise2D: (x: number, y: number) => number,
    waterExclusionZone: Set<string>,
    occupiedByVillages: Set<string>,
    waterCoordsCache: Set<string>
): Set<string> {
    const waterCandidates = new Set<string>()

    for (let x = gridMinX; x <= gridMaxX; x++) {
        for (let z = gridMinZ; z <= gridMaxZ; z++) {
            const key = `${x},${z}`
            if (waterCoordsCache.has(key)) continue

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

    return finalWaterCoords
}

/**
 * Classifies a grid coordinate into its terrain type (Dirt, Grass, or Water).
 */
export function classifyTerrain(
    x: number,
    z: number,
    placedVillages: PlacedVillage[],
    finalWaterCoords: Set<string>
): { type: 'dirt' | 'grass' | 'water'; isInsideVillage: boolean } {
    const key = `${x},${z}`
    let isBorder = false
    let isInsideVillage = false

    for (const v of placedVillages) {
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

    if (isBorder) return { type: 'dirt', isInsideVillage }
    if (finalWaterCoords.has(key)) return { type: 'water', isInsideVillage }
    return { type: 'grass', isInsideVillage }
}
