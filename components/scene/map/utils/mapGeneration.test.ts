import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { calculateSpiralPosition, generateHousePositions } from './mapGeneration'
import { PlacedVillage, HouseData } from '@/lib/types'
import { MAP_SETTINGS } from '@/config/settings'

describe('calculateSpiralPosition', () => {
    it('should return a vector at [0, 0, 0] for index 0', () => {
        const position = calculateSpiralPosition(0, 10, [])
        expect(position).toBeInstanceOf(THREE.Vector3)
        expect(position.x).toBe(0)
        expect(position.y).toBe(0)
        expect(position.z).toBe(0)
    })

    it('should calculate a predictable spiral position for a given index', () => {
        const index = 1
        const scale = MAP_SETTINGS.SPIRAL_SCALE
        const angle = index * MAP_SETTINGS.SPIRAL_ANGLE_CONSTANT
        const r = scale * Math.sqrt(index)
        const expectedX = r * Math.cos(angle)
        const expectedZ = r * Math.sin(angle)

        const position = calculateSpiralPosition(index, 10, [])
        expect(position.x).toBeCloseTo(expectedX)
        expect(position.y).toBe(0)
        expect(position.z).toBeCloseTo(expectedZ)
    })

    it('should avoid placing a new village on top of an existing one', () => {
        const villageRadius = 50
        const padding = 10
        const initialPosition = new THREE.Vector3(0, 0, 0)

        const placedVillages: PlacedVillage[] = [{
            position: initialPosition,
            radius: villageRadius,
        }]

        const newPosition = calculateSpiralPosition(1, villageRadius, placedVillages, padding)
        const distance = newPosition.distanceTo(initialPosition)

        expect(newPosition.x).not.toBe(0)
        expect(newPosition.z).not.toBe(0)
        
        expect(distance).toBeGreaterThan(villageRadius + villageRadius + padding)
    })
})

describe('generateHousePositions', () => {
    it('should respect the minDistance parameter between houses', () => {
        const houseCounts = { singleStory: 5, twoStory: 0, tenement: 0 }
        const villageRootPosition = [0, 0, 0]
        const existingHouses: HouseData[] = []
        const minDistance = 5

        const houses = generateHousePositions(houseCounts, villageRootPosition, existingHouses, minDistance)

        for (let i = 0; i < houses.length; i++) {
            for (let j = i + 1; j < houses.length; j++) {
                const distance = houses[i].position.distanceTo(houses[j].position)
                expect(distance).toBeGreaterThanOrEqual(minDistance)
            }
        }
    })

    it('should handle maximum placement attempts gracefully', () => {
        const houseCounts = { singleStory: 100, twoStory: 0, tenement: 0 }
        const villageRootPosition = [0, 0, 0]
        const existingHouses: HouseData[] = []
        const minDistance = 50

        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const houses = generateHousePositions(houseCounts, villageRootPosition, existingHouses, minDistance)
        
        expect(houses.length).toBeLessThan(100)
        expect(spy).toHaveBeenCalled()
        
        spy.mockRestore()
    })
})
