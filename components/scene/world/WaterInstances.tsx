import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useSettingsStore } from '@/store/useSettingsStore'

type WaterInstancesProps = {
    matrices: Float32Array[]
    texture: THREE.Texture
    wireframe?: boolean
}

export const WaterInstances = ({ matrices, texture, wireframe }: WaterInstancesProps) => {
    const ref = useRef<THREE.InstancedMesh>(null!)
    const [bufferSize, setBufferSize] = useState(100000)
    const shadowQuality = useSettingsStore(state => state.shadowQuality)

    const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

    const totalLength = useMemo(() => 
        matrices.reduce((acc, chunk) => acc + chunk.length, 0),
    [matrices])
    
    const count = totalLength / 16

    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), [])

    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime
    })

    useEffect(() => {
        if (count > bufferSize - 5000) {
            setBufferSize(prev => prev + 50000)
        }
    }, [count, bufferSize])

    useEffect(() => {
        if (ref.current && totalLength <= ref.current.instanceMatrix.array.length) {
            let offset = 0
            for (const chunk of matrices) {
                ref.current.instanceMatrix.array.set(chunk, offset)
                offset += chunk.length
            }
            ref.current.count = count
            ref.current.instanceMatrix.needsUpdate = true
        }
    }, [matrices, count, bufferSize, totalLength])

    return (
        <instancedMesh
            ref={ref}
            args={[boxGeometry, undefined, bufferSize]}
            raycast={() => null}
            castShadow={shadowQuality !== 'off'}
            receiveShadow={shadowQuality !== 'off'}
        >
            <meshStandardMaterial 
                map={texture} 
                roughness={0.2} 
                metalness={0.8} 
                wireframe={wireframe}
                transparent={true}
                opacity={0.8}
            />
        </instancedMesh>
    )
}
