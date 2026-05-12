export const GRID_CELL_SIZE = 50

export const getCellKey = (x: number, z: number) => 
    `${Math.floor(x / GRID_CELL_SIZE)},${Math.floor(z / GRID_CELL_SIZE)}`

/**
 * Checks if a specific area in the grid is free from occupancy.
 */
export function isSpaceFree(
    x: number, 
    z: number, 
    size: number, 
    padding: number, 
    occupiedSet: Set<string>
): boolean {
    const halfExclusion = Math.floor((size + 2 * padding) / 2)
    for (let dx = -halfExclusion; dx <= halfExclusion; dx++) {
        for (let dz = -halfExclusion; dz <= halfExclusion; dz++) {
            if (occupiedSet.has(`${x + dx},${z + dz}`)) {
                return false
            }
        }
    }
    return true
}

/**
 * Marks a grid area as occupied.
 */
export function markOccupied(
    x: number, 
    z: number, 
    size: number, 
    occupiedSet: Set<string>
) {
    const halfSize = Math.floor(size / 2)
    for (let dx = -halfSize; dx <= halfSize; dx++) {
        for (let dz = -halfSize; dz <= halfSize; dz++) {
            occupiedSet.add(`${x + dx},${z + dz}`)
        }
    }
}
