import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppStateProvider, useAppState } from './context/AppState'
import { Index } from './pages/Index'
import { AppPage } from './pages/AppPage'
import { News } from './pages/News'
import { Social } from './pages/Social'
import { Email } from './pages/Email'
import { Youtube } from './pages/Youtube'
import { Random } from './pages/Random'
import { Ranking } from './pages/Ranking'
import { Profile } from './pages/Profile'
import { Game } from './pages/Game'

function AchievementSync() {
  const { correctCount, unlockAchievement } = useAppState()
  useEffect(() => {
    if (correctCount >= 10) unlockAchievement('first_10')
  }, [correctCount, unlockAchievement])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AchievementSync />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/social" element={<Social />} />
          <Route path="/email" element={<Email />} />
          <Route path="/youtube" element={<Youtube />} />
          <Route path="/random" element={<Random />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </AppStateProvider>
    </BrowserRouter>
  )
}
