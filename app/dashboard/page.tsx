'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTotalStats, getHistory } from '@/lib/storage'
import { JOB_TYPE_LABELS } from '@/types'
import BottomNav from '@/components/BottomNav'
import type { QuizSession } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ totalSessions:0, totalAnswers:0, correctCount:0, accuracy:0, uniqueWordsLearned:0, streakDays:0 })
  const [history, setHistory] = useState<QuizSession[]>([])

  useEffect(() => { setStats(getTotalStats()); setHistory(getHistory().slice(0, 5)) }, [])

  const progressPercent = Math.min(100, Math.round((stats.uniqueWordsLearned / 300) * 100))
  const wordsUntilGoal = Math.max(0, 300 - stats.uniqueWordsLearned)
  const circumference = 2 * Math.PI * 40
  const strokeDash = (progressPercent / 100) * circumference

  return (
    <main className="min-h-screen flex flex-col px-5 pt-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{color:'var(--text)'}}>学習記録</h1>
          <p className="text-xs" style={{color:'var(--text-sub)'}}>TOEIC 700点レベル 300語</p>
        </div>
        <span className="text-2xl">📊</span>
      </div>

      {/* Progress ring card */}
      <div className="rounded-3xl p-5 mb-4 text-center" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.07)'}}>
        <div className="relative inline-flex items-center justify-center mb-3">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="9"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#dbGrad)" strokeWidth="9"
              strokeLinecap="round" strokeDasharray={`${strokeDash} ${circumference}`}
              className="transition-all duration-700"/>
            <defs>
              <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60A5FA"/>
                <stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <p className="text-2xl font-bold" style={{color:'var(--text)'}}>{stats.uniqueWordsLearned}</p>
            <p className="text-xs" style={{color:'var(--text-sub)'}}>/ 300語</p>
          </div>
        </div>
        <p className="font-semibold text-sm" style={{color:'var(--text)'}}>
          {wordsUntilGoal > 0 ? `あと ${wordsUntilGoal} 語で目標達成！` : '🎉 全単語制覇！'}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{background:'var(--primary-light)',color:'var(--primary)'}}>
          習得率 {progressPercent}%
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon:'🔥', value:`${stats.streakDays}日`, label:'連続学習', hi: stats.streakDays >= 3 },
          { icon:'🎯', value:`${stats.accuracy}%`, label:'正答率', hi: stats.accuracy >= 80 },
          { icon:'⚡', value:`${stats.totalSessions}回`, label:'総セッション', hi: false },
          { icon:'📝', value:`${stats.totalAnswers}問`, label:'総解答数', hi: false },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{
            background: s.hi ? 'var(--primary-light)' : 'var(--card)',
            boxShadow:'0 1px 8px rgba(59,130,246,0.06)',
            border: s.hi ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          }}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold" style={{color: s.hi ? 'var(--primary)' : 'var(--text)'}}>{s.value}</p>
            <p className="text-xs" style={{color:'var(--text-sub)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent history */}
      {history.length > 0 ? (
        <div className="rounded-3xl p-5" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.07)'}}>
          <h2 className="text-sm font-semibold mb-3" style={{color:'var(--text)'}}>直近の学習</h2>
          <div className="space-y-0">
            {history.map((s, i) => {
              const acc = s.answers.length > 0 ? Math.round((s.score / s.answers.length) * 100) : 0
              const date = s.completedAt
                ? new Date(s.completedAt).toLocaleDateString('ja-JP', { month:'short', day:'numeric' })
                : '未完了'
              return (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0"
                  style={{borderColor:'var(--border)'}}>
                  <div>
                    <p className="text-sm font-medium" style={{color:'var(--text)'}}>{date}</p>
                    <p className="text-xs" style={{color:'var(--text-sub)'}}>{JOB_TYPE_LABELS[s.jobType] ?? s.jobType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{color:'var(--text)'}}>{s.score}/{s.answers.length}問</p>
                    <p className="text-xs font-semibold" style={{color: acc>=80 ? 'var(--green)' : acc>=60 ? 'var(--orange)' : 'var(--red)'}}>{acc}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <span className="text-5xl mb-4 block">⚡</span>
          <p className="font-semibold mb-1" style={{color:'var(--text)'}}>まだ記録がありません</p>
          <p className="text-sm mb-6" style={{color:'var(--text-sub)'}}>最初の10問に挑戦してみよう！</p>
          <button onClick={()=>router.push('/')} className="px-6 py-3 rounded-2xl font-bold text-sm text-white"
            style={{background:'linear-gradient(135deg,#60A5FA,#3B82F6)',boxShadow:'0 4px 14px rgba(59,130,246,0.35)'}}>
            クイズをスタート →
          </button>
        </div>
      )}

      <BottomNav/>
    </main>
  )
}
