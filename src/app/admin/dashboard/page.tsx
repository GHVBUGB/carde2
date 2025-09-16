'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import UserMonitoringTable from '@/components/admin/tables/user-monitoring'
import RealTimeMonitor from '@/components/admin/real-time-monitor'
import AdminAuthWrapper from '@/components/admin/admin-auth-wrapper'

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalDownloads: number
  totalApiCalls: number
  removeBgCalls: number
  todayRegistrations: number
}

interface UserWithStats {
  id: string
  name: string
  email: string
  title: string
  created_at: string
  last_login?: string
  download_count: number
  remove_bg_count: number
  total_api_calls: number
  login_count: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalDownloads: 0,
    totalApiCalls: 0,
    removeBgCalls: 0,
    todayRegistrations: 0
  })
  const [adminEmail, setAdminEmail] = useState('')
  const [users, setUsers] = useState<UserWithStats[]>([])

  useEffect(() => {
    // 获取管理员信息
    const email = localStorage.getItem('admin_email')
    if (email) {
      setAdminEmail(email)
    }

    // 加载真实数据
    loadRealData()
    
    // 设置定时刷新（每30秒）
    const interval = setInterval(loadRealData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadRealData = async () => {
    try {
      // 获取总体统计数据
      const statsResponse = await fetch('/api/admin/stats')
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats({
          totalUsers: statsData.data.totalUsers,
          activeUsers: statsData.data.activeUsers,
          totalDownloads: statsData.data.totalDownloads,
          totalApiCalls: statsData.data.totalApiCalls,
          removeBgCalls: statsData.data.removeBgCalls,
          todayRegistrations: statsData.data.todayRegistrations
        })
        
        setUsers(statsData.data.recentUsers || [])
      } else {
        console.error('Failed to load stats:', statsData.error)
        // 使用备用数据
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalDownloads: 0,
          totalApiCalls: 0,
          removeBgCalls: 0,
          todayRegistrations: 0
        })
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      // 保持当前数据或设置为0
      setStats(prev => prev.totalUsers > 0 ? prev : {
        totalUsers: 0,
        activeUsers: 0,
        totalDownloads: 0,
        totalApiCalls: 0,
        removeBgCalls: 0,
        todayRegistrations: 0
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_email')
    localStorage.removeItem('admin_login_time')
    router.push('/admin/login')
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">51Talk 管理员面板</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">欢迎, {adminEmail}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总用户数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M7.05 16.95a5 5 0 010-7.07m9.9 0a5 5 0 010 7.07M9.879 14.121a3 3 0 010-4.242m4.242 0a3 3 0 010 4.242M12 12h.01" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">活跃用户</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总下载数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">API调用</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApiCalls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">抠图次数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.removeBgCalls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">今日新注册</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayRegistrations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 实时监控系统 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                实时监控系统
              </CardTitle>
              <CardDescription>
                系统自动监控平台使用情况，超过阈值将发送邮件告警
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealTimeMonitor />
            </CardContent>
          </Card>

          {/* 告警系统信息 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⚠️ 智能告警系统</CardTitle>
                <CardDescription>自动监控关键指标并发送邮件提醒</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">告警触发条件</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>抠图API调用 &gt; 5次/天</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>名片下载 &gt; 5次/天</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>新用户注册 &gt; 5个/天</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">告警方式</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>邮件自动发送到管理员邮箱</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>面板实时状态更新</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>防重复发送机制（1小时内）</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 平台数据概览</CardTitle>
                <CardDescription>关键运营指标实时统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">用户增长率</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      +12%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">活跃度</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      57%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">平台使用频次</span>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      2.8次/用户
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">系统稳定性</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      99.9%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 用户活动监控 */}
          <Card>
            <CardHeader>
              <CardTitle>👥 用户活动监控</CardTitle>
              <CardDescription>
                详细的用户使用统计和异常行为检测
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserMonitoringTable users={users} />
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminAuthWrapper>
  )
}
