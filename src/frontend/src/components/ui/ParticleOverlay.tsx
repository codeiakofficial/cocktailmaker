import { useEffect, useRef } from 'react'

const COUNT = 35
const MAX_ALPHA = 0.18
const SPEED = 0.22

interface Particle {
  x: number; y: number
  vx: number; vy: number
  radius: number
  alpha: number
  alphaVel: number
}

function mkParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
    radius: 28 + Math.random() * 60,
    alpha: Math.random() * MAX_ALPHA,
    alphaVel: (0.0002 + Math.random() * 0.0004) * (Math.random() < 0.5 ? 1 : -1),
  }
}

export function ParticleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles.length = 0
      for (let i = 0; i < COUNT; i++) particles.push(mkParticle(canvas.width, canvas.height))
    }

    const tick = () => {
      rafId = requestAnimationFrame(tick)

      if (!document.documentElement.classList.contains('animations')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -p.radius) p.x = canvas.width + p.radius
        if (p.x > canvas.width + p.radius) p.x = -p.radius
        if (p.y < -p.radius) p.y = canvas.height + p.radius
        if (p.y > canvas.height + p.radius) p.y = -p.radius

        p.alpha += p.alphaVel
        if (p.alpha > MAX_ALPHA) { p.alpha = MAX_ALPHA; p.alphaVel *= -1 }
        if (p.alpha < 0)          { p.alpha = 0;         p.alphaVel *= -1 }

        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = p.radius * 2.5
        ctx.shadowColor = color
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 0.25, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
