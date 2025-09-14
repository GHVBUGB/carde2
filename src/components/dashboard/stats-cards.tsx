import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardsProps {
  stats: {
    totalDownloads: number
    lastUpdated: string
    cardViews: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      title: '名片下载',
      value: stats.totalDownloads,
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: '总下载次数',
    },
    {
      title: '活动记录',
      value: stats.cardViews,
      icon: (
        <svg className="w-6 h-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: '使用记录数',
    },
    {
      title: '最后更新',
      value: stats.lastUpdated,
      icon: (
        <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '信息更新时间',
      isDate: true,
    },
    {
      title: '名片状态',
      value: '活跃',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '当前名片状态',
      isStatus: true,
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
              {item.isDate ? item.value : (
                item.isStatus ? (
                  <span className="text-lg badge-success">
                    {item.value}
                  </span>
                ) : (
                  typeof item.value === 'number' ? item.value.toLocaleString() : item.value
                )
              )}
            </div>
            <p className="text-xs text-brand-gray">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
