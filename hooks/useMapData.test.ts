import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMapData } from './useMapData'

class MockWorker {
    onmessage: ((event: any) => void) | null = null
    postMessage = vi.fn()
    terminate = vi.fn()
    addEventListener = vi.fn()
}

vi.stubGlobal('Worker', MockWorker)

vi.mock('@/lib/store/useMapStore', () => ({
    useMapStore: Object.assign(() => ({}), { getState: () => ({ resetMap: vi.fn(), appendChunkData: vi.fn(), setLastProcessedIndex: vi.fn() }) })
}))
vi.mock('three', () => ({
    Vector3: class { fromArray() { return this }; toArray() { return [0,0,0] } },
    Matrix4: class { fromArray() { return this } },
    Object3D: class {},
    Box3: class { isEmpty() { return true }; union() { return this }; getCenter() { return { toArray: () => [0,0,0] } } }
}))
vi.mock('three-stdlib', () => ({ mergeBufferGeometries: vi.fn() }))
vi.mock('@/actions/getVillageChunks', () => ({ getVillageChunks: vi.fn() }))
vi.mock('@/components/scene/houses/Tenement', () => ({ createTenementGeometries: vi.fn() }))
vi.mock('@/components/scene/houses/TwoStoryHouse', () => ({ createTwoStoryHouseGeometries: vi.fn() }))
vi.mock('@/components/scene/houses/BasicHouse', () => ({ createBasicHouseGeometries: vi.fn() }))
vi.mock('@/components/scene/decorations/Tree', () => ({ createTreeGeometries: vi.fn(() => ({ trunk: [], leaves: [] })) }))

describe('useMapData hook lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should initialize a new Worker instance on render', () => {
        renderHook(() => useMapData([]))
        expect(global.Worker).toHaveBeenCalled()
    })

    it('should call terminate on the worker when the component unmounts', () => {
        const { unmount } = renderHook(() => useMapData([]))
        const workerInstance = vi.mocked(global.Worker).mock.results[0].value
        unmount()
        expect(workerInstance.terminate).toHaveBeenCalled()
    })
})
