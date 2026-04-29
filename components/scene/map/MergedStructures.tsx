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

const HOUSE_CONFIGS: { type: HouseType; path: string }[] = [
    { type: 'basic-house', path: '/models/basic-house.glb' },
    { type: 'stone-tall-house', path: '/models/stone-tall-house.glb' },
    { type: 'stone-gable-house', path: '/models/stone-gable-house.glb' },
    { type: 'town-hall-1', path: '/models/town-hall/town-hall-1.glb' },
    { type: 'town-hall-2', path: '/models/town-hall/town-hall-2.glb' },
    { type: 'town-hall-3', path: '/models/town-hall/town-hall-3.glb' },
]

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
            'stone-gable-house': [],
            'town-hall-1': [],
            'town-hall-2': [],
            'town-hall-3': []
        }
        villageGeometries.forEach(village => {
            village.placedHouses.forEach(house => {
                if (groups[house.type]) {
                    groups[house.type].push({ house, village })
                }
            })
        })
        return groups
    }, [villageGeometries])

    return (
        <>
            {HOUSE_CONFIGS.map(config => (
                <HouseTypeInstances 
                    key={config.type}
                    houses={groupedHouses[config.type]} 
                    modelPath={config.path} 
                    isNight={timeOfDay.isNight} 
                    isShadowEnabled={isShadowEnabled}
                    setHoveredToken={setHoveredToken}
                    setSelectedToken={setSelectedToken}
                />
            ))}

            {villageGeometries.map(village => (
                <group 
                    key={village.id}
                    onPointerMove={(e) => {
                        e.stopPropagation()
                        const currentHovered = useMapStore.getState().hoveredToken
                        if (currentHovered?.ca !== village.ca) {
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

HOUSE_CONFIGS.forEach(config => useGLTF.preload(config.path))