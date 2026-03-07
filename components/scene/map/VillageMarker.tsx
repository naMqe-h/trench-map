import React from 'react'
import { Html } from '@react-three/drei'
import { Village } from '@/lib/types'
import { formatMarketCap } from '@/lib/utils'
import { Home, Send, Globe, Link as LinkIcon, ClipboardCopy } from 'lucide-react'
import * as THREE from 'three'
import { FaTiktok, FaXTwitter } from 'react-icons/fa6'

const SocialIcons = ({ socials, ca }: { socials: Record<string, string>, ca: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
        twitter: <FaXTwitter size={16} />,
        telegram: <Send size={16} />,
        website: <Globe size={16} />,
        tiktok: <FaTiktok size={16} />
    }

    const copyToClipboard = async (_ca: string) => {
        await navigator.clipboard.writeText(_ca)
    }

    return (
        <div className="flex justify-center space-x-2 mt-2">
            {Object.entries(socials).map(([key, value]) => {
                if (!value) return null
                const icon = iconMap[key] || <LinkIcon size={16} />
                return (
                    <a
                        key={key}
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-500 cursor-pointer"
                    >
                        {icon}
                    </a>
                )
            })}
            <button
                onClick={() => copyToClipboard(ca)}
                className="text-gray-600 hover:text-blue-500 cursor-pointer"
            >
                <ClipboardCopy size={16} />
            </button>
        </div>
    )
}

type VillageMarkerProps = {
    village: Village & { position: THREE.Vector3 }
}

export const VillageMarker = ({ village }: VillageMarkerProps) => {
    const totalHouses = village.houses.singleStory + village.houses.twoStory + village.houses.tenement
    
    return (
        <Html position={new THREE.Vector3(village.position.x, 15, village.position.z)}>
            <div className="bg-white/70 p-2 rounded-lg text-center w-48 cursor-pointer shadow-lg backdrop-blur-sm">
                <h2 className="font-bold text-lg">${village.ticker}</h2>
                <p className="text-base text-gray-400">{village.name}</p>
                <div className="flex justify-around items-center text-xs mt-1">
                    <div className="flex items-center space-x-1">
                        <Home size={14} />
                        <span>{totalHouses}</span>
                    </div>
                    <span>{formatMarketCap(village.marketCap)}</span>
                </div>
                <SocialIcons socials={village.socials} ca={village.ca} />
            </div>
        </Html>
    )
}