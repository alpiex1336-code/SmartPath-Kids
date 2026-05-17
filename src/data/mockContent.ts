import type { InvestigateZone } from '../types'

export interface NewsArticle {
  id: string
  title: string
  author: string
  date: string
  excerpt: string
  body: string
  zones: InvestigateZone[]
}

export interface SocialPost {
  id: string
  author: string
  avatar: string
  text: string
  image?: string
  link?: string
  zones: InvestigateZone[]
}

export interface YoutubeItem {
  id: string
  title: string
  channel: string
  duration: string
  thumbnail: string
  description: string
  videoId: string
  zones: InvestigateZone[]
}

export interface EmailItem {
  id: string
  from: string
  subject: string
  body: string
  time: string
  zones: InvestigateZone[]
}

/**
 * Content designed for primary & secondary school children:
 * - Simple, clear language
 * - School-friendly scenarios (homework, school events, games, pocket money)
 * - Obvious red flags for younger kids; subtler ones for older
 */

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Win a Free Phone! Just Click Here',
    author: 'Prize Team',
    date: 'Feb 28, 2025',
    excerpt: 'A new contest says you can win a free phone. Is it real?',
    body: 'A website says you can win a free phone. It says: "Only 10 left! Tell your friends and click the link." The link goes to a page that asks for your name, school and parent\'s phone number. Real contests from big companies don\'t usually ask for so much info so fast. Always ask a grown-up before you type your details anywhere.',
    zones: [
      { id: 'n1-z1', label: '"Win a free phone"', hint: 'Things that are free and sound too good are often tricks.', question: 'Do real contests usually ask for your school and parent\'s number straight away?', isScam: true },
      { id: 'n1-z2', label: 'Click the link', hint: 'Links can take you to fake pages that steal info.', question: 'Should you click links that promise a big prize?', isScam: true },
      { id: 'n1-z3', label: 'Ask a grown-up', hint: 'Good advice is to check with an adult before giving details.', question: 'Is "ask a grown-up" a safe tip?', isScam: false },
    ],
  },
  {
    id: 'n2',
    title: 'School Library Will Open on Saturday',
    author: 'School Office',
    date: 'Feb 27, 2025',
    excerpt: 'The library will be open this Saturday 9 AM–12 PM for reading club.',
    body: 'The school office announced that the library will be open this Saturday from 9 AM to 12 PM. Students can join the reading club. Bring your student card. This was also posted on the school noticeboard and in the weekly newsletter.',
    zones: [
      { id: 'n2-z1', label: 'School Office', hint: 'Real school news often comes from the office or teachers.', question: 'Does this sound like normal school news?', isScam: false },
      { id: 'n2-z2', label: 'Noticeboard and newsletter', hint: 'Real events are often announced in more than one place.', question: 'Is it a good sign when the same news appears in different places?', isScam: false },
    ],
  },
]

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 's1',
    author: 'CoolGamer_123',
    avatar: '🎮',
    text: 'Get 1000 free coins for the game!!! Click my link in bio!!! Only today!!!',
    link: 'tinyurl.com/free-coins-now',
    zones: [
      { id: 's1-z1', label: '1000 free coins', hint: 'When someone says "free" and "only today" it is often a trick.', question: 'Do games usually give so many free coins from a random link?', isScam: true },
      { id: 's1-z2', label: 'Link in bio', hint: 'Short links can hide where you really go.', question: 'Could this link be dangerous?', isScam: true },
    ],
  },
  {
    id: 's2',
    author: 'School Sports',
    avatar: '⚽',
    text: 'Football practice is on Thursday 4 PM. Bring a water bottle. See you there!',
    zones: [
      { id: 's2-z1', label: 'Football practice Thursday', hint: 'School clubs often post times and simple reminders.', question: 'Does this look like a normal school club message?', isScam: false },
    ],
  },
]

export const YOUTUBE_ITEMS: YoutubeItem[] = [
  {
    id: 'v1',
    title: 'GET UNLIMITED COINS IN 1 MINUTE!!! REAL!!!',
    channel: 'SecretHacks',
    duration: '0:45',
    thumbnail: '🎬',
    description: 'Download the app in the description. No virus!!! Works 100%!!!',
    videoId: 'hlWiI4xVX44',
    zones: [
      { id: 'v1-z1', label: 'Unlimited coins in 1 minute', hint: 'If it sounds too good to be true it usually is.', question: 'Would a real game give unlimited coins for free?', isScam: true },
      { id: 'v1-z2', label: 'Download the app in description', hint: 'Downloading "apps" from video descriptions can be risky.', question: 'Is it safe to download things from a video description?', isScam: true },
    ],
  },
  {
    id: 'v2',
    title: 'How to Stay Safe Online – Tips for Kids',
    channel: 'Safe Surfers',
    duration: '2:00',
    thumbnail: '📺',
    description: 'Simple tips: don\'t share your password, tell an adult if something feels wrong.',
    videoId: '8SbUC-UaAxE',
    zones: [
      { id: 'v2-z1', label: 'Stay safe online', hint: 'Real safety videos give clear rules like "don\'t share your password".', question: 'Does this sound like real safety advice?', isScam: false },
    ],
  },
]

export const EMAIL_ITEMS: EmailItem[] = [
  {
    id: 'e1',
    from: 'prize@winnner-center.com',
    subject: 'You won! Claim your prize now',
    body: 'Congratulations! You have won a big prize. Click here now to get it. If you don\'t click in 1 hour you will lose it. Hurry!!!',
    time: '10:32 AM',
    zones: [
      { id: 'e1-z1', label: 'winnner-center (with 3 n\'s)', hint: 'Real companies spell their names correctly.', question: 'Did you notice the spelling mistake in the email address?', isScam: true },
      { id: 'e1-z2', label: 'Click in 1 hour or lose it', hint: 'Messages that rush you are often scams.', question: 'Do real prizes make you hurry and click quickly?', isScam: true },
    ],
  },
  {
    id: 'e2',
    from: 'teacher@myschool.edu',
    subject: 'Homework reminder – due Friday',
    body: 'Hi, this is a reminder that your science project is due on Friday. Hand it in through the school portal. If you have questions, ask in class.',
    time: '9:00 AM',
    zones: [
      { id: 'e2-z1', label: 'myschool.edu', hint: 'School emails often use .edu or the school\'s real name.', question: 'Does this look like a normal homework reminder from school?', isScam: false },
    ],
  },
]
