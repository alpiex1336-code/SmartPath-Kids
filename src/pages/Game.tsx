import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { COIN_PENALTY_WRONG, useAppState } from '../context/AppState'
import { GAME_ITEMS } from '../data/gameData'
import type { GameItem } from '../data/gameData'
import styles from './Game.module.css'

interface DealChallenge {
  id: string
  name: string
  pitch: string
  isScam: boolean
  clue: string
}

const DEAL_CHALLENGES: DealChallenge[] = [
  {
    id: 'd1',
    name: 'Meme Pack Pro',
    pitch: 'Pay 8 coins for 50 funny sticker packs. Preview included before checkout.',
    isScam: false,
    clue: 'Fair because it explains what you get and lets you preview first.',
  },
  {
    id: 'd2',
    name: 'Legend Account Upgrade',
    pitch: 'Send your password and get VIP rank in 1 minute. Secret shortcut!',
    isScam: true,
    clue: 'Scam clue: asking for your password is never safe.',
  },
  {
    id: 'd3',
    name: 'Mystery Creator Giveaway',
    pitch: 'Win giant prizes now! Pay 3 coins verification fee and send full name + school.',
    isScam: true,
    clue: 'Scam clue: urgent prize + personal info + fee is suspicious.',
  },
  {
    id: 'd4',
    name: 'School Club Badge',
    pitch: 'Join the coding club event for 4 coins. Confirmed by teacher announcement board.',
    isScam: false,
    clue: 'Safe clue: comes from a trusted school source with clear details.',
  },
  {
    id: 'd5',
    name: 'Treasure Map DLC',
    pitch: 'One-time 6-coin purchase with refund option and parent guide.',
    isScam: false,
    clue: 'Looks fair because terms are clear and there is a refund option.',
  },
]

export function Game() {
  const { coins, spendCoins, addCoins } = useAppState()
  const [message, setMessage] = useState<string | null>(null)
  const [flipResult, setFlipResult] = useState<'heads' | 'tails' | null>(null)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [dealIndex, setDealIndex] = useState(() => Math.floor(Math.random() * DEAL_CHALLENGES.length))
  const [dealFeedback, setDealFeedback] = useState<string | null>(null)

  const show = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  const nextDeal = () => {
    setDealIndex((prev) => (prev + 1 + Math.floor(Math.random() * (DEAL_CHALLENGES.length - 1))) % DEAL_CHALLENGES.length)
  }

  const handleDealGuess = (answerScam: boolean) => {
    const deal = DEAL_CHALLENGES[dealIndex]
    const correct = answerScam === deal.isScam
    if (correct) {
      addCoins(12)
      setDealFeedback(`Nice detective work! +12 coins. ${deal.clue}`)
    } else {
      addCoins(-COIN_PENALTY_WRONG)
      setDealFeedback(`Not this time. -${COIN_PENALTY_WRONG} coins. ${deal.clue}`)
    }
    setTimeout(() => {
      nextDeal()
      setDealFeedback(null)
    }, 1200)
  }

  const handlePlay = (item: GameItem) => {
    if (item.type === 'offer') {
      if (coins < item.cost) {
        show('Not enough coins!')
        return
      }
      const ok = spendCoins(item.cost)
      if (ok && item.resultMessage) show(item.resultMessage)
      return
    }

    if (item.id === 'flip') {
      if (coins < 5) {
        show('Need 5 coins to play.')
        return
      }
      spendCoins(5)
      const result = Math.random() < 0.5 ? 'heads' : 'tails'
      setFlipResult(result)
      if (result === 'heads') {
        addCoins(8)
        show('Heads! You win 8 coins!')
      } else {
        show('Tails. Try again!')
      }
      setTimeout(() => setFlipResult(null), 2000)
    }

    if (item.id === 'dice') {
      if (coins < 10) {
        show('Need 10 coins to play.')
        return
      }
      spendCoins(10)
      const roll = Math.floor(Math.random() * 6) + 1
      setDiceResult(roll)
      if (roll === 6) {
        addCoins(20)
        show('You rolled 6! You win 20 coins!')
      } else {
        show(`You rolled ${roll}. No win this time.`)
      }
      setTimeout(() => setDiceResult(null), 2000)
    }
  }

  const getActionLabel = (item: GameItem) => {
    if (item.type === 'offer') return `Buy (${item.cost} coins)`
    if (item.id === 'flip') return `Flip (${item.cost} coins)`
    if (item.id === 'dice') return `Roll (${item.cost} coins)`
    return `Play (${item.cost} coins)`
  }

  return (
    <Shell title="Game">
      <div className={styles.card}>
        <p className={styles.balance}>Your balance: 🪙 {coins}</p>
        <p className={styles.hint}>Fun mode + scam detective mode. Good choices help you keep more coins!</p>

        <section className={styles.detectiveSection}>
          <h3 className={styles.detectiveTitle}>🕵️ Deal Detective Challenge</h3>
          <p className={styles.detectiveName}>{DEAL_CHALLENGES[dealIndex].name}</p>
          <p className={styles.detectivePitch}>{DEAL_CHALLENGES[dealIndex].pitch}</p>
          <div className={styles.detectiveActions}>
            <button type="button" className={styles.legitBtn} onClick={() => handleDealGuess(false)}>
              Looks Legit
            </button>
            <button type="button" className={styles.scamBtn} onClick={() => handleDealGuess(true)}>
              Scam Alert
            </button>
          </div>
          {dealFeedback && <p className={styles.detectiveFeedback}>{dealFeedback}</p>}
        </section>

        <h3 className={styles.arcadeTitle}>🎲 Mini Arcade</h3>
        <ul className={styles.gameList}>
          {GAME_ITEMS.map((item) => (
            <li key={item.id} className={styles.gameRow}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                {(flipResult && item.id === 'flip') && (
                  <span className={styles.result}>Result: {flipResult}</span>
                )}
                {(diceResult !== null && item.id === 'dice') && (
                  <span className={styles.result}>Rolled: {diceResult}</span>
                )}
              </div>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => handlePlay(item)}
              >
                {getActionLabel(item)}
              </button>
            </li>
          ))}
        </ul>

        {message && <div className={styles.toast}>{message}</div>}
      </div>
    </Shell>
  )
}
