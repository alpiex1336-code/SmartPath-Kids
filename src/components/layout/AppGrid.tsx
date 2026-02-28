import { Link } from 'react-router-dom'
import { APP_ICONS } from '../../data/appIcons'
import styles from './AppGrid.module.css'

export function AppGrid() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>TrueNorth Kids</h1>
        <p className={styles.subtitle}>Choose a category to begin your mission</p>
      </section>
      <div className={styles.frame}>
        <div className={styles.grid}>
          {APP_ICONS.map((app) => (
            <Link key={app.id} to={app.path} className={styles.iconWrap}>
              <span className={styles.icon}>{app.icon}</span>
              <span className={styles.name}>{app.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
