import { VoxelCanvas } from "@/components/scene/VoxelCanvas"
import { getVillageChunks } from "@/actions/getVillageChunks"

export default async function HomePage() {
    const initialVillages = await getVillageChunks(20, 0)

    return (
        <main>
            <VoxelCanvas villages={initialVillages} />
        </main>
    )
}
