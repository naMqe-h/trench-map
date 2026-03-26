import { HouseData, VegetationData, VillageData } from '@/types/scene'
import { Village } from '@/types/token'
import * as THREE from 'three'
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
    villageGeometries: VillageData[]
    hoveredToken: Village | null
    selectedToken: Village | null
    villages: Village[]
    offset: number
    hasMore: boolean
    isLoading: boolean
    isGenerating: boolean
    generationStep: string | null
    error: string | null
}

interface MapActions {
    appendChunkData: (data: ChunkData) => void
    addVillageGeometries: (geometries: VillageData[]) => void
    setLastProcessedIndex: (index: number) => void
    setHoveredToken: (token: Village | null) => void
    setSelectedToken: (token: Village | null) => void
    setLoading: (isLoading: boolean) => void
    setGenerating: (isGenerating: boolean) => void
    setGenerationStep: (step: string | null) => void
    setError: (error: string | null) => void
    addVillages: (newVillages: Village[], hasMore: boolean) => void
    addLiveVillage: (newVillage: Village, isNew: boolean) => void
    initializeVillages: (villages: Village[]) => void
    resetMap: () => void
}

const initialState: MapState = {
    lastProcessedIndex: 0,
    housesCache: [],
    grassMatricesCache: [],
    dirtMatricesCache: [],
    vegetationSpotsCache: [],
    villageGeometries: [],
    hoveredToken: null,
    selectedToken: null,
    villages: [],
    offset: 0,
    hasMore: true,
    isLoading: false,
    isGenerating: false,
    generationStep: null,
    error: null,
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
    ...initialState,

    appendChunkData: (data) =>
        set((state) => ({
            housesCache: [...state.housesCache, ...data.houses],
            grassMatricesCache: [...state.grassMatricesCache, ...data.grassMatrices],
            dirtMatricesCache: [...state.dirtMatricesCache, ...data.dirtMatrices],
            vegetationSpotsCache: [...state.vegetationSpotsCache, ...data.vegetation],
        })),

    addVillageGeometries: (geometries) =>
        set((state) => ({
            villageGeometries: [...state.villageGeometries, ...geometries],
        })),

    setLastProcessedIndex: (index) => set({ lastProcessedIndex: index }),

    setHoveredToken: (token) => set({ hoveredToken: token }),

    setSelectedToken: (token) => set({ selectedToken: token }),

    setLoading: (isLoading) => set({ isLoading }),

    setGenerating: (isGenerating) => set({ isGenerating }),

    setGenerationStep: (step) => set({ generationStep: step }),

    setError: (error) => set({ error }),

    addVillages: (newVillages, hasMore) => set(state => {
        const added = newVillages.filter(nv => !state.villages.some(pv => pv.ca === nv.ca))
        return {
            villages: [...state.villages, ...added],
            offset: state.offset + newVillages.length,
            hasMore,
        }
    }),

    addLiveVillage: (newVillage, isNew) => set(state => {
        if (state.villages.some(v => v.ca === newVillage.ca)) {
            return {}
        }
        return {
            villages: [...state.villages, newVillage],
            offset: isNew ? state.offset + 1 : state.offset
        }
    }),
    
    initializeVillages: (villages) => set({
        ...initialState,
        villages: villages,
        offset: villages.length,
    }),

    resetMap: () => set(initialState),
}))