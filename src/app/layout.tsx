import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '51Talk员工数字名片制作平台',
  description: '专为51Talk内部员工设计的数字名片制作平台，提供统一的品牌形象展示和专业的业务名片生成功能',
  keywords: '51Talk,数字名片,员工名片,在线制作',
  authors: [{ name: '51Talk Tech Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF6B35',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
        {/* Toast 容器 */}
        <div id="toast-container" />
      </body>
    </html>
  )
}
