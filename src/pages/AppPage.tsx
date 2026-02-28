import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AppPage.module.css'

type DeviceMode = 'phone' | 'computer'

const mainApps = [
  { label: 'News', icon: '📰', path: '/news' },
  { label: 'Social Media', icon: '💬', path: '/social' },
  { label: 'YouTube', icon: '▶️', path: '/youtube' },
  { label: 'Email', icon: '✉️', path: '/email' },
]

export function AppPage() {
  const [mode, setMode] = useState<DeviceMode>('phone')
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
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
        <div className="phone-frame">
          <DeviceContent navigate={navigate} />
        </div>
      ) : (
        <div className={styles.desktopWrap}>
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
