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

    it('should correctly handle PROCESS_CHUNK message type', async () => {
        await import('./mapWorker')
        
        const addEventListenerMock = vi.mocked(self.addEventListener)
        const messageHandler = addEventListenerMock.mock.calls[0][1] as (event: any) => void

        const mockRequest = {
            data: {
                type: 'PROCESS_CHUNK',
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
        expect(payload.type).toBe('CHUNK_PROCESSED')
    })

    it('should ignore or handle unknown message types gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        await import('./mapWorker')
        
        const addEventListenerMock = vi.mocked(self.addEventListener)
        const messageHandler = addEventListenerMock.mock.calls[0][1] as (event: any) => void

        const mockRequest = {
            data: {
                type: 'UNKNOWN_TYPE',
                someData: {}
            }
        }

        messageHandler(mockRequest)

        expect(postMessageMock).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown message type'), expect.anything())
        consoleSpy.mockRestore()
    })

    it('should structure the output payload with correct Matrix4 elements', async () => {
        await import('./mapWorker')
        const messageHandler = vi.mocked(self.addEventListener).mock.calls[0][1] as (event: any) => void

        const mockRequest = {
            data: {
                type: 'PROCESS_CHUNK',
                newVillages: [{
                    ca: '0x1',
                    houses: { singleStory: 1 }
                }],
                startIndex: 0
            }
        }

        messageHandler(mockRequest)

        const payload = postMessageMock.mock.calls[0][0]
        expect(payload).toHaveProperty('processedVillages')
        expect(payload).toHaveProperty('newGrassMatrices')
        
        if (payload.newGrassMatrices.length > 0) {
            expect(payload.newGrassMatrices[0]).toHaveLength(16)
        }
    })
})
