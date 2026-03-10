import * as THREE from 'three'
import { HouseData, VegetationData } from '@/lib/types'
import { create } from 'zustand'

type ChunkData = {
    houses: HouseData[]
    grassMatrices: THREE.Matrix4[]
    dirtMatrices: THREE.Matrix4[]
    vegetation: VegetationData[]
}

interface MapState {
    lastProcessedIndex: number
    housesCache: HouseData[]
    grassMatricesCache: THREE.Matrix4[]
    dirtMatricesCache: THREE.Matrix4[]
    vegetationSpotsCache: VegetationData[]
}

interface MapActions {
    appendChunkData: (data: ChunkData) => void
    setLastProcessedIndex: (index: number) => void
    resetMap: () => void
}

const initialState: MapState = {
    lastProcessedIndex: 0,
    housesCache: [],
    grassMatricesCache: [],
    dirtMatricesCache: [],
    vegetationSpotsCache: [],
}

export const useMapStore = create<MapState & MapActions>((set) => ({
    ...initialState,

    appendChunkData: (data) =>
        set((state) => ({
            housesCache: [...state.housesCache, ...data.houses],
            grassMatricesCache: [...state.grassMatricesCache, ...data.grassMatrices],
            dirtMatricesCache: [...state.dirtMatricesCache, ...data.dirtMatrices],
            vegetationSpotsCache: [...state.vegetationSpotsCache, ...data.vegetation],
        })),

    setLastProcessedIndex: (index) => set({ lastProcessedIndex: index }),

    resetMap: () => set(initialState),
}))
