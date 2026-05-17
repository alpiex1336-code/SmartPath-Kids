# Scam Investigator App — Product Specification & Guidelines

## 1. Product Overview

**Target audience:** Primary and secondary school children (roughly ages 6–16). Content and difficulty are designed for this age group: simple language, school-related and everyday scenarios (homework, school events, games, freebies, prizes), and clear red flags so kids can learn without feeling overwhelmed.

**Name (suggested):** Scam Investigator / FactGuard / TruthQuest  
**Purpose:** A gamified, educational app that trains users (especially children/teens) to detect scams, fake news, fraud, and misinformation by simulating real apps (News, Social, YouTube, Email, etc.). No real money; in-app currency (coins) only.

**Core loop:** Use simulated apps → find suspicious areas (magnifying glass) → investigate with tips/questions + optional AI chat → mark True/False → earn coins for correct answers. Spend coins in Games; compete on Ranking; collect achievements and daily rewards in Profile.

---

## 2. App Shell & Navigation

### 2.1 Home Screen (Device Simulator)

- **Layout:** A phone or desktop frame showing a home screen with app icons.
- **Icons (names flexible, functions fixed):**
  - **News** → News app (articles, some fake)
  - **Social** → Social feed (posts, images, links; some scam)
  - **YouTube** → Shorts/videos (misinfo at timestamps or “get coins” tutorials true/scam)
  - **Email** → Inbox (emails arrive at random times; some scam/phishing)
  - **Random** → Random mission (random article/video/post from above apps)
  - **Ranking** → Leaderboards (coins, accuracy)
  - **Profile / Background** → User icon, description, coins, daily reward, achievements
  - **Game** → Spend coins to play; some in-game offers are scams

- **Navigation:** Tapping an icon opens that app (new page/route). Back/Home returns to this screen.
- **Persistent:** Coin balance and user state must persist across all screens (global state/context).

---

## 3. Investigation Mechanics (Shared)

### 3.1 Suspicious Zones

- **Visual:** Certain areas of content (text block, image, link, video segment) can be “suspicious.”
- **Hover:** When the cursor is over a suspicious (or hint-enabled) area, cursor becomes a **magnifying glass**.
- **Click:** Opens a **tip/question** panel that:
  - Gives a short hint or asks a guiding question (e.g. “Who benefits if you believe this?” “Check the sender’s domain.”).
  - Optionally allows **AI chat** for deeper questioning (user can skip).
- **Judgment:** User marks each zone as **True (legit)** or **False (scam/wrong info/fraud)**.
- **Feedback:** Correct → +coins; Wrong → no coins (and optionally short explanation).
- **Design note:** A magnifying glass does not guarantee the zone is scam; it only means “worth investigating.” Some zones can be legit.

### 3.2 Coins

- **Earning:** Correct T/F identification in News, Social, YouTube, Email, Random.
- **Spending:** Only in **Game** (playing mini-games, in-game “purchases” — some are scams).
- **No real-world money.** Coins are the only currency.

---

## 4. App-by-App Specification

(Full app-by-app spec as in original; see repo for full document.)

---

## 7. Demo Completeness Checklist

- [x] Home screen with all 8 icons and navigation to each app.
- [x] News: at least 1–2 articles with multiple zones, tips, T/F, coin reward.
- [x] Social: feed with posts, thumb up/down, zones and T/F.
- [x] YouTube: at least 1 short/video with zones, tips, T/F.
- [x] Email: inbox with 2–3 emails (mix real/scam), zones, T/F.
- [x] Random: one of the above with same mechanics.
- [x] Ranking: list by coins and by accuracy (mock data).
- [x] Profile: avatar, coins, daily reward button, achievements.
- [x] Game: mini-games and scam/fair offers.
- [x] Coins update everywhere; back navigation works.

---

*Document version: 1.0 — Competition Project.*
