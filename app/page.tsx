'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, saveProfile, getTotalStats } from '@/lib/storage'
import { getAllWords } from '@/lib/words'
import { JOB_TYPES } from '@/types'
import BottomNav from '@/components/BottomNav'
import WordOfDay from '@/components/WordOfDay'

export default function HomePage() {
  const router = useRouter()
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const [selected, setSelected] = useState('')
  const [stats, setStats] = useState({ streakDays:0, uniqueWordsLearned:0, accuracy:0, totalSessions:0 })
  const [jobLabel, setJobLabel] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const profile = getProfile()
    if (profile?.jobType) {
      setIsFirstTime(false)
      setSelected(profile.jobType)
      setJobLabel(JOB_TYPES.find(j=>j.id===profile.jobType)?.label ?? profile.jobType)
      setStats(getTotalStats())
    } else {
      setIsFirstTime(true)
    }
  }, [])

  const handleOnboarding = () => {
    if (!selected) return
    saveProfile({ jobType: selected, jobLevel:'', usageScenes:[] })
    setIsFirstTime(false)
    setJobLabel(JOB_TYPES.find(j=>j.id===selected)?.label ?? selected)
    setStats(getTotalStats())
  }

  const handleJobChange = () => {
    saveProfile({ jobType:'', jobLevel:'', usageScenes:[] })
    setIsFirstTime(true)
    setMenuOpen(false)
  }

  const wordsLeft = Math.max(0, 300 - stats.uniqueWordsLearned)
  const progressPct = Math.min(100, Math.round((stats.uniqueWordsLearned / 300) * 100))
  const allWords = getAllWords()
  const todaysWord = allWords[Math.floor(Date.now() / 86400000) % allWords.length]

  if (isFirstTime === null) return null

  // ── Onboarding ─────────────────────────────────────────
  if (isFirstTime) return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-white flex items-center justify-center h-14 flex-shrink-0" style={{boxShadow:'0 1px 0 var(--border)'}}>
        <img src="/logo.png" alt="SyncWords" style={{height:32}}/>
      </header>
      <div className="flex-1 px-5 py-8 fade-up">
        <h2 className="text-2xl font-bold mb-1" style={{color:'var(--text)'}}>ようこそ！🎉</h2>
        <p className="text-sm mb-6" style={{color:'var(--text-sub)'}}>あなたの職種を教えてください。AIが最適な問題を生成します。</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {JOB_TYPES.map(job => (
            <button key={job.id} onClick={() => setSelected(job.id)}
              className="flex items-center gap-2 p-4 rounded-2xl border-2 text-sm font-medium transition-all"
              style={{ background: selected===job.id ? 'var(--primary-light)' : 'var(--card)',
                borderColor: selected===job.id ? 'var(--primary)' : 'var(--border)',
                color: selected===job.id ? 'var(--primary-dark)' : 'var(--text)' }}>
              <span className="text-xl">{job.icon}</span>{job.label}
            </button>
          ))}
        </div>
        <button onClick={handleOnboarding} disabled={!selected}
          className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all"
          style={{ background: selected ? 'linear-gradient(135deg,#60A5FA,#3B82F6)' : 'var(--border)',
            boxShadow: selected ? '0 4px 14px rgba(59,130,246,0.4)' : 'none' }}>
          学習を始める →
        </button>
      </div>
    </main>
  )

  // ── Returning user ──────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white flex items-center px-4 h-14 flex-shrink-0 relative" style={{boxShadow:'0 1px 0 var(--border)'}}>
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <img src="/logo.png" alt="SyncWords" style={{height:32}}/>
        </div>
        <button onClick={() => setMenuOpen(true)} className="ml-auto p-2 rounded-lg relative z-10" style={{color:'var(--text)'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      {/* Drawer */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)}/>
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col"
            style={{boxShadow:'-4px 0 24px rgba(0,0,0,0.12)'}}>
            <div className="flex items-center justify-between px-5 h-14 border-b" style={{borderColor:'var(--border)'}}>
              <span className="font-bold" style={{color:'var(--text)'}}>メニュー</span>
              <button onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                style={{background:'var(--border)',color:'var(--text-sub)'}}>✕</button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {([
                { icon:'⚙️', label:'職種変更', sub:'現在: '+jobLabel, action: handleJobChange },
                { icon:'📊', label:'学習記録', sub:'学習の進捗を確認', action: () => { router.push('/dashboard'); setMenuOpen(false) } },
                { icon:'📖', label:'単語一覧', sub:'登録単語をブラウズ', action: () => { router.push('/words'); setMenuOpen(false) } },
                { icon:'🛠️', label:'設定', sub:'その他の設定', action: () => { router.push('/settings'); setMenuOpen(false) } },
              ] as const).map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left"
                  style={{background:'var(--bg)'}}>
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{color:'var(--text)'}}>{item.label}</p>
                    <p className="text-xs" style={{color:'var(--text-sub)'}}>{item.sub}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Greeting */}
        <div className="mb-3 fade-up">
          <h2 className="text-xl font-bold" style={{color:'var(--text)'}}>おはようございます！</h2>
          <p className="text-sm" style={{color:'var(--text-sub)'}}>今日も目標の700点に近づきましょう 💪</p>
        </div>

        {/* Progress Card */}
        <div className="rounded-3xl p-4 mb-3 fade-up" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.08)'}}>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0" style={{width:88,height:88}}>
              <svg width="88" height="88" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="9"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#hg)" strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*38}`}
                  strokeDashoffset={`${2*Math.PI*38*(1-progressPct/100)}`}
                  style={{transition:'stroke-dashoffset 1s ease'}}/>
                <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#3B82F6"/>
                </linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold" style={{color:'var(--primary)'}}>{progressPct}%</span>
                <span className="text-[9px]" style={{color:'var(--text-sub)'}}>達成</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs mb-0.5" style={{color:'var(--text-sub)'}}>TOEIC目標スコア</p>
              <p className="text-3xl font-bold" style={{color:'var(--text)'}}>700</p>
              <p className="text-xs mt-1" style={{color:'var(--text-sub)'}}>
                {wordsLeft > 0 ? `あと ${wordsLeft} 語で達成` : '🎉 全単語制覇！'}
              </p>
              <p className="text-xs mt-0.5" style={{color:'var(--text-sub)'}}>職種: {jobLabel}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 mb-3 fade-up">
          {[
            { icon:'🔥', value:`${stats.streakDays}日`, label:'連続学習' },
            { icon:'📚', value:`${stats.uniqueWordsLearned}語`, label:'習得単語' },
            { icon:'🎯', value:`${stats.accuracy}%`, label:'正答率' },
          ].map(s=>(
            <div key={s.label} className="rounded-2xl p-2.5 text-center" style={{background:'var(--card)',boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
              <p className="text-xl mb-0.5">{s.icon}</p>
              <p className="text-sm font-bold" style={{color:'var(--text)'}}>{s.value}</p>
              <p className="text-[10px]" style={{color:'var(--text-sub)'}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => router.push('/quiz')}
          className="w-full rounded-2xl font-bold text-white fade-up"
          style={{
            background:'linear-gradient(135deg,#60A5FA,#3B82F6)',
            boxShadow:'0 6px 24px rgba(59,130,246,0.45)',
            padding:'20px 0',
            fontSize:'1.125rem',
            letterSpacing:'0.01em',
          }}>
          今日の10問を始める →
        </button>

        {/* Banner */}
        {stats.totalSessions === 0 && (
          <div className="mt-3 rounded-2xl p-3.5 flex items-center gap-3 fade-up"
            style={{background:'var(--primary-light)',border:'1px solid #BFDBFE'}}>
            <span className="text-xl">⚡</span>
            <p className="text-xs" style={{color:'var(--primary-dark)'}}>通勤・休憩時間にコツコツ続けて、700点突破を目指しましょう！</p>
          </div>
        )}

        {/* Word of the Day */}
        <div className="mt-3">
          <WordOfDay word={todaysWord} jobType={selected}/>
        </div>
      </div>

      <BottomNav/>
    </main>
  )
}
