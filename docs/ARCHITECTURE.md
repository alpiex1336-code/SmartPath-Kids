# Scam Investigator App — Architecture

## Stack

- **React 18** + **TypeScript**
- **Vite** (build & dev server)
- **React Router v6** (client-side routing)
- **CSS Modules** (scoped styles, no global conflicts)

## Directory Layout

```
src/
├── components/
│   ├── layout/          # Shell (header + coin display), AppGrid (home icons)
│   └── investigate/     # InvestigateZoneBlock (tip + T/F + coin reward)
├── context/
│   └── AppState.tsx     # Global state: coins, correct/judged counts, daily, achievements, ranking
├── data/
│   ├── appIcons.ts       # App list for home screen
│   ├── mockContent.ts    # News, Social, Email, YouTube mock items + zones (K-12 friendly)
│   └── gameData.ts       # Game offers (scam/fair) and mini-games
├── pages/
│   ├── Home.tsx
│   ├── News.tsx, Social.tsx, Email.tsx, Youtube.tsx
│   ├── Random.tsx, Ranking.tsx, Profile.tsx, Game.tsx
│   └── *.module.css
├── types/
│   └── index.ts         # AppId, InvestigateZone, Achievement, RankEntry, etc.
├── App.tsx              # Router + AppStateProvider + AchievementSync
├── main.tsx
└── index.css            # Global reset
```

## Data Flow

- **Coins / correct / judged:** Stored in `AppState` (React state + localStorage sync). `InvestigateZoneBlock` calls `addCoins`, `recordCorrect`, `recordJudged` on correct T/F.
- **Daily reward:** `claimDaily()` checks `lastClaimDate` vs today; if new day, adds coins and updates storage.
- **Achievements:** Unlocked in context (e.g. `first_10` when `correctCount >= 10` via `AchievementSync` in App).
- **Ranking:** Derived in context from current user + mock peers (`rankByCoins`, `rankByAccuracy`).

## Adding New Content

- **News/Social/Email/YouTube:** Add entries to `mockContent.ts` with `zones: InvestigateZone[]`. Each zone has `id`, `label`, `hint`, `question?`, `isScam`. Keep language simple for primary/secondary school.
- **Game offers:** Add to `gameData.ts` (cost, isScam, resultMessage).

## Routes

| Path       | Page           |
|-----------|-----------------|
| `/`       | Home (app grid) |
| `/news`   | News            |
| `/social` | Social          |
| `/email`  | Email           |
| `/youtube`| YouTube         |
| `/random` | Random mission  |
| `/ranking`| Ranking         |
| `/profile`| Profile         |
| `/game`   | Game            |
