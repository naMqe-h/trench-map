import { describe, it, expect, vi, beforeEach } from 'vitest'

const postMessageMock = vi.fn()
vi.stubGlobal('self', {
    postMessage: postMessageMock,
    addEventListener: vi.fn()
})

describe('mapWorker logic', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.resetModules()
    })

    it('should correctly structure the output payload with Matrix4 elements', async () => {
        await import('./mapWorker')
        
        const addEventListenerMock = vi.mocked(self.addEventListener)
        const messageHandler = addEventListenerMock.mock.calls[0][1] as (event: any) => void

        const mockRequest = {
            data: {
                newVillages: [{
                    ca: '0x1',
                    name: 'Test Village',
                    houses: { singleStory: 1, twoStory: 0, tenement: 0 }
                }],
                startIndex: 0
            }
        }

        messageHandler(mockRequest)

        expect(postMessageMock).toHaveBeenCalled()
        const payload = postMessageMock.mock.calls[0][0]

        expect(payload).toHaveProperty('processedVillages')
        expect(payload).toHaveProperty('newGrassMatrices')
        expect(payload).toHaveProperty('newDirtMatrices')
        expect(payload).toHaveProperty('center')

        if (payload.newGrassMatrices.length > 0) {
            expect(payload.newGrassMatrices[0]).toHaveLength(16)
            expect(typeof payload.newGrassMatrices[0][0]).toBe('number')
        }
    })

    it('should identify terrain bounds and calculate center correctly', async () => {
        await import('./mapWorker')
        const messageHandler = vi.mocked(self.addEventListener).mock.calls[0][1] as (event: any) => void

        const mockRequest = {
            data: {
                newVillages: [
                    { ca: '0x1', houses: { singleStory: 1, twoStory: 0, tenement: 0 }, forcedIndex: 0 },
                    { ca: '0x2', houses: { singleStory: 1, twoStory: 0, tenement: 0 }, forcedIndex: 1 }
                ],
                startIndex: 0
            }
        }

        messageHandler(mockRequest)

        const payload = postMessageMock.mock.calls[0][0]
        const center = payload.center

        expect(center).toBeInstanceOf(Array)
        expect(center).toHaveLength(3)
        expect(typeof center[0]).toBe('number')
    })
})
