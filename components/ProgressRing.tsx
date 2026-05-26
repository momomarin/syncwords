interface Props { percent: number; size?: number; label: string; sublabel: string }
export default function ProgressRing({ percent, size = 140, label, sublabel }: Props) {
  const r = 50; const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA"/>
            <stop offset="100%" stopColor="#3B82F6"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center -mt-[calc(70px+8px)] mb-[calc(70px-8px)]" style={{ marginTop: `-${size/2 + 4}px`, marginBottom: `${size/2 - 12}px` }}>
        <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{percent}%</div>
        <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-sub)' }}>{sublabel}</div>
      </div>
    </div>
  )
}
