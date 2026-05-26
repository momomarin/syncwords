import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SyncWords — ビジネス英単語を仕事に同期',
  description: 'TOEICビジネス単語300語をAIパーソナライズで習得。',
  icons: { icon: '/logo.png', apple: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ background: '#E8ECF0' }}>
        <div className="max-w-md mx-auto min-h-screen relative"
          style={{ background: 'var(--bg)', boxShadow: '0 0 40px rgba(0,0,0,0.12)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
