import { useState } from 'react'
import type { InvestigateZone as ZoneType } from '../../types'
import { useAppState, COIN_REWARD_CORRECT, COIN_PENALTY_WRONG } from '../../context/AppState'
import styles from './InvestigateZone.module.css'

interface Props {
  zone: ZoneType
  onResult: (correct: boolean) => void
}

export function InvestigateZoneBlock({ zone, onResult }: Props) {
  const [step, setStep] = useState<'idle' | 'tip' | 'answered'>('idle')
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null)
  const { addCoins, recordCorrect, recordJudged } = useAppState()

  const handleJudge = (answer: boolean) => {
    if (step === 'answered') return
    setUserAnswer(answer)
    setStep('answered')
    recordJudged()
    const correct = answer === zone.isScam
    if (correct) {
      addCoins(COIN_REWARD_CORRECT)
      recordCorrect()
    } else {
      addCoins(-COIN_PENALTY_WRONG)
    }
    onResult(correct)
  }

  if (step === 'answered' && userAnswer !== null) {
    const correct = userAnswer === zone.isScam
    return (
      <div className={styles.wrap}>
        <div className={styles.label}>{zone.label}</div>
        <div className={correct ? styles.correct : styles.wrong}>
          You said {userAnswer ? 'Scam / Fake' : 'Legit'}. {correct ? `Correct! +${COIN_REWARD_CORRECT} coins.` : `Not quite — this one was ${zone.isScam ? 'a scam.' : 'legit.'} -${COIN_PENALTY_WRONG} coins.`}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      {step === 'idle' ? (
        <div
          role="button"
          tabIndex={0}
          className={styles.zoneClickable}
          onClick={() => setStep('tip')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setStep('tip') }}
          aria-label={`Investigate: ${zone.label}`}
        >
          <span className={styles.label}>{zone.label}</span>
          <span className={styles.magnifyHint}>🔍</span>
        </div>
      ) : (
        <>
          <div className={styles.label}>{zone.label}</div>
          <p className={styles.hint}>{zone.hint}</p>
          {zone.question && <p className={styles.question}>{zone.question}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.trueBtn} onClick={() => handleJudge(false)}>✓ Legit</button>
            <button type="button" className={styles.falseBtn} onClick={() => handleJudge(true)}>✗ Scam / Fake</button>
          </div>
        </>
      )}
    </div>
  )
}
