import * as THREE from 'three'
import { useTexture } from "@react-three/drei"

const texturePaths = [
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
]

export const useTextureAtlas = () => {
    const loadedTextures = useTexture(texturePaths)

    const textureAtlas = {
        dirt: loadedTextures[0],
        grass: loadedTextures[1],
        cobble: loadedTextures[2],
        plank: loadedTextures[3],
        door: loadedTextures[4],
        glass: loadedTextures[5],
        rose: loadedTextures[6],
        smallGrass: loadedTextures[7],
        trunk: loadedTextures[8],
        leaves: loadedTextures[9],
        brick: loadedTextures[10],
        stoneBrick: loadedTextures[11]
    }

    Object.values(textureAtlas).forEach(texture => {
        texture.magFilter = THREE.NearestFilter
    })

    return textureAtlas
}
