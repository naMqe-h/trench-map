import { Stars } from '@react-three/drei'
import { DynamicSunLight } from '../map/DynamicSunLight'
import { Clouds } from '../decorations/Clouds'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'

export const WorldEnvironment = () => {
    const timeOfDay = useTimeOfDay()

    return (
        <>
            <ambientLight 
                color={timeOfDay.ambientColor}
                intensity={timeOfDay.ambientIntensity}
            />
            <DynamicSunLight 
                color={timeOfDay.directionalColor}
                intensity={timeOfDay.directionalIntensity}
            />
            {timeOfDay.isNight && (
                <Stars 
                    radius={100} 
                    depth={50} 
                    count={5000} 
                    factor={4} 
                    saturation={0} 
                    fade 
                    speed={1} 
                />
            )}
            <Clouds />
        </>
    )
}
