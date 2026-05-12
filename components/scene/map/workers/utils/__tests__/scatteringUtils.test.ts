import { describe, it, expect, vi } from 'vitest'
import { evaluateTreeSpot, placeVegetation } from '../scatteringUtils'

describe('scatteringUtils', () => {
    describe('evaluateTreeSpot', () => {
        it('should return a tree spot if conditions are met', () => {
            const waterNoise2D = vi.fn().mockReturnValue(1)
            const waterExclusionZone = new Set<string>()
            const occupiedByVillages = new Set<string>()
            const treeEvaluatedCoordsCache = new Set<string>()
            const housesSpatialGrid = new Map()
            const occupiedCoordsCache = new Set<string>()
            
            vi.spyOn(Math, 'random').mockReturnValue(0)

            const spot = evaluateTreeSpot(
                0, 0, 
                waterNoise2D, 
                waterExclusionZone, 
                occupiedByVillages, 
                treeEvaluatedCoordsCache, 
                housesSpatialGrid, 
                occupiedCoordsCache
            )

            expect(spot).toEqual([0, 0.5, 0])
            expect(treeEvaluatedCoordsCache.has('0,0')).toBe(true)
            
            vi.restoreAllMocks()
        })

        it('should skip if already evaluated', () => {
            const treeEvaluatedCoordsCache = new Set(['0,0'])
            const spot = evaluateTreeSpot(0, 0, vi.fn(), new Set(), new Set(), treeEvaluatedCoordsCache, new Map(), new Set())
            expect(spot).toBeNull()
        })
    })

    describe('placeVegetation', () => {
        it('should return vegetation if noise is high enough', () => {
            const noise2D = vi.fn().mockReturnValue(1)
            const veg = placeVegetation(0, 0, noise2D, false, false)
            expect(veg).not.toBeNull()
            expect(veg?.position).toEqual([0, 0, 0])
        })

        it('should return null if occupied', () => {
            const noise2D = vi.fn().mockReturnValue(1)
            expect(placeVegetation(0, 0, noise2D, true, false)).toBeNull()
            expect(placeVegetation(0, 0, noise2D, false, true)).toBeNull()
        })
    })
})
