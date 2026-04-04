import { useEffect, useState } from 'react'
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

    if (!meshes.structure || !meshes.glass || houses.length === 0) return null

    const handlePointerMove = (village: VillageData) => (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const currentHovered = useMapStore.getState().hoveredToken
        if (currentHovered?.id !== village.id) {
            setHoveredToken(village)
        }
    }

    const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHoveredToken(null)
    }

    const handleClick = (village: VillageData) => (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        setSelectedToken(village)
    }

    return (
        <>
            <Instances 
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
                        onPointerMove={handlePointerMove(village)}
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
                        onPointerMove={handlePointerMove(village)}
                        onPointerOut={handlePointerOut}
                        onClick={handleClick(village)}
                    />
                ))}
            </Instances>
        </>
    )
}
