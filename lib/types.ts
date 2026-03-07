import * as THREE from 'three'
import { HouseData } from '@/components/scene/map/utils/mapGeneration'

export interface Village {
    id?: string
    ca: string
    name: string
    ticker: string
    image: string
    houses: Houses
    marketCap: number
    socials: Record<string, string>
}

export interface Houses {
    singleStory: number
    twoStory: number
    tenement: number
}

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