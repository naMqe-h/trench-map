"use client"

import { useMapStore } from "@/store/useMapStore"
import { X, Building2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarInfo } from "./sidebars/SidebarInfo"
import { SidebarHolders } from "./sidebars/SidebarHolders"

export function Sidebar() {
    const selectedToken = useMapStore((state) => state.selectedToken)
    const selectedHouseType = useMapStore((state) => state.selectedHouseType)
    const setSelectedToken = useMapStore((state) => state.setSelectedToken)

    return (
        <AnimatePresence>
            {selectedToken && (
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-100 pointer-events-auto z-60 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl p-6 flex flex-col gap-4 text-white overflow-y-auto"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            {selectedToken.image ? (
                                <img 
                                    src={selectedToken.image} 
                                    alt={selectedToken.name} 
                                    className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-lg"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg">
                                    <Building2 size={20} className="text-gray-400" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold leading-tight">${selectedToken.ticker}</h2>
                                <span className="text-sm text-gray-400 font-medium">{selectedToken.name}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedToken(null)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {selectedHouseType === 'library' ? (
                        <SidebarHolders />
                    ) : (
                        <SidebarInfo />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}