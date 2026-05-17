import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { useAppState } from '../context/AppState'
import styles from './Ranking.module.css'

export function Ranking() {
  const { rankByCoins, rankByAccuracy } = useAppState()
  const [tab, setTab] = useState<'coins' | 'accuracy'>('coins')
  const list = tab === 'coins' ? rankByCoins : rankByAccuracy

  return (
    <Shell title="Ranking">
      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === 'coins' ? styles.tabActive : styles.tab}
          onClick={() => setTab('coins')}
        >
          🪙 Most coins
        </button>
        <button
          type="button"
          className={tab === 'accuracy' ? styles.tabActive : styles.tab}
          onClick={() => setTab('accuracy')}
        >
          🎯 Best accuracy
        </button>
      </div>
      <ul className={styles.list}>
        {list.map((e) => (
          <li key={e.rank} className={styles.row}>
            <span className={styles.rank}>#{e.rank}</span>
            <span className={styles.avatar}>{e.avatar}</span>
            <span className={styles.name}>{e.username}</span>
            <span className={styles.value}>
              {tab === 'coins' ? `${e.coins} coins` : `${e.accuracy}%`}
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
