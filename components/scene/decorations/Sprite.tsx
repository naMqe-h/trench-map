import * as THREE from 'three'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'

interface SpriteProps {
    position: THREE.Vector3Tuple
    type: 'rose' | 'smallGrass'
}

export const Sprite = ({ position, type }: SpriteProps) => {
    const textures = useTextureAtlas()
    const texture = textures[type]

    return (
        <group position={position}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshLambertMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[0, -Math.PI / 4, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshLambertMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}
