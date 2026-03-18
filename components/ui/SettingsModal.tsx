
import { X } from 'lucide-react'
import { useSettingsStore, VegetationDensity, AOQuality, TimeOfDayMode, ShadowQuality } from '@/store/useSettingsStore'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const SettingRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        {children}
    </div>
)

const Select = ({ value, onChange, children }: { value: string | number, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }) => (
    <select
        value={value}
        onChange={onChange}
        className="bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
        {children}
    </select>
)

type Preset = 'high' | 'medium' | 'low' | 'custom'

const PresetButton = ({ label, activePreset, onClick }: { label: Preset, activePreset: Preset, onClick: () => void }) => {
    const isActive = label === activePreset
    return (
        <button
            onClick={onClick}
            disabled={label === 'custom'}
            className={`cursor-pointer w-full text-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors
      ${isActive ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}
      ${label === 'custom' && 'cursor-not-allowed opacity-70'}`}
        >
            {label.charAt(0).toUpperCase() + label.slice(1)}
        </button>
    )
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const {
        activePreset,
        applyPreset,
        postProcessingEnabled,
        setPostProcessingEnabled,
        vegetationDensity,
        setVegetationDensity,
        dpr,
        setDpr,
        aoQuality,
        setAoQuality,
        renderGrassAndFlowers,
        setRenderGrassAndFlowers,
        timeOfDayMode,
        setTimeOfDayMode,
        shadowQuality,
        setShadowQuality,
        loadDistance,
        setLoadDistance,
        cameraDamping,
        setCameraDamping
    } = useSettingsStore()

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-60 backdrop-blur-sm">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg w-full max-w-sm text-white max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-zinc-700 sticky top-0 bg-zinc-800 z-10">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <button onClick={onClose} className="cursor-pointer text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 divide-y divide-zinc-700">
                    <div className="pb-2">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Performance Presets</h3>
                        <div className="grid grid-cols-4 gap-2 py-3">
                            <PresetButton label="low" activePreset={activePreset} onClick={() => applyPreset('low')} />
                            <PresetButton label="medium" activePreset={activePreset} onClick={() => applyPreset('medium')} />
                            <PresetButton label="high" activePreset={activePreset} onClick={() => applyPreset('high')} />
                            <PresetButton label="custom" activePreset={activePreset} onClick={() => {}} />
                        </div>
                    </div>

                    <div className="pt-4 pb-2">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Performance & Visuals</h3>
                        <SettingRow label="Post-Processing">
                            <input
                                type="checkbox"
                                checked={postProcessingEnabled}
                                onChange={(e) => setPostProcessingEnabled(e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </SettingRow>
                        <SettingRow label="Resolution Scale">
                            <Select
                                value={dpr}
                                onChange={(e) => setDpr(parseFloat(e.target.value))}
                            >
                                <option value={5.0}>Best Quality</option>
                                <option value={1.5}>High Quality</option>
                                <option value={0.8}>Balanced</option>
                                <option value={0.4}>Performance</option>
                            </Select>
                        </SettingRow>
                        <SettingRow label="Ambient Occlusion">
                            <Select
                                value={aoQuality}
                                onChange={(e) => setAoQuality(e.target.value as AOQuality)}
                            >
                                <option value="quality">Quality</option>
                                <option value="performance">Performance</option>
                                <option value="off">Off</option>
                            </Select>
                        </SettingRow>
                        <SettingRow label="Shadow Quality">
                            <Select
                                value={shadowQuality}
                                onChange={(e) => setShadowQuality(e.target.value as ShadowQuality)}
                            >
                                <option value="on">On</option>
                                <option value="off">Off</option>
                            </Select>
                        </SettingRow>
                    </div>

                    <div className="py-2">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">Vegetation</h3>
                        <SettingRow label="Render Grass & Flowers">
                            <input
                                type="checkbox"
                                checked={renderGrassAndFlowers}
                                onChange={(e) => setRenderGrassAndFlowers(e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </SettingRow>
                        <SettingRow label="Density">
                            <Select
                                value={vegetationDensity}
                                onChange={(e) => setVegetationDensity(e.target.value as VegetationDensity)}
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </Select>
                        </SettingRow>
                    </div>

                    <div className="py-2">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 mb-2">World & Camera</h3>
                        <SettingRow label="Time of Day">
                            <Select
                                value={timeOfDayMode}
                                onChange={(e) => setTimeOfDayMode(e.target.value as TimeOfDayMode)}
                            >
                                <option value="system">System Time</option>
                                <option value="day">Always Day</option>
                                <option value="night">Always Night</option>
                            </Select>
                        </SettingRow>
                        <div className="py-3">
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-zinc-300">Map Load Distance</label>
                                <span className="text-xs text-zinc-500">{loadDistance}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="30"
                                step="1"
                                value={loadDistance}
                                onChange={(e) => setLoadDistance(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="py-3">
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-zinc-300">Camera Smoothness</label>
                                <span className="text-xs text-zinc-500">{cameraDamping}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="0.2"
                                step="0.01"
                                value={cameraDamping}
                                onChange={(e) => setCameraDamping(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
