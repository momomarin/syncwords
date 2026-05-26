'use client'
import { useState, useEffect, useCallback } from 'react'
import { getLearnedWordIds, addLearnedWordId } from '@/lib/storage'
import type { Word } from '@/types'

interface Detail { sentence: string; tip: string }
interface Props { word: Word; jobType: string }

export default function WordOfDay({ word, jobType }: Props) {
  const cacheKey = `word_detail_${word.id}`

  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(false)
  const [understood, setUnderstood] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setUnderstood(getLearnedWordIds().includes(word.id))
    const cached = localStorage.getItem(cacheKey)
    if (cached) { try { setDetail(JSON.parse(cached)) } catch { /* ignore */ } return }
    setLoading(true)
    fetch('/api/word-detail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: word.word, meaning: word.meaning, pos: word.pos, jobType }),
    })
      .then(r => r.json())
      .then((d: Detail) => { setDetail(d); localStorage.setItem(cacheKey, JSON.stringify(d)) })
      .catch(() => setDetail({ sentence: '', tip: '' }))
      .finally(() => setLoading(false))
  }, [word.id, word.word, word.meaning, word.pos, jobType, cacheKey])

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(word.word)
    utt.lang = 'en-US'; utt.rate = 0.85
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [word.word])

  const handleUnderstood = () => {
    addLearnedWordId(word.id)
    setUnderstood(true)
  }

  const similars = word.similar.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="rounded-3xl p-4 fade-up" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.08)'}}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold" style={{color:'var(--primary)'}}>今日の単語</p>
        {understood && (
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{background:'#F0FDF4',color:'var(--green)'}}>✓ 理解済み</span>
        )}
      </div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'var(--primary-light)',color:'var(--primary)'}}>{word.pos}</span>
            <span className="text-xs" style={{color:'var(--text-sub)'}}>Lv.{word.level}</span>
          </div>
          <h3 className="text-2xl font-bold" style={{color:'var(--text)'}}>{word.word}</h3>
          <p className="text-sm font-semibold mt-0.5" style={{color:'var(--text)'}}>{word.meaning}</p>
        </div>
        <button onClick={speak} className="p-2.5 rounded-full flex-shrink-0 mt-1"
          style={{background: speaking ? 'var(--primary)' : 'var(--primary-light)', color: speaking ? '#fff' : 'var(--primary)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {similars.map(s => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full border" style={{borderColor:'var(--border)',color:'var(--text-sub)'}}>{s}</span>
        ))}
        <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'#FEF9C3',color:'#A16207'}}>📌 {word.example_scene}</span>
      </div>
      <div className="rounded-2xl p-3 mb-3" style={{background:'var(--bg)'}}>
        <p className="text-xs font-semibold mb-1.5" style={{color:'var(--text-sub)'}}>例文</p>
        {loading ? (
          <div className="flex gap-1 py-0.5">
            {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:'var(--text-sub)',animationDelay:`${i*150}ms`}}/>)}
          </div>
        ) : detail?.sentence ? (
          <p className="text-sm leading-relaxed" style={{color:'var(--text)'}}>{detail.sentence}</p>
        ) : (
          <p className="text-xs" style={{color:'var(--text-sub)'}}>例文を取得できませんでした</p>
        )}
        {detail?.tip && (
          <p className="text-xs mt-2 pt-2 border-t" style={{borderColor:'var(--border)',color:'var(--primary-dark)'}}>💡 {detail.tip}</p>
        )}
      </div>
      {!understood ? (
        <button onClick={handleUnderstood} className="w-full py-3 rounded-2xl font-bold text-sm text-white"
          style={{background:'linear-gradient(135deg,#34D399,#10B981)',boxShadow:'0 4px 12px rgba(16,185,129,0.3)'}}>
          ✓ 理解した！
        </button>
      ) : (
        <div className="w-full py-3 rounded-2xl font-bold text-sm text-center" style={{background:'#F0FDF4',color:'var(--green)'}}>
          今日の単語をマスター 🎉
        </div>
      )}
    </div>
  )
}
