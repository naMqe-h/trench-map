export class PerformanceStats {
    private deltas: number[] = []
    private isRecording: boolean = false

    start() {
        this.deltas = []
        this.isRecording = true
    }

    recordFrame(delta: number) {
        if (!this.isRecording) return
        this.deltas.push(delta)
    }

    stop() {
        this.isRecording = false
    }

    getResults() {
        if (this.deltas.length === 0) {
            return {
                avgFps: 0,
                minFps: 0,
                maxFps: 0,
                onePercentLow: 0,
                totalFrames: 0
            }
        }

        const fpsValues = this.deltas.map(d => 1 / d)
        const sortedFps = [...fpsValues].sort((a, b) => a - b)
        
        const sum = fpsValues.reduce((a, b) => a + b, 0)
        const avgFps = sum / fpsValues.length
        const minFps = sortedFps[0]
        const maxFps = sortedFps[sortedFps.length - 1]
        
        const onePercentIdx = Math.max(1, Math.floor(sortedFps.length * 0.01))
        const onePercentLow = sortedFps.slice(0, onePercentIdx).reduce((a, b) => a + b, 0) / onePercentIdx

        return {
            avgFps: Math.round(avgFps),
            minFps: Math.round(minFps),
            maxFps: Math.round(maxFps),
            onePercentLow: Math.round(onePercentLow),
            totalFrames: this.deltas.length
        }
    }
}

export const performanceStats = new PerformanceStats()
