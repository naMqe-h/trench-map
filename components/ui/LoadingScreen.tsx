import Image from 'next/image'

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
            <Image src="/trenchmap.png" alt="TrenchMap Icon" width={96} height={96} className="w-24 h-24 mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold tracking-widest mb-4">TrenchMap</h1>
            <div className="text-gray-400 text-sm">Generating the world...</div>
        </div>
    )
}

export default LoadingScreen
