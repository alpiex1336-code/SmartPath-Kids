# SmartPath Kids

> **A child-first, scenario-based digital safety simulator that trains scam detection as a daily habit, not a one-time lecture.**

---

## Why This Matters

Children are entering digital spaces earlier, while scam tactics are becoming faster, more persuasive, and more emotionally manipulative.  
Traditional safety education is often passive (slides, warnings, one-way talks). SmartPath Kids turns this into **active practice**:

- learners investigate realistic content,
- make judgment calls under uncertainty,
- get immediate feedback,
- and build confidence through repetition.

This project is designed to answer one central question:

> **How can we make critical thinking feel as engaging as the apps children already use?**

---

## What SmartPath Kids Is

SmartPath Kids is a gamified web app for primary/secondary learners to practice spotting:

- phishing emails,
- suspicious social posts,
- misleading video descriptions,
- fake urgency/persuasion tactics,
- and “too good to be true” offers.

Instead of telling students what not to do, we let them **investigate, decide, and reflect**.

---

## Core Innovation

- **Simulation over instruction**  
  The UI mirrors familiar digital contexts (News, Social, YouTube, Email), so skill transfer to real life is stronger.

- **Micro-investigation mechanics**  
  Each scenario is split into “investigation zones” where users inspect clues and classify as legit or scam.

- **Learning economy with consequences**  
  Correct decisions reward coins; incorrect decisions carry penalty (`-5`) to reinforce careful thinking over guessing.

- **Safe AI-assisted variety**  
  Optional AI-generated scenarios create fresh mission content while preserving age-appropriate constraints and safety framing.

- **Meta-cognitive reflection**  
  Investigation assistant prompts students to explain *why* they think something is safe/scam, not just click answers.

---

## Product Experience (Flow)

1. Open landing page and enter app shell.
2. Choose a category (`News`, `Social`, `Email`, `YouTube`, `Random`).
3. Investigate highlighted clues and answer **Legit** vs **Scam/Fake**.
4. Receive instant feedback and coin updates.
5. Use `Game`, `Ranking`, and `Profile` loops for replayability and progression.

---

## Feature Set

### Investigation Apps
- **News**: article-style misinformation and source credibility checks.
- **Social**: post/engagement/link-level manipulation cues.
- **YouTube**: title/channel/description trust signals.
- **Email**: sender, subject, urgency, and request legitimacy checks.
- **Random Mission**: mixed scenario training across categories.

### Progression Layer
- **Coins + scoring**
  - Correct judgment: `+10`
  - Incorrect judgment: `-5`
- **Daily reward**
- **Achievements**
- **Ranking** by coins and accuracy
- **Game mode** with fair vs scam offers and mini challenge loops

### AI Layer (Optional)
- AI scenario generation for content freshness
- Investigation assistant for guided questioning
- Phrase-avoidance + variety themes to reduce repetitive content

---

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **React Router v6**
- **CSS Modules**
- **localStorage-backed state persistence**

---

## Project Structure

```text
src/
  components/
    investigate/      # Investigate zone blocks + assistant chat UI
    layout/           # Shell and app grid
  context/
    AppState.tsx      # Coins, accuracy, achievements, daily rewards
  data/
    mockContent.ts    # Base scenarios
    gameData.ts       # Game offers/challenges
  pages/
    Index.tsx         # Landing page
    AppPage.tsx       # App shell/home
    News/Social/Email/Youtube/Random/Ranking/Profile/Game
  services/
    aiClient.ts       # AI scenario + assistant integration
    questionBank.ts   # Scenario storage/variety handling
```

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/app` | App shell |
| `/news` | News investigation |
| `/social` | Social investigation |
| `/email` | Email investigation |
| `/youtube` | YouTube investigation |
| `/random` | Random mission |
| `/ranking` | Leaderboards |
| `/profile` | Learner profile |
| `/game` | Game mode |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## AI Configuration (Important!)

If you want AI-generated missions and assistant replies, create `.env`:

```bash
VITE_MINIMAX_API_KEY=your_key_here
VITE_MINIMAX_MODEL=M2-her
```

Without API keys, base app content still runs using built-in scenarios.

---

## Safety & Design Principles

- **Age-appropriate language**
- **No real financial transactions**
- **No collection of sensitive personal learner data**
- **Feedback emphasizes reasoning, not fear**
- **Scam literacy framed as empowerment**

---

## Competition Value Proposition

SmartPath Kids is not just a “quiz app.”  
It is a practical, replayable training environment where children repeatedly exercise judgment in realistic digital contexts. The design combines:

- educational psychology (active retrieval + feedback),
- product design (engaging loops + progression),
- and technical scalability (modular routes + AI-extendable scenario engine).

This makes it both a compelling demo today and a strong foundation for school/community deployment tomorrow.

---

## License

This project is licensed under the **MIT License**. See `LICENSE`.
