export interface Word {
  id: number
  word: string
  pos: string
  meaning: string
  level: number
  example_scene: string
  similar: string
}

export interface QuizQuestion {
  wordId: number
  word: string
  meaning: string
  sentence: string
  choices: string[]
  correctAnswer: string
}

export interface QuizAnswer {
  questionIndex: number
  wordId: number
  word: string
  meaning: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  sentence: string
  feedback?: string
  timeTakenMs?: number
}

export interface QuizSession {
  id: string
  questions: QuizQuestion[]
  answers: QuizAnswer[]
  score: number
  jobType: string
  startedAt: string
  completedAt?: string
}

export interface UserProfile {
  jobType: string
  jobLevel: string
  usageScenes: string[]
}

export const JOB_TYPES = [
  { id: 'it-sales', label: 'IT営業', icon: '💼' },
  { id: 'engineer', label: 'エンジニア', icon: '💻' },
  { id: 'marketing', label: 'マーケター', icon: '📊' },
  { id: 'manager', label: 'マネージャー', icon: '👔' },
  { id: 'finance', label: '経理・財務', icon: '📈' },
  { id: 'hr', label: '人事', icon: '🤝' },
] as const

export const JOB_TYPE_LABELS: Record<string, string> = {
  'it-sales': 'IT営業',
  'engineer': 'エンジニア',
  'marketing': 'マーケター',
  'manager': 'マネージャー',
  'finance': '経理・財務',
  'hr': '人事',
}
