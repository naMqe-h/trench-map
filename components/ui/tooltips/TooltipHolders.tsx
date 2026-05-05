import { Village } from "@/types/token"

export function TooltipHolders({ token }: { token: Village }) {
    const holdersCount = token.holdersCount ?? 0
    const top10Percentage = token.top10HoldersPercentage ?? 0

    return (
        <div className="flex flex-col gap-2 py-0.5">
            <div className="flex justify-between items-center gap-4">
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Total Holders</span>
                <span className="text-sm text-white font-semibold">
                    {holdersCount.toLocaleString()}
                </span>
            </div>
            <div className="flex justify-between items-center gap-4">
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Top 10</span>
                <span className="text-sm text-white font-semibold">
                    {top10Percentage.toFixed(2)}%
                </span>
            </div>
        </div>
    )
}
