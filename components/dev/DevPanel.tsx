'use client'

import { useControls, button, folder } from 'leva'
import { useDevStore } from '@/store/useDevStore'
import { useMapStore } from '@/store/useMapStore'

type DevPanelProps = {
    loadMoreVillages?: () => void
}

export const DevPanel = ({ loadMoreVillages }: DevPanelProps) => {
    const setMaxChunks = useDevStore((state) => state.setMaxChunks)
    const setWireframeMode = useDevStore((state) => state.setWireframeMode)
    const setFreeCam = useDevStore((state) => state.setFreeCam)
    
    const resetMap = useMapStore((state) => state.resetMap)

    useControls(() => ({
        'Map System': folder({
            maxChunks: {
                value: 1,
                min: 1,
                max: 10,
                step: 1,
                onChange: (v) => setMaxChunks(v),
            },
            'Force Load Chunk': button(() => {
                if (loadMoreVillages) {
                    loadMoreVillages()
                } else {
                    console.warn('loadMoreVillages not available in DevPanel')
                }
            }),
            'Clear Map Cache': button(() => {
                resetMap()
            }),
        }),
        Graphics: folder({
            wireframeMode: {
                value: false,
                onChange: (v) => setWireframeMode(v),
            },
        }),
        Camera: folder({
            freeCam: {
                value: false,
                onChange: (v) => setFreeCam(v),
            },
        }),
    }), [loadMoreVillages])

    return null
}
