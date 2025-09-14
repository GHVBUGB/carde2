'use client'

interface UserRegistrationChartProps {
  data: Array<{
    date: string
    count: number
  }>
}

export default function UserRegistrationChart({ data }: UserRegistrationChartProps) {
  // 如果没有数据，显示占位符
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600">暂无用户注册数据</p>
        </div>
      </div>
    )
  }

  // 简单的SVG条形图实现
  const maxCount = Math.max(...data.map(d => d.count))
  const chartHeight = 200
  const chartWidth = 400
  const barWidth = chartWidth / data.length - 4

  return (
    <div className="h-64 p-4">
      <svg width="100%" height={chartHeight} className="overflow-visible">
        {/* 网格线 */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = chartHeight - (chartHeight * percent) / 100
          return (
            <g key={percent}>
              <line
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x="-10"
                y={y + 4}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {Math.round((maxCount * percent) / 100)}
              </text>
            </g>
          )
        })}

        {/* 数据条 */}
        {data.map((item, index) => {
          const barHeight = (item.count / maxCount) * chartHeight
          const x = (index * chartWidth) / data.length + 2
          const y = chartHeight - barHeight

          return (
            <g key={item.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#FF6B35"
                className="hover:fill-brand-primary/80 transition-colors"
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                className="text-xs fill-gray-500"
                textAnchor="middle"
              >
                {new Date(item.date).getDate()}
              </text>
              
              {/* 悬停显示数值 */}
              <title>{`${item.date}: ${item.count}人注册`}</title>
            </g>
          )
        })}
      </svg>

      {/* 图例 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>过去30天用户注册趋势</span>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-brand-primary rounded"></div>
          <span>注册人数</span>
        </div>
      </div>
    </div>
  )
}
