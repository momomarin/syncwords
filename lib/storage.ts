import type { QuizSession, UserProfile } from '@/types'

const PROFILE_KEY = 'syncwords_profile'
const HISTORY_KEY = 'syncwords_history'
const LEARNED_KEY = 'syncwords_learned'

export function getLearnedWordIds(): number[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LEARNED_KEY) ?? '[]') }
  catch { return [] }
}

export function addLearnedWordId(id: number): void {
  if (typeof window === 'undefined') return
  const ids = getLearnedWordIds()
  if (!ids.includes(id)) localStorage.setItem(LEARNED_KEY, JSON.stringify([...ids, id]))
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getHistory(): QuizSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSession(session: QuizSession): void {
  if (typeof window === 'undefined') return
  const history = getHistory()
  const updated = [session, ...history].slice(0, 30)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function getTotalStats() {
  const history = getHistory()
  const completed = history.filter(s => s.completedAt)
  const totalAnswers = completed.flatMap(s => s.answers)
  const correctCount = totalAnswers.filter(a => a.isCorrect).length
  const quizLearned = completed.flatMap(s => s.answers.map(a => a.wordId))
  const manualLearned = getLearnedWordIds()
  const uniqueWordsLearned = new Set([...quizLearned, ...manualLearned]).size

  const streakDays = calculateStreak(completed)

  return {
    totalSessions: completed.length,
    totalAnswers: totalAnswers.length,
    correctCount,
    accuracy: totalAnswers.length > 0
      ? Math.round((correctCount / totalAnswers.length) * 100)
      : 0,
    uniqueWordsLearned,
    streakDays,
  }
}

function calculateStreak(sessions: QuizSession[]): number {
  if (sessions.length === 0) return 0
  const dates = sessions
    .map(s => s.completedAt ? new Date(s.completedAt).toDateString() : null)
    .filter(Boolean)
  const uniqueDates = [...new Set(dates)].sort().reverse()

  let streak = 0
  let current = new Date()
  current.setHours(0, 0, 0, 0)

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr!)
    d.setHours(0, 0, 0, 0)
    const diff = (current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (diff <= 1) {
      streak++
      current = d
    } else {
      break
    }
  }
  return streak
}
