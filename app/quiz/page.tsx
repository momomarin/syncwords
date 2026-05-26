'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChoiceButton from '@/components/ChoiceButton'
import FeedbackPanel from '@/components/FeedbackPanel'
import { getProfile, saveSession } from '@/lib/storage'
import type { QuizQuestion, QuizAnswer } from '@/types'

type Phase = 'loading' | 'question' | 'answered' | 'error'

export default function QuizPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string|null>(null)
  const [feedback, setFeedback] = useState('')
  const [fbLoading, setFbLoading] = useState(false)
  const [reactionDone, setReactionDone] = useState(false)
  const [jobType, setJobType] = useState('')
  const [sessionId] = useState(() => crypto.randomUUID())
  const qStart = useRef(Date.now())

  const current = questions[idx]
  const isLast = idx === questions.length - 1
  const lastAnswer = answers[answers.length - 1]
  const canNext = phase === 'answered' && (reactionDone || lastAnswer?.isCorrect)

  useEffect(() => {
    const jt = getProfile()?.jobType ?? 'it-sales'
    setJobType(jt)
    fetch('/api/quiz/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({jobType:jt}) })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setQuestions(d.questions); setPhase('question'); qStart.current = Date.now() })
      .catch(() => setPhase('error'))
  }, [])

  const getFeedback = useCallback(async (q: QuizQuestion, wrong: string) => {
    setFbLoading(true); setFeedback('')
    try {
      const res = await fetch('/api/feedback', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ word:q.word, meaning:q.meaning, sentence:q.sentence, correctAnswer:q.correctAnswer, wrongAnswer:wrong, jobType }) })
      if (!res.body) throw new Error()
      const reader = res.body.getReader(); const dec = new TextDecoder(); let text = ''
      while (true) { const {done,value} = await reader.read(); if (done) break; text += dec.decode(value,{stream:true}); setFeedback(text) }
    } catch { setFeedback('解説を取得できませんでした。') } finally { setFbLoading(false) }
  }, [jobType])

  const handleChoice = useCallback((choice: string) => {
    if (phase !== 'question' || !current) return
    const isCorrect = choice === current.correctAnswer
    setSelected(choice); setPhase('answered'); setReactionDone(false); setFeedback('')
    setAnswers(prev => [...prev, { questionIndex:idx, wordId:current.wordId, word:current.word, meaning:current.meaning,
      selectedAnswer:choice, correctAnswer:current.correctAnswer, isCorrect, sentence:current.sentence, timeTakenMs:Date.now()-qStart.current }])
    if (isCorrect) { setScore(s=>s+1); setReactionDone(true) } else { getFeedback(current, choice) }
  }, [phase, current, idx, getFeedback])

  const handleNext = useCallback(() => {
    if (isLast) {
      const finalAnswers = answers
      const session = { id:sessionId, questions, answers:finalAnswers, score:finalAnswers.filter(a=>a.isCorrect).length, jobType, startedAt:new Date().toISOString(), completedAt:new Date().toISOString() }
      saveSession(session); sessionStorage.setItem('lastSession', JSON.stringify(session)); router.push('/result')
    } else {
      setIdx(i=>i+1); setSelected(null); setFeedback(''); setReactionDone(false); setPhase('question'); qStart.current = Date.now()
    }
  }, [isLast, answers, sessionId, questions, jobType, router])

  const choiceState = (c: string) => {
    if (phase !== 'answered') return 'idle'
    if (c === current.correctAnswer) return 'correct'
    if (c === selected) return 'wrong'
    return 'idle'
  }

  if (phase === 'loading') return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center fade-up">
        <span className="text-5xl block mb-4">⚡</span>
        <p className="font-semibold mb-1" style={{color:'var(--text)'}}>AIが問題を生成中...</p>
        <p className="text-sm" style={{color:'var(--text-sub)'}}>あなたの職種に合わせた10問を準備中</p>
        <div className="flex justify-center gap-1.5 mt-5">
          {[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{background:'var(--primary)',animationDelay:`${i*150}ms`}}/>)}
        </div>
      </div>
    </main>
  )

  if (phase === 'error') return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <p className="mb-4" style={{color:'var(--red)'}}>問題の生成に失敗しました</p>
        <button onClick={()=>router.push('/')} className="px-6 py-3 rounded-2xl font-semibold text-white" style={{background:'var(--primary)'}}>トップへ戻る</button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col px-5 pt-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={()=>router.push('/')} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{background:'var(--border)',color:'var(--text-sub)'}}>✕</button>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-medium mb-1" style={{color:'var(--text-sub)'}}>
            <span>{idx + (phase==='answered'?1:0)} / {questions.length}</span>
            <span style={{color:'var(--green)'}}>✓ {score}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{background:'var(--border)'}}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{width:`${((idx+(phase==='answered'?1:0))/questions.length)*100}%`,background:'linear-gradient(to right,#60A5FA,#3B82F6)'}}/>
          </div>
        </div>
        <button onClick={()=>router.push('/')} className="text-xs px-3 py-1.5 rounded-full border" style={{borderColor:'var(--border)',color:'var(--text-sub)'}}>中断</button>
      </div>

      {/* Question card */}
      <div className="rounded-3xl p-5 mb-4 fade-up" style={{background:'var(--card)',boxShadow:'0 2px 16px rgba(59,130,246,0.07)'}}>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
          style={{background:'var(--primary-light)',color:'var(--primary)'}}>
          Q{idx+1} · {current.word}
        </div>
        <p className="font-semibold text-lg leading-relaxed mb-1" style={{color:'var(--text)'}}>
          {current.sentence.split('____').map((part,i)=>(
            <span key={i}>{part}{i===0&&(
              <span className="inline-block px-3 py-0.5 rounded-lg mx-1 font-bold border-b-2"
                style={phase==='answered'
                  ?{background:'#EFF6FF',color:'var(--primary)',borderColor:'var(--primary)'}
                  :{background:'var(--border)',color:'transparent',borderColor:'#94A3B8',minWidth:80,textAlign:'center'}}>
                {phase==='answered' ? current.correctAnswer : '____'}
              </span>
            )}</span>
          ))}
        </p>
        <p className="text-xs mt-2" style={{color:'var(--text-sub)'}}>{current.meaning}</p>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-2.5 mb-3">
        {current.choices.map(c=>(
          <ChoiceButton key={c} choice={c} state={choiceState(c)} onClick={()=>handleChoice(c)} disabled={phase==='answered'}/>
        ))}
      </div>

      {/* Feedback */}
      {phase==='answered' && !lastAnswer?.isCorrect && (
        <FeedbackPanel feedback={feedback} isLoading={fbLoading} onReaction={()=>setReactionDone(true)} reactionDone={reactionDone}/>
      )}

      {/* Correct badge */}
      {phase==='answered' && lastAnswer?.isCorrect && (
        <div className="rounded-2xl p-4 flex items-center gap-3 slide-up" style={{background:'#F0FDF4',border:'2px solid #86EFAC'}}>
          <span className="text-2xl anim-pop">🎉</span>
          <div><p className="font-semibold text-sm" style={{color:'var(--green-dark)'}}>正解！</p><p className="text-xs" style={{color:'#4ADE80'}}>{current.word} — {current.meaning}</p></div>
        </div>
      )}

      {/* Next button */}
      {canNext && (
        <button onClick={handleNext} className="w-full mt-4 py-4 rounded-2xl font-bold text-base text-white fade-up"
          style={{background:'linear-gradient(135deg,#60A5FA,#3B82F6)',boxShadow:'0 4px 14px rgba(59,130,246,0.35)'}}>
          {isLast ? '結果を見る 🏆' : '次の問題 →'}
        </button>
      )}
    </main>
  )
}
