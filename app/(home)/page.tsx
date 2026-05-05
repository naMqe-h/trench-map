import { getVillageChunks } from "@/actions/getVillageChunks"
import { ClientCanvasWrapper } from "@/components/wrappers/ClientCanvasWrapper"
import { MAP_SETTINGS } from "@/config/settings"

export default async function HomePage() {
    const initialVillages = await getVillageChunks(MAP_SETTINGS.CHUNK_SIZE, 0)

    return (
        <main>
            <ClientCanvasWrapper villages={initialVillages} />
        </main>
    )
}
