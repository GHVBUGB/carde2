'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AbilitiesSelectorProps {
  abilities: {
    teacherScreening: boolean
    feedbackAbility: boolean
    planningAbility: boolean
    resourceSharing: boolean
  }
  onAbilitiesChange: (abilities: Partial<AbilitiesSelectorProps['abilities']>) => void
}

export default function AbilitiesSelector({ abilities, onAbilitiesChange }: AbilitiesSelectorProps) {
  const abilityOptions = [
    {
      key: 'teacherScreening' as const,
      label: '外教筛选',
      description: '协助家长筛选合适的外教老师',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: 'feedbackAbility' as const,
      label: '学情反馈',
      description: '及时反馈学员学习情况和进度',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: 'planningAbility' as const,
      label: '计划制定',
      description: '为学员制定个性化学习计划',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      key: 'resourceSharing' as const,
      label: '资源分享',
      description: '分享优质学习资源和材料',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      ),
    },
  ]

  const handleToggle = (key: keyof AbilitiesSelectorProps['abilities']) => {
    onAbilitiesChange({
      [key]: !abilities[key],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>业务能力</CardTitle>
        <CardDescription>
          选择您擅长的业务领域，突出专业优势
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abilityOptions.map((option) => {
            const isSelected = abilities[option.key]
            
            return (
              <div
                key={option.key}
                onClick={() => handleToggle(option.key)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-brand-primary bg-brand-primary/5' 
                    : 'border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50'
                  }
                `}
              >
                {/* 选中状态指示器 */}
                <div className={`
                  absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected 
                    ? 'border-brand-primary bg-brand-primary' 
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* 图标和内容 */}
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${isSelected 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-gray-100 text-brand-gray'
                    }
                  `}>
                    {option.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`
                      font-medium mb-1
                      ${isSelected ? 'text-brand-primary' : 'text-brand-dark'}
                    `}>
                      {option.label}
                    </h3>
                    <p className="text-sm text-brand-gray">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 使用说明 */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-amber-900 mb-1">选择建议</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 建议选择2-4项您最擅长的能力</li>
                <li>• 选择的能力将在名片上以标签形式展示</li>
                <li>• 确保选择的能力与您的实际工作相符</li>
                <li>• 这些标签将帮助客户更好地了解您的专业优势</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 已选择能力统计 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-brand-gray">
            已选择 <span className="font-medium text-brand-primary">
              {Object.values(abilities).filter(Boolean).length}
            </span> 项能力
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
