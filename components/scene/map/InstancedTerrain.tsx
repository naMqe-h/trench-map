import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useDevStore } from '@/store/useDevStore'
import { WaterInstances } from '../world/WaterInstances'

type InstancedBlocksProps = {
    matrices: Float32Array
    texture: THREE.Texture
    wireframe?: boolean
}

const InstancedBlocks = ({ matrices, texture, wireframe }: InstancedBlocksProps) => {
    const ref = useRef<THREE.InstancedMesh>(null!)
    const [bufferSize, setBufferSize] = useState(200000)
    const shadowQuality = useSettingsStore(state => state.shadowQuality)

    const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

    const count = matrices.length / 16

    useEffect(() => {
        if (count > bufferSize - 5000) {
            setBufferSize(prev => prev + 150000)
        }
    }, [count, bufferSize])

    useEffect(() => {
        if (ref.current && matrices.length <= ref.current.instanceMatrix.array.length) {
            ref.current.instanceMatrix.array.set(matrices)
            ref.current.count = count
            ref.current.instanceMatrix.needsUpdate = true
        }
    }, [matrices, count, bufferSize])

    return (
        <instancedMesh
            ref={ref}
            args={[boxGeometry, undefined, bufferSize]}
            raycast={() => null}
            castShadow={shadowQuality !== 'off'}
            receiveShadow={shadowQuality !== 'off'}
        >
            <meshStandardMaterial map={texture} roughness={1} metalness={0} wireframe={wireframe} />
        </instancedMesh>
    )
}

type InstancedTerrainProps = {
    grassMatrices: Float32Array
    dirtMatrices: Float32Array
    waterMatrices: Float32Array
}

export const InstancedTerrain = ({ grassMatrices, dirtMatrices, waterMatrices }: InstancedTerrainProps) => {
    const textures = useTextureAtlas()
    const shadowQuality = useSettingsStore(state => state.shadowQuality)
    const wireframeMode = useDevStore(state => state.wireframeMode)

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
                position={[0, -0.05, 0]}
                raycast={() => null}
                receiveShadow={shadowQuality !== 'off'}
            >
                <planeGeometry args={[10000, 10000]} />
                <meshStandardMaterial map={repeatingGrassTexture} roughness={1} metalness={0} wireframe={wireframeMode} />
            </mesh>
            <InstancedBlocks texture={textures.grass} matrices={grassMatrices} wireframe={wireframeMode} />
            <InstancedBlocks texture={textures.soil} matrices={dirtMatrices} wireframe={wireframeMode} />
            <WaterInstances texture={textures.water} matrices={waterMatrices} wireframe={wireframeMode} />
        </>
    )
}
