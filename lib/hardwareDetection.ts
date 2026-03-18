
export const getPerformanceTier = (): 'high' | 'medium' | 'low' => {
    if (typeof window === 'undefined') {
        return 'medium';
    }

    if (/Mobi|Android/i.test(navigator.userAgent)) {
        return 'low';
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl || !(gl instanceof WebGLRenderingContext)) {
            return 'low';
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer) {
                const lowerRenderer = renderer.toLowerCase();
                if (/\brtx\b|\bgeforce\b|\bgtx\b|\bradeon\b|amd|apple m|m1|m2|m3|m4/i.test(lowerRenderer)) {
                    return 'high';
                }
                if (/\bintel\b|\buhd\b|\biris\b/i.test(lowerRenderer)) {
                    return 'medium';
                }
            }
        }
    } catch {
        return 'medium';
    }

    return 'medium';
};
