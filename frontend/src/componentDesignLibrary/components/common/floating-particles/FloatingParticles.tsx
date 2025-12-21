import React, { useEffect, useRef } from "react"
import type { FloatingParticlesProps } from "./types"

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  colors = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle interface
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      opacity: number
    }

    // Create particle
    const createParticle = (
      canvasWidth: number,
      canvasHeight: number
    ): Particle => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
    })

    // Update particle
    const updateParticle = (
      particle: Particle,
      canvasWidth: number,
      canvasHeight: number
    ) => {
      particle.x += particle.vx
      particle.y += particle.vy

      // Wrap around edges
      if (particle.x < 0) particle.x = canvasWidth
      if (particle.x > canvasWidth) particle.x = 0
      if (particle.y < 0) particle.y = canvasHeight
      if (particle.y > canvasHeight) particle.y = 0
    }

    // Draw particle
    const drawParticle = (
      ctx: CanvasRenderingContext2D,
      particle: Particle
    ) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(canvas.width, canvas.height))
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        updateParticle(particle, canvas.width, canvas.height)
        drawParticle(ctx, particle)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [count, colors])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
    />
  )
}