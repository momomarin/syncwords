'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAllWords } from '@/lib/words'
import { getLearnedWordIds, addLearnedWordId } from '@/lib/storage'
import BottomNav from '@/components/BottomNav'
import type { Word } from '@/types'

type Folder = 'all' | 'pos' | 'learned' | 'unlearned'
interface Detail { sentence: string; tip: string }

const POS_GROUPS = [
  { label: '名詞', color: '#DBEAFE', textColor: '#1D4ED8' },
  { label: '動詞', color: '#DCFCE7', textColor: '#15803D' },
  { label: '形容詞', color: '#FEF9C3', textColor: '#A16207' },
  { label: '副詞', color: '#F3E8FF', textColor: '#7E22CE' },
]

function SpeakIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  )
}

function WordCard({ word, isExpanded, isLearned, onToggle, onLearn }: {
  word: Word; isExpanded: boolean; isLearned: boolean
  onToggle: () => void; onLearn: () => void
}) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const cacheKey = `word_detail_${word.id}`

  useEffect(() => {
    if (!isExpanded) return
    const cached = localStorage.getItem(cacheKey)
    if (cached) { try { setDetail(JSON.parse(cached)); return } catch { /* ignore */ } }
    setLoading(true)
    fetch('/api/word-detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: word.word, meaning: word.meaning, pos: word.pos, jobType: 'general' }),
    })
      .then(r => r.json())
      .then((d: Detail) => { setDetail(d); localStorage.setItem(cacheKey, JSON.stringify(d)) })
      .catch(() => setDetail({ sentence: '', tip: '' }))
      .finally(() => setLoading(false))
  }, [isExpanded, word.id, word.word, word.meaning, word.pos, cacheKey])

  const speak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(word.word)
    utt.lang = 'en-US'; utt.rate = 0.85
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [word.word])

  const similars = word.similar.split(',').map(s => s.trim()).filter(Boolean)
  const posGroup = POS_GROUPS.find(g => word.pos.includes(g.label)) ?? { color: '#F1F5F9', textColor: '#475569' }

  return (
    <div className="rounded-2xl overflow-hidden" style={{background:'var(--card)',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
      {/* Collapsed row */}
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold" style={{color:'var(--text)'}}>{word.word}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{background: posGroup.color, color: posGroup.textColor}}>{word.pos}</span>
          </div>
          <p className="text-xs truncate" style={{color:'var(--text-sub)'}}>{word.meaning}</p>
        </div>
        {isLearned && <span className="text-green-500 text-base flex-shrink-0">✓</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          style={{color:'var(--text-sub)'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t" style={{borderColor:'var(--border)'}}>
          {/* Word header */}
          <div className="flex items-center justify-between pt-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{background: posGroup.color, color: posGroup.textColor}}>{word.pos}</span>
                <span className="text-xs" style={{color:'var(--text-sub)'}}>Lv.{word.level}</span>
              </div>
              <h3 className="text-xl font-bold" style={{color:'var(--text)'}}>{word.word}</h3>
              <p className="text-sm font-semibold mt-0.5" style={{color:'var(--text)'}}>{word.meaning}</p>
            </div>
            <button onClick={speak} className="p-2.5 rounded-full flex-shrink-0"
              style={{background: speaking ? 'var(--primary)' : 'var(--primary-light)', color: speaking ? '#fff' : 'var(--primary)'}}>
              <SpeakIcon/>
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {similars.map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full border"
                style={{borderColor:'var(--border)',color:'var(--text-sub)'}}>{s}</span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#FEF9C3',color:'#A16207'}}>
              📌 {word.example_scene}
            </span>
          </div>

          {/* Example sentence */}
          <div className="rounded-xl p-3 mb-3" style={{background:'var(--bg)'}}>
            <p className="text-xs font-semibold mb-1.5" style={{color:'var(--text-sub)'}}>例文</p>
            {loading ? (
              <div className="flex gap-1 py-0.5">
                {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{background:'var(--text-sub)',animationDelay:`${i*150}ms`}}/>)}
              </div>
            ) : detail?.sentence ? (
              <p className="text-sm leading-relaxed" style={{color:'var(--text)'}}>{detail.sentence}</p>
            ) : (
              <p className="text-xs" style={{color:'var(--text-sub)'}}>例文を取得できませんでした</p>
            )}
            {detail?.tip && (
              <p className="text-xs mt-2 pt-2 border-t" style={{borderColor:'var(--border)',color:'var(--primary-dark)'}}>
                💡 {detail.tip}
              </p>
            )}
          </div>

          {/* Understood button */}
          {!isLearned ? (
            <button onClick={(e) => { e.stopPropagation(); onLearn() }}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
              style={{background:'linear-gradient(135deg,#34D399,#10B981)',boxShadow:'0 3px 10px rgba(16,185,129,0.3)'}}>
              ✓ 理解した！
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-xl font-bold text-sm text-center"
              style={{background:'#F0FDF4',color:'var(--green)'}}>
              学習済み ✓
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WordsPage() {
  const router = useRouter()
  const allWords = useMemo(() => getAllWords(), [])
  const [folder, setFolder] = useState<Folder>('all')
  const [activePosGroup, setActivePosGroup] = useState<string | null>(null)
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set())
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setLearnedIds(new Set(getLearnedWordIds()))
  }, [])

  const handleLearn = useCallback((id: number) => {
    addLearnedWordId(id)
    setLearnedIds(prev => new Set([...prev, id]))
  }, [])

  const filteredWords = useMemo(() => {
    let words = allWords
    if (folder === 'learned') words = words.filter(w => learnedIds.has(w.id))
    else if (folder === 'unlearned') words = words.filter(w => !learnedIds.has(w.id))
    else if (folder === 'pos') {
      const group = POS_GROUPS.find(g => g.label === activePosGroup)
      if (group) words = words.filter(w => w.pos.includes(group.label))
      else words = []
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      words = words.filter(w => w.word.toLowerCase().includes(q) || w.meaning.includes(q))
    }
    return words
  }, [allWords, folder, activePosGroup, learnedIds, query])

  const folders: { id: Folder; icon: string; label: string; count: number }[] = [
    { id: 'all',       icon: '📚', label: '全単語',   count: allWords.length },
    { id: 'pos',       icon: '🏷️', label: '品詞',     count: POS_GROUPS.length },
    { id: 'learned',   icon: '✅', label: '学習済み', count: learnedIds.size },
    { id: 'unlearned', icon: '📖', label: '未学習',   count: allWords.length - learnedIds.size },
  ]

  const posWordCount = (label: string) => allWords.filter(w => w.pos.includes(label)).length

  return (
    <main className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="bg-white flex items-center px-4 h-14 flex-shrink-0" style={{boxShadow:'0 1px 0 var(--border)'}}>
        <button onClick={() => router.back()} className="p-2 rounded-lg mr-2" style={{color:'var(--text-sub)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="text-base font-bold" style={{color:'var(--text)'}}>単語一覧</h1>
      </header>

      {/* Folder cards */}
      <div className="grid grid-cols-4 gap-2 px-4 pt-3 pb-2">
        {folders.map(f => (
          <button key={f.id} onClick={() => { setFolder(f.id); setActivePosGroup(null); setExpandedId(null) }}
            className="rounded-2xl py-3 px-1 flex flex-col items-center gap-1 transition-all"
            style={{
              background: folder === f.id ? 'var(--primary)' : 'var(--card)',
              boxShadow: folder === f.id ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 6px rgba(0,0,0,0.05)',
            }}>
            <span className="text-lg leading-none">{f.icon}</span>
            <span className="text-sm font-bold leading-none" style={{color: folder === f.id ? '#fff' : 'var(--text)'}}>
              {f.id === 'pos' ? `${f.count}種` : f.count}
            </span>
            <span className="text-[10px] leading-none" style={{color: folder === f.id ? 'rgba(255,255,255,0.8)' : 'var(--text-sub)'}}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {/* POS sub-chips */}
      {folder === 'pos' && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
          {POS_GROUPS.map(g => (
            <button key={g.label}
              onClick={() => { setActivePosGroup(activePosGroup === g.label ? null : g.label); setExpandedId(null) }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
              style={{
                background: activePosGroup === g.label ? g.color : 'var(--card)',
                borderColor: activePosGroup === g.label ? g.textColor : 'var(--border)',
                color: activePosGroup === g.label ? g.textColor : 'var(--text-sub)',
              }}>
              {g.label} {posWordCount(g.label)}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{color:'var(--text-sub)'}}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="単語・意味で検索..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)'}}/>
        </div>
      </div>

      {/* Word list */}
      <div className="flex-1 px-4 space-y-2">
        {folder === 'pos' && !activePosGroup ? (
          <div className="pt-6 text-center">
            <p className="text-sm" style={{color:'var(--text-sub)'}}>上の品詞を選んでください</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="pt-8 text-center">
            <p className="text-2xl mb-2">
              {folder === 'learned' ? '📖' : '🔍'}
            </p>
            <p className="text-sm" style={{color:'var(--text-sub)'}}>
              {folder === 'learned' ? 'まだ学習済みの単語がありません' : '見つかりませんでした'}
            </p>
          </div>
        ) : filteredWords.map(w => (
          <WordCard key={w.id} word={w}
            isExpanded={expandedId === w.id}
            isLearned={learnedIds.has(w.id)}
            onToggle={() => setExpandedId(expandedId === w.id ? null : w.id)}
            onLearn={() => handleLearn(w.id)}/>
        ))}
      </div>

      <BottomNav/>
    </main>
  )
}
