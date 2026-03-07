import { getVillageData } from "@/lib/actions"
import { VoxelCanvas } from "@/components/scene/VoxelCanvas"

export default async function HomePage() {
    const villages = await getVillageData()

    return (
        <main>
            <VoxelCanvas villages={villages} />
        </main>
    )
}
