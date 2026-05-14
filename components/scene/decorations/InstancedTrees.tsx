import * as THREE from 'three'
import { useRef, useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { TreeSpot } from '@/types/scene'

type InstancedTreesProps = {
    treeSpots: TreeSpot[]
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
            const spot = treeSpots[i]
            const [x, y, z] = spot.position
            dummy.position.set(x, y - 0.5, z)
            
            dummy.rotation.set(0, spot.rotation, 0)
            dummy.scale.setScalar(spot.scale)

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
