import * as THREE from 'three'
import { MAP_SETTINGS } from '../../config/settings'
import { HouseData, HouseType, PlacedVillage } from '../../types/scene'
import { HOUSE_TIERS } from '../../constants/houses'

export const generateHousePositions = (
    houseCounts: Record<string, number>,
    villageRootPosition: number[],
    existingHouses: HouseData[],
) => {
    const houseTiersToPlace = Object.entries(houseCounts)
        .flatMap(([levelKey, count]) => {
            const tier = HOUSE_TIERS[levelKey]
            return tier ? Array(count).fill(tier) : []
        })
        .sort((a, b) => {
            const footprintA = a.footprint.x * a.footprint.z
            const footprintB = b.footprint.x * b.footprint.z
            if (footprintB !== footprintA) {
                return footprintB - footprintA
            }
            return b.level - a.level
        })

    const houseCount = houseTiersToPlace.length
    if (houseCount === 0) {
        return []
    }

    const generatedHouses: HouseData[] = []
    const rootVec = new THREE.Vector3(villageRootPosition[0], 0, villageRootPosition[2])
    
    const SPACING_MULTIPLIER = 5
    const initialSearchRadius = MAP_SETTINGS.HOUSE_PLACEMENT_BASE_RADIUS + (Math.sqrt(houseCount) * SPACING_MULTIPLIER)

    const checkCollision = (pos: THREE.Vector3, footprintToPlace: { x: number, z: number }, existingHouse: HouseData) => {
        const existingTier = Object.values(HOUSE_TIERS).find(t => t.modelType === existingHouse.type)
        if (!existingTier) return false

        const existingFootprint = existingTier.footprint
        
        const minX1 = pos.x - Math.floor(footprintToPlace.x / 2)
        const maxX1 = pos.x + Math.floor(footprintToPlace.x / 2)
        const minZ1 = pos.z - Math.floor(footprintToPlace.z / 2)
        const maxZ1 = pos.z + Math.floor(footprintToPlace.z / 2)

        const minX2 = existingHouse.position.x - Math.floor(existingFootprint.x / 2)
        const maxX2 = existingHouse.position.x + Math.floor(existingFootprint.x / 2)
        const minZ2 = existingHouse.position.z - Math.floor(existingFootprint.z / 2)
        const maxZ2 = existingHouse.position.z + Math.floor(existingFootprint.z / 2)

        if (minX1 < maxX2 + MAP_SETTINGS.HOUSE_PADDING && maxX1 > minX2 - MAP_SETTINGS.HOUSE_PADDING &&
            minZ1 < maxZ2 + MAP_SETTINGS.HOUSE_PADDING && maxZ1 > minZ2 - MAP_SETTINGS.HOUSE_PADDING) {
            return true
        }
        return false
    }

    for (const tierToPlace of houseTiersToPlace) {
        const footprintToPlace = tierToPlace.footprint
        let housePlaced = false
        let currentSearchRadius = initialSearchRadius

        while (!housePlaced) {
            const candidatePoints: THREE.Vector3[] = []
            const step = 2
            for (let x = -currentSearchRadius; x <= currentSearchRadius; x += step) {
                for (let z = -currentSearchRadius; z <= currentSearchRadius; z += step) {
                    const point = new THREE.Vector3(rootVec.x + x, 0, rootVec.z + z)
                    if (point.distanceTo(rootVec) <= currentSearchRadius) {
                        candidatePoints.push(point)
                    }
                }
            }
            
            candidatePoints.sort((a, b) => a.distanceTo(rootVec) - b.distanceTo(rootVec))

            for (const candidatePos of candidatePoints) {
                let hasCollision = false
                for (const house of existingHouses) {
                    if (checkCollision(candidatePos, footprintToPlace, house)) {
                        hasCollision = true
                        break
                    }
                }
                if (hasCollision) continue

                for (const house of generatedHouses) {
                    if (checkCollision(candidatePos, footprintToPlace, house)) {
                        hasCollision = true
                        break
                    }
                }
                if (hasCollision) continue

                generatedHouses.push({
                    position: candidatePos,
                    type: tierToPlace.modelType as HouseType,
                    rotation: 0
                })
                housePlaced = true
                break
            }

            if (!housePlaced) {
                currentSearchRadius += 5
            }
        }
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
