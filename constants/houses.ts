export const HOUSE_TIERS: Record<string, { label: string; modelType: string; footprint: { x: number, z: number }; level: number }> = {
    'level-1': { label: 'Basic House', modelType: 'basic-house', footprint: { x: 5, z: 5 }, level: 1 },
    'level-2': { label: 'Stone Tall House', modelType: 'stone-tall-house', footprint: { x: 5, z: 5 }, level: 2 },
    'level-3': { label: 'Stone Gable House', modelType: 'stone-gable-house', footprint: { x: 11, z: 9 }, level: 3 },
    'town-hall-1': { label: 'Town Hall', modelType: 'town-hall-1', footprint: { x: 14, z: 9 }, level: 1 },
    'town-hall-2': { label: 'Town Hall', modelType: 'town-hall-2', footprint: { x: 20, z: 13 }, level: 2 },
    'town-hall-3': { label: 'Town Hall', modelType: 'town-hall-3', footprint: { x: 35, z: 23 }, level: 3 },
    'library-1': { label: 'Library', modelType: 'library-1', footprint: { x: 35, z: 23 }, level: 1 }
}

export const HOUSE_NAMES: Record<string, { label: string }> = {
    'level-1': { label: 'Basic House' },
    'level-2': { label: 'Stone Tall House' },
    'level-3': { label: 'Stone Gable House' },
    'town-hall': { label: 'Town Hall' },
    'library': { label: 'Library' }
}