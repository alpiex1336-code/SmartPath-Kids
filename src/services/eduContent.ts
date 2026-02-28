const WIKI_TOPICS_PRIMARY = [
  'Online safety',
  'Internet privacy',
  'Phishing',
  'Computer virus',
  'Cyberbullying',
  'Digital citizenship',
  'Online shopping safety',
  'Online games safety',
  'Social media privacy',
  'Email safety',
] as const

const WIKI_TOPICS_SECONDARY = [
  'Two-factor authentication',
  'Social engineering',
  'Misinformation',
  'Clickbait',
  'Online scam',
  'Password security',
  'Identity theft',
  'Online fraud',
  'Online advertising',
  'Privacy on social networks',
] as const

export interface EducationalSnippet {
  topic: string
  sourceName: string
  sourceUrl: string
  summary: string
}

async function fetchWikipediaSummary(topic: string): Promise<EducationalSnippet | null> {
  const encoded = encodeURIComponent(topic)
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
  if (!res.ok) return null
  const json = await res.json()
  if (!json.extract || typeof json.extract !== 'string') return null

  return {
    topic: json.title || topic,
    sourceName: 'Wikipedia',
    sourceUrl: json.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encoded}`,
    summary: json.extract,
  }
}

/**
 * In addition to Wikipedia, the app can later integrate:
 * - Oak National Academy OpenAPI (UK curriculum, primary & secondary)
 * - Encyclopaedia Britannica API (general reference, free tier for non-commercial use)
 * - OER Commons API (open educational resources with curriculum alignment)
 *
 * These typically require API keys; we keep this file browser-safe by default and
 * rely on Wikipedia as a zero-config source. Additional sources can be wired in
 * behind environment flags or a backend proxy.
 */

const FALLBACK_SNIPPETS_PRIMARY: EducationalSnippet[] = [
  {
    topic: 'School group chat safety',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'In a school group chat, it is important not to share your full name, home address, or other private details. If someone sends a strange link or asks you to move to another app, you should check with a trusted adult first.',
  },
  {
    topic: 'Fake charity and donation requests',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Some people pretend to collect money for charity. Real charities have official websites and do not rush you. If someone asks for money or card details urgently, tell a trusted adult.',
  },
  {
    topic: 'Suspicious homework or tutoring offers',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Be careful if someone you do not know offers to help with homework or says they are a tutor. Real tutors work through school or trusted sites. Never share your school login or personal details.',
  },
  {
    topic: 'Fake concert or event tickets',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Fake ticket sellers often use urgent messages like "last few left" or "act now". Real ticket sites are well known. Always buy tickets from official sources or ask a parent to help.',
  },
  {
    topic: 'Strangers asking to move to another app',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'If someone you do not know asks you to chat on a different app or send photos, tell a trusted adult. Real friends do not pressure you to move to private chats.',
  },
]

const FALLBACK_SNIPPETS_SECONDARY: EducationalSnippet[] = [
  {
    topic: 'Impersonation scams',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Impersonation scams happen when someone pretends to be a teacher, friend, or company to trick you. They might copy a logo or use a similar email address. Checking the real address and asking through another trusted channel can help you spot the scam.',
  },
  {
    topic: 'Suspicious job and scholarship offers',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Teenagers may receive messages about easy jobs or scholarships that sound perfect but ask for fees or personal data first. Real opportunities rarely ask for money up front. Researching the organisation and talking to a careers advisor or teacher can help verify offers.',
  },
  {
    topic: 'Fake delivery and parcel notifications',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Scammers send fake messages saying you have a parcel waiting or a fee to pay. Real delivery companies use official apps and do not ask for payment via random links. Check the sender address carefully.',
  },
  {
    topic: 'Misleading surveys and quizzes',
    sourceName: 'Built-in content',
    sourceUrl: '',
    summary:
      'Some quizzes or surveys ask for your name, school, or phone number before showing results. Legitimate surveys from school or research do not collect personal data in exchange for fun results.',
  },
]

export async function fetchRandomEducationalSnippet(level: 'primary' | 'secondary'): Promise<EducationalSnippet | null> {
  const topics = level === 'primary' ? WIKI_TOPICS_PRIMARY : WIKI_TOPICS_SECONDARY

  // Try a few random Wikipedia topics first
  for (let i = 0; i < 3; i += 1) {
    const topic = topics[Math.floor(Math.random() * topics.length)]
    try {
      const fromWiki = await fetchWikipediaSummary(topic)
      if (fromWiki) return fromWiki
    } catch {
      // ignore and try next
    }
  }

  // Fallback: use built-in snippets so we always have content
  const pool = level === 'primary' ? FALLBACK_SNIPPETS_PRIMARY : FALLBACK_SNIPPETS_SECONDARY
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

