'use client'
import { useRouter, usePathname } from 'next/navigation'

const items = [
  { path: '/',          icon: '🏠', label: 'ホーム' },
  { path: '/dashboard', icon: '📊', label: '学習記録' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t bg-white flex" style={{ borderColor: 'var(--border)' }}>
      {items.map(item => {
        const active = pathname === item.path
        return (
          <button key={item.path} onClick={() => router.push(item.path)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors"
            style={{ color: active ? 'var(--primary)' : 'var(--text-sub)' }}>
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
