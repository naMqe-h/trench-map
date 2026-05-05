import { Twitter, Send, Globe, Link as LinkIcon } from "lucide-react"
import { Village } from "@/types/token"

const SocialIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
        case 'twitter': return <Twitter size={14} />
        case 'telegram': return <Send size={14} />
        case 'website': return <Globe size={14} />
        default: return <LinkIcon size={14} />
    }
}

export function TooltipInfo({ token }: { token: Village }) {
    const socialKeys = token.socials
        ? (Array.isArray(token.socials)
            ? (token.socials as string[]).filter(s => !!s)
            : Object.keys(token.socials).filter(key => {
                const value = (token.socials as Record<string, string>)[key]
                return value !== undefined && value !== null && value !== ""
            }))
        : []

    const marketCapValue = token.marketCap

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col">
                {marketCapValue !== undefined && (
                    <div className="text-sm">
                        MCap: <span className="font-semibold text-green-400">${marketCapValue.toLocaleString()}</span>
                    </div>
                )}
            </div>

            {socialKeys.length > 0 && (
                <div className="flex flex-row gap-2">
                    {socialKeys.map((social) => (
                        <span key={social} className="p-1.5 bg-white/5 rounded-md text-gray-300">
                            <SocialIcon type={social} />
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
