import * as THREE from 'three'
import { MAP_SETTINGS } from '../../config/settings'
import { HouseData, HouseType, PlacedVillage } from '../../types/scene'
import { HOUSE_TIERS } from '../../constants/houses'

export const generateHousePositions = (
    houseCounts: Record<string, number>,
    villageRootPosition: number[],
    existingHouses: HouseData[],
    minDistance: number
) => {
    const types: HouseType[] = []
    Object.entries(houseCounts).forEach(([levelKey, count]) => {
        const tier = HOUSE_TIERS[levelKey]
        if (tier && tier.modelType) {
            for (let i = 0; i < count; i++) {
                types.push(tier.modelType as HouseType)
            }
        }
    })

    const houseCount = types.length
    if (houseCount === 0) {
        return []
    }

    const generatedHouses: HouseData[] = []
    const rootVec = new THREE.Vector3(villageRootPosition[0], 0, villageRootPosition[2])

    const potentialPositions: THREE.Vector3[] = []
    const searchRadius = MAP_SETTINGS.HOUSE_PLACEMENT_BASE_RADIUS + (houseCount * MAP_SETTINGS.HOUSE_PLACEMENT_RADIUS_MULTIPLIER)
    const gridSize = Math.ceil(searchRadius / minDistance)

    for (let i = -gridSize; i <= gridSize; i++) {
        for (let j = -gridSize; j <= gridSize; j++) {
            const x = rootVec.x + i * minDistance
            const z = rootVec.z + j * minDistance
            const point = new THREE.Vector3(x, 0, z)
            
            if (rootVec.distanceTo(point) <= searchRadius) {
                potentialPositions.push(point)
            }
        }
    }

    potentialPositions.sort((a, b) => a.distanceTo(rootVec) - b.distanceTo(rootVec))

    for (const pos of potentialPositions) {
        if (generatedHouses.length >= houseCount) {
            break
        }

        let hasCollision = false

        for (const house of existingHouses) {
            if (pos.distanceTo(house.position) < minDistance) {
                hasCollision = true
                break
            }
        }
        if (hasCollision) continue

        for (const house of generatedHouses) {
            if (pos.distanceTo(house.position) < minDistance) {
                hasCollision = true
                break
            }
        }
        if (hasCollision) continue

        generatedHouses.push({
            position: pos,
            type: types[generatedHouses.length],
        })
    }
    
    if (generatedHouses.length < houseCount) {
        console.warn(`Could not place all houses for a village. Placed ${generatedHouses.length}/${houseCount}`)
    }
    
    return generatedHouses
}



export const calculateSpiralPosition = (index: number, villageRadius: number, placedVillages: PlacedVillage[], padding: number = MAP_SETTINGS.VILLAGE_PADDING): THREE.Vector3 => {
    if (index === 0) {
        return new THREE.Vector3(0, 0, 0)
    }

    let attempt = index
    const scale = MAP_SETTINGS.SPIRAL_SCALE

    while (true) {
        const angle = attempt * MAP_SETTINGS.SPIRAL_ANGLE_CONSTANT
        const r = scale * Math.sqrt(attempt)
        const x = r * Math.cos(angle)
        const z = r * Math.sin(angle)
        const testPos = new THREE.Vector3(x, 0, z)

        const hasCollision = placedVillages.some(v => v.position.distanceTo(testPos) < (villageRadius + v.radius + padding))
        
        if (hasCollision) {
            attempt += MAP_SETTINGS.SPIRAL_COLLISION_STEP
        } else {
            return testPos
        }
    }
}
