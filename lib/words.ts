import wordListRaw from '@/data/toeic_wordlist.json'
import type { Word } from '@/types'

const wordList: Word[] = wordListRaw as Word[]

export function getRandomWords(count: number = 10, level?: number): Word[] {
  const filtered = level ? wordList.filter(w => w.level === level) : wordList
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function getWordsByIds(ids: number[]): Word[] {
  return ids.map(id => wordList.find(w => w.id === id)).filter(Boolean) as Word[]
}

export function getAllWords(): Word[] {
  return wordList
}
