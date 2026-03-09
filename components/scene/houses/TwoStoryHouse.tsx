import * as THREE from 'three'
import { BufferGeometry } from 'three'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

export const createTwoStoryHouseGeometries = (position: THREE.Vector3Tuple): {
    cobble: BufferGeometry[],
    plank: BufferGeometry[],
    glass: BufferGeometry[]
} => {
    const [x, y, z] = position

    const cobbleGeometries: BufferGeometry[] = []
    const plankGeometries: BufferGeometry[] = []
    const glassGeometries: BufferGeometry[] = []

    const size = 2 

    for (let yi = 0; yi < 6; yi++) { 
        for (let i = -size; i <= size; i++) {
            for (let j = -size; j <= size; j++) {
                const isPerimeter = (i === -size || i === size || j === -size || j === size)
                
                if (isPerimeter) {
                    const isCorner = (Math.abs(i) === size && Math.abs(j) === size)
                    
                    if (yi < 2 && i === 0 && j === size) {
                        continue
                    }

                    const blockGeo = boxGeometry.clone()
                    blockGeo.translate(x + i, y + yi, z + j)

                    if ((yi === 1 || yi === 4) && !isCorner) {
                        glassGeometries.push(blockGeo)
                        continue
                    }

                    cobbleGeometries.push(blockGeo)
                } else if (yi === 2) {
                    const blockGeo = boxGeometry.clone()
                    blockGeo.translate(x + i, y + yi, z + j)
                    plankGeometries.push(blockGeo)
                }
            }
        }
    }

    for (let i = -size; i <= size; i++) {
        const abs_i = Math.abs(i)
        const roof_y = y + 6 + (size - abs_i)
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