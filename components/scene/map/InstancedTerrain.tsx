import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

type InstancedBlocksProps = {
    matrices: THREE.Matrix4[]
    texture: THREE.Texture
}

const InstancedBlocks = ({ matrices, texture }: InstancedBlocksProps) => {
    const ref = useRef<THREE.InstancedMesh>(null!)
    const lastUpdatedIndex = useRef(0)
    const [bufferSize, setBufferSize] = useState(200000)

    useEffect(() => {
        if (matrices.length > bufferSize - 5000) {
            setBufferSize(prev => prev + 150000)
        }
    }, [matrices.length, bufferSize])

    useEffect(() => {
        if (ref.current) {
            ref.current.count = matrices.length;
            for (let i = lastUpdatedIndex.current; i < matrices.length; i++) {
                ref.current.setMatrixAt(i, matrices[i])
            }
            lastUpdatedIndex.current = matrices.length
            ref.current.instanceMatrix.needsUpdate = true
        }
    }, [matrices, matrices.length])

    return (
        <instancedMesh
            ref={ref}
            args={[boxGeometry, undefined, bufferSize]}
            raycast={() => null}
        >
            <meshLambertMaterial map={texture} />
        </instancedMesh>
    )
}

type InstancedTerrainProps = {
    grassMatrices: THREE.Matrix4[]
    dirtMatrices: THREE.Matrix4[]
}

export const InstancedTerrain = ({ grassMatrices, dirtMatrices }: InstancedTerrainProps) => {
    const textures = useTextureAtlas()

    const repeatingGrassTexture = useMemo(() => {
        const tex = textures.grass.clone()
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(5000, 5000)
        tex.needsUpdate = true
        return tex
    }, [textures.grass])

    return (
        <>
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.55, 0]}
                raycast={() => null}
            >
                <planeGeometry args={[10000, 10000]} />
                <meshLambertMaterial map={repeatingGrassTexture} />
            </mesh>
            <InstancedBlocks texture={textures.grass} matrices={grassMatrices} />
            <InstancedBlocks texture={textures.dirt} matrices={dirtMatrices} />
        </>
    )
}
