import { useEffect, useState, useRef } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { useMapStore } from '@/store/useMapStore'
import { VillageData, HouseData } from '@/types/scene'
import { useGLTF, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

type HouseTypeInstancesProps = {
    houses: { house: HouseData; village: VillageData }[]
    modelPath: string
    isNight: boolean
    isShadowEnabled: boolean
    setHoveredToken: (token: any) => void
    setSelectedToken: (token: any) => void
}

export const HouseTypeInstances = ({ 
    houses, 
    modelPath, 
    isNight, 
    isShadowEnabled, 
    setHoveredToken, 
    setSelectedToken 
}: HouseTypeInstancesProps) => {
    const { scene } = useGLTF(modelPath) as any
    const [meshes, setMeshes] = useState<{ structure: THREE.Mesh | null, glass: THREE.Mesh | null }>({ structure: null, glass: null })
    const proxyRef = useRef<THREE.Mesh>(null)
    const instancesRef = useRef<THREE.InstancedMesh>(null)
    const isIntroPlaying = useMapStore((state) => state.isIntroPlaying)

    useEffect(() => {
        let structure: THREE.Mesh | null = null
        let glass: THREE.Mesh | null = null
        
        scene.updateMatrixWorld(true)
        
        scene.traverse((child: any) => {
            if (child.isMesh) {
                const bakedGeometry = child.geometry.clone()
                bakedGeometry.applyMatrix4(child.matrixWorld)
                
                const bakedMesh = new THREE.Mesh(bakedGeometry, child.material)

                if (child.material.map?.name.includes('glass')) {
                    glass = bakedMesh
                } else {
                    structure = bakedMesh
                }
            }
        })
        setMeshes({ structure, glass })
    }, [scene])

    useEffect(() => {
        if (meshes.glass) {
            const material = meshes.glass.material as THREE.MeshStandardMaterial
            material.emissiveIntensity = isNight ? 3.0 : 0
            material.toneMapped = false
            material.emissive.setHex(0xffaa00)
            material.transparent = true
            material.opacity = 1.0
            material.needsUpdate = true
        }
    }, [isNight, meshes.glass])

    useEffect(() => {
        return () => {
            document.body.style.cursor = 'auto'
        }
    }, [])

    if (!meshes.structure || !meshes.glass || houses.length === 0) return null

    const handlePointerMove = (village: VillageData, house: HouseData) => (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (isIntroPlaying) return

        document.body.style.cursor = 'pointer'

        if (e.instanceId !== undefined && proxyRef.current) {
            proxyRef.current.position.copy(house.position)
            proxyRef.current.rotation.set(0, house.rotation || 0, 0)
            proxyRef.current.scale.set(1.001, 1.001, 1.001)
            proxyRef.current.updateMatrix()
            proxyRef.current.visible = true
        }

        const currentHovered = useMapStore.getState().hoveredToken
        if (currentHovered?.id !== village.id) {
            setHoveredToken(village)
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
        setSelectedToken(village)
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
                />
            </mesh>
        </>
    )
}
