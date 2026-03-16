import { VillageData } from '@/lib/types'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'
import { useMapStore } from '@/lib/store/useMapStore'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'

type MergedStructuresProps = {
    villageGeometries: VillageData[]
}

export const MergedStructures = ({ villageGeometries }: MergedStructuresProps) => {
    const textures = useTextureAtlas()
    const setHoveredToken = useMapStore((state) => state.setHoveredToken)
    const setSelectedToken = useMapStore((state) => state.setSelectedToken)
    const timeOfDay = useTimeOfDay()

    return (
        <>
            {villageGeometries.map(village => (
                <group 
                    key={village.id}
                    onPointerMove={(e) => {
                        e.stopPropagation()
                        const currentHovered = useMapStore.getState().hoveredToken
                        if (currentHovered?.id !== village.id) {
                            setHoveredToken(village)
                        }
                    }}
                    onPointerOut={(e) => {
                        e.stopPropagation()
                        setHoveredToken(null)
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedToken(village)
                    }}
                >
                    {village.geometries.cobble && (
                        <mesh geometry={village.geometries.cobble}>
                            <meshStandardMaterial map={textures.cobble} roughness={1} metalness={0} />
                        </mesh>
                    )}
                    {village.geometries.plank && (
                        <mesh geometry={village.geometries.plank}>
                            <meshStandardMaterial map={textures.plank} roughness={1} metalness={0} />
                        </mesh>
                    )}
                    {village.geometries.glass && (
                        <mesh geometry={village.geometries.glass}>
                            <meshStandardMaterial 
                                map={textures.glass} 
                                transparent 
                                opacity={0.6}
                                emissive="#ffd27f"
                                emissiveIntensity={timeOfDay.isNight ? 2.5 : 0}
                            />
                        </mesh>
                    )}
                    {village.geometries.brick && (
                        <mesh geometry={village.geometries.brick}>
                            <meshStandardMaterial map={textures.brick} roughness={1} metalness={0} />
                        </mesh>
                    )}
                    {village.geometries.stoneBrick && (
                        <mesh geometry={village.geometries.stoneBrick}>
                            <meshStandardMaterial map={textures.stoneBrick} roughness={1} metalness={0} />
                        </mesh>
                    )}
                    {village.treeGeometries.trunk && (
                        <mesh geometry={village.treeGeometries.trunk}>
                            <meshStandardMaterial map={textures.trunk} roughness={1} metalness={0} />
                        </mesh>
                    )}
                    {village.treeGeometries.leaves && (
                        <mesh geometry={village.treeGeometries.leaves}>
                            <meshStandardMaterial map={textures.leaves} transparent opacity={0.8} roughness={1} metalness={0} />
                        </mesh>
                    )}
                </group>
            ))}
        </>
    )
}