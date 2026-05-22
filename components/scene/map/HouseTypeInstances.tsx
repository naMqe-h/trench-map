import { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { useMapStore } from '@/store/useMapStore'
import { useDevStore } from '@/store/useDevStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { VillageData, HouseData } from '@/types/scene'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type HouseTypeInstancesProps = {
    houses: { house: HouseData; village: VillageData }[]
    modelPath: string
    houseType: string
    isNight: boolean
    isShadowEnabled: boolean
    setHoveredToken: (token: any, houseType?: string | null) => void
    setSelectedToken: (token: any, houseType?: string) => void
}

export const HouseTypeInstances = ({ 
    houses, 
    modelPath, 
    houseType,
    isNight, 
    isShadowEnabled, 
    setHoveredToken, 
    setSelectedToken 
}: HouseTypeInstancesProps) => {
    const { scene } = useGLTF(modelPath) as any
    const [meshes, setMeshes] = useState<{ structure: THREE.Mesh | null, glass: THREE.Mesh | null }>({ structure: null, glass: null })
    const proxyRef = useRef<THREE.Mesh>(null)
    const instancesRef = useRef<THREE.InstancedMesh>(null)
    const glassInstancesRef = useRef<THREE.InstancedMesh>(null)
    const isIntroPlaying = useMapStore((state) => state.isIntroPlaying)
    const wireframeMode = useDevStore((state) => state.wireframeMode)

    const activePreset = useSettingsStore(state => state.activePreset)
    const loadDistance = useSettingsStore(state => state.loadDistance)
    const cameraPosition = useMapStore(state => state.cameraPosition)

    const filteredHouses = useMemo(() => {
        if (activePreset !== 'mobile') return houses
        
        const maxDistSq = (loadDistance * 16) ** 2
        return houses.filter(({ house }) => {
            const dx = house.position[0] - cameraPosition.x
            const dz = house.position[2] - cameraPosition.z
            return (dx * dx + dz * dz) < maxDistSq
        })
    }, [houses, activePreset, loadDistance, cameraPosition.x, cameraPosition.z])

    useEffect(() => {
        const structureGeometries: THREE.BufferGeometry[] = []
        const glassGeometries: THREE.BufferGeometry[] = []
        let structureMaterial: THREE.Material | null = null
        let glassMaterial: THREE.Material | null = null
        
        scene.updateMatrixWorld(true)
        
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.updateMatrixWorld(true)
                const bakedGeometry = child.geometry.clone()
                bakedGeometry.applyMatrix4(child.matrixWorld)
                
                if (child.material.map?.name.includes('glass') || child.material.name.toLowerCase().includes('glass')) {
                    glassGeometries.push(bakedGeometry)
                    if (!glassMaterial) glassMaterial = child.material
                } else {
                    structureGeometries.push(bakedGeometry)
                    if (!structureMaterial) structureMaterial = child.material
                }
            }
        })

        const mergedStructure = structureGeometries.length > 0 
            ? (structureGeometries.length === 1 ? structureGeometries[0] : mergeGeometries(structureGeometries))
            : null
        
        const mergedGlass = glassGeometries.length > 0
            ? (glassGeometries.length === 1 ? glassGeometries[0] : mergeGeometries(glassGeometries))
            : null

        setMeshes({ 
            structure: mergedStructure ? new THREE.Mesh(mergedStructure, structureMaterial!) : null, 
            glass: mergedGlass ? new THREE.Mesh(mergedGlass, glassMaterial!) : null 
        })
    }, [scene])

    useEffect(() => {
        if (meshes.glass) {
            const material = meshes.glass.material as THREE.MeshStandardMaterial
            material.emissiveIntensity = isNight ? 3.0 : 0
            material.toneMapped = false
            material.emissive.setHex(0xffaa00)
            material.transparent = true
            material.opacity = 1.0
            material.wireframe = wireframeMode
            material.needsUpdate = true
        }
    }, [isNight, meshes.glass, wireframeMode])

    useEffect(() => {
        if (meshes.structure) {
            const material = meshes.structure.material as THREE.MeshStandardMaterial
            material.wireframe = wireframeMode
            material.needsUpdate = true
        }
    }, [meshes.structure, wireframeMode])

    useEffect(() => {
        return () => {
            document.body.style.cursor = 'auto'
        }
    }, [])

    useLayoutEffect(() => {
        if (activePreset === 'mobile' && instancesRef.current && filteredHouses.length > 0) {
            const dummy = new THREE.Object3D()
            filteredHouses.forEach(({ house }, i) => {
                dummy.position.fromArray(house.position)
                dummy.rotation.set(0, house.rotation || 0, 0)
                dummy.updateMatrix()
                instancesRef.current!.setMatrixAt(i, dummy.matrix)
                if (glassInstancesRef.current) {
                    glassInstancesRef.current.setMatrixAt(i, dummy.matrix)
                }
            })
            instancesRef.current.instanceMatrix.needsUpdate = true
            if (glassInstancesRef.current) {
                glassInstancesRef.current.instanceMatrix.needsUpdate = true
            }
        }
    }, [filteredHouses, activePreset, meshes.structure])

    if (!meshes.structure || houses.length === 0) return null

    const handlePointerMove = (village: VillageData, house: HouseData) => (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (isIntroPlaying) return

        document.body.style.cursor = 'pointer'

        if (e.instanceId !== undefined && proxyRef.current) {
            proxyRef.current.position.fromArray(house.position)
            proxyRef.current.rotation.set(0, house.rotation || 0, 0)
            proxyRef.current.scale.set(1.001, 1.001, 1.001)
            proxyRef.current.updateMatrix()
            proxyRef.current.visible = true
        }

        const currentHovered = useMapStore.getState().hoveredToken
        const currentHoveredType = useMapStore.getState().hoveredHouseType
        const targetType = houseType.startsWith('library') ? 'library' : 'town-hall'

        if (currentHovered?.ca !== village.ca || currentHoveredType !== targetType) {
            setHoveredToken(village, targetType)
        }
    }

    const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        document.body.style.cursor = 'auto'
        if (proxyRef.current) {
            proxyRef.current.visible = false
        }
        setHoveredToken(null)
    }

    const handleClick = (village: VillageData) => (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (isIntroPlaying) return
        const sidebarType = houseType.startsWith('library') ? 'library' : 'town-hall'
        setSelectedToken(village, sidebarType)
    }

    if (activePreset === 'mobile') {
        return (
            <>
                <instancedMesh
                    ref={instancesRef}
                    args={[meshes.structure.geometry, meshes.structure.material, filteredHouses.length]}
                    castShadow={isShadowEnabled}
                    receiveShadow={isShadowEnabled}
                    onPointerMove={(e) => {
                        if (e.instanceId !== undefined && filteredHouses[e.instanceId]) {
                            const { house, village } = filteredHouses[e.instanceId]
                            handlePointerMove(village, house)(e)
                        }
                    }}
                    onPointerOut={handlePointerOut}
                    onClick={(e) => {
                        if (e.instanceId !== undefined && filteredHouses[e.instanceId]) {
                            const { village } = filteredHouses[e.instanceId]
                            handleClick(village)(e)
                        }
                    }}
                />
                {meshes.glass && (
                    <instancedMesh
                        ref={glassInstancesRef}
                        args={[meshes.glass.geometry, meshes.glass.material, filteredHouses.length]}
                        castShadow={isShadowEnabled}
                        receiveShadow={isShadowEnabled}
                        onClick={(e) => {
                            if (e.instanceId !== undefined && filteredHouses[e.instanceId]) {
                                const { village } = filteredHouses[e.instanceId]
                                handleClick(village)(e)
                            }
                        }}
                    />
                )}
                <mesh 
                    ref={proxyRef} 
                    visible={false} 
                    matrixAutoUpdate={false} 
                    geometry={meshes.structure.geometry}
                >
                    <meshStandardMaterial 
                        emissive="#cccccc" 
                        emissiveIntensity={0.15} 
                        transparent 
                        opacity={0.4} 
                        depthWrite={false} 
                        wireframe={wireframeMode}
                    />
                </mesh>
            </>
        )
    }

    return (
        <>
            <Instances 
                ref={instancesRef}
                geometry={meshes.structure.geometry} 
                material={meshes.structure.material}
                castShadow={isShadowEnabled}
                receiveShadow={isShadowEnabled}
            >
                {houses.map(({ house, village }, i) => (
                    <Instance 
                        key={`${village.id}-${i}`}
                        position={house.position} 
                        rotation={[0, house.rotation || 0, 0]}
                        onPointerMove={handlePointerMove(village, house)}
                        onPointerOut={handlePointerOut}
                        onClick={handleClick(village)}
                    />
                ))}
            </Instances>
            {meshes.glass && (
                <Instances 
                    geometry={meshes.glass.geometry} 
                    material={meshes.glass.material}
                    castShadow={isShadowEnabled}
                    receiveShadow={isShadowEnabled}
                >
                    {houses.map(({ house, village }, i) => (
                        <Instance 
                            key={`${village.id}-${i}-glass`}
                            position={house.position} 
                            rotation={[0, house.rotation || 0, 0]}
                            onClick={handleClick(village)}
                        />
                    ))}
                </Instances>
            )}
            <mesh 
                ref={proxyRef} 
                visible={false} 
                matrixAutoUpdate={false} 
                geometry={meshes.structure.geometry}
            >
                <meshStandardMaterial 
                    emissive="#cccccc" 
                    emissiveIntensity={0.15} 
                    transparent 
                    opacity={0.4} 
                    depthWrite={false} 
                    wireframe={wireframeMode}
                />
            </mesh>
        </>
    )
}
