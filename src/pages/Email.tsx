import { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { InvestigateZoneBlock } from '../components/investigate/InvestigateZone'
import { InvestigationChat } from '../components/investigate/InvestigationChat'
import { EMAIL_ITEMS } from '../data/mockContent'
import type { EmailItem } from '../data/mockContent'
import { generateInvestigationScenario } from '../services/aiClient'
import { saveScenario, scenarioToInvestigateZones, getRecentPhrasesToAvoid } from '../services/questionBank'
import styles from './Email.module.css'

function extractSenderFromScenario(text: string): string | null {
  const fromLine = text.match(/(?:^|\n)\s*from\s*:\s*([^\n]+)/i)
  if (fromLine?.[1]?.trim()) return fromLine[1].trim()

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  if (emailMatch?.[0]) return emailMatch[0]

  return null
}

export function Email() {
  const [emails] = useState(EMAIL_ITEMS)
  const [openId, setOpenId] = useState<string | null>(EMAIL_ITEMS[0]?.id ?? null)
  const [aiZonesByEmail, setAiZonesByEmail] = useState<Record<string, EmailItem['zones']>>({})
  const [aiFromByEmail, setAiFromByEmail] = useState<Record<string, string>>({})
  const [aiSubjectByEmail, setAiSubjectByEmail] = useState<Record<string, string>>({})
  const [aiBodyByEmail, setAiBodyByEmail] = useState<Record<string, string>>({})
  const [, setCompletedZonesByEmail] = useState<Record<string, Record<string, boolean>>>({})
  const [loadingEmailId, setLoadingEmailId] = useState<string | null>(null)
  const [errorByEmail, setErrorByEmail] = useState<Record<string, string>>({})

  const open = openId ? emails.find((e) => e.id === openId) : null

  const regenerateZonesForEmail = async (email: EmailItem) => {
    setLoadingEmailId(email.id)
    setErrorByEmail((prev) => ({ ...prev, [email.id]: '' }))
    try {
      const scenario = await generateInvestigationScenario({
        appKind: 'email',
        baseText: email.body,
        level: 'primary',
        avoidPhrases: getRecentPhrasesToAvoid(),
        forcedTheme: `an email from ${email.from} with subject "${email.subject}"`,
      })
      saveScenario(scenario, 'primary')
      const generatedText = scenario.corruptedBody || scenario.body
      const parsedSender = extractSenderFromScenario(generatedText)
      if (parsedSender) {
        setAiFromByEmail((prev) => ({
          ...prev,
          [email.id]: parsedSender,
        }))
      }
      setAiSubjectByEmail((prev) => ({
        ...prev,
        [email.id]: scenario.title,
      }))
      setAiBodyByEmail((prev) => ({
        ...prev,
        [email.id]: scenario.corruptedBody || scenario.body,
      }))
      setAiZonesByEmail((prev) => ({
        ...prev,
        [email.id]: scenarioToInvestigateZones(scenario) as EmailItem['zones'],
      }))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      setErrorByEmail((prev) => ({ ...prev, [email.id]: `Could not generate new questions: ${message}` }))
    } finally {
      setLoadingEmailId(null)
    }
  }

  return (
    <Shell title="Email">
      <div className={styles.layout}>
        <div className={styles.inbox}>
          <h2 className={styles.inboxTitle}>Inbox</h2>
          {emails.map((e) => (
            <button
              key={e.id}
              type="button"
              className={openId === e.id ? styles.emailRowActive : styles.emailRow}
              onClick={() => setOpenId(e.id)}
            >
              <span className={styles.from}>{aiFromByEmail[e.id] ?? e.from}</span>
              <span className={styles.subject}>{aiSubjectByEmail[e.id] ?? e.subject}</span>
              <span className={styles.time}>{e.time}</span>
            </button>
          ))}
        </div>
        <div className={styles.reader}>
          {open ? (
            <>
              <div className={styles.emailHeader}>
                <p><strong>From:</strong> {aiFromByEmail[open.id] ?? open.from}</p>
                <p><strong>Subject:</strong> {aiSubjectByEmail[open.id] ?? open.subject}</p>
                <p><strong>Time:</strong> {open.time}</p>
              </div>
              <div className={styles.emailBody}>{aiBodyByEmail[open.id] ?? open.body}</div>
              <h4 className={styles.zoneTitle}>🔍 Investigate this email</h4>
              {(aiZonesByEmail[open.id] ?? open.zones).map((zone) => (
                <InvestigateZoneBlock
                  key={zone.id}
                  zone={zone}
                  onResult={() => {
                    const currentZones = aiZonesByEmail[open.id] ?? open.zones
                    setCompletedZonesByEmail((prev) => {
                      const forEmail = prev[open.id] ?? {}
                      const nextForEmail = { ...forEmail, [zone.id]: true }
                      const allDone = currentZones.every((z) => nextForEmail[z.id])
                      if (allDone) {
                        void regenerateZonesForEmail(open)
                      }
                      return { ...prev, [open.id]: nextForEmail }
                    })
                  }}
                />
              ))}
              <button
                type="button"
                className={styles.aiButton}
                onClick={() => { void regenerateZonesForEmail(open) }}
                disabled={loadingEmailId === open.id}
              >
                {loadingEmailId === open.id ? 'Making new questions…' : 'New questions'}
              </button>
              {errorByEmail[open.id] && <p className={styles.aiError}>{errorByEmail[open.id]}</p>}
            </>
          ) : (
            <p className={styles.placeholder}>Select an email</p>
          )}
        </div>
        <aside className={styles.aside}>
          <InvestigationChat contextLabel={open ? open.subject : 'this email'} />
        </aside>
      </div>
    </Shell>
  )
}
