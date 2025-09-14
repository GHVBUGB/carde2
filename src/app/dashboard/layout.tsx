import { Suspense } from 'react'
import DashboardNav from '@/components/dashboard/nav'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <DashboardNav />
      
      <div className="flex">
        {/* 侧边栏 */}
        <DashboardSidebar />
        
        {/* 主要内容区域 */}
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner w-8 h-8"></div>
            </div>
          }>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
