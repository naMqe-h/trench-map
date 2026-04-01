import { describe, it, expect, beforeEach } from 'vitest'
import { useMapStore } from './useMapStore'
import { act } from '@testing-library/react'
import * as THREE from 'three'

const initialStoreState = useMapStore.getState()

describe('useMapStore', () => {
    
    beforeEach(() => {
        act(() => {
            useMapStore.setState(initialStoreState)
        })
    })

    it('should correctly append new chunk data to the cache', () => {
        const initialHousesCount = useMapStore.getState().housesCache.length
        const initialGrassCount = useMapStore.getState().grassMatricesCache.length

        const newChunkData = {
            houses: [{ position: new THREE.Vector3(10, 0, 10), type: 'basic-house' as const }],
            grassMatrices: [new THREE.Matrix4().setPosition(1, 0, 1)],
            dirtMatrices: [],
            vegetation: []
        }

        act(() => {
            useMapStore.getState().appendChunkData(newChunkData)
        })

        const state = useMapStore.getState()
        
        expect(state.housesCache.length).toBe(initialHousesCount + 1)
        expect(state.grassMatricesCache.length).toBe(initialGrassCount + 1)
        
        expect(state.housesCache[initialHousesCount].position).toEqual(new THREE.Vector3(10, 0, 10))
        expect(state.grassMatricesCache[initialGrassCount]).toEqual(new THREE.Matrix4().setPosition(1, 0, 1))
    })

    it('should maintain state immutability when appending data', () => {
        const originalHousesCache = useMapStore.getState().housesCache
        const originalGrassCache = useMapStore.getState().grassMatricesCache

        const newChunkData = {
            houses: [{ position: new THREE.Vector3(20, 0, 20), type: 'stone-tall-house' as const }],
            grassMatrices: [new THREE.Matrix4().setPosition(2, 0, 2)],
            dirtMatrices: [],
            vegetation: []
        }

        act(() => {
            useMapStore.getState().appendChunkData(newChunkData)
        })

        const state = useMapStore.getState()

        expect(state.housesCache).not.toBe(originalHousesCache)
        expect(state.grassMatricesCache).not.toBe(originalGrassCache)

        expect(state.housesCache.length).toBe(1)
        expect(state.grassMatricesCache.length).toBe(1)
    })

    it('resetMap should reset the state to its initial values', () => {
        const newChunkData = {
            houses: [{ position: new THREE.Vector3(10, 0, 10), type: 'basic-house' as const }],
            grassMatrices: [new THREE.Matrix4().setPosition(1, 0, 1)],
            dirtMatrices: [],
            vegetation: []
        }

        act(() => {
            useMapStore.getState().appendChunkData(newChunkData)
            useMapStore.getState().setLastProcessedIndex(5)
        })

        expect(useMapStore.getState().housesCache.length).not.toBe(0)
        expect(useMapStore.getState().lastProcessedIndex).not.toBe(0)

        act(() => {
            useMapStore.getState().resetMap()
        })
        
        const state = useMapStore.getState()

        expect(state.housesCache.length).toBe(0)
        expect(state.grassMatricesCache.length).toBe(0)
        expect(state.vegetationSpotsCache.length).toBe(0)
        expect(state.lastProcessedIndex).toBe(0)
    })
})
