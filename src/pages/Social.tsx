import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { InvestigateZoneBlock } from '../components/investigate/InvestigateZone'
import { InvestigationChat } from '../components/investigate/InvestigationChat'
import { SOCIAL_POSTS } from '../data/mockContent'
import type { SocialPost } from '../data/mockContent'
import { generateInvestigationScenario } from '../services/aiClient'
import { saveScenario, scenarioToInvestigateZones, getRecentPhrasesToAvoid } from '../services/questionBank'
import styles from './Social.module.css'

type Reaction = 'up' | 'down' | null

export function Social() {
  const [posts] = useState(SOCIAL_POSTS)
  const [reactions, setReactions] = useState<Record<string, Reaction>>({})
  const [aiZonesByPost, setAiZonesByPost] = useState<Record<string, SocialPost['zones']>>({})
  const [aiTextByPost, setAiTextByPost] = useState<Record<string, string>>({})
  const [, setCompletedZonesByPost] = useState<Record<string, Record<string, boolean>>>({})
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null)
  const [errorByPost, setErrorByPost] = useState<Record<string, string>>({})

  const setReaction = (postId: string, value: 'up' | 'down') => {
    setReactions((r) => {
      const current = r[postId]
      const next = current === value ? null : value
      return { ...r, [postId]: next }
    })
  }

  const regenerateZonesForPost = async (post: SocialPost) => {
    setLoadingPostId(post.id)
    setErrorByPost((prev) => ({ ...prev, [post.id]: '' }))
    try {
      const scenario = await generateInvestigationScenario({
        appKind: 'social',
        baseText: post.text,
        level: 'primary',
        avoidPhrases: getRecentPhrasesToAvoid(),
        forcedTheme: `a social media post by "${post.author}" about: ${post.text.slice(0, 60)}`,
      })
      saveScenario(scenario, 'primary')
      setAiTextByPost((prev) => ({
        ...prev,
        [post.id]: scenario.corruptedBody || scenario.body,
      }))
      setAiZonesByPost((prev) => ({
        ...prev,
        [post.id]: scenarioToInvestigateZones(scenario) as SocialPost['zones'],
      }))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      setErrorByPost((prev) => ({ ...prev, [post.id]: `Could not generate new questions: ${message}` }))
    } finally {
      setLoadingPostId(null)
    }
  }

  return (
    <Shell title="Social">
      <div className={styles.twoCol}>
        <div className={styles.feed}>
          {posts.map((post) => (
            <div key={post.id} className={styles.post}>
              <div className={styles.postHeader}>
                <span className={styles.avatar}>{post.avatar}</span>
                <span className={styles.author}>{post.author}</span>
              </div>
              <p className={styles.text}>{aiTextByPost[post.id] ?? post.text}</p>
              {post.link && !aiTextByPost[post.id] && (
                <p className={styles.link}>{post.link}</p>
              )}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={reactions[post.id] === 'up' ? styles.thumbUpActive : styles.thumbUp}
                  onClick={() => setReaction(post.id, 'up')}
                  aria-label="Like"
                >
                  👍
                </button>
                <button
                  type="button"
                  className={reactions[post.id] === 'down' ? styles.thumbDownActive : styles.thumbDown}
                  onClick={() => setReaction(post.id, 'down')}
                  aria-label="Dislike"
                >
                  👎
                </button>
              </div>
              <h4 className={styles.zoneTitle}>🔍 Investigate this post</h4>
              {(aiZonesByPost[post.id] ?? post.zones).map((zone) => (
                <InvestigateZoneBlock
                  key={zone.id}
                  zone={zone}
                  onResult={() => {
                    const currentZones = aiZonesByPost[post.id] ?? post.zones
                    setCompletedZonesByPost((prev) => {
                      const forPost = prev[post.id] ?? {}
                      const nextForPost = { ...forPost, [zone.id]: true }
                      const allDone = currentZones.every((z) => nextForPost[z.id])
                      if (allDone) {
                        void regenerateZonesForPost(post)
                      }
                      return { ...prev, [post.id]: nextForPost }
                    })
                  }}
                />
              ))}
              <button
                type="button"
                className={styles.aiButton}
                onClick={() => { void regenerateZonesForPost(post) }}
                disabled={loadingPostId === post.id}
              >
                {loadingPostId === post.id ? 'Making new questions…' : 'New questions'}
              </button>
              {errorByPost[post.id] && <p className={styles.aiError}>{errorByPost[post.id]}</p>}
            </div>
          ))}
        </div>
        <aside className={styles.aside}>
          <InvestigationChat contextLabel="this post" />
        </aside>
      </div>
    </Shell>
  )
}
