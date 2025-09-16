'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface UserMonitoringTableProps {
  users: UserWithStats[]
}

export default function UserMonitoringTable({ users }: UserMonitoringTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityStatus = (lastLogin?: string) => {
    if (!lastLogin) return { status: 'inactive', text: '从未登录', color: 'gray' }
    
    const daysSinceLogin = (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceLogin <= 1) return { status: 'active', text: '今日活跃', color: 'green' }
    if (daysSinceLogin <= 7) return { status: 'recent', text: '近期活跃', color: 'blue' }
    return { status: 'inactive', text: '不活跃', color: 'red' }
  }

  const getAlertLevel = (count: number, threshold: number = 5) => {
    if (count > threshold) return 'high'
    if (count > threshold * 0.8) return 'medium'
    return 'normal'
  }

  return (
    <div className="space-y-4">
      {/* 快速统计 */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => getActivityStatus(u.last_login).status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">今日活跃</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(u => u.remove_bg_count > 5).length}
          </div>
          <div className="text-sm text-gray-600">抠图超限</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.download_count > 5).length}
          </div>
          <div className="text-sm text-gray-600">下载超限</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length}
          </div>
          <div className="text-sm text-gray-600">今日注册</div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium">用户信息</th>
              <th className="text-left p-3 font-medium">职位</th>
              <th className="text-left p-3 font-medium">注册时间</th>
              <th className="text-left p-3 font-medium">最后登录</th>
              <th className="text-left p-3 font-medium">登录次数</th>
              <th className="text-left p-3 font-medium">活动状态</th>
              <th className="text-left p-3 font-medium">抠图次数</th>
              <th className="text-left p-3 font-medium">下载次数</th>
              <th className="text-left p-3 font-medium">总API调用</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const activity = getActivityStatus(user.last_login)
              const removeBgAlert = getAlertLevel(user.remove_bg_count, 5)
              const downloadAlert = getAlertLevel(user.download_count, 5)
              const apiAlert = getAlertLevel(user.total_api_calls, 10)
              const isNewToday = new Date(user.created_at).toDateString() === new Date().toDateString()
              
              return (
                <tr 
                  key={user.id} 
                  className={`border-b hover:bg-gray-50 ${isNewToday ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{user.name || '未设置'}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                      {isNewToday && (
                        <Badge variant="secondary" className="text-xs">
                          新用户
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {user.title || '未设置'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-xs">
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs">
                      {user.last_login ? formatDate(user.last_login) : '从未登录'}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-center">
                      <span className={`font-medium ${user.login_count > 10 ? 'text-green-600' : ''}`}>
                        {user.login_count}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        activity.color === 'green' ? 'text-green-600 border-green-200' :
                        activity.color === 'blue' ? 'text-blue-600 border-blue-200' :
                        activity.color === 'red' ? 'text-red-600 border-red-200' :
                        'text-gray-600 border-gray-200'
                      }`}
                    >
                      {activity.text}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-center">
                      <span className={`font-medium ${
                        removeBgAlert === 'high' ? 'text-red-600 bg-red-50 px-2 py-1 rounded' :
                        removeBgAlert === 'medium' ? 'text-orange-600' : ''
                      }`}>
                        {user.remove_bg_count}
                      </span>
                      {removeBgAlert === 'high' && (
                        <div className="text-xs text-red-500 mt-1">超限!</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-center">
                      <span className={`font-medium ${
                        downloadAlert === 'high' ? 'text-red-600 bg-red-50 px-2 py-1 rounded' :
                        downloadAlert === 'medium' ? 'text-orange-600' : ''
                      }`}>
                        {user.download_count}
                      </span>
                      {downloadAlert === 'high' && (
                        <div className="text-xs text-red-500 mt-1">超限!</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-center">
                      <span className={`font-medium ${
                        apiAlert === 'high' ? 'text-red-600 bg-red-50 px-2 py-1 rounded' :
                        apiAlert === 'medium' ? 'text-orange-600' : ''
                      }`}>
                        {user.total_api_calls}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无用户数据
        </div>
      )}

      {users.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t">
          <div>
            显示 {users.length} 个用户的监控数据
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>超限警告</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span>今日新用户</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

