import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/nav'
import AdminSidebar from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  // 检查用户是否已认证
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 检查用户是否为管理员
  const { data: userProfile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userProfile?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <AdminNav />
      
      <div className="flex">
        {/* 侧边栏 */}
        <AdminSidebar />
        
        {/* 主要内容区域 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
