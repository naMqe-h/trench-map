"use client"

import { memo, useState, useRef, useEffect } from 'react'
import { addToken } from '@/actions/addToken'
import { Village } from '@/types/token'
import { useMapStore } from '@/store/useMapStore'
import { useShallow } from 'zustand/react/shallow'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

type TopBarProps = {
    setNewVillageData: (data: { village: Village; trigger: number; isNew: boolean }) => void
}

const TopBar = memo(function TopBar({ setNewVillageData }: TopBarProps) {
    const [contractAddress, setContractAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const { villages, generationStep, setGenerationStepAction } = useMapStore(
        useShallow((state) => ({
            villages: state.villages,
            generationStep: state.generationStep,
            setGenerationStepAction: state.setGenerationStep,
        }))
    )

    useEffect(() => {
        if (isMobileExpanded && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isMobileExpanded])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const ca = contractAddress.trim()
        if (!ca) return

        const existingVillage = villages.find(v => v.ca.toLowerCase() === ca.toLowerCase())
        if (existingVillage) {
            setNewVillageData({
                village: existingVillage,
                trigger: Date.now(),
                isNew: false
            })
            setContractAddress('')
            setIsMobileExpanded(false)
            return
        }

        setIsLoading(true)

        try {
            const result = await addToken(ca)
            if (result.success && result.village) {
                toast.success("Village added successfully!")
                setGenerationStepAction('fetching')
                setNewVillageData({ 
                    village: result.village, 
                    trigger: Date.now(), 
                    isNew: true 
                })
                setContractAddress('')
                setIsMobileExpanded(false)
            } else {
                const errorMessage = result.error || "Failed to process token."
                toast.error(errorMessage)
            }
        } catch (err: any) {
            console.error("Error processing token:", err)
            const errorMessage = err.message || "An error occurred while processing the token."
            toast.error(errorMessage)
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
        <div className={`flex items-center min-h-[64px] relative z-50 px-4 py-3 transition-colors ${isMobileExpanded ? 'bg-transparent' : 'justify-end sm:justify-center bg-transparent sm:bg-black/70 sm:backdrop-blur-md'}`}>
            {!isMobileExpanded && (
                <button
                    onClick={() => setIsMobileExpanded(true)}
                    className="sm:hidden flex items-center justify-center p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-lg transition-all active:scale-95"
                    aria-label="Search"
                >
                    <Search size={22} />
                </button>
            )}

            <div className={`${isMobileExpanded ? 'absolute top-0 left-0 w-full h-auto bg-black p-4 z-50 shadow-2xl flex flex-col border-b border-gray-800' : 'hidden'} sm:static sm:bg-transparent sm:p-0 sm:flex sm:w-full sm:justify-center items-center`}>
                <AnimatePresence>
                    {(isMobileExpanded || typeof window !== 'undefined') && (
                        <motion.form 
                            onSubmit={handleSubmit} 
                            initial={isMobileExpanded ? { opacity: 0, y: -10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-3"
                        >
                            <div className="w-full sm:max-w-md relative flex flex-col gap-2">
                                <div className="flex justify-between items-center sm:hidden mb-2">
                                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Search Token</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileExpanded(false)}
                                        className="text-gray-400 hover:text-white p-1 cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={contractAddress}
                                    onChange={(e) => setContractAddress(e.target.value)}
                                    placeholder="Enter Contract Address"
                                    disabled={isLoading || !!generationStep}
                                    className="bg-gray-900 text-white border border-gray-700 p-3 sm:p-2 w-full placeholder-gray-500 disabled:opacity-50 focus:border-blue-500 outline-none rounded-sm transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !!generationStep || !contractAddress.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:py-2 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer font-medium transition-all rounded-sm"
                            >
                                {getButtonText()}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
})

export { TopBar }
