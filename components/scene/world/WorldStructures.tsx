import { useEffect } from 'react'
import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { MergedStructures } from '../map/MergedStructures'

type WorldStructuresProps = {
    onReady?: () => void
    onCountChange?: (count: number) => void
}

export const WorldStructures = ({ onReady, onCountChange }: WorldStructuresProps) => {
    const { villageGeometries } = useMapStore(
        useShallow((state) => ({
            villageGeometries: state.villageGeometries,
        }))
    )

    useEffect(() => {
        if (villageGeometries && villageGeometries.length > 0) {
            onReady?.()
            onCountChange?.(villageGeometries.length)
        }
    }, [villageGeometries, onReady, onCountChange])

    return (
        <MergedStructures 
            villageGeometries={villageGeometries}
        />
    )
}
