import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number
    activeUsersToday: number
    totalDownloads: number
    apiCallsToday: number
  }
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const statItems = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      description: '平台注册用户总数',
    },
    {
      title: '今日活跃',
      value: stats.activeUsersToday,
      change: '+8%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: '今日登录用户数',
    },
    {
      title: '下载总数',
      value: stats.totalDownloads,
      change: '+15%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: '名片下载总次数',
    },
    {
      title: 'API调用',
      value: stats.apiCallsToday,
      change: '+5%',
      changeType: 'positive' as const,
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: '今日API调用次数',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray">
              {item.title}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-dark mb-1">
              {item.value.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${
                item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.change}
              </span>
              <span className="text-xs text-brand-gray">vs 上月</span>
            </div>
            <p className="text-xs text-brand-gray mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
