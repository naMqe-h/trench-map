"use client"

import { useState } from 'react'
import { Village } from '@/lib/types'
import { processToken } from '@/actions/processToken'

type TopBarProps = {
    onTokenProcessed: (village: Village, index: number, isNew: boolean) => void
    generationStep: string | null
}

export function TopBar({ onTokenProcessed, generationStep }: TopBarProps) {
    const [contractAddress, setContractAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!contractAddress.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            const result = await processToken(contractAddress.trim())
            if (result.success) {
                onTokenProcessed(result.village, result.index, result.isNew)
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
        <div className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md px-4 py-3 flex justify-center items-center font-minecraft">
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
}

