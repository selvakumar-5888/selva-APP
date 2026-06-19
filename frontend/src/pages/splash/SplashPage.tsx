import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SplashPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true })
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: {
      x: number; y: number; vx: number; vy: number; radius: number; alpha: number
    }[] = []
    const particleCount = 60
    let animId: number

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    function connectParticles() {
      if (!ctx || !canvas) return
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(196, 192, 255, ${0.1 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196, 192, 255, ${p.alpha})`
        ctx.fill()
      })
      connectParticles()
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      {/* Ambient glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full"
          style={{
            background: 'rgba(196, 192, 255, 0.2)',
            filter: 'blur(80px)',
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full"
          style={{
            background: 'rgba(238, 193, 60, 0.1)',
            filter: 'blur(80px)',
            animation: 'pulseGlow 4s ease-in-out infinite',
            animationDelay: '-2s',
          }}
        />
      </div>

      {/* Constellation canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1]" />

      {/* Orbiting icons */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
        {[
          { icon: 'auto_stories', size: 24, duration: 15, delay: 0 },
          { icon: 'timer', size: 20, duration: 22, delay: -5 },
          { icon: 'star_rate', size: 28, duration: 18, delay: -10 },
          { icon: 'school', size: 22, duration: 25, delay: -15 },
        ].map((item, i) => (
          <span
            key={i}
            className="material-symbols-outlined absolute"
            style={{
              fontSize: item.size,
              color: 'rgba(196, 192, 255, 0.4)',
              animation: `orbit ${item.duration}s linear infinite`,
              animationDelay: `${item.delay}s`,
            }}
          >
            {item.icon}
          </span>
        ))}
      </div>

      {/* Main content */}
      <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          {/* Logo icon */}
          <div className="w-20 h-20 rounded-full border border-[rgba(196,192,255,0.3)] bg-[rgba(196,192,255,0.05)] flex items-center justify-center mb-2">
            <span
              className="material-symbols-outlined text-[#c4c0ff]"
              style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>

          {/* Title */}
          <div className="relative">
            <h1
              className="text-white tracking-tighter"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(36px, 8vw, 48px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textShadow: '0 0 15px rgba(196, 192, 255, 0.4)',
              }}
            >
              StudyMind AI
            </h1>
            <div className="absolute -inset-2 rounded-xl opacity-50" style={{ background: 'rgba(196,192,255,0.05)', filter: 'blur(20px)' }} />
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 18,
              color: 'rgba(240, 237, 230, 0.7)',
              letterSpacing: '0.02em',
              animation: 'fadeInUp 1s ease-out 0.3s both',
            }}
          >
            Your AI-powered academic brain.
          </p>

          {/* Progress bar */}
          <div
            className="mt-10 rounded-full overflow-hidden relative"
            style={{ width: 280, height: 2, background: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                background: '#c4c0ff',
                boxShadow: '0 0 12px rgba(196, 192, 255, 0.8)',
                animation: 'progressLoad 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards',
              }}
            />
          </div>

          {/* Status label */}
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
              color: 'rgba(199, 196, 216, 0.4)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 500,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            Initializing Matrix
          </span>
        </div>
      </main>

      {/* Corner accents */}
      <div className="fixed top-10 left-10 z-20 hidden md:block opacity-20 border-l border-t border-[rgba(196,192,255,0.4)] w-12 h-12" />
      <div className="fixed bottom-10 right-10 z-20 hidden md:block opacity-20 border-r border-b border-[rgba(196,192,255,0.4)] w-12 h-12" />

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes progressLoad {
          0% { width: 0%; opacity: 0.5; }
          50% { width: 70%; opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
