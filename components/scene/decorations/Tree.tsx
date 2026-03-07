import * as THREE from 'three'
import { BufferGeometry } from 'three'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

export const createTreeGeometries = (position: THREE.Vector3Tuple) => {
    const [x, y, z] = position

    const trunkGeometries: BufferGeometry[] = []
    const leavesGeometries: BufferGeometry[] = []

    for (let i = 0; i < 4; i++) {
        const blockGeo = boxGeometry.clone()
        blockGeo.translate(x, y + i, z)
        trunkGeometries.push(blockGeo)
    }

    for (let lx = -2; lx <= 2; lx++) {
        for (let ly = 4; ly <= 6; ly++) {
            for (let lz = -2; lz <= 2; lz++) {
                if (Math.random() > 0.3) { 
                    const blockGeo = boxGeometry.clone()
                    blockGeo.translate(x + lx, y + ly, z + lz)
                    leavesGeometries.push(blockGeo)
                }
            }
        }
    }

    return {
        trunk: trunkGeometries,
        leaves: leavesGeometries
    }
}
