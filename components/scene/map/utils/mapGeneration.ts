import * as THREE from 'three'
import { MAP_SETTINGS } from '@/config/settings'

export type HouseType = 'singleStory' | 'twoStory' | 'tenement'

export type HouseData = {
    position: THREE.Vector3
    type: HouseType
}

export const generateHousePositions = (
    houseCounts: { singleStory: number, twoStory: number, tenement: number },
    villageRootPosition: number[],
    existingHouses: HouseData[],
    minDistance: number
) => {
    const types: HouseType[] = [
        ...Array(houseCounts.tenement).fill('tenement'),
        ...Array(houseCounts.twoStory).fill('twoStory'),
        ...Array(houseCounts.singleStory).fill('singleStory')
    ]
    
    const houseCount = types.length
    const generatedHouses: HouseData[] = []
    const maxTotalAttempts = houseCount * MAP_SETTINGS.MAX_PLACEMENT_ATTEMPTS_MULTIPLIER
    let attempts = 0
    const baseRadius = MAP_SETTINGS.HOUSE_PLACEMENT_BASE_RADIUS + (houseCount * MAP_SETTINGS.HOUSE_PLACEMENT_RADIUS_MULTIPLIER)

    while (generatedHouses.length < houseCount && attempts < maxTotalAttempts) {
        attempts++
        const randomAngle = Math.random() * 2 * Math.PI
        const randomRadius = baseRadius + Math.random() * MAP_SETTINGS.HOUSE_PLACEMENT_RANDOM_RADIUS
        const houseX = villageRootPosition[0] + Math.cos(randomAngle) * randomRadius
        const houseZ = villageRootPosition[2] + Math.sin(randomAngle) * randomRadius
        const newPos = new THREE.Vector3(houseX, 0, houseZ)

        let hasCollision = false
        for (const house of [...existingHouses, ...generatedHouses]) {
            if (newPos.distanceTo(house.position) < minDistance) {
                hasCollision = true
                break
            }
        }

        if (!hasCollision) {
            generatedHouses.push({
                position: newPos,
                type: types[generatedHouses.length]
            })
        }
    }
    
    if (generatedHouses.length < houseCount) {
        console.warn(`Could not place all houses for a village. Placed ${generatedHouses.length}/${houseCount}`)
    }
    
    return generatedHouses
}

export interface PlacedVillage { 
    position: THREE.Vector3, 
    radius: number 
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
