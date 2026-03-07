import { useRef, useEffect } from 'react'
import * as THREE from 'three'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

type InstancedBlocksProps = {
    matrices: THREE.Matrix4[]
    texture: THREE.Texture
}

const InstancedBlocks = ({ matrices, texture }: InstancedBlocksProps) => {
    const ref = useRef<THREE.InstancedMesh>(null!)
    
    useEffect(() => {
        if (ref.current) {
            matrices.forEach((matrix, i) => {
                ref.current.setMatrixAt(i, matrix)
            })
            ref.current.instanceMatrix.needsUpdate = true
        }
    }, [matrices])

    return (
        <instancedMesh ref={ref} args={[boxGeometry, undefined, matrices.length]} castShadow receiveShadow>
            <meshStandardMaterial map={texture} />
        </instancedMesh>
    )
}

type InstancedTerrainProps = {
    grassMatrices: THREE.Matrix4[]
    dirtMatrices: THREE.Matrix4[]
    grassTexture: THREE.Texture
    dirtTexture: THREE.Texture
}

export const InstancedTerrain = ({ grassMatrices, dirtMatrices, grassTexture, dirtTexture }: InstancedTerrainProps) => {
    return (
        <>
            <InstancedBlocks texture={grassTexture} matrices={grassMatrices} />
            <InstancedBlocks texture={dirtTexture} matrices={dirtMatrices} />
        </>
    )
}