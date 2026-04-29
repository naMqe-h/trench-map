import * as THREE from 'three'
import type { Village } from './token'

/**
 * Represents a serialized THREE.Vector3 for efficient data transfer.
 */
export type SerializedVector3 = [number, number, number]

/**
 * Represents a serialized THREE.Matrix4 for efficient data transfer.
 */
export type SerializedMatrix4 = number[]

/**
 * Represents the different types of houses available in the village.
 */
export type HouseType = 'basic-house' | 'stone-tall-house' | 'stone-gable-house' | 'town-hall-1' | 'town-hall-2' | 'town-hall-3'

/**
 * Represents the structure for house data, including its position and type.
 */
export type HouseData = {
    position: THREE.Vector3
    type: HouseType
    rotation?: number
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
export type VegetationType = 'rose' | 'smallGrass' | 'tulip' | 'dandelion'

/**
 * Represents a single piece of vegetation, including its position and type.
 */
export interface VegetationData {
    position: SerializedVector3
    type: VegetationType
}

/**
 * Represents the fully processed data for a village, including geometries for rendering.
 * This data is used on the client-side for visualization.
 */
export interface VillageData extends Village {
    position: THREE.Vector3
    radius: number
    placedHouses: HouseData[]
}

/**
 * Represents the data structure for a village after being processed by the map worker.
 * Positions are serialized as arrays for efficient transfer from the worker.
 */
export interface ProcessedVillageData {
    village: Village
    position: SerializedVector3
    radius: number
    villageHouses: { position: SerializedVector3, type: HouseType, rotation: number }[]
    treeSpots: SerializedVector3[]
}


// Payloads from Worker to Main Thread
export type ChunkProcessedPayload = {
    type: 'CHUNK_PROCESSED'
    processedVillages: ProcessedVillageData[]
    newGrassMatrices: Float32Array
    newDirtMatrices: Float32Array
    newWaterMatrices: Float32Array
    newVegetationSpots: VegetationData[]
    treeSpots: SerializedVector3[]
    center: SerializedVector3
}

/**
 * Represents the discriminated union for all possible payloads sent FROM the map worker TO the main thread.
 */
export type MapWorkerPayload = ChunkProcessedPayload // | OtherPayloads

// Requests from Main Thread to Worker
export type ProcessChunkRequest = {
    type: 'PROCESS_CHUNK'
    newVillages: Village[]
    startIndex: number
}

/**
 * Represents the discriminated union for all possible requests sent FROM the main thread TO the map worker.
 */
export type MapWorkerRequest = ProcessChunkRequest // | OtherRequests