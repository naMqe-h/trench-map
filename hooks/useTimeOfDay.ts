import { useState, useEffect } from 'react'

export function useTimeOfDay() {
  const [timeState, setTimeState] = useState(() => calculateTimeState())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeState(calculateTimeState())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return timeState
}

function calculateTimeState() {
  const now = new Date()
  const hour = now.getHours()
  const isNight = hour < 6 || hour >= 19

  let ambientColor = '#ffffff'
  let ambientIntensity = 0.3
  let directionalColor = '#ffffff'
  let directionalIntensity = 0.7
  let backgroundColor = '#87ceeb'

  if (isNight) {
    ambientColor = '#ffc0cb'
    ambientIntensity = 0.12
    directionalColor = '#354055'
    directionalIntensity = 0.2
    backgroundColor = '#040810'
  } else if (hour >= 6 && hour < 9) {
    ambientColor = '#ffc0cb'
    ambientIntensity = 0.3
    directionalColor = '#ffd700'
    directionalIntensity = 0.8
    backgroundColor = '#ffb6c1'
  } else if (hour >= 17 && hour < 19) {
    ambientColor = '#ffc0cb'
    ambientIntensity = 0.4
    directionalColor = '#354055'
    directionalIntensity = 0.7
    backgroundColor = '#ff7f50'
  }

  return {
    isNight,
    ambientColor,
    ambientIntensity,
    directionalColor,
    directionalIntensity,
    backgroundColor
  }
}