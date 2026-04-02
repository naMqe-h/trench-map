import { useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'
import { useMapStore } from '@/store/useMapStore'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { useSettingsStore } from '@/store/useSettingsStore'
import { VillageData } from '@/types/scene'
import { BasicHouse } from '../houses/BasicHouse'
import { StoneTallhouse } from '../houses/StoneTallhouse'
import { StoneGableHouse } from '../houses/StoneGableHouse'

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
        uTime: { value: 0 },
        uHoveredId: { value: -1.0 }
    }), [])

    useFrame(() => {
        uniforms.uTime.value = performance.now() / 1000
    })

    const onBeforeCompile = useCallback((shader: any) => {
        shader.uniforms.uTime = uniforms.uTime
        shader.uniforms.uHoveredId = uniforms.uHoveredId
        shader.vertexShader = `
            uniform float uTime;
            uniform float uHoveredId;
            attribute float aSpawnTime;
            attribute float aHouseId;
            varying float vHouseId;
            ${shader.vertexShader}
        `.replace(
            '#include <begin_vertex>',
            `
            vHouseId = aHouseId;
            float progress = clamp((uTime - aSpawnTime) / 1.0, 0.0, 1.0);
            float easedProgress = progress * (2.0 - progress);
            vec3 transformed = vec3( position.x, position.y * easedProgress, position.z );      
            `
        )

        shader.fragmentShader = `
            uniform float uHoveredId;
            varying float vHouseId;
            ${shader.fragmentShader}
        `.replace(
            '#include <dithering_fragment>',
            `
            #include <dithering_fragment>
            if (abs(vHouseId - uHoveredId) < 0.5) {
                gl_FragColor.rgb *= 1.5;
            }
            `
        )
    }, [uniforms])

    const handlePointerMove = useCallback((e: any) => {
        const index = e.face?.a
        if (index !== undefined) {
            const houseId = e.object.geometry.attributes.aHouseId?.getX(index)
            if (houseId !== undefined && uniforms.uHoveredId.value !== houseId) {
                uniforms.uHoveredId.value = houseId
                document.body.style.cursor = 'pointer'
            }
        }
    }, [uniforms])

    const handlePointerOut = useCallback((e: any) => {
        uniforms.uHoveredId.value = -1.0
        document.body.style.cursor = 'auto'
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
                    {village.placedHouses.map((house, index) => {
                        if (house.type === 'basic-house') {
                            return (
                                <BasicHouse 
                                    key={`${village.id}-${index}`} 
                                    position={house.position.toArray()} 
                                />
                            )
                        }
                        if (house.type === 'stone-tall-house') {
                            return (
                                <StoneTallhouse 
                                    key={`${village.id}-${index}`} 
                                    position={house.position.toArray()} 
                                />
                            )
                        }
                        if (house.type === 'stone-gable-house') {
                            return (
                                <StoneGableHouse 
                                    key={`${village.id}-${index}`} 
                                    position={house.position.toArray()} 
                                />
                            )
                        }
                        return null
                    })}
                    {village.geometries.cobble && (
                        <mesh 
                            geometry={village.geometries.cobble}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                            onPointerMove={handlePointerMove}
                            onPointerOut={handlePointerOut}
                        >
                            <meshStandardMaterial map={textures.cobble} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.geometries.plank && (
                        <mesh 
                            geometry={village.geometries.plank}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                            onPointerMove={handlePointerMove}
                            onPointerOut={handlePointerOut}
                        >
                            <meshStandardMaterial map={textures.plank} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.geometries.glass && (
                        <mesh 
                            geometry={village.geometries.glass}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                            onPointerMove={handlePointerMove}
                            onPointerOut={handlePointerOut}
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
                            onPointerMove={handlePointerMove}
                            onPointerOut={handlePointerOut}
                        >
                            <meshStandardMaterial map={textures.brick} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                    {village.geometries.stoneBrick && (
                        <mesh 
                            geometry={village.geometries.stoneBrick}
                            castShadow={isShadowEnabled}
                            receiveShadow={isShadowEnabled}
                            onPointerMove={handlePointerMove}
                            onPointerOut={handlePointerOut}
                        >
                            <meshStandardMaterial map={textures.stoneBrick} roughness={1} metalness={0} onBeforeCompile={onBeforeCompile} />
                        </mesh>
                    )}
                </group>
            ))}
        </>
    )
}