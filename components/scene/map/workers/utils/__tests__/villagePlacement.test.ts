import { describe, it, expect, vi } from 'vitest'
import { processVillageBatch, isSafeDistanceFromHouses } from '../villagePlacement'
import * as THREE from 'three'

describe('villagePlacement', () => {
    describe('processVillageBatch', () => {
        it('should correctly process a batch of villages', () => {
            const newVillages = [{
                ca: '0x1',
                houses: { 'level-1': 1 }
            }] as any
            
            const params = {
                newVillages,
                startIndex: 0,
                placedVillagesCache: [],
                villageHouseKeysCache: new Set<string>(),
                housesSpatialGrid: new Map(),
                allHousesCache: []
            }

            const { processedVillages, tempBounds } = processVillageBatch(params)

            expect(processedVillages).toHaveLength(1)
            expect(tempBounds).toBeInstanceOf(THREE.Box3)
            expect(params.placedVillagesCache).toHaveLength(1)
            expect(params.allHousesCache.length).toBeGreaterThan(0)
        })
    })

    describe('isSafeDistanceFromHouses', () => {
        it('should return true if far enough from houses', () => {
            const spatialGrid = new Map()
            spatialGrid.set('0,0', [{ x: 0, z: 0, fx: 2, fz: 2 }])
            
            expect(isSafeDistanceFromHouses(10, 10, 2, 2, spatialGrid)).toBe(true)
        })

        it('should return false if too close to a house', () => {
            const spatialGrid = new Map()
            spatialGrid.set('0,0', [{ x: 0, z: 0, fx: 2, fz: 2 }])
            
            expect(isSafeDistanceFromHouses(1, 1, 2, 2, spatialGrid)).toBe(false)
        })
    })
})
