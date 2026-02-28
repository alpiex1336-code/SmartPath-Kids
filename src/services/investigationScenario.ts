import { fetchRandomEducationalSnippet } from './eduContent'
import { generateInvestigationScenario, type InvestigationScenario } from './aiClient'
import { saveScenario, getRecentPhrasesToAvoid } from './questionBank'

export type LearnerLevel = 'primary' | 'secondary'

export async function generateAndStoreRandomScenario(params: {
  level: LearnerLevel
}): Promise<InvestigationScenario> {
  const { level } = params

  const snippet = await fetchRandomEducationalSnippet(level)
  if (!snippet) {
    throw new Error('Could not fetch educational content for scenario generation')
  }

  // Randomly choose an app kind to keep missions varied.
  const kinds: InvestigationScenario['kind'][] = ['news', 'social', 'email', 'youtube']
  const appKind = kinds[Math.floor(Math.random() * kinds.length)]

  const scenario = await generateInvestigationScenario({
    appKind,
    baseText: snippet.summary,
    level,
    avoidPhrases: getRecentPhrasesToAvoid(),
    forcedTheme: `a ${appKind} scenario about ${snippet.topic}`,
  })

  saveScenario(scenario, level)
  return scenario
}

