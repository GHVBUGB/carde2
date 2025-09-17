'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase/client'
import StatsCards from '@/components/dashboard/stats-cards'

export default function DashboardPage() {
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDownloads: 0,
    lastUpdated: '',
    cardViews: 0,
  })

  useEffect(() => {
    checkAuth()
    if (user) {
      loadUserStats()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      // 获取用户完整信息
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userProfile) {
        setUser(userProfile)
      }

    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    if (!user) return

    try {
      const { data: statsData } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const downloads = statsData?.filter(s => s.action_type === 'download').length || 0
      const lastUpdate = user.updated_at ? new Date(user.updated_at).toLocaleDateString('zh-CN') : '从未'

      setStats({
        totalDownloads: downloads,
        lastUpdated: lastUpdate,
        cardViews: statsData?.length || 0,
      })

    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-brand-gray">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark mb-2" dir="rtl">
              أهلاً وسهلاً، {user.name || 'المستخدم'}!
            </h1>
            <p className="text-brand-gray" dir="rtl">
              إدارة بطاقتك الرقمية، عرض صورتك المهنية
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/dashboard/editor')}
              className="btn-primary"
              dir="rtl"
            >
              تعديل البطاقة
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/profile')}
              dir="rtl"
            >
              الإعدادات الشخصية
            </Button>
            {user.is_admin && (
              <Button 
                variant="outline"
                onClick={() => router.push('/admin')}
                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              >
                🔐 لوحة الإدارة
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} />

      <div className="grid lg:grid-cols-1 gap-6">
        {/* 快速操作 - 已隐藏 */}
        <Card className="hidden">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/dashboard/editor')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              编辑名片内容
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/dashboard/export')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出名片图片
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/dashboard/profile')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              个人信息设置
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                // 分享功能
                if (navigator.share) {
                  navigator.share({
                    title: `${user.name}的数字名片`,
                    text: `来看看我的51Talk数字名片`,
                    url: `${window.location.origin}/card/${user.id}`,
                  })
                }
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              分享我的名片
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>
            您的名片使用记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.totalDownloads > 0 ? (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">名片下载</p>
                    <p className="text-xs text-brand-gray">总共下载了 {stats.totalDownloads} 次</p>
                  </div>
                </div>
                <span className="text-xs text-brand-gray">{stats.lastUpdated}</span>
              </div>
            ) : (
              <div className="text-center py-8 text-brand-gray">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>暂无活动记录</p>
                <p className="text-sm">开始使用名片功能来查看活动统计</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
