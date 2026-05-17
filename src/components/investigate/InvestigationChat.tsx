import { useState, useRef, useEffect } from 'react'
import styles from './InvestigationChat.module.css'
import { askInvestigationAssistant } from '../../services/aiClient'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface Props {
  contextLabel?: string
  className?: string
}

export function InvestigationChat({ contextLabel, className }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: contextLabel
        ? `You’re looking at "${contextLabel}". Ask me anything to help you decide if it’s legit or a scam.`
        : 'Ask me anything to help you investigate. I can’t see your screen, but I can give tips about scams and how to stay safe.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    const userMsg: Message = { id: String(Date.now()), role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setError(null)

    try {
      setLoading(true)
      const reply = await askInvestigationAssistant({
        contextLabel,
        learnerQuestion: text,
        level: 'primary',
      })
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: 'assistant', text: reply }])
    } catch (e) {
      // If the AI call fails (e.g. missing API key), fall back to a simple static tip.
      // eslint-disable-next-line no-console
      console.error(e)
      const fallback =
        'I could not reach the AI helper right now. Think about who sent this, what they are asking for, and if it sounds too good to be true. When you are unsure, ask a trusted adult.'
      setError('The smart assistant is offline. Showing a simple safety tip instead.')
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: 'assistant', text: fallback }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.chat} ${className ?? ''}`}>
      <div className={styles.header}>🛡️ Investigation assistant</div>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className={styles.botMsg}>
            Thinking of some tips for you…
          </div>
        )}
        {error && (
          <div className={styles.errorMsg}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputRow}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void send() }}
          className={styles.input}
        />
        <button type="button" className={styles.sendBtn} onClick={() => { void send() }} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
