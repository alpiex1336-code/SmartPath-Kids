import type { InvestigateZone } from '../types'
import type { InvestigationScenario } from './aiClient'

export type ScenarioKind = InvestigationScenario['kind']

export interface StoredScenario extends InvestigationScenario {
  id: string
  createdAt: string
  level: 'primary' | 'secondary'
}

const STORAGE_KEY = 'scam_demo_ai_question_bank'

function readAll(): StoredScenario[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as StoredScenario[]
  } catch {
    return []
  }
}

function writeAll(items: StoredScenario[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / privacy errors – question bank is a best-effort cache
  }
}

export function saveScenario(scenario: InvestigationScenario, level: 'primary' | 'secondary'): StoredScenario {
  const existing = readAll()
  const stored: StoredScenario = {
    ...scenario,
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    level,
  }
  const next = [stored, ...existing].slice(0, 100)
  writeAll(next)
  return stored
}

export function listScenarios(kind?: ScenarioKind): StoredScenario[] {
  const all = readAll()
  if (!kind) return all
  return all.filter((s) => s.kind === kind)
}

export function getLatestScenario(kind?: ScenarioKind, level?: 'primary' | 'secondary'): StoredScenario | null {
  const all = listScenarios(kind)
  if (!all.length) return null
  if (!level) return all[0]
  const filtered = all.find((s) => s.level === level)
  return filtered ?? all[0]
}

/** Phrases to avoid in new AI scenarios (from recent stored scenarios). Used to force variety. */
export function getRecentPhrasesToAvoid(limit = 30): string[] {
  const all = readAll().slice(0, 15)
  const phrases = new Set<string>()
  const banned = [
    '1000 free coins',
    'free coins',
    'unlimited coins',
    'win a free phone',
    'click here',
    'act now',
    'instant access',
    'only today',
    'limited time',
    'tell your friends',
  ]
  banned.forEach((p) => phrases.add(p.toLowerCase()))

  for (const s of all) {
    if (s.title) phrases.add(s.title.trim().toLowerCase())
    const body = (s.corruptedBody || s.body || '').slice(0, 200)
    body.split(/\s+/).filter((w) => w.length >= 4).slice(0, 10).forEach((w) => phrases.add(w.toLowerCase()))
    for (const z of s.zones || []) {
      if (z.label) phrases.add(z.label.trim().toLowerCase())
    }
  }
  return Array.from(phrases).slice(0, limit)
}

export function scenarioToInvestigateZones(scenario: InvestigationScenario): InvestigateZone[] {
  const bodyText = (scenario.corruptedBody || scenario.body || '').trim()
  const rawZones: InvestigateZone[] = scenario.zones.map((z) => ({
    id: z.id,
    label: z.label,
    hint: z.hint,
    question: z.question,
    isScam: z.isScam,
  }))

  if (!rawZones.length) return rawZones

  const MAX_ZONES = 5

  // Use a simple heuristic so that longer pieces of text usually get more questions.
  let desiredCount: number
  if (!bodyText || bodyText.length <= 280) {
    // Very short or missing body: keep things light.
    desiredCount = Math.min(rawZones.length, 3)
  } else if (bodyText.length <= 600) {
    desiredCount = Math.min(rawZones.length, 4)
  } else {
    desiredCount = Math.min(rawZones.length, MAX_ZONES)
  }

  const limited = rawZones.slice(0, Math.min(MAX_ZONES, desiredCount))
  return limited
}

