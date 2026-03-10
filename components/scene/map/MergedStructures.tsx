import { VillageData } from '@/lib/types'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'

type MergedStructuresProps = {
    villageGeometries: VillageData[]
}

export const MergedStructures = ({ villageGeometries }: MergedStructuresProps) => {
    const textures = useTextureAtlas()

    return (
        <>
            {villageGeometries.map(village => (
                <group key={village.id}>
                    {village.geometries.cobble && (
                        <mesh geometry={village.geometries.cobble} raycast={() => null}>
                            <meshLambertMaterial map={textures.cobble} />
                        </mesh>
                    )}
                    {village.geometries.plank && (
                        <mesh geometry={village.geometries.plank} raycast={() => null}>
                            <meshLambertMaterial map={textures.plank} />
                        </mesh>
                    )}
                    {village.geometries.glass && (
                        <mesh geometry={village.geometries.glass} raycast={() => null}>
                            <meshLambertMaterial map={textures.glass} transparent opacity={0.6} />
                        </mesh>
                    )}
                    {village.geometries.brick && (
                        <mesh geometry={village.geometries.brick} raycast={() => null}>
                            <meshLambertMaterial map={textures.brick} />
                        </mesh>
                    )}
                    {village.geometries.stoneBrick && (
                        <mesh geometry={village.geometries.stoneBrick} raycast={() => null}>
                            <meshLambertMaterial map={textures.stoneBrick} />
                        </mesh>
                    )}
                    {village.treeGeometries.trunk && (
                        <mesh geometry={village.treeGeometries.trunk} raycast={() => null}>
                            <meshLambertMaterial map={textures.trunk} />
                        </mesh>
                    )}
                    {village.treeGeometries.leaves && (
                        <mesh geometry={village.treeGeometries.leaves} raycast={() => null}>
                            <meshLambertMaterial map={textures.leaves} transparent opacity={0.8} />
                        </mesh>
                    )}
                </group>
            ))}
        </>
    )
}
