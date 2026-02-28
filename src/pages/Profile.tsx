import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { useAppState } from '../context/AppState'
import styles from './Profile.module.css'

export function Profile() {
  const { coins, username, setUsername, dailyReward, claimDaily, achievements } = useAppState()
  const [editing, setEditing] = useState(false)
  const [inputName, setInputName] = useState(username)
  const [claimMessage, setClaimMessage] = useState<string | null>(null)

  const today = new Date().toDateString()
  const alreadyClaimed = dailyReward.lastClaimDate === today

  const handleClaim = () => {
    const { success, amount } = claimDaily()
    if (success) setClaimMessage(`You claimed ${amount} coins!`)
    else setClaimMessage('Already claimed today.')
    setTimeout(() => setClaimMessage(null), 2000)
  }

  const handleSaveName = () => {
    setUsername(inputName.trim() || 'Detective')
    setEditing(false)
  }

  return (
    <Shell title="Profile">
      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatar}>🕵️</span>
        </div>
        {editing ? (
          <div className={styles.nameEdit}>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className={styles.input}
              autoFocus
            />
            <button type="button" className={styles.btn} onClick={handleSaveName}>Save</button>
          </div>
        ) : (
          <h2 className={styles.name} onClick={() => setEditing(true)}>{username}</h2>
        )}
        <p className={styles.coins}>🪙 {coins} coins</p>

        <section className={styles.section}>
          <h3>Daily reward</h3>
          <button
            type="button"
            className={alreadyClaimed ? styles.claimDisabled : styles.claimBtn}
            onClick={handleClaim}
            disabled={alreadyClaimed}
          >
            {alreadyClaimed ? 'Claimed today' : 'Claim 50 coins'}
          </button>
          {claimMessage && <p className={styles.claimMsg}>{claimMessage}</p>}
        </section>

        <section className={styles.section}>
          <h3>Achievements</h3>
          <ul className={styles.achievements}>
            {achievements.map((a) => (
              <li key={a.id} className={a.unlocked ? styles.achievementUnlocked : styles.achievementLocked}>
                <span>{a.icon}</span>
                <div>
                  <strong>{a.name}</strong>
                  <p>{a.description}</p>
                  {a.unlocked && <span className={styles.reward}>+{a.reward} coins</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  )
}
