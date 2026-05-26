'use client'
interface Props { feedback: string; isLoading: boolean; onReaction: () => void; reactionDone: boolean }

export default function FeedbackPanel({ feedback, isLoading, onReaction, reactionDone }: Props) {
  return (
    <div className="mt-3 slide-up">
      <div className="bg-white rounded-2xl border-2 p-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'var(--primary-light)' }}>⚡</div>
          <div className="flex-1">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>AIメンター</p>
            {isLoading ? (
              <div className="flex gap-1 py-1">
                {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background:'var(--text-sub)', animationDelay:`${i*150}ms`}}/>)}
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{feedback}</p>
            )}
          </div>
        </div>
        {!isLoading && feedback && !reactionDone && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-sub)' }}>この解説はどうでしたか？</p>
            <div className="flex gap-2">
              {['💡 なるほど','🤔 もう一息','😅 難しい'].map(r=>(
                <button key={r} onClick={onReaction}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border transition-colors hover:bg-blue-50"
                  style={{ borderColor:'var(--border)', color:'var(--text-sub)' }}>{r}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
