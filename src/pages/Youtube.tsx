import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { InvestigateZoneBlock } from '../components/investigate/InvestigateZone'
import { InvestigationChat } from '../components/investigate/InvestigationChat'
import { YOUTUBE_ITEMS } from '../data/mockContent'
import type { YoutubeItem } from '../data/mockContent'
import { generateInvestigationScenario } from '../services/aiClient'
import { saveScenario, scenarioToInvestigateZones, getRecentPhrasesToAvoid } from '../services/questionBank'
import styles from './Youtube.module.css'

function cleanYoutubeDescription(rawText: string, title: string): string {
  const text = rawText.trim()
  if (!text) return text

  const titleEscaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const repetitive = new RegExp(`^(a video titled\\s+)?"${titleEscaped}"\\s*(on\\s+the\\s+channel\\s+"[^"]+")?\\s*`, 'i')
  const noLead = text.replace(repetitive, '').trim()
  return noLead || text
}

export function Youtube() {
  const [videos] = useState(YOUTUBE_ITEMS)
  const [selectedId, setSelectedId] = useState<string | null>(YOUTUBE_ITEMS[0]?.id ?? null)
  const [comment, setComment] = useState('')
  const [aiZonesByVideo, setAiZonesByVideo] = useState<Record<string, YoutubeItem['zones']>>({})
  const [aiTitleByVideo, setAiTitleByVideo] = useState<Record<string, string>>({})
  const [aiDescByVideo, setAiDescByVideo] = useState<Record<string, string>>({})
  const [, setCompletedZonesByVideo] = useState<Record<string, Record<string, boolean>>>({})
  const [commentsByVideo, setCommentsByVideo] = useState<Record<string, string[]>>({})
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null)
  const [errorByVideo, setErrorByVideo] = useState<Record<string, string>>({})
  const selected = selectedId ? videos.find((v) => v.id === selectedId) ?? null : null

  const handleAddComment = (videoId: string | null) => {
    if (!videoId) return
    const text = comment.trim()
    if (!text) return
    setCommentsByVideo((prev) => {
      const existing = prev[videoId] ?? []
      return { ...prev, [videoId]: [...existing, text] }
    })
    setComment('')
  }

  const regenerateZonesForVideo = async (video: YoutubeItem) => {
    setLoadingVideoId(video.id)
    setErrorByVideo((prev) => ({ ...prev, [video.id]: '' }))
    try {
      const scenario = await generateInvestigationScenario({
        appKind: 'youtube',
        baseText: `${video.title}\n${video.channel}\n${video.description}`,
        level: 'primary',
        avoidPhrases: getRecentPhrasesToAvoid(),
        forcedTheme: `a YouTube video called "${video.title}" on the channel "${video.channel}"`,
      })
      saveScenario(scenario, 'primary')
      setAiTitleByVideo((prev) => ({
        ...prev,
        [video.id]: scenario.title,
      }))
      setAiDescByVideo((prev) => ({
        ...prev,
        [video.id]: cleanYoutubeDescription(scenario.corruptedBody || scenario.body, scenario.title),
      }))
      setAiZonesByVideo((prev) => ({
        ...prev,
        [video.id]: scenarioToInvestigateZones(scenario) as YoutubeItem['zones'],
      }))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      setErrorByVideo((prev) => ({ ...prev, [video.id]: `Could not generate new questions: ${message}` }))
    } finally {
      setLoadingVideoId(null)
    }
  }

  return (
    <Shell title="YouTube">
      <div className={styles.layout}>
        <div className={styles.list}>
          {videos.map((v) => (
            <button
              key={v.id}
              type="button"
              className={selected?.id === v.id ? styles.videoRowActive : styles.videoRow}
              onClick={() => {
                setSelectedId(v.id)
              }}
            >
              <span className={styles.thumb}>{v.thumbnail}</span>
              <div className={styles.videoInfo}>
                <span className={styles.videoTitle}>{aiTitleByVideo[v.id] ?? v.title}</span>
                <span className={styles.channel}>{v.channel} · {v.duration}</span>
              </div>
            </button>
          ))}
        </div>
        <div className={styles.playerCol}>
          {selected ? (
            <>
              <div className={styles.videoWrapper} key={selected.id}>
                <div className={styles.videoMockPlayer} aria-label={`Video preview: ${selected.title}`}>
                  <span className={styles.videoEmoji}>{selected.thumbnail}</span>
                  <p className={styles.videoNowPlaying}>Now playing</p>
                  <p className={styles.videoMainTitle}>{aiTitleByVideo[selected.id] ?? selected.title}</p>
                  <p className={styles.videoMeta}>{selected.channel} • {selected.duration}</p>
                </div>
              </div>
              <h2 className={styles.videoTitle}>{aiTitleByVideo[selected.id] ?? selected.title}</h2>
              <p className={styles.channel}>{selected.channel}</p>
              <p className={styles.desc}>{aiDescByVideo[selected.id] ?? selected.description}</p>
              <h4 className={styles.zoneTitle}>🔍 Investigate this video</h4>
              {(aiZonesByVideo[selected.id] ?? selected.zones).map((zone) => (
                <InvestigateZoneBlock
                  key={zone.id}
                  zone={zone}
                  onResult={() => {
                    const currentZones = aiZonesByVideo[selected.id] ?? selected.zones
                    setCompletedZonesByVideo((prev) => {
                      const forVideo = prev[selected.id] ?? {}
                      const nextForVideo = { ...forVideo, [zone.id]: true }
                      const allDone = currentZones.every((z) => nextForVideo[z.id])
                      if (allDone) {
                        void regenerateZonesForVideo(selected)
                      }
                      return { ...prev, [selected.id]: nextForVideo }
                    })
                  }}
                />
              ))}
              <button
                type="button"
                className={styles.aiButton}
                onClick={() => {
                  void regenerateZonesForVideo(selected)
                }}
                disabled={loadingVideoId === selected.id}
              >
                {loadingVideoId === selected.id ? 'Making new questions…' : 'New questions'}
              </button>
              {errorByVideo[selected.id] && <p className={styles.aiError}>{errorByVideo[selected.id]}</p>}
              <div className={styles.comments}>
                <h4>Comments</h4>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddComment(selected.id)
                    }
                  }}
                  className={styles.commentInput}
                />
                <button
                  type="button"
                  className={styles.aiButton}
                  onClick={() => handleAddComment(selected.id)}
                >
                  Post
                </button>
                {(commentsByVideo[selected.id] ?? []).length > 0 && (
                  <ul>
                    {commentsByVideo[selected.id]?.map((c, idx) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>
        <aside className={styles.aside}>
          <InvestigationChat contextLabel={selected ? (aiTitleByVideo[selected.id] ?? selected.title) : 'this video'} />
        </aside>
      </div>
    </Shell>
  )
}
