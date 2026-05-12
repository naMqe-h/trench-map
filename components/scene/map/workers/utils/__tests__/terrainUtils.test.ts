import { describe, it, expect, vi } from 'vitest'
import { generateWaterLayout, classifyTerrain } from '../terrainUtils'

describe('terrainUtils', () => {
    describe('generateWaterLayout', () => {
        it('should identify and filter water candidates', () => {
            const waterNoise2D = vi.fn().mockReturnValue(-1)
            const waterExclusionZone = new Set<string>()
            const occupiedByVillages = new Set<string>()
            const waterCoordsCache = new Set<string>()
            
            const resultSmall = generateWaterLayout(0, 2, 0, 2, waterNoise2D, waterExclusionZone, occupiedByVillages, waterCoordsCache)
            expect(resultSmall.size).toBe(0)

            const resultLarge = generateWaterLayout(0, 5, 0, 5, waterNoise2D, waterExclusionZone, occupiedByVillages, waterCoordsCache)
            expect(resultLarge.size).toBeGreaterThan(15)
        })

        it('should respect exclusion zones', () => {
            const waterNoise2D = vi.fn().mockReturnValue(-1)
            const waterExclusionZone = new Set(['0,0'])
            const occupiedByVillages = new Set<string>()
            const waterCoordsCache = new Set<string>()
            
            const result = generateWaterLayout(0, 5, 0, 5, waterNoise2D, waterExclusionZone, occupiedByVillages, waterCoordsCache)
            expect(result.has('0,0')).toBe(false)
        })
    })

    describe('classifyTerrain', () => {
        it('should classify as water if in water set', () => {
            const finalWaterCoords = new Set(['10,10'])
            const result = classifyTerrain(10, 10, [], finalWaterCoords)
            expect(result.type).toBe('water')
        })

        it('should classify as dirt if in path radius', () => {
            const placedVillages = [{ position: [0, 0, 0], radius: 10 }] as any
            const result = classifyTerrain(10, 0, placedVillages, new Set())
            expect(result.type).toBe('dirt')
        })

        it('should classify as grass otherwise', () => {
            const result = classifyTerrain(100, 100, [], new Set())
            expect(result.type).toBe('grass')
        })
    })
})
