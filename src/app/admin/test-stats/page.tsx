'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'

interface TestStats {
  totalUsers: number
  todayRegistrations: number
  weeklyActiveUsers: number
  totalDownloads: number
  totalApiCalls: number
  totalRemoveBackground: number
  userDetails: Array<{
    id: string
    name: string
    email: string
    downloads: number
    apiCalls: number
    removeBackground: number
  }>
}

export default function TestStatsPage() {
  const [stats, setStats] = useState<TestStats | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // 转换API数据格式为测试页面期望的格式
          const transformedStats: TestStats = {
            totalUsers: result.data.totalUsers || 0,
            todayRegistrations: result.data.todayRegistrations || 0,
            weeklyActiveUsers: result.data.activeUsers || 0,
            totalDownloads: result.data.totalDownloads || 0,
            totalApiCalls: result.data.totalApiCalls || 0,
            totalRemoveBackground: result.data.removeBgCalls || 0,
            userDetails: (result.data.recentUsers || []).map((user: any) => ({
              id: user.id,
              name: user.name || '未设置',
              email: user.email || '未设置',
              downloads: user.download_count || 0,
              apiCalls: user.total_api_calls || 0,
              removeBackground: user.remove_bg_count || 0
            }))
          }
          setStats(transformedStats)
        } else {
          console.error('API返回格式错误:', result)
        }
      } else {
        console.error('获取统计数据失败，状态码:', response.status)
      }
    } catch (error) {
      console.error('获取统计数据错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const testDownload = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch('/api/log-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          format: 'png',
          fileSize: 1024000,
          filename: 'test-download.png'
        })
      })
      
      if (response.ok) {
        alert('测试下载日志记录成功！')
        fetchStats() // 刷新统计数据
      } else {
        alert('测试下载日志记录失败！')
      }
    } catch (error) {
      console.error('测试下载失败:', error)
      alert('测试下载失败！')
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">统计数据测试页面</h1>
        <div className="space-x-2">
          <Button onClick={fetchStats} disabled={loading}>
            {loading ? '刷新中...' : '刷新数据'}
          </Button>
          <Button onClick={testDownload} variant="outline">
            测试下载日志
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* 总体统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  总用户数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  今日新注册
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayRegistrations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  周活跃用户
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weeklyActiveUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  总下载数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalDownloads}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  API调用数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalApiCalls}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  抠图次数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalRemoveBackground}</div>
              </CardContent>
            </Card>
          </div>

          {/* 用户详细统计 */}
          <Card>
            <CardHeader>
              <CardTitle>用户详细统计</CardTitle>
              <CardDescription>
                显示每个用户的下载、API调用和抠图统计数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">用户</th>
                      <th className="text-left p-2">邮箱</th>
                      <th className="text-left p-2">下载数</th>
                      <th className="text-left p-2">API调用</th>
                      <th className="text-left p-2">抠图次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.userDetails.map((userDetail) => (
                      <tr key={userDetail.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{userDetail.name}</div>
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {userDetail.email}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-blue-600">
                            {userDetail.downloads}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-green-600">
                            {userDetail.apiCalls}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-purple-600">
                            {userDetail.removeBackground}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!stats && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">点击"刷新数据"获取统计信息</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}