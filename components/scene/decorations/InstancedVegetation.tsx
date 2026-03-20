
import * as THREE from 'three'
import { useMemo, useRef, useLayoutEffect } from 'react'
import { useTextureAtlas } from '@/hooks/useTextureAtlas'
import { mergeBufferGeometries } from 'three-stdlib'
import { VegetationData } from '@/types/scene'

type InstancedVegetationProps = {
    vegetationData: VegetationData[]
}

export const InstancedVegetation = ({ vegetationData }: InstancedVegetationProps) => {
    const crossGeometry = useMemo(() => mergeBufferGeometries([
        new THREE.PlaneGeometry(1, 1).rotateY(Math.PI / 4),
        new THREE.PlaneGeometry(1, 1).rotateY(-Math.PI / 4),
    ]), [])

    const textures = useTextureAtlas()

    const roseMaterial = useMemo(() => new THREE.MeshLambertMaterial({
        map: textures.rose,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    }), [textures.rose])

    const smallGrassMaterial = useMemo(() => new THREE.MeshLambertMaterial({
        map: textures.smallGrass,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    }), [textures.smallGrass])

    const tulipMaterial = useMemo(() => new THREE.MeshLambertMaterial({
        map: textures.tulip,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    }), [textures.tulip])

    const dandelionMaterial = useMemo(() => new THREE.MeshLambertMaterial({
        map: textures.dandelion,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
    }), [textures.dandelion])

    const instancesByType = useMemo(() => {
        const instances: Record<string, VegetationData[]> = {
            rose: [],
            smallGrass: [],
            tulip: [],
            dandelion: [],
        }

        for (const spot of vegetationData) {
            if (instances[spot.type]) {
                instances[spot.type].push(spot)
            }
        }

        return instances
    }, [vegetationData])

    if (!crossGeometry) return null

    return (
        <>
            <InstancedSpriteMesh
                instances={instancesByType.rose}
                geometry={crossGeometry}
                material={roseMaterial}
            />
            <InstancedSpriteMesh
                instances={instancesByType.smallGrass}
                geometry={crossGeometry}
                material={smallGrassMaterial}
            />
            <InstancedSpriteMesh
                instances={instancesByType.tulip}
                geometry={crossGeometry}
                material={tulipMaterial}
            />
            <InstancedSpriteMesh
                instances={instancesByType.dandelion}
                geometry={crossGeometry}
                material={dandelionMaterial}
            />
        </>
    )
}

type InstancedSpriteMeshProps = {
    instances: VegetationData[]
    geometry: THREE.BufferGeometry
    material: THREE.Material
}

const InstancedSpriteMesh = ({ instances, geometry, material }: InstancedSpriteMeshProps) => {
    const ref = useRef<THREE.InstancedMesh>(null!)
    
    useLayoutEffect(() => {
        if (!instances.length) return
        const dummy = new THREE.Object3D()
        for (let i = 0; i < instances.length; i++) {
            const { position } = instances[i]
            dummy.position.set(...position)
            
            dummy.rotation.y = Math.random() * Math.PI * 2
            const scale = THREE.MathUtils.lerp(0.8, 1.2, Math.random())
            dummy.scale.set(scale, scale, scale)

            dummy.updateMatrix()
            ref.current.setMatrixAt(i, dummy.matrix)
        }
        ref.current.instanceMatrix.needsUpdate = true
    }, [instances])

    if (!instances.length) return null

    return (
        <instancedMesh
            ref={ref}
            args={[geometry, material, instances.length]}
            frustumCulled={false}
        />
    )
}
