import { useMemo } from 'react'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three-stdlib'
import { Village } from '@/lib/types'
import { generateHousePositions, HouseData } from '@/components/scene/map/utils/mapGeneration'
import { createTenementGeometries } from '@/components/scene/houses/Tenement'
import { createTwoStoryHouseGeometries } from '@/components/scene/houses/TwoStoryHouse'
import { createBasicHouseGeometries } from '@/components/scene/houses/BasicHouse'
import { createTreeGeometries } from '@/components/scene/decorations/Tree'

export const useMapData = (villages: Village[]) => {
    const padding = 20

    const { allHouseData, bounds, villageData, center } = useMemo(() => {
        const allHouses: HouseData[] = []
        const numVillages = villages.length
        const gridSize = Math.ceil(Math.sqrt(numVillages))
        
        const tempVillages: { 
            village: Village, 
            houses: HouseData[], 
            radius: number, 
            localRoot: THREE.Vector3 
        }[] = []

        villages.forEach((village) => {
            const villageHouses = generateHousePositions(village.houses, [0, 0, 0], [], 12)
            let maxDist = 0
            villageHouses.forEach(h => {
                const dist = h.position.length()
                if (dist > maxDist) maxDist = dist
            })
            const radius = maxDist + 10
            tempVillages.push({ village, houses: villageHouses, radius, localRoot: new THREE.Vector3(0, 0, 0) })
        })

        const colWidths = new Array(gridSize).fill(0)
        const rowHeights = new Array(gridSize).fill(0)

        tempVillages.forEach((v, i) => {
            const col = i % gridSize
            const row = Math.floor(i / gridSize)
            if (v.radius * 2 > colWidths[col]) colWidths[col] = v.radius * 2
            if (v.radius * 2 > rowHeights[row]) rowHeights[row] = v.radius * 2
        })

        const colOffsets = new Array(gridSize).fill(0)
        const rowOffsets = new Array(gridSize).fill(0)

        for (let i = 1; i < gridSize; i++) {
            colOffsets[i] = colOffsets[i - 1] + colWidths[i - 1] / 2 + colWidths[i] / 2 + 3
            rowOffsets[i] = rowOffsets[i - 1] + rowHeights[i - 1] / 2 + rowHeights[i] / 2 + 3
        }

        const processedVillageData: (Village & { position: THREE.Vector3, radius: number, placedHouses: HouseData[] })[] = []

        tempVillages.forEach((v, i) => {
            const col = i % gridSize
            const row = Math.floor(i / gridSize)
            const finalPos = new THREE.Vector3(colOffsets[col], 0, rowOffsets[row])

            v.houses.forEach(h => {
                h.position.add(finalPos)
            })
            
            allHouses.push(...v.houses)
            processedVillageData.push({
                ...v.village,
                position: finalPos,
                radius: v.radius,
                placedHouses: v.houses
            })
        })

        if (allHouses.length === 0) {
            return { allHouseData: [], bounds: new THREE.Box3(), villageData: [], center: new THREE.Vector3() }
        }

        const calculatedBounds = new THREE.Box3().setFromPoints(allHouses.map(h => h.position))
        return { 
            allHouseData: allHouses, 
            bounds: calculatedBounds, 
            villageData: processedVillageData,
            center: calculatedBounds.getCenter(new THREE.Vector3())
        }
    }, [villages])

    const mergedGeometries = useMemo(() => {
        if (allHouseData.length === 0) return null

        const allGeometries: Record<string, THREE.BufferGeometry[]> = {
            cobble: [],
            plank: [],
            glass: [],
            brick: [],
            stoneBrick: []
        }

        allHouseData.forEach(house => {
            let houseGeos
            
            if (house.type === 'tenement') {
                houseGeos = createTenementGeometries(house.position.toArray() as THREE.Vector3Tuple)
            } else if (house.type === 'twoStory') {
                houseGeos = createTwoStoryHouseGeometries(house.position.toArray() as THREE.Vector3Tuple)
            } else {
                houseGeos = createBasicHouseGeometries(house.position.toArray() as THREE.Vector3Tuple)
            }

            for (const [type, geos] of Object.entries(houseGeos)) {
                if (allGeometries[type] && geos.length > 0) {
                    allGeometries[type].push(...(geos as THREE.BufferGeometry[]))
                }
            }
        })

        const merged: Record<string, THREE.BufferGeometry | null> = {}
        for (const type in allGeometries) {
            merged[type] = allGeometries[type].length > 0 ? BufferGeometryUtils.mergeBufferGeometries(allGeometries[type]) : null
        }

        return merged
    }, [allHouseData])

    const instancedTerrain = useMemo(() => {
        if (allHouseData.length === 0) return null

        const grassMatrices: THREE.Matrix4[] = []
        const dirtMatrices: THREE.Matrix4[] = []
        const dummy = new THREE.Object3D()
        const processedCoords = new Set<string>()

        villageData.forEach((village) => {
            const minX = Math.floor(village.position.x - village.radius - padding)
            const maxX = Math.ceil(village.position.x + village.radius + padding)
            const minZ = Math.floor(village.position.z - village.radius - padding)
            const maxZ = Math.ceil(village.position.z + village.radius + padding)

            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const coordKey = `${x},${z}`
                    
                    if (processedCoords.has(coordKey)) continue
                    processedCoords.add(coordKey)

                    let isPath = false
                    villageData.forEach((v) => {
                        const distance = Math.sqrt(Math.pow(x - v.position.x, 2) + Math.pow(z - v.position.z, 2))
                        if (Math.abs(distance - v.radius) < 1.5) {
                            isPath = true
                        }
                    })

                    dummy.position.set(x, -1, z)
                    dummy.updateMatrix()

                    if (isPath) {
                        dirtMatrices.push(dummy.matrix.clone())
                    } else {
                        grassMatrices.push(dummy.matrix.clone())
                    }
                }
            }
        })
        
        return { grassMatrices, dirtMatrices }
    }, [villageData, allHouseData.length])

    const { vegetationSpots, mergedTreeGeometries } = useMemo(() => {
        const spots: { position: THREE.Vector3Tuple, type: 'rose' | 'smallGrass' }[] = []
        const allTrunkGeometries: THREE.BufferGeometry[] = []
        const allLeavesGeometries: THREE.BufferGeometry[] = []

        if (allHouseData.length === 0) return { vegetationSpots: [], mergedTreeGeometries: null }

        const occupied = new Set<string>()
        allHouseData.forEach(house => {
            const house_x = Math.round(house.position.x)
            const house_z = Math.round(house.position.z)
            const footprint = house.type === 'tenement' ? 7 : 5
            for (let i = -footprint; i <= footprint; i++) {
                for (let j = -footprint; j <= footprint; j++) {
                    occupied.add(`${house_x + i},${house_z + j}`)
                }
            }
        })

        const availableSpots: THREE.Vector3[] = []
        const processedSpots = new Set<string>()

        villageData.forEach((village) => {
            const minX = Math.floor(village.position.x - village.radius - padding)
            const maxX = Math.ceil(village.position.x + village.radius + padding)
            const minZ = Math.floor(village.position.z - village.radius - padding)
            const maxZ = Math.ceil(village.position.z + village.radius + padding)

            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const coordKey = `${x},${z}`
                    
                    if (occupied.has(coordKey) || processedSpots.has(coordKey)) continue
                    processedSpots.add(coordKey)

                    let isPath = false
                    villageData.forEach((v) => {
                        const distance = Math.sqrt(Math.pow(x - v.position.x, 2) + Math.pow(z - v.position.z, 2))
                        if (Math.abs(distance - v.radius) < 1.5) {
                            isPath = true
                        }
                    })
                    
                    if (!isPath) {
                        availableSpots.push(new THREE.Vector3(x, 0, z))
                    }
                }
            }
        })

        const numVegetation = Math.floor(availableSpots.length / 25)
        for (let i = 0; i < numVegetation; i++) {
            const spot = availableSpots.splice(Math.floor(Math.random() * availableSpots.length), 1)[0]
            if (!spot) continue
            const type = Math.random() > 0.5 ? 'rose' : 'smallGrass'
            spots.push({ position: [spot.x, spot.y - 0.5, spot.z], type })
        }

        const numTrees = Math.floor(availableSpots.length / 200)
        for (let i = 0; i < numTrees; i++) {
            const spot = availableSpots.splice(Math.floor(Math.random() * availableSpots.length), 1)[0]
            if (!spot) continue
            const { trunk, leaves } = createTreeGeometries(spot.toArray() as THREE.Vector3Tuple)
            allTrunkGeometries.push(...trunk)
            allLeavesGeometries.push(...leaves)
        }
        
        const mergedTrunk = allTrunkGeometries.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(allTrunkGeometries) : null
        const mergedLeaves = allLeavesGeometries.length > 0 ? BufferGeometryUtils.mergeBufferGeometries(allLeavesGeometries) : null

        return { vegetationSpots: spots, mergedTreeGeometries: { trunk: mergedTrunk, leaves: mergedLeaves } }

    }, [allHouseData, villageData])

    const shadowCamSize = bounds.isEmpty() ? 0 : Math.max(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z) + 2 * padding

    return {
        villageData,
        mergedGeometries,
        instancedTerrain,
        vegetationSpots,
        mergedTreeGeometries,
        center,
        shadowCamSize,
        hasData: allHouseData.length > 0
    }
}