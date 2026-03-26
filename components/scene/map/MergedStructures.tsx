import { useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'
import { useMapStore } from '@/store/useMapStore'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { useSettingsStore } from '@/store/useSettingsStore'
import { VillageData } from '@/types/scene'

type MergedStructuresProps = {
    villageGeometries: VillageData[]
}

export const MergedStructures = ({ villageGeometries }: MergedStructuresProps) => {
    const textures = useTextureAtlas()
    const setHoveredToken = useMapStore((state) => state.setHoveredToken)
    const setSelectedToken = useMapStore((state) => state.setSelectedToken)
    const timeOfDay = useTimeOfDay()
    const shadowQuality = useSettingsStore(state => state.shadowQuality)
    const isShadowEnabled = shadowQuality !== 'off'

    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), [])

    useFrame(() => {
        uniforms.uTime.value = performance.now() / 1000
    })

    const onBeforeCompile = useCallback((shader: THREE.Shader) => {
        shader.uniforms.uTime = uniforms.uTime
        shader.vertexShader = `
            uniform float uTime;
            attribute float aSpawnTime;
            ${shader.vertexShader}
        `.replace(
            '#include <begin_vertex>',
            `
            float progress = clamp((uTime - aSpawnTime) / 1.0, 0.0, 1.0);
            float easedProgress = progress * (2.0 - progress);
            vec3 transformed = vec3( position.x, position.y * easedProgress, position.z );
            `
        )
    }, [uniforms])

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
                        <mesh 
                            geometry={village.geometries.cobble}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial map={textures.cobble} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.geometries.plank && (
                        <mesh 
                            geometry={village.geometries.plank}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial map={textures.plank} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.geometries.glass && (
                        <mesh 
                            geometry={village.geometries.glass}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial 
                                map={textures.glass} 
                                transparent 
                                opacity={0.6}
                                emissive="#ffd27f"
                                emissiveIntensity={timeOfDay.isNight ? 2.5 : 0}
                                onBeforeCompile={onBeforeCompile}
                            />
                        </mesh>
                    )}
                    {village.geometries.brick && (
                        <mesh 
                            geometry={village.geometries.brick}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial map={textures.brick} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.geometries.stoneBrick && (
                        <mesh 
                            geometry={village.geometries.stoneBrick}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial map={textures.stoneBrick} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.treeGeometries.trunk && (
                        <mesh 
                            geometry={village.treeGeometries.trunk}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial map={textures.trunk} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.treeGeometries.leaves && (
                        <mesh 
                            geometry={village.treeGeometries.leaves}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                        >
                            <meshStandardMaterial map={textures.leaves} transparent opacity={0.8} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                </group>
            ))}
        </>
    )
}