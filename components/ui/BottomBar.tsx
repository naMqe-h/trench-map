import { FaXTwitter, FaGithub } from 'react-icons/fa6'
import { APP_VERSION } from '@/config/version'
import Link from 'next/link'

type BottomBarProps = {
    villageCount: number
}

export const BottomBar = ({ villageCount }: BottomBarProps) => {
    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3 font-mono">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
                <span>Tokens: {villageCount}</span>
                <span className="hidden sm:inline opacity-50">|</span>
                <span id="coords-display">X: 0 Z: 0</span>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 text-gray-400">
                v{APP_VERSION}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">Created by naMqe</span>
                    <Link
                        href="https://github.com/naMqe-h" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors cursor-pointer text-lg sm:text-base"
                    >
                        <FaGithub />
                    </Link>
                </div>
                <Link
                    href="https://x.com/naMqe7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors cursor-pointer text-lg sm:text-base"
                >
                    <FaXTwitter />
                </Link>
            </div>
        </div>
    )
}
