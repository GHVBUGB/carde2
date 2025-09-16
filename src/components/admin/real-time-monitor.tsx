'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MonitorData {
  success: boolean
  timestamp: string
  stats: {
    overview: any
    usage: any
    userCount: number
  }
  alerts: Array<{
    type: string
    level: 'info' | 'warning' | 'critical'
    message: string
    count?: number
    threshold?: number
  }>
  alertCount: number
  hasAlerts: boolean
}

export default function RealTimeMonitor() {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 获取监控数据
  const fetchMonitorData = async () => {
    try {
      // 获取今日统计数据
      const response = await fetch('/api/admin/today-stats')
      const data = await response.json()
      
      if (data.success) {
        // 转换数据格式以匹配 MonitorData 接口
        const monitorData: MonitorData = {
          success: true,
          timestamp: data.timestamp,
          stats: {
            overview: {
              users: data.data.todayNewUsers,
              downloads: data.data.todayDownloads,
              registrations: data.data.todayNewUsers
            },
            usage: {
              api_calls: data.data.todayApiCalls,
              remove_bg: data.data.todayRemoveBg
            },
            userCount: data.data.todayNewUsers
          },
          alerts: data.data.alerts || [],
          alertCount: data.data.alertCount || 0,
          hasAlerts: data.data.hasAlerts || false
        }
        
        setMonitorData(monitorData)
        setLastUpdate(new Date())
        
        // 如果有新的告警，在控制台显示
        if (data.data.hasAlerts && data.data.alerts.length > 0) {
          console.log('🚨 检测到告警:', data.data.alerts)
        }
        
      } else {
        console.error('Failed to fetch monitor data:', data.error)
        
        // 设置错误状态
        setMonitorData({
          success: false,
          timestamp: new Date().toISOString(),
          stats: {
            overview: { users: 0, downloads: 0 },
            usage: { api_calls: 0, remove_bg: 0 },
            userCount: 0
          },
          alerts: [{
            type: 'api_error',
            level: 'critical',
            message: data.error || '无法获取监控数据，请检查数据库连接'
          }],
          alertCount: 1,
          hasAlerts: true
        })
      }
    } catch (error) {
      console.error('Failed to fetch monitor data:', error)
      
      // 网络错误状态
      setMonitorData({
        success: false,
        timestamp: new Date().toISOString(),
        stats: {
          overview: { users: 0, downloads: 0 },
          usage: { api_calls: 0, remove_bg: 0 },
          userCount: 0
        },
        alerts: [{
          type: 'network_error',
          level: 'critical',
          message: '网络连接失败，无法获取实时数据'
        }],
        alertCount: 1,
        hasAlerts: true
      })
    } finally {
      setLoading(false)
    }
  }

  // 手动触发告警检查
  const triggerAlertCheck = async () => {
    try {
      const response = await fetch('/api/admin/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceAlert: true })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`告警检查完成！\n发送邮件: ${result.sentEmails} 封\n检测到告警: ${result.alerts.length} 个`)
        await fetchMonitorData() // 刷新数据
      }
    } catch (error) {
      console.error('Failed to trigger alert check:', error)
      alert('告警检查失败，请重试')
    }
  }

  // 自动刷新
  useEffect(() => {
    fetchMonitorData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitorData, 30000) // 30秒刷新一次
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  const getAlertLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🚨'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📊'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="loading-spinner w-6 h-6 mr-2"></div>
            <span>加载监控数据...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              📡 实时监控系统
              {monitorData?.hasAlerts && (
                <Badge variant="destructive" className="animate-pulse">
                  {monitorData.alertCount} 个告警
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? '⏸️ 暂停' : '▶️ 开始'} 自动刷新
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMonitorData}
              >
                🔄 手动刷新
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={triggerAlertCheck}
              >
                📧 触发告警检查
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              最后更新: {lastUpdate?.toLocaleString('zh-CN') || '未知'}
            </div>
            <div className="flex items-center gap-4">
              <span>自动刷新: {autoRefresh ? '开启' : '关闭'}</span>
              <span>监控用户: {monitorData?.stats.userCount || 0} 个</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 告警列表 */}
      {monitorData?.alerts && monitorData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚨 当前告警</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitorData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.level === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getAlertLevelIcon(alert.level)}
                      </span>
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        {alert.count !== undefined && alert.threshold !== undefined && (
                          <div className="text-sm text-gray-600 mt-1">
                            当前值: {alert.count} | 阈值: {alert.threshold}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={getAlertLevelColor(alert.level) as any}>
                      {alert.level.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 快速统计 */}
      {monitorData?.stats && (
        <Card>
          <CardHeader>
            <CardTitle>📊 实时统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {monitorData.stats.overview.totalUsers}
                </div>
                <div className="text-sm text-gray-600">总用户数</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  monitorData.stats.overview.todayRegistrations > 5 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {monitorData.stats.overview.todayRegistrations}
                </div>
                <div className="text-sm text-gray-600">今日注册</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  monitorData.stats.usage.removeBgCallsToday > 5 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {monitorData.stats.usage.removeBgCallsToday}
                </div>
                <div className="text-sm text-gray-600">今日抠图</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  monitorData.stats.usage.downloadsToday > 5 ? 'text-red-600' : 'text-purple-600'
                }`}>
                  {monitorData.stats.usage.downloadsToday}
                </div>
                <div className="text-sm text-gray-600">今日下载</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 无告警状态 */}
      {monitorData && !monitorData.hasAlerts && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-lg font-medium">系统运行正常</div>
              <div className="text-sm">当前没有检测到任何告警</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

