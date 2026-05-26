'use client'
import { useRouter } from 'next/navigation'
import { saveProfile } from '@/lib/storage'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const router = useRouter()

  const handleReset = () => {
    if (!confirm('学習データをすべてリセットしますか？この操作は元に戻せません。')) return
    localStorage.clear()
    router.push('/')
  }

  return (
    <main className="min-h-screen flex flex-col pb-24">
      <header className="bg-white flex items-center px-4 h-14 flex-shrink-0" style={{boxShadow:'0 1px 0 var(--border)'}}>
        <button onClick={() => router.back()} className="p-2 rounded-lg mr-2" style={{color:'var(--text-sub)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="text-base font-bold" style={{color:'var(--text)'}}>設定</h1>
      </header>

      <div className="px-4 pt-4 space-y-3">
        <div className="rounded-3xl overflow-hidden" style={{background:'var(--card)',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
          <button onClick={() => { saveProfile({jobType:'',jobLevel:'',usageScenes:[]}); router.push('/') }}
            className="w-full flex items-center gap-3 px-5 py-4 border-b" style={{borderColor:'var(--border)'}}>
            <span className="text-xl">⚙️</span>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{color:'var(--text)'}}>職種を変更する</p>
              <p className="text-xs" style={{color:'var(--text-sub)'}}>AIが生成する問題の職種を変更</p>
            </div>
            <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--text-sub)'}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button onClick={handleReset}
            className="w-full flex items-center gap-3 px-5 py-4">
            <span className="text-xl">🗑️</span>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{color:'var(--red)'}}>データをリセット</p>
              <p className="text-xs" style={{color:'var(--text-sub)'}}>学習履歴・進捗をすべて削除</p>
            </div>
            <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--text-sub)'}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-xs pt-2" style={{color:'var(--text-sub)'}}>SyncWords v0.1.0</p>
      </div>

      <BottomNav/>
    </main>
  )
}
