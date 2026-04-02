import * as THREE from 'three'
import { useRef, useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { SerializedVector3 } from '@/types/scene'

type InstancedTreesProps = {
    treeSpots: SerializedVector3[]
}

export const InstancedTrees = ({ treeSpots }: InstancedTreesProps) => {
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null!)
    const { nodes } = useGLTF('/models/tree.glb')

    const treeMesh = useMemo(() => (
        Object.values(nodes).find(n => (n as THREE.Mesh).isMesh) as THREE.Mesh
    ), [nodes])

    useLayoutEffect(() => {
        if (!treeSpots.length || !instancedMeshRef.current) return

        const dummy = new THREE.Object3D()
        for (let i = 0; i < treeSpots.length; i++) {
            const [x, y, z] = treeSpots[i]
            dummy.position.set(x, y - 0.5, z)
            
            dummy.rotation.y = Math.random() * Math.PI * 2
            const scale = THREE.MathUtils.lerp(0.9, 1.1, Math.random())
            dummy.scale.set(scale, scale, scale)

            dummy.updateMatrix()
            instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
        }
        instancedMeshRef.current.instanceMatrix.needsUpdate = true
    }, [treeSpots])

    if (!treeSpots.length || !treeMesh) return null

    return (
        <instancedMesh
            ref={instancedMeshRef}
            args={[treeMesh.geometry, treeMesh.material, treeSpots.length]}
            castShadow
            receiveShadow
        />
    )
}

useGLTF.preload('/models/tree.glb')
