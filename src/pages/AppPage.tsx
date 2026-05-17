import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AppPage.module.css'

type DeviceMode = 'phone' | 'computer'
type BubblePhase = 'alive' | 'fading' | 'popping'

interface Bubble {
  id: string
  x: number
  y: number
  size: number
  color: string
  phase: BubblePhase
}

const mainApps = [
  { label: 'News', icon: '📰', path: '/news' },
  { label: 'Social Media', icon: '💬', path: '/social' },
  { label: 'YouTube', icon: '▶️', path: '/youtube' },
  { label: 'Email', icon: '✉️', path: '/email' },
]

const BUBBLE_COLORS = [
  'hsl(208 92% 58% / 0.88)',
  'hsl(190 88% 52% / 0.86)',
  'hsl(266 80% 62% / 0.86)',
  'hsl(338 82% 64% / 0.84)',
  'hsl(145 72% 48% / 0.84)',
  'hsl(34 92% 56% / 0.84)',
]

export function AppPage() {
  const [mode, setMode] = useState<DeviceMode>('phone')
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const navigate = useNavigate()
  const stageRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const bubbleTimersRef = useRef<Record<string, { fade: number; remove: number }>>({})

  useEffect(() => {
    const createBubble = () => {
      const stageEl = stageRef.current
      const screenEl = screenRef.current
      if (!stageEl || !screenEl) return

      setBubbles((prev) => {
        if (prev.length >= 10) return prev

        const stage = stageEl.getBoundingClientRect()
        const screen = screenEl.getBoundingClientRect()
        const bubbleSize = 30 + Math.random() * 36
        const protectedMargin = 20
        const protectedRect = {
          left: screen.left - stage.left - protectedMargin,
          right: screen.right - stage.left + protectedMargin,
          top: screen.top - stage.top - protectedMargin,
          bottom: screen.bottom - stage.top + protectedMargin,
        }

        let x = 0
        let y = 0
        let placed = false
        const maxX = Math.max(0, stage.width - bubbleSize)
        const maxY = Math.max(0, stage.height - bubbleSize)

        for (let i = 0; i < 30; i += 1) {
          const nx = Math.random() * maxX
          const ny = Math.random() * maxY
          const overlapsProtected =
            nx < protectedRect.right &&
            nx + bubbleSize > protectedRect.left &&
            ny < protectedRect.bottom &&
            ny + bubbleSize > protectedRect.top
          if (!overlapsProtected) {
            x = nx
            y = ny
            placed = true
            break
          }
        }

        if (!placed) return prev

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const nextBubble: Bubble = {
          id,
          x,
          y,
          size: bubbleSize,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          phase: 'alive',
        }

        const fadeTimer = window.setTimeout(() => {
          setBubbles((current) => current.map((b) => (b.id === id ? { ...b, phase: 'fading' } : b)))
        }, 2400)

        const removeTimer = window.setTimeout(() => {
          setBubbles((current) => current.filter((b) => b.id !== id))
          delete bubbleTimersRef.current[id]
        }, 3000)

        bubbleTimersRef.current[id] = { fade: fadeTimer, remove: removeTimer }
        return [...prev, nextBubble]
      })
    }

    const intervalId = window.setInterval(createBubble, 800)
    return () => {
      window.clearInterval(intervalId)
      Object.values(bubbleTimersRef.current).forEach((t) => {
        window.clearTimeout(t.fade)
        window.clearTimeout(t.remove)
      })
      bubbleTimersRef.current = {}
    }
  }, [mode])

  const popBubble = (id: string) => {
    const timers = bubbleTimersRef.current[id]
    if (timers) {
      window.clearTimeout(timers.fade)
      window.clearTimeout(timers.remove)
    }
    setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, phase: 'popping' } : b)))
    const removeTimer = window.setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id))
      delete bubbleTimersRef.current[id]
    }, 280)
    bubbleTimersRef.current[id] = { fade: 0, remove: removeTimer }
  }

  return (
    <div className={styles.page} ref={stageRef}>
      <div className={styles.bubbleLayer} aria-hidden>
        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            type="button"
            className={`${styles.bubble} ${bubble.phase === 'fading' ? styles.bubbleFading : ''} ${bubble.phase === 'popping' ? styles.bubblePopping : ''}`}
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              background: `radial-gradient(circle at 30% 28%, hsl(0 0% 100% / 0.8), ${bubble.color})`,
            }}
            onClick={() => popBubble(bubble.id)}
            aria-label="Bubble"
          />
        ))}
      </div>
      <div className={styles.toggleRow}>
        <button
          type="button"
          className={mode === 'phone' ? styles.toggleActive : styles.toggle}
          onClick={() => setMode('phone')}
        >
          Phone
        </button>
        <button
          type="button"
          className={mode === 'computer' ? styles.toggleActive : styles.toggle}
          onClick={() => setMode('computer')}
        >
          Computer
        </button>
      </div>

      {mode === 'phone' ? (
        <div className="phone-frame" ref={screenRef}>
          <DeviceContent navigate={navigate} />
        </div>
      ) : (
        <div className={styles.desktopWrap} ref={screenRef}>
          <div className="computer-frame">
            <DeviceContent navigate={navigate} />
          </div>
          <div className="computer-stand" />
          <div className="computer-base" />
        </div>
      )}
    </div>
  )
}

function DeviceContent({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className={styles.deviceContent}>
      <div className={styles.topBar}>
        <button type="button" onClick={() => navigate('/random')}>Random</button>
        <button type="button" onClick={() => navigate('/ranking')}>Ranking</button>
        <button type="button" onClick={() => navigate('/profile')}>Profile</button>
      </div>

      <div className={styles.grid}>
        {mainApps.map((app) => (
          <button key={app.path} type="button" className={styles.card} onClick={() => navigate(app.path)}>
            <span className={styles.cardIcon}>{app.icon}</span>
            <span className={styles.cardLabel}>{app.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.gameButton} onClick={() => navigate('/game')}>
          Game Start
        </button>
      </div>
    </div>
  )
}
