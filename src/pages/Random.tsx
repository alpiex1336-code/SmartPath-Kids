import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { InvestigateZoneBlock } from '../components/investigate/InvestigateZone'
import { InvestigationChat } from '../components/investigate/InvestigationChat'
import { NEWS_ARTICLES, SOCIAL_POSTS, EMAIL_ITEMS, YOUTUBE_ITEMS } from '../data/mockContent'
import { generateAndStoreRandomScenario } from '../services/investigationScenario'
import { scenarioToInvestigateZones } from '../services/questionBank'
import styles from './Random.module.css'

type ContentKind = 'news' | 'social' | 'email' | 'youtube'

const ALL_ITEMS: { kind: ContentKind; id: string; title: string; zones: { id: string; label: string; hint: string; question?: string; isScam: boolean }[] }[] = [
  ...NEWS_ARTICLES.map((a) => ({ kind: 'news' as ContentKind, id: a.id, title: a.title, zones: a.zones })),
  ...SOCIAL_POSTS.map((p) => ({ kind: 'social' as ContentKind, id: p.id, title: p.text.slice(0, 40) + '...', zones: p.zones })),
  ...EMAIL_ITEMS.map((e) => ({ kind: 'email' as ContentKind, id: e.id, title: e.subject, zones: e.zones })),
  ...YOUTUBE_ITEMS.map((v) => ({ kind: 'youtube' as ContentKind, id: v.id, title: v.title, zones: v.zones })),
]

export function Random() {
  const [current] = useState(() => ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiTitle, setAiTitle] = useState<string | null>(null)
  const [aiKind, setAiKind] = useState<ContentKind | null>(null)
  const [aiZones, setAiZones] = useState<typeof current.zones | null>(null)

  const runAiMission = async () => {
    setAiError(null)
    setAiLoading(true)
    try {
      const scenario = await generateAndStoreRandomScenario({ level: 'primary' })
      setAiTitle(scenario.title)
      setAiKind(scenario.kind as ContentKind)
      setAiZones(scenarioToInvestigateZones(scenario))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      setAiError(`Could not load a new AI mission: ${message}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Shell title="Random Mission">
      <div className={styles.layout}>
        <div className={styles.card}>
          <p className={styles.badge}>Random mission</p>
          <p className={styles.source}>
            From:&nbsp;
            {aiKind ?? current.kind}
          </p>
          <h2 className={styles.title}>{aiTitle ?? current.title}</h2>
          <h4 className={styles.zoneTitle}>🔍 Investigate</h4>
          {(aiZones ?? current.zones).map((zone) => (
            <InvestigateZoneBlock key={zone.id} zone={zone} onResult={() => {}} />
          ))}
          <div className={styles.actionsRow}>
            <button type="button" className={styles.nextBtn} onClick={() => { void runAiMission() }} disabled={aiLoading}>
              {aiLoading ? 'Loading new questions…' : 'New questions'}
            </button>
          </div>
          {aiError && <p className={styles.error}>{aiError}</p>}
        </div>
        <aside className={styles.aside}>
          <InvestigationChat contextLabel={aiTitle ?? current.title} />
        </aside>
      </div>
    </Shell>
  )
}
