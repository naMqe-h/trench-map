import { VoxelCanvas } from "@/components/scene/VoxelCanvas"
import { getVillageChunks } from "@/actions/getVillageChunks"
import { Tooltip } from "@/components/ui/Tooltip"
import { Sidebar } from "@/components/ui/Sidebar"

export default async function HomePage() {
    const initialVillages = await getVillageChunks(20, 0)

    return (
        <main>
            <VoxelCanvas villages={initialVillages} />
            <Tooltip />
            <Sidebar />
        </main>
    )
}
