import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

type InstancedBlocksProps = {
    matrices: THREE.Matrix4[]
    texture: THREE.Texture
}

const InstancedBlocks = ({ matrices, texture }: InstancedBlocksProps) => {
    const ref = useRef<THREE.InstancedMesh>(null!)
    const [bufferSize, setBufferSize] = useState(200000)

    useEffect(() => {
        if (matrices.length > bufferSize - 5000) {
            setBufferSize(prev => prev + 150000)
        }
    }, [matrices.length, bufferSize])

    useEffect(() => {
        if (ref.current) {
            ref.current.count = matrices.length;
            matrices.forEach((matrix, i) => {
                ref.current.setMatrixAt(i, matrix)
            })
            ref.current.instanceMatrix.needsUpdate = true
        }
    }, [matrices, matrices.length])

    return (
        <instancedMesh ref={ref} args={[boxGeometry, undefined, bufferSize]} raycast={() => null}>
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
    const repeatingGrassTexture = useMemo(() => {
        const tex = grassTexture.clone()
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(5000, 5000)
        tex.needsUpdate = true
        return tex
    }, [grassTexture])

    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} raycast={() => null}>
                <planeGeometry args={[10000, 10000]} />
                <meshStandardMaterial map={repeatingGrassTexture} />
            </mesh>
            <InstancedBlocks texture={grassTexture} matrices={grassMatrices} />
            <InstancedBlocks texture={dirtTexture} matrices={dirtMatrices} />
        </>
    )
}