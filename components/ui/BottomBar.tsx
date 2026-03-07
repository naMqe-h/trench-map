import { FaXTwitter, FaGithub } from 'react-icons/fa6'
import { APP_VERSION } from '@/config/version'
import Link from 'next/link'

type BottomBarProps = {
    villageCount: number
}

export const BottomBar = ({ villageCount }: BottomBarProps) => {
    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md text-white text-sm flex justify-between items-center px-6 py-3 font-mono">
            <div className="flex items-center gap-4">
                <span>Tokens: {villageCount}</span>
                <span className="opacity-50">|</span>
                <span id="coords-display">X: 0 Z: 0</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="opacity-70 text-xs">v{APP_VERSION}</span>
                <span className="opacity-50">|</span>
                <div className="flex items-center gap-2">
                    <span>Created by naMqe</span>
                    <Link
                        href="https://github.com/naMqe-h" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        <FaGithub size={18} />
                    </Link>
                </div>
                <Link
                    href="https://x.com/naMqe7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                    <FaXTwitter size={18} />
                </Link>
            </div>
        </div>
    )
}
