import * as THREE from 'three'

interface SpriteProps {
    position: THREE.Vector3Tuple
    texture: THREE.Texture
}

export const Sprite = ({ position, texture }: SpriteProps) => {
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
