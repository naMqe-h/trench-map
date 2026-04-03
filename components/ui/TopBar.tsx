"use client"

import { memo, useState } from 'react'
import { processToken } from '@/actions/processToken'
import { Village } from '@/types/token'
import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'

type TopBarProps = {
    setNewVillageData: (data: { village: Village; trigger: number; isNew: boolean }) => void
}

const TopBar = memo(function TopBar({ setNewVillageData }: TopBarProps) {
    const [contractAddress, setContractAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { generationStep, setGenerationStepAction } = useMapStore(
        useShallow((state) => ({
            generationStep: state.generationStep,
            setGenerationStepAction: state.setGenerationStep,
        }))
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!contractAddress.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            const result = await processToken(contractAddress.trim())
            if (result.success) {
                setGenerationStepAction('fetching')
                setNewVillageData({ 
                    village: result.village, 
                    trigger: Date.now(), 
                    isNew: result.isNew 
                })
                setContractAddress('')
            } else {
                setError("Failed to process token.")
            }
        } catch (err: any) {
            console.error("Error processing token:", err)
            setError(err.message || "An error occurred while processing the token.")
        } finally {
            setIsLoading(false)
        }
    }

    const getButtonText = () => {
        if (isLoading) return "Processing..."
        if (generationStep === 'fetching') return "Fetching data..."
        if (generationStep === 'calculating') return "Calculating terrain..."
        if (generationStep === 'building') return "Building structures..."
        return "Search"
    }


    return (
        <div className="bg-black/70 backdrop-blur-md px-4 py-3 flex justify-center items-center min-h-[64px]">
            <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row justify-center items-center gap-2">
                <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="Enter Contract Address"
                    disabled={isLoading || !!generationStep}
                    className="bg-gray-900 text-white border border-gray-700 p-2 w-full sm:max-w-md placeholder-gray-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !!generationStep || !contractAddress.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
                >
                    {getButtonText()}
                </button>
            </form>
            {error && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-red-600/80 text-white px-3 py-1 text-sm border border-red-500">
                    {error}
                </div>
            )}
        </div>
    )
})

export { TopBar }

