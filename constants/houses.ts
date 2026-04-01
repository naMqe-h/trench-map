export const HOUSE_TIERS: Record<string, { label: string; modelType: string; footprint: { x: number, z: number }; level: number }> = {
    'level-1': { label: 'Basic House', modelType: 'basic-house', footprint: { x: 5, z: 5 }, level: 1 },
    'level-2': { label: 'Stone Tall House', modelType: 'stone-tall-house', footprint: { x: 5, z: 5 }, level: 2 },
    'level-3': { label: 'Tenement', modelType: 'tenement', footprint: { x: 7, z: 7 }, level: 3 }
}
