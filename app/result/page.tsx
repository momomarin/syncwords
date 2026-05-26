'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizSession } from '@/types'
import { JOB_TYPE_LABELS } from '@/types'
import BottomNav from '@/components/BottomNav'

export default function ResultPage() {
  const router = useRouter()
  const [session, setSession] = useState<QuizSession|null>(null)
  const [email, setEmail] = useState('')
  const [encouragement, setEncouragement] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'summary'|'words'>('summary')

  useEffect(() => {
    const raw = sessionStorage.getItem('lastSession')
    if (!raw) { router.push('/'); return }
    const s: QuizSession = JSON.parse(raw)
    setSession(s)
    setLoading(true)
    fetch('/api/summary', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({answers:s.answers,jobType:s.jobType}) })
      .then(r=>r.json()).then(d=>{ setEmail(d.email??''); setEncouragement(d.encouragement??'') })
      .catch(()=>setEmail('サマリーの生成に失敗しました。'))
      .finally(()=>setLoading(false))
  }, [router])

  if (!session) return null
  const acc = Math.round((session.score/session.answers.length)*100)
  const emoji = acc>=80?'🏆':acc>=60?'💪':'📚'

  return (
    <main className="min-h-screen pb-24 px-5 pt-6">
      {/* Score */}
      <div className="rounded-3xl p-6 mb-4 text-center fade-up" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.08)'}}>
        <div className="text-5xl mb-2">{emoji}</div>
        <div className="text-5xl font-bold mb-1" style={{color: acc>=80?'var(--green)':acc>=60?'var(--orange)':'var(--red)'}}>
          {session.score}<span className="text-xl" style={{color:'var(--text-sub)'}}>/{session.answers.length}</span>
        </div>
        <p className="text-sm mb-2" style={{color:'var(--text-sub)'}}>正答率 {acc}% · {JOB_TYPE_LABELS[session.jobType]??session.jobType}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{background:'var(--primary-light)',color:'var(--primary)'}}>
          🌱 今日 +{session.score}語 習得！
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{background:'var(--card)'}}>
        {(['summary','words'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={tab===t?{background:'var(--primary)',color:'#fff'}:{color:'var(--text-sub)'}}>
            {t==='summary'?'✉️ Aha-Mail':'📝 単語リスト'}
          </button>
        ))}
      </div>

      {tab==='summary' && (
        <div className="fade-up">
          <div className="rounded-3xl overflow-hidden mb-3" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.07)'}}>
            <div className="px-5 py-3 border-b text-xs" style={{background:'#F8FAFF',borderColor:'var(--border)',color:'var(--text-sub)',fontFamily:'monospace'}}>
              <div>From: ai-coach@syncwords.app</div>
              <div>Subject: Today&apos;s Business English — {new Date().toLocaleDateString('ja-JP')}</div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <span className="text-3xl">⚡</span>
                  <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{background:'var(--primary)',animationDelay:`${i*150}ms`}}/>)}</div>
                  <p className="text-xs" style={{color:'var(--text-sub)'}}>ビジネスメールを生成中...</p>
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{color:'var(--text)',fontFamily:'monospace'}}
                  dangerouslySetInnerHTML={{__html:email.replace(/\*\*([^*]+)\*\*/g,'<strong style="color:var(--primary)">$1</strong>')}}/>
              )}
            </div>
          </div>
          {!loading && email && (
            <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm mb-3 border transition-all"
              style={{background:'var(--card)',borderColor:'var(--border)',color:'var(--text)'}}>
              {copied?'✓ コピーしました！':'📋 メールをコピー'}
            </button>
          )}
          {encouragement && (
            <div className="rounded-2xl p-4 flex gap-3" style={{background:'var(--primary-light)',border:'1px solid #BFDBFE'}}>
              <span className="text-xl flex-shrink-0">⚡</span>
              <p className="text-sm leading-relaxed" style={{color:'var(--primary-dark)'}}>{encouragement}</p>
            </div>
          )}
        </div>
      )}

      {tab==='words' && (
        <div className="space-y-2 fade-up">
          {session.answers.map((a,i)=>(
            <div key={i} className="rounded-2xl p-4 flex items-start gap-3 border" style={{background:'var(--card)',borderColor:a.isCorrect?'#86EFAC':'#FCA5A5'}}>
              <span className="text-lg mt-0.5">{a.isCorrect?'✓':'✗'}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{color:a.isCorrect?'var(--green-dark)':'var(--red-dark)'}}>{a.word}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--text-sub)'}}>{a.meaning}</p>
                {!a.isCorrect&&<p className="text-xs mt-1" style={{color:'var(--text-sub)'}}>選択: {a.selectedAnswer} → 正解: {a.correctAnswer}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button onClick={()=>router.push('/dashboard')} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold border" style={{background:'var(--card)',borderColor:'var(--border)',color:'var(--text)'}}>📊 学習記録</button>
        <button onClick={()=>router.push('/')} className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#60A5FA,#3B82F6)',boxShadow:'0 4px 14px rgba(59,130,246,0.3)'}}>もう1回 →</button>
      </div>
      <BottomNav/>
    </main>
  )
}
