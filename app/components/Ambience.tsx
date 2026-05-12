"use client";

import { useEffect, useRef } from "react";

interface AmbienceProps {
  isActive: boolean;
  isAISpeaking: boolean;
}

export default function Ambience({ isActive, isAISpeaking }: AmbienceProps) {
  const restaurantRef = useRef<HTMLAudioElement>(null);

  // Play/pause restaurant ambience based on call state
  useEffect(() => {
    if (!restaurantRef.current) return;

    if (isActive) {
      restaurantRef.current.play().catch(() => {
        console.warn("Ambience play blocked — needs user interaction.");
      });
    } else {
      restaurantRef.current.pause();
    }
  }, [isActive]);

  // Dynamic volume: very low when Sana speaks so it doesn't compete,
  // slightly higher when listening (feels like a real restaurant phone call)
  useEffect(() => {
    if (!restaurantRef.current) return;

    const targetVolume = isAISpeaking ? 0.06 : 0.28;

    let currentVolume = restaurantRef.current.volume;
    const interval = setInterval(() => {
      if (Math.abs(currentVolume - targetVolume) < 0.004) {
        restaurantRef.current!.volume = targetVolume;
        clearInterval(interval);
      } else {
        currentVolume += (targetVolume - currentVolume) * 0.18;
        restaurantRef.current!.volume = currentVolume;
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isAISpeaking]);

  return (
    <>
      {/* Restaurant background ambience */}
      <audio ref={restaurantRef} loop style={{ display: "none" }}>
        <source src="/audio/restaurant.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}
