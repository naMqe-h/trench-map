import { describe, it, expect } from 'vitest'
import { getCellKey, isSpaceFree, markOccupied, GRID_CELL_SIZE } from '../gridUtils'

describe('gridUtils', () => {
    it('should generate correct cell keys', () => {
        expect(getCellKey(0, 0)).toBe('0,0')
        expect(getCellKey(GRID_CELL_SIZE, GRID_CELL_SIZE)).toBe('1,1')
        expect(getCellKey(GRID_CELL_SIZE - 1, GRID_CELL_SIZE - 1)).toBe('0,0')
        expect(getCellKey(-1, -1)).toBe('-1,-1')
    })

    it('should correctly detect occupied space', () => {
        const occupiedSet = new Set<string>()
        occupiedSet.add('5,5')
        
        expect(isSpaceFree(5, 5, 1, 0, occupiedSet)).toBe(false)
        
        expect(isSpaceFree(6, 6, 1, 0, occupiedSet)).toBe(true)
        
        expect(isSpaceFree(6, 6, 1, 1, occupiedSet)).toBe(false)
    })

    it('should mark area as occupied', () => {
        const occupiedSet = new Set<string>()
        markOccupied(10, 10, 3, occupiedSet)
        
        expect(occupiedSet.has('10,10')).toBe(true)
        expect(occupiedSet.has('9,9')).toBe(true)
        expect(occupiedSet.has('11,11')).toBe(true)
        expect(occupiedSet.has('12,12')).toBe(false)
        expect(occupiedSet.size).toBe(9)
    })
})
