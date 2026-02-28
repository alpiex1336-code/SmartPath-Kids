export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface InvestigationScenario {
  kind: 'news' | 'social' | 'email' | 'youtube'
  title: string
  /** Main body text or description shown to the learner */
  body: string
  /** Optional short excerpt / preview */
  excerpt?: string
  /** Optional sender/author/channel metadata depending on kind */
  meta?: {
    authorOrFrom?: string
    timeOrDate?: string
  }
  /**
   * Paragraph where some parts may be intentionally fake or misleading.
   * This is what learners will inspect.
   */
  corruptedBody: string
  /** Investigation zones following the existing InvestigateZone shape */
  zones: {
    id: string
    label: string
    hint: string
    question?: string
    isScam: boolean
  }[]
  /** Extra guiding tips the assistant can use */
  tips: string[]
  /** Self-reflection questions to help students explain their thinking */
  selfReflection: string[]
}

const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY as string | undefined
const MINIMAX_MODEL = import.meta.env.VITE_MINIMAX_MODEL || 'M2-her'

/** Phrases that indicate AI meta-commentary – truncate content before these. */
const META_COMMENTARY_STARTS = [
  'the highlighted differences',
  'let me know if you need',
  'the rest of the format remains',
  'based on your needs',
  'i can continue with',
  'in future responses',
  'do not add any extra explanation',
]

/** Placeholder/template phrases that must never be shown to learners (inner prompt leak). */
const INNER_PROMPT_PLACEHOLDERS = [
  'short title of the scenario',
  'one or more lines describing',
  'the version learners will see',
  'label text',
  'hint text',
  'question text',
  'between 3 and 5 such lines',
  'short tip 1',
  'self-reflection question 1',
  'end_body',
  'end_corrupted_body',
  'end_zones',
  'end_tips',
  'end_self_reflection',
]

function stripMetaCommentary(text: string): string {
  const lower = text.toLowerCase()
  let cutAt = text.length
  for (const phrase of META_COMMENTARY_STARTS) {
    const idx = lower.indexOf(phrase)
    if (idx !== -1 && idx < cutAt) cutAt = idx
  }
  return text.slice(0, cutAt).trim()
}

/** Returns true if the string looks like a template placeholder (e.g. <short title of the scenario>). */
function looksLikeTemplatePlaceholder(s: string): boolean {
  const t = s.trim()
  if (t.length < 3) return false
  const lower = t.toLowerCase()
  if (/^<[^>]+>$/.test(t)) return true
  for (const p of INNER_PROMPT_PLACEHOLDERS) {
    if (lower.includes(p)) return true
  }
  return false
}

/** Remove lines that are template placeholders or format headers so they never reach the UI. */
function stripInnerPromptFromBody(text: string): string {
  if (!text || !text.trim()) return text
  const lines = text.split('\n')
  const kept: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    const upper = trimmed.toUpperCase()
    if (trimmed.startsWith('TITLE:') || trimmed.startsWith('BODY:') || trimmed.startsWith('CORRUPTED_BODY:') ||
        upper.startsWith('END_BODY') || upper.startsWith('END_CORRUPTED') || upper.startsWith('END_ZONES') ||
        upper.startsWith('ZONES:') || upper.startsWith('TIPS:') || upper.startsWith('SELF_REFLECTION')) continue
    if (looksLikeTemplatePlaceholder(trimmed)) continue
    kept.push(line)
  }
  return kept.join('\n').trim()
}

function getBlock(
  lines: string[],
  header: string,
  terminator: string,
  extraTerminators: string[] = [],
): string | null {
  const upperHeader = header.toUpperCase()
  const upperTerminator = terminator.toUpperCase()
  const startIdx = lines.findIndex((l) => l.trim().toUpperCase().startsWith(upperHeader))
  if (startIdx === -1) return null

  const collected: string[] = []

  // Some models put the first content line on the same line as the header,
  // e.g. "ZONES: - [SCAM] ...". Capture that part as the first collected line.
  const headerLine = lines[startIdx]
  const afterColon = headerLine.split(':').slice(1).join(':').trim()
  if (afterColon) {
    collected.push(afterColon)
  }

  for (let i = startIdx + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim()
    const upper = trimmed.toUpperCase()
    if (upper.startsWith(upperTerminator)) break
    if (extraTerminators.some((t) => upper.startsWith(t.toUpperCase()))) break
    collected.push(lines[i])
  }

  let text = collected.join('\n').trim()
  text = stripMetaCommentary(text)
  return text || null
}

function sanitizeZoneField(value: string, fallback: string): string {
  const t = value.trim()
  if (!t || looksLikeTemplatePlaceholder(t)) return fallback
  return t
}

function parseZones(block: string | null, kind: InvestigationScenario['kind']): InvestigationScenario['zones'] {
  if (!block) return []
  const lines = block.split('\n')
  const zones: InvestigationScenario['zones'] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line.startsWith('-')) continue
    const withoutDash = line.replace(/^-+\s*/, '')
    const match = withoutDash.match(/^\[(SCAM|SAFE)\]\s*(.+?)\s*\|\|\s*(.+?)\s*\|\|\s*(.+)\s*$/i)
    if (!match) continue
    const [, tag, label, hint, question] = match
    const isScam = tag.toUpperCase() === 'SCAM'
    zones.push({
      id: `${kind}-${zones.length + 1}`,
      label: sanitizeZoneField(label, 'Check this detail'),
      hint: sanitizeZoneField(hint, 'Think about whether this is trustworthy.'),
      question: sanitizeZoneField(question, 'What do you think?'),
      isScam,
    })
  }

  return zones
}

function parseBullets(block: string | null): string[] {
  if (!block) return []
  return block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.replace(/^-+\s*/, '').trim())
    .filter(Boolean)
}

function normaliseScenarioTitle(
  rawTitle: string | null | undefined,
  appKind: InvestigationScenario['kind'],
  baseText: string,
): string {
  const fallbackByKind: Record<InvestigationScenario['kind'], string> = {
    news: 'Online safety news story',
    social: 'Social media post about safety',
    email: 'Online safety email',
    youtube: 'Online safety video',
  }

  const cleaned = (rawTitle ?? '').trim()
  const lower = cleaned.toLowerCase()

  const genericTitles = new Set([
    '',
    'news',
    'article',
    'exciting news article',
    'exciting article',
    'post',
    'social post',
    'email',
    'message',
    'youtube',
    'video',
  ])

  const isGeneric = genericTitles.has(lower) || cleaned.length < 4
  if (!isGeneric && cleaned.length >= 8) {
    return cleaned
  }

  const firstSentence = baseText
    .split(/[\n.!?]/)
    .map((s) => s.trim())
    .find(Boolean)

  if (firstSentence && firstSentence.length >= 10) {
    const clipped = firstSentence.length > 80 ? `${firstSentence.slice(0, 77).trimEnd()}…` : firstSentence
    return clipped
  }

  return fallbackByKind[appKind]
}

async function callMinimax(messages: ChatMessage[]): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error('Missing VITE_MINIMAX_API_KEY – set it in your .env file to enable the AI agent.')
  }

  const minimaxMessages = messages.map((m) => ({
    role: m.role,
    name: m.role === 'user' ? 'User' : 'MiniMax AI',
    content: m.content,
  }))

  const res = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: minimaxMessages,
      temperature: 0.9,
      top_p: 0.95,
      max_completion_tokens: 1024,
      stream: false,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`MiniMax API error: ${res.status} ${res.statusText} ${text}`)
  }

  const json = await res.json()
  const status = json.base_resp?.status_code
  if (typeof status === 'number' && status !== 0) {
    const msg = json.base_resp?.status_msg ?? 'MiniMax error'
    throw new Error(`MiniMax API error: ${status} ${msg}`)
  }

  const content = json.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('MiniMax response missing content')
  }
  return content
}

/** Rotating themes to force variety – each "New questions" uses a different scenario type. */
const SCENARIO_THEMES = [
  'fake charity or donation request',
  'fake homework help or tutoring offer',
  'misleading survey or quiz that asks for personal info',
  'fake concert or event ticket',
  'fake gift card or voucher',
  'suspicious DM from someone pretending to be a friend',
  'fake app update or security alert',
  'fake competition or lottery win',
  'stranger asking to move to another app or chat',
  'fake delivery or parcel notification',
  'suspicious link in a school-related message',
  'fake celebrity or influencer giveaway',
  'stranger offering "easy money" or a job',
  'fake login or password reset request',
  'misleading ad for a game or app',
  'fake scholarship or grant offer',
  'suspicious friend request from unknown person',
  'fake prize or reward that asks for payment first',
  'pretend class group chat asking for secret account details',
  'fake game mod install offer that promises special powers',
  'tricky profile pretending to be a favorite creator',
  'fake school event sign-up page with odd payment request',
  'too-cheap second-hand item listing that asks for advance payment',
  'voice message pretending to be a family emergency',
  'fake support account asking to verify account with password',
] as const

const STYLE_SPINS = [
  'short mystery style with playful tone',
  'mini detective challenge with one silly clue and one serious clue',
  'friendly school-day story style',
  'comic-adventure style with clear practical steps',
  'light game-quest style with realistic online details',
] as const

export async function generateInvestigationScenario(params: {
  appKind: 'news' | 'social' | 'email' | 'youtube'
  baseText: string
  level: 'primary' | 'secondary'
  avoidPhrases?: string[]
  forcedTheme?: string
}): Promise<InvestigationScenario> {
  const { appKind, baseText, level, avoidPhrases = [], forcedTheme } = params

  const theme =
    forcedTheme ??
    SCENARIO_THEMES[Math.floor(Math.random() * SCENARIO_THEMES.length)]
  const styleSpin = STYLE_SPINS[Math.floor(Math.random() * STYLE_SPINS.length)]

  const avoidText =
    avoidPhrases.length > 0
      ? `\n\nCRITICAL – NEVER use these phrases or anything similar (they are overused): ${avoidPhrases.slice(0, 25).join(', ')}.`
      : ''

  const system: ChatMessage = {
    role: 'system',
    content:
      'You are a safety and digital literacy tutor for children. ' +
      'You design short scenarios that help learners spot scams, fakes, and trustworthy information. ' +
      'Your tone must always be age-appropriate, friendly, and non-scary.',
  }

  const user: ChatMessage = {
    role: 'user',
    content: [
      `Level: ${level === 'primary' ? 'Primary (age 8–11)' : 'Secondary (age 12–15)'}.`,
      `App kind: ${appKind}.`,
      '',
      `THIS TIME you MUST use a scenario about: "${theme}". Every new scenario must be completely different – no repeated phrases, no similar examples.`,
      `Use this presentation style for variety: "${styleSpin}".`,
      avoidText,
      '',
      'You are given factual source text about online safety. Use it to design ONE short, realistic scenario for my game.',
      '',
      'Steps you MUST follow:',
      '1) Read the source text and extract the most useful, age-appropriate ideas about online safety, scams, trustworthy sources, or critical thinking.',
      '2) Create a NEW short scenario that fits the given app kind (do NOT just slightly edit the original text; make up a fresh but realistic example):',
      '   - news: a short news article from a news site (include clues like headline, source name, or quote).',
      '   - social: one short social media post written by a user (no long email-style paragraphs; include username, emojis, hashtags, or link text).',
      '   - email: one email message with From, Subject and body (at least one zone should use the From or Subject line as a clue).',
      '   - youtube: one video title + short description from a video channel (use channel name, description and link in the description as clues).',
      '3) Take the scenario text and carefully change just a few words or details so that some parts become fake, misleading, or suspicious.',
      '   - Some details should clearly be scams/fakes.',
      '   - Some details should stay trustworthy/correct.',
      '4) Create 3–5 investigation zones where the learner can tap and decide if each detail is scam/fake or legit.',
      '   - Each zone has: label, hint, short self-reflection question, and isScam (true/false).',
      '   - The title must be specific and descriptive (not just a generic word like "news" or "article").',
      '5) ALSO create:',
      '   - 3–5 short tips that the assistant chat can share.',
      '   - 2–4 self-reflection questions that ask the learner to explain their thinking.',
      '',
      'Return your answer in EXACTLY this plain text format (no extra comments, no markdown, no JSON):',
      '',
      'TITLE: <short title of the scenario>',
      'BODY:',
      '<one or more lines describing the basic scenario in a factual way>',
      'END_BODY',
      'CORRUPTED_BODY:',
      '<the version learners will see, with a few fake or suspicious details mixed in>',
      'END_CORRUPTED_BODY',
      'ZONES:',
      '- [SCAM] label text || hint text || question text',
      '- [SAFE] label text || hint text || question text',
      '(between 3 and 5 such lines, each starting with - and [SCAM] or [SAFE])',
      'END_ZONES',
      'TIPS:',
      '- short tip 1',
      '- short tip 2',
      '- short tip 3',
      'END_TIPS',
      'SELF_REFLECTION:',
      '- self-reflection question 1',
      '- self-reflection question 2',
      'END_SELF_REFLECTION',
      '',
      'Rules:',
      '- Use simple language that a child at the given level can understand.',
      '- Never include real personal data or anything unsafe.',
      '- Make sure some zones are scams/fakes and some are safe/legit.',
      '- The BODY section must contain at least two full sentences of actual story content (never say things like "There is no content in the article").',
      '- Create between 3 and 5 investigation zones only; do NOT create more than 5.',
      '- For EMAIL, use the From address, Subject line, and any strange requests in the body as scam/safe clues.',
      '- For SOCIAL, use things like username, hashtags, comments, and links inside the post as clues (do not describe a separate email or text message).',
      '- For YOUTUBE, use the video title, channel name, thumbnail idea, and description link as clues.',
      '- For YOUTUBE, do not repeat the full video title sentence again in the first line of description text.',
      '- NEVER repeat phrases from the banned list above. Invent fresh wording every time.',
      '- Do NOT use "free coins", "1000 free coins", "unlimited coins", "win a free phone", "click here", "act now", "instant access" or similar – these are overused. Use the forced theme instead.',
      '- Output ONLY the format above. Never add phrases like "Let me know if you need adjustments", "The highlighted differences above", or any explanation after END_SELF_REFLECTION.',
      '',
      'Here is the factual source text you must base this on:',
      baseText,
    ].join('\n'),
  }

  const raw = await callMinimax([system, user])

  const lines = raw.split('\n')

  const titleLine = lines.find((l) => l.trim().toUpperCase().startsWith('TITLE:'))
  let rawTitle = titleLine ? titleLine.split(':').slice(1).join(':').trim() : ''
  if (looksLikeTemplatePlaceholder(rawTitle)) rawTitle = ''

  const sectionHeaders = ['ZONES:', 'TIPS:', 'SELF_REFLECTION:', 'END_FORMAT']
  let bodyBlock = getBlock(lines, 'BODY:', 'END_BODY', sectionHeaders)
  let corruptedBlock =
    getBlock(lines, 'CORRUPTED_BODY:', 'END_CORRUPTED_BODY', sectionHeaders) ?? bodyBlock
  bodyBlock = bodyBlock ? stripInnerPromptFromBody(bodyBlock) : null
  corruptedBlock = corruptedBlock ? stripInnerPromptFromBody(corruptedBlock) : corruptedBlock

  let zones = parseZones(
    getBlock(lines, 'ZONES:', 'END_ZONES', ['TIPS:', 'SELF_REFLECTION:']),
    appKind,
  )

  // Fallback: if the model ignored our format slightly, scan the whole output
  // for zone lines so we still get 3–5 zones instead of failing.
  if (!zones.length) {
    zones = parseZones(raw, appKind)
  }
  const tips = parseBullets(getBlock(lines, 'TIPS:', 'END_TIPS', ['SELF_REFLECTION:']))
  const selfReflection = parseBullets(
    getBlock(lines, 'SELF_REFLECTION:', 'END_SELF_REFLECTION', ['END_FORMAT', 'END_ZONES', 'ZONES:']),
  ).filter((q) => !META_COMMENTARY_STARTS.some((p) => q.toLowerCase().includes(p)))

  if (!zones.length) {
    zones = [
      {
        id: `${appKind}-1`,
        label: 'Too good to be true?',
        hint: 'Online offers or messages that sound perfect are often scams.',
        question: 'Does this situation seem too good to be true?',
        isScam: true,
      },
      {
        id: `${appKind}-2`,
        label: 'Check the sender or source',
        hint: 'Real news, apps, and emails come from names you recognise and trust.',
        question: 'Who is this message, post or video really from?',
        isScam: false,
      },
      {
        id: `${appKind}-3`,
        label: 'Think before you click or pay',
        hint: 'Never rush to click links or pay money because of a message.',
        question: 'What could happen if you click or pay without checking?',
        isScam: true,
      },
    ]
  }

  const safeTitle = normaliseScenarioTitle(rawTitle, appKind, baseText)
  const safeBody = (bodyBlock ?? '').trim() || ''
  const safeCorrupted = (corruptedBlock ?? safeBody).trim() || safeBody
  const scenarioToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const zonesWithUniqueIds = zones.map((z, index) => ({
    ...z,
    id: `${z.id}-${scenarioToken}-${index + 1}`,
  }))

  const scenario: InvestigationScenario = {
    kind: appKind,
    title: safeTitle,
    body: safeBody,
    excerpt: undefined,
    meta: undefined,
    corruptedBody: safeCorrupted,
    zones: zonesWithUniqueIds,
    tips,
    selfReflection,
  }

  return scenario
}

export async function askInvestigationAssistant(params: {
  contextLabel?: string
  learnerQuestion: string
  level: 'primary' | 'secondary'
  lastTips?: string[]
}): Promise<string> {
  const { contextLabel, learnerQuestion, level, lastTips } = params

  const system: ChatMessage = {
    role: 'system',
    content:
      'You are a friendly “Investigation assistant” chatting with a child about whether something online is a scam or safe. ' +
      'You never scare them, never ask for personal data, and you always encourage them to talk to a trusted adult. ' +
      'Use short, clear sentences.',
  }

  const tipsText = lastTips && lastTips.length
    ? `Here are some tips related to this mission that you can reuse or build on:\n- ${lastTips.join('\n- ')}\n\n`
    : ''

  const user: ChatMessage = {
    role: 'user',
    content: [
      level === 'primary' ? 'The learner is in PRIMARY school (about 8–11 years old).' : 'The learner is in SECONDARY school (about 12–15 years old).',
      contextLabel ? `They are currently looking at: "${contextLabel}".` : '',
      '',
      tipsText,
      'Their question or message is:',
      learnerQuestion,
      '',
      'Reply with one short paragraph or 2–3 bullet points.',
      'Help them notice clues, but do NOT give away every answer instantly.',
      'End with a gentle question like “What do you think?” to invite reflection.',
    ]
      .filter(Boolean)
      .join('\n'),
  }

  return callMinimax([system, user])
}

