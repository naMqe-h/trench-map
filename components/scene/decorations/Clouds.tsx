
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh as InstancedMeshImpl } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const CLOUD_COUNT = 100
const Y_MIN = 60
const Y_MAX = 80
const XZ_MIN = -500
const XZ_MAX = 500
const SCALE_X_MIN = 10
const SCALE_X_MAX = 20
const SCALE_Y_MIN = 2
const SCALE_Y_MAX = 4
const SCALE_Z_MIN = 10
const SCALE_Z_MAX = 20

export function Clouds() {
    const instancedMeshRef = useRef<InstancedMeshImpl>(null)

    const cloudMatrices = useMemo(() => {
        const matrices = []
        const matrix = new THREE.Matrix4()

        for (let i = 0; i < CLOUD_COUNT; i++) {
            const position = new THREE.Vector3(
                Math.random() * (XZ_MAX - XZ_MIN) + XZ_MIN,
                Math.random() * (Y_MAX - Y_MIN) + Y_MIN,
                Math.random() * (XZ_MAX - XZ_MIN) + XZ_MIN
            )

            const scale = new THREE.Vector3(
                Math.random() * (SCALE_X_MAX - SCALE_X_MIN) + SCALE_X_MIN,
                Math.random() * (SCALE_Y_MAX - SCALE_Y_MIN) + SCALE_Y_MIN,
                Math.random() * (SCALE_Z_MAX - SCALE_Z_MIN) + SCALE_Z_MIN
            )

            const quaternion = new THREE.Quaternion()

            matrix.compose(position, quaternion, scale)
            matrices.push(matrix.clone())
        }

        return matrices
    }, [])

    useLayoutEffect(() => {
        if (!instancedMeshRef.current) return
        cloudMatrices.forEach((matrix, i) => {
            instancedMeshRef.current!.setMatrixAt(i, matrix)
        })
        instancedMeshRef.current.instanceMatrix.needsUpdate = true
    }, [cloudMatrices])

    useFrame((_, delta) => {
        if (instancedMeshRef.current) {
            instancedMeshRef.current.position.x += 0.05 * delta * 20 

            if (instancedMeshRef.current.position.x > XZ_MAX + 200) {
                instancedMeshRef.current.position.x = XZ_MIN - 200
            }
        }
    })

    return (
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, CLOUD_COUNT]}>
            <boxGeometry />
            <meshBasicMaterial color="white" transparent opacity={0.6} />
        </instancedMesh>
    )
}
