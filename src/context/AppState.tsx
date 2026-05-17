import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Achievement, DailyReward, RankEntry } from '../types'

const COIN_REWARD_CORRECT = 10
const COIN_PENALTY_WRONG = 5
const DAILY_COINS = 50
const STORAGE_KEYS = {
  coins: 'scam_demo_coins',
  lastDaily: 'scam_demo_last_daily',
  achievements: 'scam_demo_achievements',
  totalCorrect: 'scam_demo_total_correct',
  totalJudged: 'scam_demo_total_judged',
  username: 'scam_demo_username',
}

function loadNumber(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key)
    return v != null ? parseInt(v, 10) : fallback
  } catch {
    return fallback
  }
}

function loadString(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: string | number) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    //
  }
}

const defaultAchievements: Achievement[] = [
  { id: 'first_10', name: 'First 10', description: 'Get 10 correct investigations', icon: '🎯', reward: 20, unlocked: false },
  { id: 'streak_5', name: 'Hot Streak', description: '5 correct in a row', icon: '🔥', reward: 30, unlocked: false },
  { id: 'email_hero', name: 'Email Hero', description: 'Spot your first email scam', icon: '📧', reward: 25, unlocked: false },
]

interface AppStateValue {
  coins: number
  addCoins: (n: number) => void
  spendCoins: (n: number) => boolean
  correctCount: number
  judgedCount: number
  recordCorrect: () => void
  recordJudged: () => void
  accuracy: number
  dailyReward: DailyReward
  claimDaily: () => { success: boolean; amount: number }
  achievements: Achievement[]
  unlockAchievement: (id: string) => void
  username: string
  setUsername: (s: string) => void
  rankByCoins: RankEntry[]
  rankByAccuracy: RankEntry[]
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState(() => loadNumber(STORAGE_KEYS.coins, 100))
  const [correctCount, setCorrectCount] = useState(() => loadNumber(STORAGE_KEYS.totalCorrect, 0))
  const [judgedCount, setJudgedCount] = useState(() => loadNumber(STORAGE_KEYS.totalJudged, 0))
  const [lastDaily, setLastDaily] = useState<string | null>(() => loadString(STORAGE_KEYS.lastDaily, '') || null)
  const [username, setUsernameState] = useState(() => loadString(STORAGE_KEYS.username, 'Detective'))
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.achievements)
      if (raw) {
        const parsed = JSON.parse(raw) as Achievement[]
        return parsed.length ? parsed : defaultAchievements
      }
    } catch {
      //
    }
    return defaultAchievements
  })

  const addCoins = useCallback((n: number) => {
    setCoins((c) => {
      const next = Math.max(0, c + n)
      save(STORAGE_KEYS.coins, next)
      return next
    })
  }, [])

  const spendCoins = useCallback((n: number) => {
    if (n <= 0) return true
    setCoins((c) => {
      if (c < n) return c
      const next = c - n
      save(STORAGE_KEYS.coins, next)
      return next
    })
    return coins >= n
  }, [coins])

  const recordCorrect = useCallback(() => {
    setCorrectCount((n) => {
      const next = n + 1
      save(STORAGE_KEYS.totalCorrect, next)
      return next
    })
  }, [])

  const recordJudged = useCallback(() => {
    setJudgedCount((n) => {
      const next = n + 1
      save(STORAGE_KEYS.totalJudged, next)
      return next
    })
  }, [])

  const accuracy = judgedCount === 0 ? 0 : Math.round((correctCount / judgedCount) * 100)

  const dailyReward: DailyReward = useMemo(() => ({
    claimed: false,
    lastClaimDate: lastDaily,
    amount: DAILY_COINS,
  }), [lastDaily])

  const claimDaily = useCallback(() => {
    const today = new Date().toDateString()
    if (lastDaily === today) return { success: false, amount: 0 }
    setLastDaily(today)
    save(STORAGE_KEYS.lastDaily, today)
    setCoins((c) => {
      const next = c + DAILY_COINS
      save(STORAGE_KEYS.coins, next)
      return next
    })
    return { success: true, amount: DAILY_COINS }
  }, [lastDaily])

  const setUsername = useCallback((s: string) => {
    setUsernameState(s)
    save(STORAGE_KEYS.username, s)
  }, [])

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((list) => {
      const next = list.map((a) =>
        a.id === id && !a.unlocked
          ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
          : a
      )
      try {
        localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(next))
      } catch {
        //
      }
      return next
    })
  }, [])

  const rankByCoins: RankEntry[] = useMemo(() => {
    const acc = judgedCount > 0 ? Math.round((correctCount / judgedCount) * 100) : 0
    return [
      { rank: 1, username, avatar: '🕵️', coins, accuracy: acc },
      { rank: 2, username: 'Alice', avatar: '👩', coins: Math.max(0, coins - 30), accuracy: 85 },
      { rank: 3, username: 'Bob', avatar: '👨', coins: Math.max(0, coins - 50), accuracy: 78 },
    ].sort((a, b) => b.coins - a.coins)
      .map((e, i) => ({ ...e, rank: i + 1 }))
  }, [username, coins, correctCount, judgedCount])

  const rankByAccuracy: RankEntry[] = useMemo(() => {
    const acc = judgedCount > 0 ? Math.round((correctCount / judgedCount) * 100) : 0
    return [
      { rank: 1, username, avatar: '🕵️', coins, accuracy: acc },
      { rank: 2, username: 'Alice', avatar: '👩', coins: 80, accuracy: 85 },
      { rank: 3, username: 'Bob', avatar: '👨', coins: 60, accuracy: 78 },
    ].sort((a, b) => b.accuracy - a.accuracy)
      .map((e, i) => ({ ...e, rank: i + 1 }))
  }, [username, coins, correctCount, judgedCount])

  const value: AppStateValue = useMemo(
    () => ({
      coins,
      addCoins,
      spendCoins,
      correctCount,
      judgedCount,
      recordCorrect,
      recordJudged,
      accuracy,
      dailyReward,
      claimDaily,
      achievements,
      unlockAchievement,
      username,
      setUsername,
      rankByCoins,
      rankByAccuracy,
    }),
    [
      coins,
      addCoins,
      spendCoins,
      correctCount,
      judgedCount,
      recordCorrect,
      recordJudged,
      accuracy,
      dailyReward,
      claimDaily,
      achievements,
      unlockAchievement,
      username,
      rankByCoins,
      rankByAccuracy,
    ]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export { COIN_REWARD_CORRECT }
export { COIN_PENALTY_WRONG }
