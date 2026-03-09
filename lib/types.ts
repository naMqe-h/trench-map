import * as THREE from 'three'

/**
 * Represents the different types of houses available in the village.
 */
export type HouseType = 'singleStory' | 'twoStory' | 'tenement'

/**
 * Represents the structure for house data, including its position and type.
 */
export type HouseData = {
    position: THREE.Vector3
    type: HouseType
}

/**
 * Represents a village that has been placed on the map, including its position and radius.
 */
export interface PlacedVillage {
    position: THREE.Vector3
    radius: number
}

/**
 * Represents the different types of vegetation that can be placed on the map.
 */
export type VegetationType = 'rose' | 'smallGrass'

/**
 * Represents a single piece of vegetation, including its position and type.
 */
export interface VegetationData {
    position: THREE.Vector3Tuple,
    type: VegetationType
}

/**
 * Represents the core data for a village fetched from the database.
 */
export interface Village {
    id?: string
    ca: string
    name: string
    ticker: string
    image: string
    houses: Houses
    marketCap: number
    socials: Record<string, string>
    forcedIndex?: number
}

/**
 * Defines the number of each type of house in a village.
 */
export interface Houses {
    singleStory: number
    twoStory: number
    tenement: number
}

/**
 * Represents the fully processed data for a village, including geometries for rendering.
 * This data is used on the client-side for visualization.
 */
export interface VillageData extends Village {
    position: THREE.Vector3
    radius: number
    placedHouses: HouseData[]
    geometries: Record<string, THREE.BufferGeometry | null>
    treeGeometries: {
        trunk: THREE.BufferGeometry | null,
        leaves: THREE.BufferGeometry | null,
    }
}

/**
 * Represents the data structure for a village after being processed by the map worker.
 * Positions are serialized as arrays for efficient transfer from the worker.
 */
export interface ProcessedVillageData {
    village: Village
    position: [number, number, number]
    radius: number
    villageHouses: { position: [number, number, number]; type: HouseType }[]
    treeSpots: [number, number, number][]
}

/**
 * Represents the payload sent from the map worker to the main thread.
 */
export interface MapWorkerPayload {
    processedVillages: ProcessedVillageData[]
    newGrassMatrices: number[][]
    newDirtMatrices: number[][]
    newVegetationSpots: VegetationData[]
    center: number[]
}

/**
 * Represents the data sent from the main thread to the map worker.
 */
export interface MapWorkerRequest {
    newVillages: Village[]
    startIndex: number
}