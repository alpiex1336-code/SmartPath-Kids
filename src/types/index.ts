/** Shared app types */

export type AppId = 'news' | 'social' | 'youtube' | 'email' | 'random' | 'ranking' | 'profile' | 'game'

export interface AppIcon {
  id: AppId
  name: string
  icon: string
  path: string
}

export interface InvestigateZone {
  id: string
  label: string
  hint: string
  question?: string
  isScam: boolean
}

export interface TipResult {
  zoneId: string
  userAnswer: boolean | null
  correct: boolean
  reward: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  reward: number
  unlocked: boolean
  unlockedAt?: string
}

export interface RankEntry {
  rank: number
  username: string
  avatar: string
  coins: number
  accuracy: number
}

export interface DailyReward {
  claimed: boolean
  lastClaimDate: string | null
  amount: number
}
