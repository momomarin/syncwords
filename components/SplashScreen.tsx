'use client'
import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'done'>('done')

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) return
    setPhase('in')
    const t1 = setTimeout(() => setPhase('hold'), 700)
    const t2 = setTimeout(() => setPhase('out'), 1600)
    const t3 = setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem('splashShown', '1')
    }, 2100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (phase === 'done') return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
      <img
        src="/logo.png"
        alt="SyncWords"
        className={phase === 'out' ? 'splash-out' : 'splash-in'}
        style={{ width: 220 }}
      />
    </div>
  )
}
