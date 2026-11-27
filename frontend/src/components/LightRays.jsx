import { useEffect, useRef } from 'react'

export default function LightRays({ color = '#ffffff', speed = 1.0, opacity = 0.3, raysColor = 'rgba(255,255,255,0.3)' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw soft light rays from top center
      const centerX = canvas.width / 2
      const centerY = canvas.height * 0.2

      // Create gradient rays
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const length = canvas.height * (0.5 + Math.random() * 0.5)

        const x1 = centerX + Math.cos(angle) * 100
        const y1 = centerY + Math.sin(angle) * 50

        const x2 = centerX + Math.cos(angle) * length
        const y2 = centerY + Math.sin(angle) * length

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, raysColor)
        gradient.addColorStop(1, 'transparent')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 20
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Draw soft glow at center
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, canvas.width * 0.4
      )
      glowGradient.addColorStop(0, 'rgba(125, 211, 252, 0.15)')
      glowGradient.addColorStop(1, 'transparent')

      ctx.fillStyle = glowGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [color, speed, opacity, raysColor])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: opacity,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  )
}