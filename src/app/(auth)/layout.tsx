import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50">
      {/* 导航栏 */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">51</span>
            </div>
            <span className="text-xl font-bold text-brand-dark">Talk名片</span>
          </Link>
          
          <div className="text-sm text-brand-gray">
            专为51Talk员工设计的数字名片平台
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="px-6 py-4 text-center text-sm text-brand-gray">
        <p>&copy; 2024 51Talk Online Education. All rights reserved.</p>
      </footer>
    </div>
  )
}
