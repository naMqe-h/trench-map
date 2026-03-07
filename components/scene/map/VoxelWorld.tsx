import * as THREE from 'three'
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei'
import { Village } from '@/lib/types'
import { VillageMarker } from './VillageMarker'
import { DynamicSunLight } from './DynamicSunLight'
import { InstancedTerrain } from './InstancedTerrain'
import { MergedStructures } from './MergedStructures'
import { useMapData } from '@/hooks/useMapData'
import { Sprite } from '../decorations/Sprite'

type VoxelWorldProps = {
    villages: Village[]
}

export const VoxelWorld = ({ villages }: VoxelWorldProps) => {
    const { 
        villageData, 
        mergedGeometries, 
        instancedTerrain, 
        vegetationSpots, 
        mergedTreeGeometries, 
        center, 
        shadowCamSize,
        hasData
    } = useMapData(villages)

    const [
        dirtTexture,
        grassTexture,
        cobbleTexture,
        plankTexture,
        doorTexture,
        glassTexture,
        roseTexture,
        smallGrassTexture,
        treeTexture,
        leavesTexture,
        brickTexture,
        stoneBrickTexture
    ] = useTexture([
        '/textures/dirt.png',
        '/textures/grass.png',
        '/textures/cobble.png',
        '/textures/wooden_plank.png',
        '/textures/wooden_doors.png',
        '/textures/glass.png',
        '/textures/flowers_rose.png',
        '/textures/small_grass.png',
        '/textures/tree.png',
        '/textures/leaves.png',
        '/textures/brick.png',
        '/textures/stone_brick.png'
    ])

    const textures = [dirtTexture, grassTexture, cobbleTexture, plankTexture, doorTexture, glassTexture, roseTexture, smallGrassTexture, treeTexture, leavesTexture, brickTexture, stoneBrickTexture]
    textures.forEach(texture => {
        texture.magFilter = THREE.NearestFilter
    })

    return (
        <>
            <PerspectiveCamera makeDefault position={[center.x + 10, 40, center.z + 60]} fov={45} />
            <OrbitControls
                makeDefault
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2.5}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
            />

            {villageData.map((village) => (
                <VillageMarker key={village.ca} village={village} />
            ))}
            
            <DynamicSunLight />

            {instancedTerrain && (
                <InstancedTerrain 
                    grassMatrices={instancedTerrain.grassMatrices} 
                    dirtMatrices={instancedTerrain.dirtMatrices}
                    grassTexture={grassTexture}
                    dirtTexture={dirtTexture}
                />
            )}

            <MergedStructures 
                geometries={mergedGeometries}
                treeGeometries={mergedTreeGeometries}
                textures={{
                    cobble: cobbleTexture,
                    plank: plankTexture,
                    glass: glassTexture,
                    brick: brickTexture,
                    stoneBrick: stoneBrickTexture,
                    tree: treeTexture,
                    leaves: leavesTexture
                }}
            />

            {vegetationSpots.map((spot, i) => (
                <Sprite 
                    key={`veg-${i}`} 
                    position={spot.position} 
                    texture={spot.type === 'rose' ? roseTexture : smallGrassTexture} 
                />
            ))}

            {hasData && (
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[center.x, -1.5, center.z]}>
                    <planeGeometry args={[shadowCamSize, shadowCamSize]} />
                    <shadowMaterial opacity={0.3} />
                </mesh>
            )}
        </>
    )
}