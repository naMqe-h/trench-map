import * as THREE from 'three'
import { BufferGeometry } from 'three'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

export const createBasicHouseGeometries = (position: THREE.Vector3Tuple) => {
    const [x, y, z] = position

    const cobbleGeometries: BufferGeometry[] = []
    const plankGeometries: BufferGeometry[] = []
    const glassGeometries: BufferGeometry[] = []

    const size = 2

    for (let yi = 0; yi < 3; yi++) {
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {
                if (i === -size || i === size || j === -size || j === size) {
                    const isCorner = (Math.abs(i) === size && Math.abs(j) === size)
                    const pos: THREE.Vector3Tuple = [x + i, y + yi, z + j]

                    if (yi < 2 && i === 0 && j === size) {
                        continue
                    }

                    const blockGeo = boxGeometry.clone()
                    blockGeo.translate(pos[0], pos[1], pos[2])

                    if (yi === 1 && !isCorner) {
                        glassGeometries.push(blockGeo)
                        continue
                    }

                    cobbleGeometries.push(blockGeo)
                }
            }
        }
    }

    for (let i = -size; i <= size; i++) {
        const abs_i = Math.abs(i)
        const roof_y = y + 3 + (size - abs_i)
        for (let j = -size; j <= size; j++) {
            const blockGeo = boxGeometry.clone()
            blockGeo.translate(x + i, roof_y, z + j)
            plankGeometries.push(blockGeo)
        }
    }

    return {
        cobble: cobbleGeometries,
        plank: plankGeometries,
        glass: glassGeometries
    }
}
