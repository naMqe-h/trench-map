
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function BasicHouse({ position }: { position: THREE.Vector3Tuple }) {
    const { scene } = useGLTF('/models/basic-house.glb')

    return <primitive object={scene.clone()} position={position} />
}

useGLTF.preload('/models/basic-house.glb')
