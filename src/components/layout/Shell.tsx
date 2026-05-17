import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppState'
import styles from './Shell.module.css'

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  const { coins } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/app'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        {!isHome && (
          <>
            <div className={styles.navGroup}>
              <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Back">
                ← Back
              </button>
              <button type="button" className={styles.homeBtn} onClick={() => navigate('/app')} aria-label="Home">
                Home
              </button>
            </div>
          </>
        )}
        {isHome && (
          <span className={styles.logo}>
            <span className={styles.logoEmoji} aria-hidden>🛡️</span>
            TrueNorth Kids
          </span>
        )}
        {title && !isHome && <span className={styles.title}>{title}</span>}
        <div className={styles.coins}>
          <span className={styles.coinIcon}>🪙</span>
          <span>{coins}</span>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
