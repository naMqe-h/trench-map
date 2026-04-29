import { HouseData, SerializedVector3, VegetationData, VillageData } from '@/types/scene'
import { Village } from '@/types/token'
import { create } from 'zustand'

type ChunkData = {
    houses: HouseData[]
    grassMatrices: Float32Array
    dirtMatrices: Float32Array
    waterMatrices: Float32Array
    vegetation: VegetationData[]
    treeSpots: SerializedVector3[]
}

interface MapState {
    lastProcessedIndex: number
    housesCache: HouseData[]
    grassMatricesCache: Float32Array
    dirtMatricesCache: Float32Array
    waterMatricesCache: Float32Array
    vegetationSpotsCache: VegetationData[]
    treeSpotsCache: SerializedVector3[]
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
    cameraPosition: { x: number; z: number }
    cameraRotation: number
    cameraFlightRequest: { village: Village; trigger: number; isNew: boolean } | null
    isIntroPlaying: boolean
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
    setCameraState: (position: { x: number; z: number }, rotation: number) => void
    setCameraFlightRequest: (request: { village: Village; trigger: number; isNew: boolean } | null) => void
    setIsIntroPlaying: (isPlaying: boolean) => void
}

const initialState: MapState = {
    lastProcessedIndex: 0,
    housesCache: [],
    grassMatricesCache: new Float32Array(0),
    dirtMatricesCache: new Float32Array(0),
    waterMatricesCache: new Float32Array(0),
    vegetationSpotsCache: [],
    treeSpotsCache: [],
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
    cameraPosition: { x: 0, z: 0 },
    cameraRotation: 0,
    cameraFlightRequest: null,
    isIntroPlaying: true,
}

function mergeTypedArrays(a: Float32Array, b: Float32Array): Float32Array {
    const res = new Float32Array(a.length + b.length)
    res.set(a)
    res.set(b, a.length)
    return res
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
    ...initialState,

    appendChunkData: (data) =>
        set((state) => ({
            housesCache: [...state.housesCache, ...data.houses],
            grassMatricesCache: mergeTypedArrays(state.grassMatricesCache, data.grassMatrices),
            dirtMatricesCache: mergeTypedArrays(state.dirtMatricesCache, data.dirtMatrices),
            waterMatricesCache: mergeTypedArrays(state.waterMatricesCache, data.waterMatrices),
            vegetationSpotsCache: [...state.vegetationSpotsCache, ...data.vegetation],
            treeSpotsCache: [...state.treeSpotsCache, ...data.treeSpots],
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

    setCameraState: (position, rotation) => set({ cameraPosition: position, cameraRotation: rotation }),

    setCameraFlightRequest: (request) => set({ cameraFlightRequest: request }),

    setIsIntroPlaying: (isPlaying) => set({ isIntroPlaying: isPlaying }),
}))