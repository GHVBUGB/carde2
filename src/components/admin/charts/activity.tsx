'use client'

interface ActivityChartProps {
  data: Array<{
    date: string
    [key: string]: string | number
  }>
}

export default function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600">暂无活动数据</p>
        </div>
      </div>
    )
  }

  // 提取活动类型
  const activityTypes = ['login', 'download', 'api_call', 'edit_profile']
  const colors = {
    login: '#4A90E2',
    download: '#FF6B35',
    api_call: '#F5A623',
    edit_profile: '#50E3C2'
  }

  // 计算最大值用于缩放
  const maxValue = Math.max(...data.map(item => 
    activityTypes.reduce((sum, type) => sum + (Number(item[type]) || 0), 0)
  ))

  const chartHeight = 200
  const chartWidth = 600
  const barWidth = chartWidth / data.length - 8

  return (
    <div className="h-80 p-4">
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
                {Math.round((maxValue * percent) / 100)}
              </text>
            </g>
          )
        })}

        {/* 堆叠条形图 */}
        {data.map((item, index) => {
          const x = (index * chartWidth) / data.length + 4
          let currentY = chartHeight

          return (
            <g key={item.date}>
              {activityTypes.map((type) => {
                const value = Number(item[type]) || 0
                const barHeight = (value / maxValue) * chartHeight
                currentY -= barHeight

                return (
                  <rect
                    key={type}
                    x={x}
                    y={currentY}
                    width={barWidth}
                    height={barHeight}
                    fill={colors[type as keyof typeof colors]}
                    className="hover:opacity-80 transition-opacity"
                    rx="1"
                  >
                    <title>{`${item.date} ${type}: ${value}`}</title>
                  </rect>
                )
              })}
              
              {/* 日期标签 */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                className="text-xs fill-gray-500"
                textAnchor="middle"
              >
                {new Date(item.date).getDate()}
              </text>
            </g>
          )
        })}
      </svg>

      {/* 图例 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {activityTypes.map((type) => {
          const label = {
            login: '登录',
            download: '下载',
            api_call: 'API调用',
            edit_profile: '编辑资料'
          }[type]

          return (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: colors[type as keyof typeof colors] }}
              ></div>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          )
        })}
      </div>

      {/* 统计摘要 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          过去30天平台活动统计 • 总活动数: {data.reduce((sum, item) => 
            sum + activityTypes.reduce((typeSum, type) => typeSum + (Number(item[type]) || 0), 0), 0
          ).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
