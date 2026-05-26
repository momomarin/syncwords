import type { Metadata } from 'next'
import './globals.css'
import SplashScreen from '@/components/SplashScreen'

export const metadata: Metadata = {
  title: 'SyncWords — ビジネス英単語を仕事に同期',
  description: 'TOEICビジネス単語300語をAIパーソナライズで習得。',
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ background: '#E8ECF0' }}>
        <SplashScreen />
        <div className="max-w-md mx-auto min-h-screen relative"
          style={{ background: 'var(--bg)', boxShadow: '0 0 40px rgba(0,0,0,0.12)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
