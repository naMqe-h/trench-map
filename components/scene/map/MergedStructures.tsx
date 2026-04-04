import { useMemo } from 'react'
import { useMapStore } from '@/store/useMapStore'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { useSettingsStore } from '@/store/useSettingsStore'
import { VillageData, HouseData, HouseType } from '@/types/scene'
import { useGLTF } from '@react-three/drei'
import { HouseTypeInstances } from './HouseTypeInstances'

type MergedStructuresProps = {
    villageGeometries: VillageData[]
}

export const MergedStructures = ({ villageGeometries }: MergedStructuresProps) => {
    const setHoveredToken = useMapStore((state) => state.setHoveredToken)
    const setSelectedToken = useMapStore((state) => state.setSelectedToken)
    const timeOfDay = useTimeOfDay()
    const shadowQuality = useSettingsStore(state => state.shadowQuality)
    const isShadowEnabled = shadowQuality !== 'off'

    const groupedHouses = useMemo(() => {
        const groups: Record<HouseType, { house: HouseData; village: VillageData }[]> = {
            'basic-house': [],
            'stone-tall-house': [],
            'stone-gable-house': []
        }
        villageGeometries.forEach(village => {
            village.placedHouses.forEach(house => {
                groups[house.type].push({ house, village })
            })
        })
        return groups
    }, [villageGeometries])

    return (
        <>
            <HouseTypeInstances 
                houses={groupedHouses['basic-house']} 
                modelPath="/models/basic-house.glb" 
                isNight={timeOfDay.isNight} 
                isShadowEnabled={isShadowEnabled}
                setHoveredToken={setHoveredToken}
                setSelectedToken={setSelectedToken}
            />
            <HouseTypeInstances 
                houses={groupedHouses['stone-tall-house']} 
                modelPath="/models/stone-tall-house.glb" 
                isNight={timeOfDay.isNight} 
                isShadowEnabled={isShadowEnabled}
                setHoveredToken={setHoveredToken}
                setSelectedToken={setSelectedToken}
            />
            <HouseTypeInstances 
                houses={groupedHouses['stone-gable-house']} 
                modelPath="/models/stone-gable-house.glb" 
                isNight={timeOfDay.isNight} 
                isShadowEnabled={isShadowEnabled}
                setHoveredToken={setHoveredToken}
                setSelectedToken={setSelectedToken}
            />

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
                </group>
            ))}
        </>
    )
}

useGLTF.preload('/models/basic-house.glb')
useGLTF.preload('/models/stone-tall-house.glb')
useGLTF.preload('/models/stone-gable-house.glb')