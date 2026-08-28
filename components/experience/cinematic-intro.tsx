"use client"

import { useRef, useMemo, useCallback, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion"
import { Scale, FastForward } from "lucide-react"

export type ExperiencePhase = "intro" | "transition" | "application"

interface CinematicIntroProps {
  phase: ExperiencePhase
  images: string[]
  introDuration?: number
  transitionDuration?: number
  onIntroComplete: () => void
  onTransitionComplete: () => void
}

const MAX_HORIZONTAL_OFFSET = 8
const MAX_VERTICAL_OFFSET = 8
const DEPTH_RANGE = 50

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function createClothMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float curveIntensity = scrollForce * 0.2;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        pos.z -= curve;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(map, vUv);
        // Desaturate slightly for refined monochrome feel
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        vec3 tone = mix(color.rgb, vec3(gray), 0.35);
        gl_FragColor = vec4(tone, color.a * opacity);
      }
    `,
  })
}

function GalleryLayer({
  images,
  introDuration = 11,
  active,
  onIntroComplete,
}: {
  images: string[]
  introDuration?: number
  active: boolean
  onIntroComplete: () => void
}) {
  const visibleCount = Math.min(images.length, 8) || 1
  const textures = useTexture(images)

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount]
  )

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = []
    for (let i = 0; i < visibleCount; i++) {
      const hAngle = (i * 2.618) % (Math.PI * 2)
      const vAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2)
      const hRadius = (i % 3) * 1.1
      const vRadius = ((i + 1) % 4) * 0.75
      positions.push({
        x: (Math.sin(hAngle) * hRadius * MAX_HORIZONTAL_OFFSET) / 3,
        y: (Math.cos(vAngle) * vRadius * MAX_VERTICAL_OFFSET) / 4,
      })
    }
    return positions
  }, [visibleCount])

  const planes = useRef(
    Array.from({ length: visibleCount }, (_, i) => ({
      z: ((DEPTH_RANGE / visibleCount) * i) % DEPTH_RANGE,
      imageIndex: i % images.length,
    }))
  )

  const progress = useRef(0)
  const completed = useRef(false)
  const scrollVelocity = useRef(0)

  useFrame((_, delta) => {
    if (!active || completed.current) return

    // Slower, smoother progression
    progress.current += delta / introDuration
    const clamped = Math.min(progress.current, 1)

    // Gentle acceleration through first 60%, slow elegant deceleration over last 40%
    const rampWindow = 0.6
    let targetSpeed: number
    if (clamped < rampWindow) {
      targetSpeed = 0.16 // Gentle slow cruise
    } else {
      const decel = (clamped - rampWindow) / (1 - rampWindow)
      targetSpeed = 0.16 * (1 - easeOutCubic(decel))
    }
    scrollVelocity.current += (targetSpeed - scrollVelocity.current) * 0.04

    const totalRange = DEPTH_RANGE
    const halfRange = totalRange / 2
    const imageAdvance = visibleCount % images.length || images.length

    planes.current.forEach((plane) => {
      let newZ = plane.z + scrollVelocity.current * delta * 10
      if (newZ >= totalRange) {
        const wraps = Math.floor(newZ / totalRange)
        newZ -= totalRange * wraps
        plane.imageIndex = (plane.imageIndex + wraps * imageAdvance) % images.length
      } else if (newZ < 0) {
        newZ += totalRange
      }
      plane.z = ((newZ % totalRange) + totalRange) % totalRange
      ;(plane as any).worldZ = plane.z - halfRange
    })

    materials.forEach((m) => {
      m.uniforms.scrollForce.value = scrollVelocity.current
    })

    if (clamped >= 1 && !completed.current) {
      completed.current = true
      onIntroComplete()
    }
  })

  if (images.length === 0) return null

  return (
    <>
      {planes.current.map((plane, i) => {
        const texture = textures[plane.imageIndex]
        const material = materials[i]
        if (!texture || !material) return null
        material.uniforms.map.value = texture

        const aspect = texture.image ? texture.image.width / texture.image.height : 1
        const scale: [number, number, number] =
          aspect > 1 ? [2.2 * aspect, 2.2, 1] : [2.2, 2.2 / aspect, 1]

        return (
          <mesh
            key={i}
            position={[spatialPositions[i].x, spatialPositions[i].y, plane.z - DEPTH_RANGE / 2]}
            scale={scale}
            material={material}
          >
            <planeGeometry args={[1, 1, 16, 16]} />
          </mesh>
        )
      })}
    </>
  )
}

function ShaderTransitionLayer({
  active,
  transitionDuration,
}: {
  active: boolean
  transitionDuration: number
}) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !mountRef.current) return
    const container = mountRef.current

    const vertexShader = `
      void main() { gl_Position = vec4(position, 1.0); }
    `
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.04;
        float lineWidth = 0.002;
        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i = 0; i < 5; i++){
            color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
          }
        }
        // Monochrome white light flare
        float lum = dot(color.rgb, vec3(0.333));
        gl_FragColor = vec4(vec3(lum), 1.0);
      }
    `

    const camera = new THREE.Camera()
    camera.position.z = 1
    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)
    const uniforms = { time: { value: 1.0 }, resolution: { value: new THREE.Vector2() } }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
    scene.add(new THREE.Mesh(geometry, material))

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height)
    }
    resize()
    window.addEventListener("resize", resize)

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      uniforms.time.value += 0.04
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(raf)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [active])

  return (
    <motion.div
      ref={mountRef}
      className="pointer-events-none absolute inset-0"
      style={{ mixBlendMode: "screen" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? [0, 0.5, 0] : 0 }}
      transition={{ duration: transitionDuration, ease: "easeInOut", times: [0, 0.5, 1] }}
    />
  )
}

export default function CinematicIntro({
  phase,
  images,
  introDuration = 11,
  transitionDuration = 1.6,
  onIntroComplete,
  onTransitionComplete,
}: CinematicIntroProps) {
  // Lock page scroll while the cinematic layer is on top
  useEffect(() => {
    const prev = document.body.style.overflow
    if (phase !== "application") {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = prev || ""
    }
    return () => {
      document.body.style.overflow = prev || ""
    }
  }, [phase])

  const handleSkip = useCallback(() => {
    onIntroComplete()
  }, [onIntroComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-black w-screen h-screen overflow-hidden select-none"
      style={{ pointerEvents: phase === "intro" ? "auto" : "none" }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: phase === "transition" ? 0 : 1,
      }}
      transition={{ duration: transitionDuration, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (phase === "transition") {
          onTransitionComplete()
        }
      }}
    >
      {/* 3D WebGL Cloth Canvas */}
      <Canvas camera={{ position: [0, 0, 0], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <GalleryLayer
          images={images}
          introDuration={introDuration}
          active={phase === "intro"}
          onIntroComplete={onIntroComplete}
        />
      </Canvas>

      {/* Atmospheric Shader Cross-Dissolve Flare */}
      <ShaderTransitionLayer active={phase === "transition"} transitionDuration={transitionDuration} />

      {/* Pitch Black Vignette & Depth Mask */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black opacity-90" />

      {/* Center Cinematic Typography (Pitch Black Theme) */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="space-y-4 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs tracking-[0.12em] uppercase mb-2 font-sans">
            <Scale className="w-3.5 h-3.5 text-white" />
            <span>verdict</span>
          </div>

          <h1 className="font-display text-white leading-none" style={{ fontSize: 'clamp(4rem, 12vw, 9rem)', fontFamily: 'Abril Fatface, serif', letterSpacing: '-0.01em' }}>
            VERDICT AI
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-sans font-normal max-w-xl mx-auto leading-relaxed tracking-wide">
            Multi-agent hiring deliberation grounded in immutable evidence, adversarial debate, and qualitative consensus.
          </p>
        </motion.div>
      </div>

      {/* Bottom Navigation Cue */}
      <div className="pointer-events-none absolute bottom-8 left-0 right-0 flex items-center justify-between px-8 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>INITIALIZING DELIBERATION MATRIX</span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition-all hover:scale-105"
        >
          <span>Enter Workspace</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
