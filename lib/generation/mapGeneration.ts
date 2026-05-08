import * as THREE from 'three'
import { MAP_SETTINGS } from '../../config/settings'
import { HouseData, HouseType, PlacedVillage, SerializedVector3 } from '../../types/scene'
import { HOUSE_TIERS } from '../../constants/houses'

interface InternalHouseData {
    position: THREE.Vector3
    type: HouseType
    rotation?: number
}

export const generateHousePositions = (
    houseCounts: Record<string, number>,
    villageRootPosition: number[],
    existingHouses: HouseData[],
): HouseData[] => {
    const generatedHouses: InternalHouseData[] = []
    const rootVec = new THREE.Vector3(villageRootPosition[0], 0, villageRootPosition[2])

    const rawTownHallLevel = houseCounts['town-hall']
    if (rawTownHallLevel) {
        const validatedLevel = [1, 2, 3].includes(rawTownHallLevel) ? rawTownHallLevel : 1
        const townHallType = `town-hall-${validatedLevel}` as HouseType
        
        generatedHouses.push({
            position: new THREE.Vector3(0, 0, 0),
            type: townHallType,
            rotation: 0
        })
    }

    const houseTiersToPlace = Object.entries(houseCounts)
        .filter(([key]) => key !== 'town-hall' && key !== 'library')
        .flatMap(([levelKey, count]) => {
            const tier = HOUSE_TIERS[levelKey]
            return tier ? Array(count).fill(tier) : []
        })

    const rawLibraryLevel = houseCounts['library']
    if (rawLibraryLevel) {
        const validatedLevel = [1, 2].includes(rawLibraryLevel) ? rawLibraryLevel : 1
        const libraryTier = HOUSE_TIERS[`library-${validatedLevel}`]
        if (libraryTier) {
            houseTiersToPlace.push(libraryTier)
        }
    }

    houseTiersToPlace.sort((a, b) => {
        const footprintA = a.footprint.x * a.footprint.z
        const footprintB = b.footprint.x * b.footprint.z
        if (footprintB !== footprintA) {
            return footprintB - footprintA
        }
        return b.level - a.level
    })

    if (houseTiersToPlace.length === 0) {
        return generatedHouses.map(h => ({
            ...h,
            position: h.position.toArray() as SerializedVector3
        }))
    }
    
    const SPACING_MULTIPLIER = 5
    const houseCount = houseTiersToPlace.length
    const initialSearchRadius = MAP_SETTINGS.HOUSE_PLACEMENT_BASE_RADIUS + (Math.sqrt(houseCount) * SPACING_MULTIPLIER)

    const checkCollision = (pos: THREE.Vector3, footprintToPlace: { x: number, z: number }, existingHousePos: THREE.Vector3, existingHouseType: HouseType) => {
        const existingTier = Object.values(HOUSE_TIERS).find(t => t.modelType === existingHouseType)
        if (!existingTier) return false

        const existingFootprint = existingTier.footprint
        
        const minX1 = pos.x - Math.floor(footprintToPlace.x / 2)
        const maxX1 = pos.x + Math.floor(footprintToPlace.x / 2)
        const minZ1 = pos.z - Math.floor(footprintToPlace.z / 2)
        const maxZ1 = pos.z + Math.floor(footprintToPlace.z / 2)

        const minX2 = existingHousePos.x - Math.floor(existingFootprint.x / 2)
        const maxX2 = existingHousePos.x + Math.floor(existingFootprint.x / 2)
        const minZ2 = existingHousePos.z - Math.floor(existingFootprint.z / 2)
        const maxZ2 = existingHousePos.z + Math.floor(existingFootprint.z / 2)

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
                    const point = new THREE.Vector3(x, 0, z)
                    if (point.length() <= currentSearchRadius) {
                        candidatePoints.push(point)
                    }
                }
            }
            
            candidatePoints.sort((a, b) => a.length() - b.length())

            for (const candidatePos of candidatePoints) {
                let hasCollision = false
                for (const house of existingHouses) {
                    const worldCandidate = candidatePos.clone().add(rootVec)
                    const existingPos = new THREE.Vector3().fromArray(house.position)
                    if (checkCollision(worldCandidate, footprintToPlace, existingPos, house.type)) {
                        hasCollision = true
                        break
                    }
                }
                if (hasCollision) continue

                for (const house of generatedHouses) {
                    if (checkCollision(candidatePos, footprintToPlace, house.position, house.type)) {
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
    
    return generatedHouses.map(h => ({
        ...h,
        position: h.position.toArray() as SerializedVector3
    }))
}



export const calculateSpiralPosition = (
    index: number, 
    villageRadius: number, 
    placedVillages: PlacedVillage[], 
    padding: number = MAP_SETTINGS.VILLAGE_PADDING,
    isValid?: (pos: THREE.Vector3) => boolean
): THREE.Vector3 => {
    if (index === 0 && (!isValid || isValid(new THREE.Vector3(0, 0, 0)))) {
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

        const hasCollision = placedVillages.some(v => {
            const vPos = new THREE.Vector3().fromArray(v.position)
            return vPos.distanceTo(testPos) < (villageRadius + v.radius + padding)
        })
        
        if (hasCollision || (isValid && !isValid(testPos))) {
            attempt += MAP_SETTINGS.SPIRAL_COLLISION_STEP
        } else {
            return testPos
        }
    }
}
