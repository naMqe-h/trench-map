import { describe, it, expect, beforeEach } from 'vitest'
import { useMapStore } from './useMapStore'
import { act } from '@testing-library/react'

const initialStoreState = useMapStore.getState()

describe('useMapStore', () => {
    
    beforeEach(() => {
        act(() => {
            useMapStore.setState(initialStoreState)
        })
    })

    it('should correctly finalize chunk processing and update state', () => {
        const initialHousesCount = useMapStore.getState().housesCache.length
        const initialGrassChunksCount = useMapStore.getState().grassMatricesChunks.length

        const newChunkData = {
            houses: [{ position: [10, 0, 10], type: 'basic-house' as const }],
            grassMatrices: new Float32Array(16),
            dirtMatrices: new Float32Array(0),
            waterMatrices: new Float32Array(0),
            treeSpots: [],
            vegetation: []
        }

        const newGeometries = [
            { id: 'v1', position: [0, 0, 0], radius: 10, placedHouses: [] }
        ]

        act(() => {
            useMapStore.getState().finalizeChunkProcessing(newChunkData as any, newGeometries as any)
        })

        const state = useMapStore.getState()
        
        expect(state.housesCache.length).toBe(initialHousesCount + 1)
        expect(state.housesCache[initialHousesCount].position).toEqual([10, 0, 10])
        expect(state.grassMatricesChunks.length).toBe(initialGrassChunksCount + 1)
        expect(state.villageGeometries.length).toBe(1)
        expect(state.isGenerating).toBe(false)
        expect(state.generationStep).toBe(null)
    })

    it('should maintain state immutability when finalizing chunk processing', () => {
        const originalHousesCache = useMapStore.getState().housesCache
        const originalGrassChunks = useMapStore.getState().grassMatricesChunks

        const newChunkData = {
            houses: [{ position: [20, 0, 20], type: 'stone-tall-house' as const }],
            grassMatrices: new Float32Array(16),
            dirtMatrices: new Float32Array(0),
            waterMatrices: new Float32Array(0),
            treeSpots: [],
            vegetation: []
        }

        act(() => {
            useMapStore.getState().finalizeChunkProcessing(newChunkData as any, [])
        })

        const state = useMapStore.getState()

        expect(state.housesCache).not.toBe(originalHousesCache)
        expect(state.grassMatricesChunks).not.toBe(originalGrassChunks)

        expect(state.housesCache.length).toBe(1)
        expect(state.grassMatricesChunks.length).toBe(1)
    })

    it('resetMap should reset the state to its initial values', () => {
        const newChunkData = {
            houses: [{ position: [10, 0, 10], type: 'basic-house' as const }],
            grassMatrices: new Float32Array(16),
            dirtMatrices: new Float32Array(0),
            waterMatrices: new Float32Array(0),
            treeSpots: [],
            vegetation: []
        }

        act(() => {
            useMapStore.getState().finalizeChunkProcessing(newChunkData as any, [])
            useMapStore.getState().setLastProcessedIndex(5)
        })

        expect(useMapStore.getState().housesCache.length).not.toBe(0)
        expect(useMapStore.getState().lastProcessedIndex).not.toBe(0)

        act(() => {
            useMapStore.getState().resetMap()
        })
        
        const state = useMapStore.getState()

        expect(state.housesCache.length).toBe(0)
        expect(state.grassMatricesChunks.length).toBe(0)
        expect(state.vegetationSpotsCache.length).toBe(0)
        expect(state.lastProcessedIndex).toBe(0)
    })
})
