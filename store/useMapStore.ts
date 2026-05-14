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
    grassMatricesChunks: Float32Array[]
    dirtMatricesChunks: Float32Array[]
    waterMatricesChunks: Float32Array[]
    vegetationSpotsCache: VegetationData[]
    treeSpotsCache: SerializedVector3[]
    villageGeometries: VillageData[]
    hoveredToken: Village | null
    hoveredHouseType: string | null
    selectedToken: Village | null
    selectedHouseType: string | null
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
    finalizeChunkProcessing: (data: ChunkData, geometries: VillageData[]) => void
    setLastProcessedIndex: (index: number) => void
    setHoveredToken: (token: Village | null, houseType?: string | null) => void
    setSelectedToken: (token: Village | null, houseType?: string) => void
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
    grassMatricesChunks: [],
    dirtMatricesChunks: [],
    waterMatricesChunks: [],
    vegetationSpotsCache: [],
    treeSpotsCache: [],
    villageGeometries: [],
    hoveredToken: null,
    hoveredHouseType: null,
    selectedToken: null,
    selectedHouseType: null,
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

export const useMapStore = create<MapState & MapActions>((set, get) => ({
    ...initialState,

    finalizeChunkProcessing: (data, geometries) =>
        set((state) => ({
            housesCache: [...state.housesCache, ...data.houses],
            grassMatricesChunks: [...state.grassMatricesChunks, data.grassMatrices],
            dirtMatricesChunks: [...state.dirtMatricesChunks, data.dirtMatrices],
            waterMatricesChunks: [...state.waterMatricesChunks, data.waterMatrices],
            vegetationSpotsCache: [...state.vegetationSpotsCache, ...data.vegetation],
            treeSpotsCache: [...state.treeSpotsCache, ...data.treeSpots],
            villageGeometries: [...state.villageGeometries, ...geometries],
            generationStep: null,
            isGenerating: false,
        })),

    setLastProcessedIndex: (index) => set({ lastProcessedIndex: index }),

    setHoveredToken: (token, houseType = null) => set({ hoveredToken: token, hoveredHouseType: token ? houseType : null }),

    setSelectedToken: (token, houseType = 'town-hall') => set({ selectedToken: token, selectedHouseType: houseType }),

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
