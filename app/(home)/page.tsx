import { getVillageChunks } from "@/actions/getVillageChunks"
import { ClientCanvasWrapper } from "@/components/wrappers/ClientCanvasWrapper"

export default async function HomePage() {
    const initialVillages = await getVillageChunks(20, 0)

    return (
        <main>
            <ClientCanvasWrapper villages={initialVillages} />
        </main>
    )
}
