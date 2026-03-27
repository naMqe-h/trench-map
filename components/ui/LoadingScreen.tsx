import Image from 'next/image'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
    return (
        <motion.div
            className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-gray-900 text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Image src="/trenchmap.png" alt="TrenchMap Icon" width={96} height={96} className="w-24 h-24 mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold tracking-widest mb-4">TrenchMap</h1>
            <div className="text-gray-400 text-sm">Generating the world...</div>
        </motion.div>
    )
}

export default LoadingScreen
