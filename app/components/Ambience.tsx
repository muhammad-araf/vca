"use client";

import { useEffect, useRef } from "react";

interface AmbienceProps {
  isActive: boolean;
  isAISpeaking: boolean;
}

export default function Ambience({ isActive, isAISpeaking }: AmbienceProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isActive) {
      audioRef.current.play().catch(() => {
        console.warn("Ambience play blocked by browser. User interaction needed.");
      });
    } else {
      audioRef.current.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (!audioRef.current) return;

    // Dynamic Volume Logic: Significant increase for better audibility
    const targetVolume = isAISpeaking ? 0.15 : 0.35;
    
    // Smooth transition
    let currentVolume = audioRef.current.volume;
    const interval = setInterval(() => {
      if (Math.abs(currentVolume - targetVolume) < 0.005) {
        audioRef.current!.volume = targetVolume;
        clearInterval(interval);
      } else {
        currentVolume += (targetVolume - currentVolume) * 0.2;
        audioRef.current!.volume = currentVolume;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAISpeaking]);

  return (
    <audio
      ref={audioRef}
      loop
      style={{ display: "none" }}
    >
      <source src="/audio/restaurant.mp3" type="audio/mpeg" />
    </audio>
  );
}
