"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { SettingsModal } from "./SettingsModal"

export const SettingsOverlay = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed bottom-20 right-4 z-50 p-2 bg-zinc-800 border border-zinc-700 rounded-full text-white cursor-pointer hover:bg-zinc-700 md:top-4 md:bottom-auto"
            >
                <Settings size={24} />
            </button>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    )
}
