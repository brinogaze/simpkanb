import React, { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  z: number
  r: number
  twinkle: number
}

interface Props {
  paused?: boolean
}

export function GalaxyBackground({ paused = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const stars: Star[] = []
    let width = 0
    let height = 0
    let raf = 0
    let lastTime = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars.length = 0
      const count = Math.floor((width * height) / 16000)
      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          z: 0.25 + Math.random() * 0.75,
          r: 0.4 + Math.random() * 1.6,
          twinkle: Math.random() * Math.PI * 2,
        })
      }
    }

    const onMove = (e: PointerEvent) => {
      mouseRef.current.tx = e.clientX / Math.max(width, 1)
      mouseRef.current.ty = e.clientY / Math.max(height, 1)
    }

    const render = (time: number) => {
      const dt = time - lastTime
      if (dt < 33) {
        raf = requestAnimationFrame(render)
        return
      }
      lastTime = time

      const m = mouseRef.current
      m.x += (m.tx - m.x) * 0.06
      m.y += (m.ty - m.y) * 0.06

      ctx.clearRect(0, 0, width, height)

      // Nebula gradients
      const g1 = ctx.createRadialGradient(
        width * (0.7 + (m.x - 0.5) * 0.08),
        height * (0.25 + (m.y - 0.5) * 0.05),
        0,
        width * 0.7,
        height * 0.25,
        width * 0.55
      )
      g1.addColorStop(0, 'rgba(0, 217, 255, 0.16)')
      g1.addColorStop(1, 'rgba(0, 217, 255, 0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, width, height)

      const g2 = ctx.createRadialGradient(
        width * (0.25 - (m.x - 0.5) * 0.06),
        height * (0.75 - (m.y - 0.5) * 0.04),
        0,
        width * 0.25,
        height * 0.75,
        width * 0.45
      )
      g2.addColorStop(0, 'rgba(138, 43, 226, 0.14)')
      g2.addColorStop(1, 'rgba(138, 43, 226, 0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, width, height)

      // Pointer glow
      const px = m.x * width
      const py = m.y * height
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 220)
      glow.addColorStop(0, 'rgba(111, 217, 255, 0.16)')
      glow.addColorStop(1, 'rgba(111, 217, 255, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      // Stars
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i]
        const driftX = (m.x - 0.5) * s.z * 22
        const driftY = (m.y - 0.5) * s.z * 18
        const x = s.x * width + driftX
        const y = s.y * height + driftY
        const a = 0.45 + 0.45 * Math.sin(time * 0.0012 + s.twinkle)
        ctx.globalAlpha = a * (0.5 + s.z * 0.5)
        ctx.fillStyle = '#cdd8ff'
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(render)
    }

    const renderStatic = () => {
      const now = performance.now()
      lastTime = now
      const m = mouseRef.current
      const time = now
      ctx.clearRect(0, 0, width, height)

      const g1 = ctx.createRadialGradient(
        width * (0.7 + (m.x - 0.5) * 0.08),
        height * (0.25 + (m.y - 0.5) * 0.05),
        0,
        width * 0.7,
        height * 0.25,
        width * 0.55
      )
      g1.addColorStop(0, 'rgba(0, 217, 255, 0.16)')
      g1.addColorStop(1, 'rgba(0, 217, 255, 0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, width, height)

      const g2 = ctx.createRadialGradient(
        width * (0.25 - (m.x - 0.5) * 0.06),
        height * (0.75 - (m.y - 0.5) * 0.04),
        0,
        width * 0.25,
        height * 0.75,
        width * 0.45
      )
      g2.addColorStop(0, 'rgba(138, 43, 226, 0.14)')
      g2.addColorStop(1, 'rgba(138, 43, 226, 0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i]
        const x = s.x * width
        const y = s.y * height
        const a = 0.45 + 0.45 * Math.sin(time * 0.0012 + s.twinkle)
        ctx.globalAlpha = a * (0.5 + s.z * 0.5)
        ctx.fillStyle = '#cdd8ff'
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    resize()
    window.addEventListener('resize', resize)
    if (paused) {
      renderStatic()
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(render)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [paused])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-90"
      aria-hidden="true"
    />
  )
}
