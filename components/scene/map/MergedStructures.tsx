import * as THREE from 'three'

type MergedStructuresProps = {
    geometries: Record<string, THREE.BufferGeometry | null> | null
    treeGeometries: { trunk: THREE.BufferGeometry | null, leaves: THREE.BufferGeometry | null } | null
    textures: {
        cobble: THREE.Texture
        plank: THREE.Texture
        glass: THREE.Texture
        brick: THREE.Texture
        stoneBrick: THREE.Texture
        tree: THREE.Texture
        leaves: THREE.Texture
    }
}

export const MergedStructures = ({ geometries, treeGeometries, textures }: MergedStructuresProps) => {
    return (
        <>
            {geometries?.cobble && (
                <mesh geometry={geometries.cobble} castShadow>
                    <meshStandardMaterial map={textures.cobble} />
                </mesh>
            )}
            {geometries?.plank && (
                <mesh geometry={geometries.plank} castShadow>
                    <meshStandardMaterial map={textures.plank} />
                </mesh>
            )}
            {geometries?.glass && (
                <mesh geometry={geometries.glass} castShadow>
                    <meshStandardMaterial map={textures.glass} transparent opacity={0.6} />
                </mesh>
            )}
            {geometries?.brick && (
                <mesh geometry={geometries.brick} castShadow>
                    <meshStandardMaterial map={textures.brick} />
                </mesh>
            )}
            {geometries?.stoneBrick && (
                <mesh geometry={geometries.stoneBrick} castShadow>
                    <meshStandardMaterial map={textures.stoneBrick} />
                </mesh>
            )}
            
            {treeGeometries?.trunk && (
                <mesh geometry={treeGeometries.trunk} castShadow>
                    <meshStandardMaterial map={textures.tree} />
                </mesh>
            )}
            {treeGeometries?.leaves && (
                <mesh geometry={treeGeometries.leaves} castShadow>
                    <meshStandardMaterial map={textures.leaves} transparent opacity={0.8} />
                </mesh>
            )}
        </>
    )
}