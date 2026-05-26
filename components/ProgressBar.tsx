interface Props { current: number; total: number; score: number }
export default function ProgressBar({ current, total, score }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium mb-1.5" style={{ color: 'var(--text-sub)' }}>
        <span>{current} / {total} 問</span>
        <span style={{ color: 'var(--green)' }}>✓ {score} 正解</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(to right, #60A5FA, #3B82F6)' }}/>
      </div>
    </div>
  )
}
