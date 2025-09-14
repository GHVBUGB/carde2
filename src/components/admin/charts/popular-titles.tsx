'use client'

interface PopularTitlesChartProps {
  data: Array<{
    title: string
    count: number
  }>
}

export default function PopularTitlesChart({ data }: PopularTitlesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-gray-600">暂无职位数据</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = ['#FF6B35', '#4A90E2', '#F5A623', '#50E3C2', '#BD10E0']

  return (
    <div className="h-64 p-4">
      <div className="flex items-center justify-center h-full">
        {/* 饼图 */}
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100
              const strokeDasharray = `${percentage * 2.51} 251`
              const strokeDashoffset = -data
                .slice(0, index)
                .reduce((sum, prev) => sum + (prev.count / total) * 251, 0)

              return (
                <circle
                  key={item.title}
                  cx="100"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              )
            })}
          </svg>
          
          {/* 中心文字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-dark">{total}</div>
              <div className="text-xs text-gray-500">总用户</div>
            </div>
          </div>
        </div>

        {/* 图例 */}
        <div className="ml-8 space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.count / total) * 100).toFixed(1)
            return (
              <div key={item.title} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <div className="text-sm">
                  <div className="font-medium text-brand-dark">{item.title}</div>
                  <div className="text-gray-500">
                    {item.count}人 ({percentage}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
