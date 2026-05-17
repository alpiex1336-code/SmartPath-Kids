import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { InvestigateZoneBlock } from '../components/investigate/InvestigateZone'
import { InvestigationChat } from '../components/investigate/InvestigationChat'
import { NEWS_ARTICLES } from '../data/mockContent'
import type { NewsArticle } from '../data/mockContent'
import { generateInvestigationScenario } from '../services/aiClient'
import { saveScenario, scenarioToInvestigateZones, getRecentPhrasesToAvoid } from '../services/questionBank'
import { fetchRandomEducationalSnippet } from '../services/eduContent'
import styles from './ContentPage.module.css'

export function News() {
  const [article, setArticle] = useState<NewsArticle | null>(NEWS_ARTICLES[0])
  const [, setDoneZones] = useState<Record<string, boolean>>({})
  const [aiZones, setAiZones] = useState<NewsArticle['zones'] | null>(null)
  const [aiTitle, setAiTitle] = useState<string | null>(null)
  const [aiBody, setAiBody] = useState<string | null>(null)
  const [aiAuthor, setAiAuthor] = useState<string | null>(null)
  const [aiDate, setAiDate] = useState<string | null>(null)
  const [aiExcerpt, setAiExcerpt] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const regenerateZones = async () => {
    if (!article) return
    setAiError(null)
    setAiLoading(true)
    try {
      const snippet = await fetchRandomEducationalSnippet('primary')
      if (!snippet) {
        throw new Error('Could not fetch educational content for a new article')
      }
      const scenario = await generateInvestigationScenario({
        appKind: 'news',
        baseText: snippet.summary,
        level: 'primary',
        avoidPhrases: getRecentPhrasesToAvoid(),
        forcedTheme: `a news article about ${snippet.topic}`,
      })
      saveScenario(scenario, 'primary')
      setAiTitle(scenario.title)
      setAiBody(scenario.corruptedBody || scenario.body)
      setAiAuthor('Safety Reporter')
      setAiDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
      const firstSentence = (scenario.body || scenario.corruptedBody || '').split('\n')[0]
      setAiExcerpt(firstSentence)
      setAiZones(scenarioToInvestigateZones(scenario) as NewsArticle['zones'])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      setAiError(`Could not generate new questions: ${message}`)
    } finally {
      setAiLoading(false)
    }
  }

  if (!article) return null

  const currentZones = (aiZones ?? article.zones)


  return (
    <Shell title="News">
      <div className={styles.twoCol}>
      <div className={styles.card}>
        <h1 className={styles.articleTitle}>{aiTitle ?? article.title}</h1>
        <p className={styles.meta}>{aiAuthor ?? article.author} · {aiDate ?? article.date}</p>
        <p className={styles.excerpt}>{aiExcerpt ?? article.excerpt}</p>
        <div className={styles.body}>{aiBody ?? article.body}</div>
        <hr className={styles.hr} />
        <h3 className={styles.sectionTitle}>🔍 Investigate these areas</h3>
        {currentZones.map((zone) => (
          <InvestigateZoneBlock
            key={zone.id}
            zone={zone}
            onResult={() => {
              setDoneZones((d) => {
                const next = { ...d, [zone.id]: true }
                const allDone = currentZones.every((z) => next[z.id])
                if (allDone) {
                  void regenerateZones()
                }
                return next
              })
            }}
          />
        ))}
        <button
          type="button"
          className={styles.aiButton}
          onClick={() => { void regenerateZones() }}
          disabled={aiLoading}
        >
          {aiLoading ? 'Making new questions…' : 'New questions'}
        </button>
        {aiError && <p className={styles.aiError}>{aiError}</p>}
      </div>
      <aside className={styles.aside}>
        <InvestigationChat contextLabel={article.title} />
      </aside>
      </div>
      <div className={styles.articleList}>
        <p className={styles.listTitle}>More articles</p>
        {NEWS_ARTICLES.map((a) => (
          <button
            key={a.id}
            type="button"
            className={styles.articleLink}
            onClick={() => {
              setArticle(a)
              setDoneZones({})
            }}
          >
            {a.title}
          </button>
        ))}
      </div>
    </Shell>
  )
}
