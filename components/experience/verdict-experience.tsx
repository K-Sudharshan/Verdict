"use client"

import React, { useCallback, useState } from "react"
import CinematicIntro, { type ExperiencePhase } from "@/components/experience/cinematic-intro"

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1741332966416-414d8a5b8887?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1754769440490-2eb64d715775?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1758640920659-0bb864175983?w=1200&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1758367454070-731d3cc11774?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1746023841657-e5cd7cc90d2c?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1741715661559-6149723ea89a?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1725878746053-407492aa4034?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1752588975168-d2d7965a6d64?w=1200&auto=format&fit=crop&q=60",
]

interface VerdictExperienceProps {
  children: React.ReactNode
}

export default function VerdictExperience({ children }: VerdictExperienceProps) {
  const [phase, setPhase] = useState<ExperiencePhase>("intro")

  const handleIntroComplete = useCallback(() => {
    setPhase("transition")
  }, [])

  const handleTransitionComplete = useCallback(() => {
    setPhase("application")
  }, [])

  return (
    <div className="relative min-h-screen bg-black">
      {/* Existing Functional Verdict.AI Application Layer rendered underneath */}
      <div 
        className={`transition-all duration-1000 ease-out ${
          phase === "intro" 
            ? "opacity-0 scale-[0.99] blur-sm" 
            : phase === "transition"
            ? "opacity-100 scale-100 blur-0"
            : "opacity-100 scale-100 blur-0"
        }`}
        style={{ 
          pointerEvents: phase === "application" ? "auto" : "none",
        }}
        aria-hidden={phase !== "application"}
      >
        {children}
      </div>

      {/* Cinematic 3D Layer seated at z-[99999] covering the viewport and navigation bar */}
      {phase !== "application" && (
        <CinematicIntro
          phase={phase}
          images={GALLERY_IMAGES}
          introDuration={11}
          transitionDuration={1.6}
          onIntroComplete={handleIntroComplete}
          onTransitionComplete={handleTransitionComplete}
        />
      )}
    </div>
  )
}
