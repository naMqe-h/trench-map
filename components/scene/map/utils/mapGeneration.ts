import * as THREE from 'three'

export type HouseType = 'singleStory' | 'twoStory' | 'tenement'

export type HouseData = {
    position: THREE.Vector3
    type: HouseType
}

export const generateHousePositions = (
    houseCounts: { singleStory: number, twoStory: number, tenement: number },
    villageRootPosition: number[],
    existingHouses: HouseData[],
    minDistance: number
) => {
    const types: HouseType[] = [
        ...Array(houseCounts.tenement).fill('tenement'),
        ...Array(houseCounts.twoStory).fill('twoStory'),
        ...Array(houseCounts.singleStory).fill('singleStory')
    ]
    
    const houseCount = types.length
    const generatedHouses: HouseData[] = []
    const maxTotalAttempts = houseCount * 100
    let attempts = 0
    const baseRadius = 5 + (houseCount * 0.5)

    while (generatedHouses.length < houseCount && attempts < maxTotalAttempts) {
        attempts++
        const randomAngle = Math.random() * 2 * Math.PI
        const randomRadius = baseRadius + Math.random() * 15
        const houseX = villageRootPosition[0] + Math.cos(randomAngle) * randomRadius
        const houseZ = villageRootPosition[2] + Math.sin(randomAngle) * randomRadius
        const newPos = new THREE.Vector3(houseX, 0, houseZ)

        let hasCollision = false
        for (const house of [...existingHouses, ...generatedHouses]) {
            if (newPos.distanceTo(house.position) < minDistance) {
                hasCollision = true
                break
            }
        }

        if (!hasCollision) {
            generatedHouses.push({
                position: newPos,
                type: types[generatedHouses.length]
            })
        }
    }
    
    if (generatedHouses.length < houseCount) {
        console.warn(`Could not place all houses for a village. Placed ${generatedHouses.length}/${houseCount}`)
    }
    
    return generatedHouses
}